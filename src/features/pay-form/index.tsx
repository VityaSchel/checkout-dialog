import { Formik } from 'formik'
import styles from './styles.module.scss'
import * as Yup from 'yup'
import Input from '@x5io/flat-uikit/dist/input'
import Checkbox from '@x5io/flat-uikit/dist/checkbox'
import { Button } from '@/shared/button'
import { FormHelperText, Stack } from '@mui/material'
import { PayFormValues } from 'checkout'
// @ts-expect-error no types
import InputMask from 'react-input-mask'
import React from 'react'

export function PayForm({ initialValues, checkboxes, onSubmit, priceInRub }: {
  initialValues?: { email?: string }
  checkboxes: { defaultActive: boolean, htmlLabel: string }[]
  onSubmit: (payFormValues: PayFormValues/*, sendReceipt: false | string*/) => Promise<boolean>
  priceInRub?: number
}) {
  return (
    <Formik
      initialValues={{ 
        cardNumber: '',
        cardExp: '',
        cardCVC: '',
        sendReceipt: true,
        email: initialValues?.email ?? '',
        ...Object.fromEntries(checkboxes.map((cb, i) => [`checkbox${i}`, cb.defaultActive]))
      }}
      validationSchema={
        Yup.object({
          cardNumber: Yup.string().matches(/^\d{4} \d{4} \d{4} \d{4,6}$/, 'Введите цифры'),
          cardExp: Yup.string().matches(/^\d\d\/\d\d$/, 'Введите цифры'),
          cardCVC: Yup.string().matches(/^\d+$/, 'Введите цифры').length(3, 'Введите 3 цифры'),
          sendReceipt: Yup.boolean(),
          email: Yup.string().email(),
          ...Object.fromEntries(checkboxes.map((cb, i) => [`checkbox${i}`, Yup.bool().oneOf([true], ' ').required()]))
        })
      }
      validateOnBlur={false}
      validateOnChange={false}
      validateOnMount={false}
      onSubmit={(values, { setSubmitting, setErrors }) => {
        setSubmitting(true)
        onSubmit({
          cardNumber: values.cardNumber.replaceAll(/[^\d]/g, ''),
          cardExp: values.cardExp,
          cardCVC: values.cardCVC,
        } /*, values.sendReceipt && values.email */)
          .then((isCorrect: boolean) => {
            if(!isCorrect) {
              setErrors({ cardNumber: 'Некорректные данные' })
            }
            setSubmitting(false)
          })
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        // setFieldValue,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <form onSubmit={handleSubmit} className={styles.form}>
          <InputMask
            mask="9999 9999 9999 999999"
            value={values.cardNumber}
            name="cardNumber"
            onChange={handleChange}
            maskChar={null}
          >
            {(inputProps: any) => (
              <Input
                placeholder='4123 4567 1234 5678'
                label='Номер карты'
                type="cardNumber"
                name="cardNumber"
                onChange={handleChange}
                error={values.cardNumber && errors.cardNumber}
                {...inputProps}
              />
            )}
          </InputMask>
          <Stack direction='row' spacing={2} className={styles.flex}>
            <InputMask 
              mask="99/99" 
              value={values.cardExp}
              name="cardExp"
              onChange={handleChange}
              maskChar={null}
            >
              {(inputProps: any) => (
                <Input
                  placeholder='12/34'
                  label='Месяц/Год'
                  type="cardExp"
                  name="cardExp"
                  onChange={handleChange}
                  error={values.cardExp && errors.cardExp}
                  {...inputProps}
                />
              )}
            </InputMask>
            <Input
              placeholder='123'
              label='CVC'
              type="cardCVC"
              name="cardCVC"
              inputProps={{ maxlength: 3 }}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.cardCVC}
              error={values.cardCVC && errors.cardCVC}
            />
          </Stack>
          {/* <Checkbox
            name='sendReceipt'
            onChange={handleChange}
            error={undefined}
            value={values.sendReceipt}
          >
            Отправить квитанцию на E-mail
          </Checkbox>
          {values.sendReceipt && (
            <Input
              placeholder='Почта для чека'
              label='E-mail'
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              error={values.email && errors.email}
            />
          )} */}
          {checkboxes.map((cb, i) => (
            <>
              <Checkbox
                name={`checkbox${i}`}
                onChange={handleChange}
                // @ts-expect-error unidexable
                error={errors[`checkbox${i}`]}
                // @ts-expect-error unidexable
                value={values[`checkbox${i}`]}
                key={i}
              >
                <p dangerouslySetInnerHTML={{__html: cb.htmlLabel}} />
              </Checkbox>
            </>
          ))}
          <Button type="submit" disabled={
            !values.cardCVC?.length || 
            !values.cardExp?.length || 
            !values.cardNumber?.length || 
            isSubmitting
          } className={styles.submit}>
            Оплатить {priceInRub} ₽
          </Button>
        </form>
      )}
    </Formik>
  )
}