import { PayFormValues } from '../../component/index.tsx';
export declare function PayForm({ initialValues, emailRequired, checkboxes, onSubmit, priceInRub }: {
    initialValues?: {
        email?: string;
    };
    emailRequired: boolean;
    checkboxes: {
        defaultActive: boolean;
        htmlLabel: string;
    }[];
    onSubmit: (payFormValues: PayFormValues) => Promise<boolean>;
    priceInRub?: number;
}): import("react/jsx-runtime").JSX.Element;
