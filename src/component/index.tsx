import React from 'react'
import styles from './styles.module.scss'
import Spinner from 'react-bootstrap/Spinner'
import { Button } from '@/shared/button'
import Dialog from '@mui/material/Dialog'
import { PayForm } from '@/features/pay-form'
import { AppBar, IconButton, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { MdClose } from 'react-icons/md'
import 'bootstrap/dist/css/bootstrap.min.css'

export type PayFormValues = {
  cardNumber: string
  cardExp: string
  cardCVC: string
  email: string
}

const CheckoutModal = React.forwardRef((props, ref) => {
  const [open, setOpen] = React.useState(false)
  const [onCancel, setOnCancel] = React.useState<undefined | (() => any)>(undefined)
  const [onCallback, setOnCallback] = React.useState<undefined | ((cryptogram: string, email: string) => Promise<boolean | undefined>)>(undefined)
  const [initialValues, setInitialValues] = React.useState<undefined | { email?: string }>(undefined)
  const [paymentInfo, setPaymentInfo] = React.useState<undefined | {
    title: string
    priceString: string
    priceInRub: number
  }>()
  const [paymentOptions, setPaymentOptions] = React.useState<{ emailRequired: boolean } | null>(null)
  const [checkboxes, setCheckboxes] = React.useState<undefined | { defaultActive: boolean, htmlLabel: string }[]>(undefined)
  const [paymentProcessor, setPaymentProcessor] = React.useState<PaymentProcessorOption>()
  const [screen, setScreen] = React.useState<'pay' | 'loading' | 'error' | 'success'>('pay')

  const handleClose = () => {
    setOpen(false)
    onCancel?.()
  }

  React.useImperativeHandle((ref), () => ({
    open(options, onSuccess, onCancel) {
      setPaymentOptions({ emailRequired: options.emailRequired ?? false })
      setScreen('pay')
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
    setScreen('loading')
    let processor = paymentProcessor
    if (paymentProcessor?.name === 'auto') {
      processor = await paymentProcessor.resolver(payFormValues.cardNumber.replaceAll(/[^\d]/g, ''))
      if (!processor) {
        setScreen('error')
        return false
      }
    } else if (!processor) {
      return false
    }
    if (processor.name === 'cloudpayments') {
      return await generateCloudPaymentsCryptogram(payFormValues, processor.publicId)
    } else if(processor.name === 'payselection') {
      return await generatePaySelectionCryptogram(payFormValues, processor.publickey)
    } else {
      setScreen('error')
      return false
    }
  }

  const generateCloudPaymentsCryptogram = async ({ cardNumber, cardExp, cardCVC, email }: PayFormValues, publicId: string): Promise<boolean> => {
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
      onCallback?.(cryptogram, email)
        .then(result => {
          if(result === false) {
            setScreen('error')
          } else if(result === true) {
            setScreen('success')
          }
        })
        .catch(() => setScreen('error'))
      return true
    } catch(e) {
      console.error(e)
      return false
    }
  }

  const generatePaySelectionCryptogram = async ({ cardNumber, cardExp, cardCVC, email }: PayFormValues, publickey: string): Promise<boolean> => {
    try {
      const formData = {
        TransactionDetails: {
          Amount: paymentInfo?.priceInRub,
          Currency: 'RUB'
        },
        PaymentMethod: 'Card',
        PaymentDetails: {
          CardholderName: 'TEST CARD',
          CardNumber: cardNumber,
          CVC: Number(cardCVC),
          ExpMonth: cardExp.split('/')[0],
          ExpYear: cardExp.split('/')[1]
        },
      }
      const token = await window['CardCryptoToken'](publickey, formData)
      onCallback?.(token, email)
        .then(result => {
          if (result === false) {
            setScreen('error')
          } else if (result === true) {
            setScreen('success')
          }
        })
        .catch(() => setScreen('error'))
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
        {screen === 'pay'
          ? (<>
            <span className={styles.price}>{paymentInfo?.priceString}</span>
            <PayForm
              initialValues={initialValues}
              emailRequired={paymentOptions?.emailRequired ?? false}
              checkboxes={checkboxes!}
              onSubmit={handleGenerateCryptogram}
              priceInRub={paymentInfo?.priceInRub}
            />
          </>) : screen === 'error' 
            ? (
              <div className={styles.error}>
                <span className={styles.errorTitle}>Ошибка</span>
                <Button onClick={handleClose}>Вернуться в магазин</Button>
              </div>
            ) : screen === 'success'
              ? (
                <div className={styles.success}>
                  <span className={styles.successTitle}>Спасибо!</span>
                  <Button onClick={handleClose} disabled>Перенаправление...</Button>
                </div>
              ) : (
                <div className={styles.spinner}>
                  <Spinner animation="border" />
                </div>
              )}
      </div>
    </Dialog>
  )
})
CheckoutModal.displayName = 'CheckoutModal'
export { CheckoutModal }

type PaymentProcessorOption = {
  name: 'auto'
  resolver: (cardNumber: string) => PaymentProcessor
} | PaymentProcessor

type PaymentProcessor = {
  name: 'cloudpayments'
  publicId: string
} | {
  name: 'payselection',
  publickey: string
}

export type CheckoutModalRef = {
  open: (
    options: {
      paymentInfo: {
        title: string
        priceString: string
        priceInRub: number
      },
      paymentProcessor: PaymentProcessorOption,
      initialValues?: {
        email?: string
      },
      checkboxes: {
        defaultActive: boolean
        htmlLabel: string
      }[],
      emailRequired?: boolean
    },
    onSuccess: (cryptogram: string, email: string) => any,
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