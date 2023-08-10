interface Window { 
  cp: {
    Checkout: new ({ publicId: string }) => any
  }
  CardCryptoToken: (publickey: string, data: object) => any
}