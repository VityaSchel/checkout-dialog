import React from 'react'
import ReactDOM from 'react-dom/client'
import { CheckoutModal } from '@x5io/checkout-modal'
import type { CheckoutModalRef } from '@x5io/checkout-modal'
import '@x5io/checkout-modal/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

function App() {
  const checkoutRef = React.useRef<CheckoutModalRef>()

  React.useEffect(() => {
    checkoutRef.current?.open({
      paymentInfo: {
        title: 'Оплата подписки "название магазина"',
        priceString: '999 ₽',
        priceInRub: 999
      },
      // paymentProcessor: { name: 'cloudpayments', publicId: 'test_api_000000000000000002' },
      paymentProcessor: { name: 'payselection', publickey: '0405397f7577bd835210a57708aafe876786dc8e2d12e6880917d61a4ad1d03a75068ea6bc26554c7a1bf5b50ed40105837eee001178579279eca57f89bdff5fc2' },
      checkboxes: [
        { defaultActive: true, htmlLabel: 'Foo bar' },
        { defaultActive: true, htmlLabel: 'Hello world' },
      ]
    }, async (cryptogram: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(cryptogram)
      return true
    })
  }, [])

  return (
    <CheckoutModal
      ref={checkoutRef}
    />
  )
}