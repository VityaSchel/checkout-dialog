import styles from './styles.module.scss'
import cx from 'classnames'

export function Button({ children, className, ...props }: React.PropsWithChildren<{
  className?: string
}> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx(styles.btn, className)} {...props}>{children}</button>
}