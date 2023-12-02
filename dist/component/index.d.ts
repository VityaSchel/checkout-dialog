import React from 'react';
export type PayFormValues = {
    cardNumber: string;
    cardExp: string;
    cardCVC: string;
    email: string;
};
declare const CheckoutModal: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
export { CheckoutModal };
type PaymentProcessorOption = {
    name: 'auto';
    resolver: (cardNumber: string) => PaymentProcessor;
} | PaymentProcessor;
type PaymentProcessor = {
    name: 'cloudpayments';
    publicId: string;
} | {
    name: 'payselection';
    publickey: string;
};
export type CheckoutModalRef = {
    open: (options: {
        paymentInfo: {
            title: string;
            priceString: string;
            priceInRub: number;
        };
        paymentProcessor: PaymentProcessorOption;
        initialValues?: {
            email?: string;
        };
        checkboxes: {
            defaultActive: boolean;
            htmlLabel: string;
        }[];
        emailRequired?: boolean;
    }, onSuccess: (cryptogram: string, email: string) => any, onCancel?: () => any) => any;
};
