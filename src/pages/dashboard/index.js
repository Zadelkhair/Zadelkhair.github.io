import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import styles from '@/styles/Admin.module.css'
import { getContent, getHealth, getSiteInfo, rebuildSite } from '@/lib/admin-api'
import { normalizeContent } from '@/lib/admin-content'

const shortTime = (value) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleString()
}

export default function DashboardOverview() {
  const [health, setHealth] = useState(null)
  const [siteInfo, setSiteInfo] = useState(null)
  const [content, setContent] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [buildLog, setBuildLog] = useState('')

  const loadAll = async () => {
    setIsRefreshing(true)
    setError('')

    try {
      const [nextHealth, nextSiteInfo, nextContent] = await Promise.all([
        getHealth(),
        getSiteInfo(),
        getContent(),
      ])

      setHealth(nextHealth)
      setSiteInfo(nextSiteInfo)
      setContent(normalizeContent(nextContent))
      setNotice('Dashboard synced with the local server.')
    } catch (loadError) {
      setError(`${loadError.message} Start the manager with "npm run serve:local".`)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const runRebuild = async () => {
    setIsRebuilding(true)
    setError('')

    try {
      const response = await rebuildSite()
      const combined = [response.stdout, response.stderr]
        .filter((value) => typeof value === 'string' && value.length > 0)
        .join('\n')

      setBuildLog(combined || 'Build finished with no output.')
      setNotice(`Static build completed in ${response.durationMs} ms.`)
      await loadAll()
    } catch (rebuildError) {
      setError(rebuildError.message)
    } finally {
      setIsRebuilding(false)
    }
  }

  const stats = useMemo(() => {
    const safe = content || normalizeContent({})

    return {
      projects: safe.works.length,
      skillGroups: safe.skillGroups.length,
      experiences: safe.experiences.length,
      education: safe.education.length,
      languages: safe.spokenLanguages.length,
      outputFiles: siteInfo?.topLevelOutputFiles?.length || 0,
    }
  }, [content, siteInfo])

  const actions = (
    <>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={loadAll}
        disabled={isRefreshing || isRebuilding}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={runRebuild}
        disabled={isRefreshing || isRebuilding}
      >
        {isRebuilding ? 'Rebuilding...' : 'Rebuild Site'}
      </button>
      <Link href="/" className={styles.btnGhost}>
        Open Portfolio
      </Link>
    </>
  )

  return (
    <>
      <Head>
        <title>Admin Overview</title>
        <meta
          name="description"
          content="Professional administration dashboard for portfolio content and local static builds."
        />
      </Head>

      <AdminLayout
        title="Overview"
        description="Control and monitor content, build output, and local server health from one place."
        actions={actions}
        notice={notice}
        error={error}
      >
        <section className={styles.cardGrid}>
          <article className={styles.card}>
            <h3>Projects</h3>
            <p>{stats.projects}</p>
          </article>
          <article className={styles.card}>
            <h3>Skill Groups</h3>
            <p>{stats.skillGroups}</p>
          </article>
          <article className={styles.card}>
            <h3>Experience Entries</h3>
            <p>{stats.experiences}</p>
          </article>
          <article className={styles.card}>
            <h3>Education Entries</h3>
            <p>{stats.education}</p>
          </article>
          <article className={styles.card}>
            <h3>Languages</h3>
            <p>{stats.languages}</p>
          </article>
          <article className={styles.card}>
            <h3>Output Files</h3>
            <p>{stats.outputFiles}</p>
          </article>
          <article className={styles.card}>
            <h3>Server Status</h3>
            <p>{health?.status || 'offline'}</p>
          </article>
          <article className={styles.card}>
            <h3>Build In Progress</h3>
            <p>{health?.isBuilding ? 'yes' : 'no'}</p>
          </article>
        </section>

        <section className={styles.grid2}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Runtime</h2>
            </div>

            <div className={styles.formGridSingle}>
              <p className={styles.helperText}>
                <strong>Static directory:</strong> {health?.staticDir || '--'}
              </p>
              <p className={styles.helperText}>
                <strong>Content file:</strong> {health?.contentFile || '--'}
              </p>
              <p className={styles.helperText}>
                <strong>Last check:</strong> {shortTime(health?.time)}
              </p>
              <p className={styles.helperText}>
                <strong>Uptime:</strong> {health?.uptimeSeconds ?? '--'} seconds
              </p>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>API Routes</h2>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {(siteInfo?.endpoints || []).map((route) => (
                    <tr key={route}>
                      <td>{route}</td>
                      <td>Local manager endpoint</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Build Output</h2>
            <p>Latest `npm run build` output from the local manager server.</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <pre className={styles.helperText}>
                      {buildLog || 'Trigger "Rebuild Site" to capture logs.'}
                    </pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </AdminLayout>
    </>
  )
}
