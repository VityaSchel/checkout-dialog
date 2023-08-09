# Checkout modal

Компонент для оплаты на сайте в модальном окне с поддержкой cloudpayments и payselection.

Types definitions запакованы, стили скомпилированы в `style.css`.

## Использование

```tsx
import { CheckoutModal } from 'checkout-modal'
import type { CheckoutModalRef } from 'checkout-modal'
import 'checkout-modal/index.css'

function Main() {
  const checkoutRef = React.useRef<CheckoutModalRef>()

  React.useEffect(() => {
    checkoutRef.current.open()
  }, [checkoutRef])

  return (
    <CheckoutModal
      ref={checkoutRef}
    />
  )
}
```

Обязательна настройка сервер-сайд рендеринга [https://mui.com/material-ui/guides/server-rendering/](https://mui.com/material-ui/guides/server-rendering/)