# Checkout modal

![Screenshot](https://raw.githubusercontent.com/VityaSchel/checkout-dialog/demo/image.png)

[Visit interactive demo](https://vityaschel.github.io/checkout-dialog)

Компонент для оплаты на сайте в модальном окне с поддержкой cloudpayments и payselection.

Types definitions запакованы, стили скомпилированы в `style.css`.

## Использование

```tsx
import { CheckoutModal } from 'checkout-modal'
import type { CheckoutModalRef } from 'checkout-modal'
import 'checkout-modal/index.css'

function Main() {
  const checkoutRef = React.useRef<CheckoutModalRef>()

  const email = 'hi@hloth.dev'

  React.useEffect(() => {
    checkoutRef.current?.open({
      initialValues: {
        email
      },
      paymentInfo: {
        title: 'Оплата подписки "название магазина"',
        priceString: '999 ₽',
        priceInRub: 999
      },
      /* paymentProcessor: { 
        name: 'auto', 
        resolver: (cardNumber: string) => {
          return { name: 'cloudpayments', publicId: 'test_api_000000000000000002' }
        }
      }*/,
      // paymentProcessor: { name: 'cloudpayments', publicId: 'test_api_000000000000000002' },
      paymentProcessor: { name: 'payselection', publickey: '0405397f7577bd835210a57708aafe876786dc8e2d12e6880917d61a4ad1d03a75068ea6bc26554c7a1bf5b50ed40105837eee001178579279eca57f89bdff5fc2' },
      checkboxes: [
        { defaultActive: true, htmlLabel: 'Foo bar' },
        { defaultActive: true, htmlLabel: 'Hello world' },
      ],
      emailRequired: true
    }, (cryptogram: string, email: string) => {
      alert(cryptogram)
      console.log('set-email', email)
      return true
    })
  }, [])

  return (
    <CheckoutModal
      ref={checkoutRef}
    />
  )
}
```

В колбэке onSuccess в котором передается cryptogram нужно возвращать boolean, означающий удался ли запрос или нет (показать ошибку или успех).

Обязательна настройка сервер-сайд рендеринга [https://mui.com/material-ui/guides/server-rendering/](https://mui.com/material-ui/guides/server-rendering/)