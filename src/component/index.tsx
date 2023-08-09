import React from 'react'
import styles from './styles.module.scss'
import { Button } from '@/shared/button'
import Dialog from '@mui/material/Dialog'
import { PayForm } from '@/features/pay-form'
import { default as initEciesWASM } from 'ecies-wasm'
import * as ecies from 'ecies-wasm'

initEciesWASM()

import eccrypto from 'eccrypto'

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
      // var pubkey = Buffer.from(publickey, 'hex')
      const pk = hexToUint8Array(publickey)
      const formData = JSON.stringify({
        TransactionDetails: {
          Amount: paymentInfo?.priceInRub,
          Currency: 'RUB'
        },
        PaymentMethod: 'Card',
        PaymentDetails: {
          CardholderName: 'TEST CARD',
          CardNumber: cardNumber,
          CVC: cardCVC,
          ExpMonth: cardExp.split('/')[0],
          ExpYear: cardExp.split('/')[1]
        },
        MessageExpiration: Date.now() + 86400000
      })
      const encoder = new TextEncoder()
      const data = encoder.encode(formData)
      const encrypted = await ecies.encrypt(pk, data)
      console.log(encrypted)
      // console.log(encrypted.toString('hex'))
      // const sendData = {
      //   signedMessage: JSON.stringify(
      //     {
      //       encryptedMessage: encrypted.ciphertext.toString('base64'),
      //       ephemeralPublicKey: encrypted.ephemPublicKey.toString('base64')
      //     }
      //   ),
      //   iv: encrypted.iv.toString('base64'),
      //   tag: encrypted.mac.toString('base64')
      // }
      // const finalString = window.btoa(JSON.stringify(sendData))
      // console.log(finalString)
      // onCallback?.(finalString)
      return true
    } catch(e) {
      console.error(e)
      return false
    }
  }

  React.useEffect(() => {
    if(!window['cp']) {
      const script = document.createElement('script')
      script.src = 'https://checkout.cloudpayments.ru/checkout.js'
      window.document.body.append(script)
    }
  }, [])

  return (
    <Dialog onClose={handleClose} open={open} className={styles.dialog}>
      <h1 className={styles.title}>{paymentInfo?.title}</h1>
      <span className={styles.price}>{paymentInfo?.priceString}</span>
      <PayForm
        initialValues={initialValues}
        checkboxes={checkboxes!}
        onSubmit={handleGenerateCryptogram}
        priceInRub={paymentInfo?.priceInRub}
      />
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