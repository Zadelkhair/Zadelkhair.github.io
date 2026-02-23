import Link from 'next/link'
import { useRouter } from 'next/router'
import { Sora, Work_Sans } from 'next/font/google'
import styles from '@/styles/Admin.module.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
})

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/projects', label: 'Projects' },
  { href: '/dashboard/career', label: 'Career' },
]

const isLinkActive = (pathname, href) => {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function AdminLayout({
  title,
  description,
  actions,
  notice,
  error,
  children,
}) {
  const router = useRouter()

  return (
    <main className={`${styles.adminRoot} ${sora.variable} ${workSans.variable}`}>
      <div className={styles.backdrop} aria-hidden="true" />

      <div className={styles.adminShell}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarKicker}>Portfolio Admin</p>
          <h2 className={styles.sidebarTitle}>Control Center</h2>

          <nav className={styles.navList} aria-label="Dashboard navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${
                  isLinkActive(router.pathname, item.href)
                    ? styles.navLinkActive
                    : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.ghostLink}>
              Open Public Site
            </Link>
          </div>
        </aside>

        <section className={styles.contentPane}>
          <header className={styles.pageHeader}>
            <div>
              <p className={styles.pageKicker}>Administration</p>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            {actions ? <div className={styles.actionRow}>{actions}</div> : null}
          </header>

          <div className={styles.contentBody}>
            {notice ? <p className={styles.notice}>{notice}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}

            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
