import Link from 'next/link'
import commonStyles from '../../styles/common.module.scss'
import styles from './header.module.scss'

export default function Header() {
  return (
    <>
      <header className={commonStyles.containerCommon}>
        <Link href="/">
          <a>
            <img className={styles.headerImage} src="/logo.svg" alt="logo"/>
          </a>
        </Link>
      </header>
    </>
  )
}
