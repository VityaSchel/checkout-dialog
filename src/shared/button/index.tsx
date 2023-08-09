import styles from './styles.module.scss'

export function Button({ children }: React.PropsWithChildren) {
  return <button className={styles.btn}>{children}</button>
}