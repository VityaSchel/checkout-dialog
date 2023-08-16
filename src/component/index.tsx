import React from 'react'
import styles from './styles.module.scss'
import { Button } from '@/shared/button'
import Dialog from '@mui/material/Dialog'
import { PayForm } from '@/features/pay-form'
import { AppBar, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { MdClose } from 'react-icons/md'

export type PayFormValues = {
  cardNumber: string
  cardExp: string
  cardCVC: string
}

const CheckoutModal = React.forwardRef((props, ref) => {
  const [open, setOpen] = React.useState(false)
  const [onCancel, setOnCancel] = React.useState<undefined | (() => any)>(undefined)
  const [onCallback, setOnCallback] = React.useState<undefined | ((cryptogram: string) => any)>(undefined)
  const [initialValues, setInitialValues] = React.useState<undefined | { email?: string }>(undefined)
  const [paymentInfo, setPaymentInfo] = React.useState<undefined | {
    title: string
    priceString: string
    priceInRub: number
  }>()
  const [checkboxes, setCheckboxes] = React.useState<undefined | { defaultActive: boolean, htmlLabel: string }[]>(undefined)
  const [paymentProcessor, setPaymentProcessor] = React.useState < { name: 'cloudpayments', publicId: string } | { name: 'payselection', publickey: string }>()

  const handleClose = () => {
    setOpen(false)
    onCancel?.()
  }

  React.useImperativeHandle((ref), () => ({
    open(options, onSuccess, onCancel) {
      setOnCancel(() => onCancel)
      setOnCallback(() => onSuccess)
      setInitialValues(options.initialValues)
      setPaymentInfo(options.paymentInfo)
      setCheckboxes(options.checkboxes)
      setPaymentProcessor(options.paymentProcessor)
      setOpen(true)
    }
  } as CheckoutModalRef))

  const handleGenerateCryptogram = async (payFormValues: PayFormValues) => {
    if (paymentProcessor?.name === 'cloudpayments') {
      return await generateCloudPaymentsCryptogram(payFormValues, paymentProcessor.publicId)
    } else if(paymentProcessor?.name === 'payselection') {
      return await generatePaySelectionCryptogram(payFormValues, paymentProcessor.publickey)
    } else {
      return false
    }
  }

  const generateCloudPaymentsCryptogram = async ({ cardNumber, cardExp, cardCVC }: PayFormValues, publicId: string): Promise<boolean> => {
    const fieldValues = {
      cvv: cardCVC,
      cardNumber: cardNumber,
      expDateMonth: cardExp.split('/')[0],
      expDateYear: cardExp.split('/')[1],
    }
    try {
      const cp = new window['cp'].Checkout({
        publicId: publicId,
      })
      const cryptogram = await cp.createPaymentCryptogram(fieldValues)
      onCallback?.(cryptogram)
      return true
    } catch(e) {
      console.error(e)
      return false
    }
  }

  const generatePaySelectionCryptogram = async ({ cardNumber, cardExp, cardCVC }: PayFormValues, publickey: string): Promise<boolean> => {
    try {
      const formData = {
        TransactionDetails: {
          Amount: paymentInfo?.priceInRub,
          Currency: 'RUB'
        },
        PaymentDetails: {
          CardholderName: 'TEST CARD',
          CardNumber: cardNumber,
          CVC: Number(cardCVC),
          ExpMonth: cardExp.split('/')[0],
          ExpYear: cardExp.split('/')[1]
        },
      }
      const token = await window['CardCryptoToken'](publickey, formData)
      onCallback?.(token)
      return true
    } catch(e) {
      console.error(e)
      return false
    }
  }

  React.useEffect(() => {
    if (!window['cp']) {
      const script = document.createElement('script')
      script.src = 'https://checkout.cloudpayments.ru/checkout.js'
      window.document.body.append(script)
    }
    if (!window['CardCryptoToken']) {
      const script = document.createElement('script')
      script.src = 'https://cardcryptotoken.payselection.com/CardCryptoToken.js'
      window.document.body.append(script)
    }
  }, [])

  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <Dialog 
      onClose={handleClose} 
      open={open} 
      className={styles.dialog} 
      fullScreen={isMobile}
    >
      {isMobile
        ? (
          <AppBar sx={{ position: 'relative', marginBottom: 4 }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
              >
                <MdClose />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1, fontSize: 16 }} variant="h6" component="div">
                {paymentInfo?.title}
              </Typography>
            </Toolbar>
          </AppBar>
        ) : (
          <h1 className={styles.title}>{paymentInfo?.title}</h1>
        )
      }
      <div className={styles.dialogContent}>
        <span className={styles.price}>{paymentInfo?.priceString}</span>
        <PayForm
          initialValues={initialValues}
          checkboxes={checkboxes!}
          onSubmit={handleGenerateCryptogram}
          priceInRub={paymentInfo?.priceInRub}
        />
      </div>
    </Dialog>
  )
})
CheckoutModal.displayName = 'CheckoutModal'
export { CheckoutModal }

export type CheckoutModalRef = {
  open: (
    options: {
      paymentInfo: {
        title: string
        priceString: string
        priceInRub: number
      },
      paymentProcessor: {
        name: 'cloudpayments' 
        publicId: string
      } | {
        name: 'payselection',
        publickey: string
      },
      initialValues?: {
        email?: string
      },
      checkboxes: {
        defaultActive: boolean
        htmlLabel: string
      }[]
    },
    onSuccess: (cryptogram: string) => any,
    onCancel?: () => any
  ) => any
}

function hexToUint8Array(hex: string) {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters')
  }

  const uint8Array = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substr(i, 2), 16)
    uint8Array[i / 2] = byte
  }

  return uint8Array
}