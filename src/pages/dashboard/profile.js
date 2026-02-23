import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import styles from '@/styles/Admin.module.css'
import {
  getContent,
  rebuildSite,
  saveContent,
  uploadImage,
} from '@/lib/admin-api'
import { normalizeContent, toAssetPath, toPublicPath } from '@/lib/admin-content'

export default function DashboardProfile() {
  const [content, setContent] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError('')

    try {
      const payload = await getContent()
      setContent(normalizeContent(payload))
      setNotice('Profile data loaded.')
    } catch (loadError) {
      setError(`${loadError.message} Start the manager with "npm run serve:local".`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateMeta = (key, value) => {
    setContent((current) => ({
      ...current,
      meta: { ...current.meta, [key]: value },
    }))
  }

  const updateContact = (key, value) => {
    setContent((current) => ({
      ...current,
      contact: { ...current.contact, [key]: value },
    }))
  }

  const updateHero = (key, value) => {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, [key]: value },
    }))
  }

  const updateCta = (key, value) => {
    setContent((current) => ({
      ...current,
      cta: { ...current.cta, [key]: value },
    }))
  }

  const updateSection = (sectionName, key, value) => {
    setContent((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [sectionName]: {
          ...current.sections[sectionName],
          [key]: value,
        },
      },
    }))
  }

  const save = async () => {
    if (!content) {
      return false
    }

    setIsSaving(true)
    setError('')

    try {
      await saveContent(content)
      setNotice('Profile content saved to src/data/site-content.json.')
      return true
    } catch (saveError) {
      setError(saveError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const saveAndRebuild = async () => {
    const saved = await save()
    if (!saved) {
      return
    }

    setIsRebuilding(true)
    setError('')

    try {
      const response = await rebuildSite()
      setNotice(`Saved and rebuilt in ${response.durationMs} ms.`)
    } catch (rebuildError) {
      setError(rebuildError.message)
    } finally {
      setIsRebuilding(false)
    }
  }

  const uploadPortrait = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const payload = await uploadImage({ file, folder: 'profile' })
      updateHero('portraitSrc', toAssetPath(payload.relativePath || payload.publicPath))
      setNotice('Portrait image uploaded. Save to persist.')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  const portraitPreview = useMemo(() => {
    if (!content?.hero?.portraitSrc) {
      return ''
    }

    return toPublicPath(content.hero.portraitSrc)
  }, [content])

  const actions = (
    <>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={load}
        disabled={isLoading || isSaving || isRebuilding}
      >
        {isLoading ? 'Refreshing...' : 'Reload'}
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={save}
        disabled={isLoading || isSaving || isRebuilding}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
      <button
        type="button"
        className={styles.btnGhost}
        onClick={saveAndRebuild}
        disabled={isLoading || isSaving || isRebuilding}
      >
        {isRebuilding ? 'Rebuilding...' : 'Save + Rebuild'}
      </button>
    </>
  )

  if (!content) {
    return (
      <>
        <Head>
          <title>Admin Profile</title>
        </Head>
        <AdminLayout
          title="Profile"
          description="Edit core profile and contact settings for your portfolio."
          actions={actions}
          notice={notice}
          error={error}
        >
          <section className={styles.panel}>
            <p className={styles.helperText}>Loading profile data...</p>
          </section>
        </AdminLayout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Profile</title>
        <meta
          name="description"
          content="Profile settings administration with forms and image upload controls."
        />
      </Head>

      <AdminLayout
        title="Profile"
        description="Edit your personal details, section titles, hero content, and contact links."
        actions={actions}
        notice={notice}
        error={error}
      >
        <section className={styles.sectionStack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Meta and Branding</h2>
              <p>Title, description, and brand text shown in browser and top navigation.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="meta-title">Meta title</label>
                <input
                  id="meta-title"
                  className={styles.input}
                  value={content.meta.title}
                  onChange={(event) => updateMeta('title', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="brand">Brand text</label>
                <input
                  id="brand"
                  className={styles.input}
                  value={content.brand}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, brand: event.target.value }))
                  }
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="meta-description">Meta description</label>
                <textarea
                  id="meta-description"
                  className={styles.textarea}
                  value={content.meta.description}
                  onChange={(event) => updateMeta('description', event.target.value)}
                />
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Contact</h2>
              <p>Links and contact values used in header, hero, and CTA sections.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="contact-linkedin">LinkedIn URL</label>
                <input
                  id="contact-linkedin"
                  className={styles.input}
                  value={content.contact.linkedinUrl}
                  onChange={(event) => updateContact('linkedinUrl', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  className={styles.input}
                  value={content.contact.email}
                  onChange={(event) => updateContact('email', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-phone">Phone (link value)</label>
                <input
                  id="contact-phone"
                  className={styles.input}
                  value={content.contact.phone}
                  onChange={(event) => updateContact('phone', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-phone-display">Phone display label</label>
                <input
                  id="contact-phone-display"
                  className={styles.input}
                  value={content.contact.phoneDisplay}
                  onChange={(event) => updateContact('phoneDisplay', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-location">Location</label>
                <input
                  id="contact-location"
                  className={styles.input}
                  value={content.contact.location}
                  onChange={(event) => updateContact('location', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="resume-path">Resume path</label>
                <input
                  id="resume-path"
                  className={styles.input}
                  value={content.contact.resumePath}
                  onChange={(event) => updateContact('resumePath', event.target.value)}
                />
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Hero and CTA</h2>
              <p>Main profile intro, portrait, and call-to-action labels.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="hero-eyebrow">Hero eyebrow</label>
                <input
                  id="hero-eyebrow"
                  className={styles.input}
                  value={content.hero.eyebrow}
                  onChange={(event) => updateHero('eyebrow', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="hero-alt">Portrait alt</label>
                <input
                  id="hero-alt"
                  className={styles.input}
                  value={content.hero.portraitAlt}
                  onChange={(event) => updateHero('portraitAlt', event.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="hero-title">Hero title</label>
                <input
                  id="hero-title"
                  className={styles.input}
                  value={content.hero.title}
                  onChange={(event) => updateHero('title', event.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="hero-lead">Hero lead paragraph</label>
                <textarea
                  id="hero-lead"
                  className={styles.textarea}
                  value={content.hero.lead}
                  onChange={(event) => updateHero('lead', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="portrait-src">Portrait path</label>
                <input
                  id="portrait-src"
                  className={styles.input}
                  value={content.hero.portraitSrc}
                  onChange={(event) =>
                    updateHero('portraitSrc', toAssetPath(event.target.value))
                  }
                />
                <p className={styles.helperText}>Use relative paths like images/uploads/profile/your-file.jpg</p>
              </div>

              <div className={styles.field}>
                <label htmlFor="portrait-upload">Upload portrait image</label>
                <input
                  id="portrait-upload"
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={uploadPortrait}
                  disabled={isUploading}
                />
                <p className={styles.helperText}>
                  {isUploading ? 'Uploading image...' : 'Upload sets portrait path automatically.'}
                </p>
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="cta-lead">CTA lead text</label>
                <input
                  id="cta-lead"
                  className={styles.input}
                  value={content.cta.lead}
                  onChange={(event) => updateCta('lead', event.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="cta-title">CTA title</label>
                <input
                  id="cta-title"
                  className={styles.input}
                  value={content.cta.title}
                  onChange={(event) => updateCta('title', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="cta-email-label">CTA email label</label>
                <input
                  id="cta-email-label"
                  className={styles.input}
                  value={content.cta.emailLabel}
                  onChange={(event) => updateCta('emailLabel', event.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="cta-phone-label">CTA phone label</label>
                <input
                  id="cta-phone-label"
                  className={styles.input}
                  value={content.cta.phoneLabel}
                  onChange={(event) => updateCta('phoneLabel', event.target.value)}
                />
              </div>
            </div>

            {portraitPreview ? (
              <div className={styles.previewFrame}>
                <img src={portraitPreview} alt="Current portrait preview" />
              </div>
            ) : null}
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Section Titles and Descriptions</h2>
              <p>Change labels for capabilities, experience, education, languages, and projects blocks.</p>
            </div>

            <div className={styles.grid2}>
              {Object.entries(content.sections).map(([sectionName, sectionValue]) => (
                <div key={sectionName} className={styles.panel}>
                  <div className={styles.field}>
                    <label htmlFor={`${sectionName}-title`}>{sectionName} title</label>
                    <input
                      id={`${sectionName}-title`}
                      className={styles.input}
                      value={sectionValue.title}
                      onChange={(event) =>
                        updateSection(sectionName, 'title', event.target.value)
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor={`${sectionName}-desc`}>{sectionName} description</label>
                    <textarea
                      id={`${sectionName}-desc`}
                      className={styles.textarea}
                      value={sectionValue.description}
                      onChange={(event) =>
                        updateSection(sectionName, 'description', event.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </AdminLayout>
    </>
  )
}
