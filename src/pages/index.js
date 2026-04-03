import Head from 'next/head'
import Image from 'next/image'
import { Sora, Work_Sans } from 'next/font/google'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import styles from '@/styles/Home.module.css'
import siteContent from '@/data/site-content.json'

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

const getString = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback

const getStringArray = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim().length > 0)
    : []

const fallbackImage = 'images/profile/zadelkhair-profile.jpeg'

const meta = siteContent?.meta || {}
const contact = siteContent?.contact || {}
const hero = siteContent?.hero || {}
const sections = siteContent?.sections || {}
const cta = siteContent?.cta || {}

const skillGroups = (Array.isArray(siteContent?.skillGroups)
  ? siteContent.skillGroups
  : []
)
  .map((group, index) => ({
    title: getString(group?.title, `Group ${index + 1}`),
    list: getStringArray(group?.list),
  }))
  .filter((group) => group.title.length > 0)

const works = (Array.isArray(siteContent?.works) ? siteContent.works : []).map(
  (project, index) => {
    const fallbackTitle = `Project ${index + 1}`
    const image = getString(project?.image, fallbackImage)
    const swiperImages = getStringArray(project?.swiperImages)
    const categories = getStringArray(project?.modal?.categories)

    return {
      category: getString(project?.category, 'Project'),
      title: getString(project?.title, fallbackTitle),
      image,
      liveUrl: getString(project?.liveUrl),
      liveLabel: getString(project?.liveLabel, 'Open Live Project'),
      modal: {
        title: getString(
          project?.modal?.title,
          getString(project?.title, fallbackTitle)
        ),
        description: getString(project?.modal?.description),
        categories,
      },
      swiperImages: swiperImages.length > 0 ? swiperImages : [image],
    }
  }
)

const experiences = (Array.isArray(siteContent?.experiences)
  ? siteContent.experiences
  : []
).map((item) => ({
  role: getString(item?.role),
  company: getString(item?.company),
  location: getString(item?.location),
  period: getString(item?.period),
  points: getStringArray(item?.points),
}))

const education = (Array.isArray(siteContent?.education)
  ? siteContent.education
  : []
).map((item) => ({
  degree: getString(item?.degree),
  school: getString(item?.school),
  period: getString(item?.period),
  details: getString(item?.details),
}))

const spokenLanguages = getStringArray(siteContent?.spokenLanguages)

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const projectVideoExtensions = new Set([
  'mp4',
  'm4v',
  'mov',
  'webm',
  'ogv',
  'ogg',
])

const toLinkHref = (value, fallback = '') => {
  const raw = getString(value, fallback).trim()
  if (!raw) {
    return ''
  }
  if (
    raw.startsWith('/') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:')
  ) {
    return raw
  }
  return `/${raw.replace(/^\/+/, '')}`
}

const toPublicPath = (assetPath) => {
  const cleanedPath = getString(assetPath).replace(/^\/+/, '')
  return cleanedPath.length > 0 ? `/${cleanedPath}` : '/images/profile/zadelkhair-profile.jpeg'
}

const getProjectMediaType = (assetPath) => {
  const extension = getString(assetPath).split('.').pop().toLowerCase()
  return projectVideoExtensions.has(extension) ? 'video' : 'image'
}

export default function Home() {
  const pageTitle = getString(
    meta.title,
    'Zadelkhair Abdelkoddous | Full-Stack & AI Developer'
  )
  const pageDescription = getString(
    meta.description,
    'Portfolio of Zadelkhair Abdelkoddous - Full-Stack and AI-focused developer building web, mobile, and intelligent software systems.'
  )
  const brand = getString(contact.brand, getString(siteContent?.brand, 'Portfolio'))
  const linkedinUrl = getString(contact.linkedinUrl)
  const email = getString(contact.email)
  const phone = getString(contact.phone)
  const phoneDisplay = getString(contact.phoneDisplay, phone)
  const locationText = getString(contact.location)
  const resumePath = toLinkHref(
    contact.resumePath,
    '/abdelkoddous-zadelkhair-resume.pdf'
  )
  const emailHref = email ? `mailto:${email}` : '#'
  const phoneHref = phone ? `tel:${phone}` : '#'
  const heroEyebrow = getString(hero.eyebrow)
  const heroTitle = getString(hero.title)
  const heroLead = getString(hero.lead)
  const portraitSrc = toPublicPath(
    getString(hero.portraitSrc, '/images/profile/zadelkhair-profile.jpeg')
  )
  const portraitAlt = getString(hero.portraitAlt, 'Developer portrait')
  const ctaEmailLabel = getString(cta.emailLabel, email)
  const ctaPhoneLabel = getString(cta.phoneLabel, 'Call Me')
  const [hasLocalManagerServer, setHasLocalManagerServer] = useState(false)

  const [projectSlides, setProjectSlides] = useState(() =>
    works.reduce((accumulator, project) => {
      accumulator[project.title] = 0
      return accumulator
    }, {})
  )
  const [visibleProjects, setVisibleProjects] = useState(() =>
    works.reduce((accumulator, project, index) => {
      accumulator[`${project.title}-${index}`] = false
      return accumulator
    }, {})
  )
  const [loadedProjectMedia, setLoadedProjectMedia] = useState({})
  const projectCardRefs = useRef(new Map())

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200)

    const detectServer = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          return
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          return
        }

        const payload = await response.json()
        if (isMounted && payload?.status === 'ok') {
          setHasLocalManagerServer(true)
        }
      } catch {
        // Hide dashboard link silently when local manager API is unavailable.
      } finally {
        clearTimeout(timeoutId)
      }
    }

    detectServer()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const projectId = entry.target.getAttribute('data-project-id')
          if (!projectId) {
            return
          }

          setVisibleProjects((current) => {
            if (current[projectId]) {
              return current
            }

            return { ...current, [projectId]: true }
          })

          observer.unobserve(entry.target)
        })
      },
      {
        root: null,
        rootMargin: '180px 0px',
        threshold: 0.12,
      }
    )

    projectCardRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [])

  const setProjectSlide = (projectTitle, slideIndex) => {
    setProjectSlides((current) => ({ ...current, [projectTitle]: slideIndex }))
  }

  const changeProjectSlide = (projectTitle, totalSlides, direction) => {
    setProjectSlides((current) => {
      const activeIndex = current[projectTitle] ?? 0
      const nextIndex = (activeIndex + direction + totalSlides) % totalSlides
      return { ...current, [projectTitle]: nextIndex }
    })
  }

  const markProjectMediaLoaded = (mediaKey) => {
    setLoadedProjectMedia((current) => {
      if (current[mediaKey]) {
        return current
      }

      return { ...current, [mediaKey]: true }
    })
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${styles.main} ${sora.variable} ${workSans.variable}`}>
        <div className={styles.backgroundGlow} aria-hidden="true" />
        <div className={styles.texture} aria-hidden="true" />

        <header className={styles.navbar}>
          <p className={styles.brand}>{brand}</p>
          <div className={styles.navActions}>
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navLink}
              >
                LinkedIn
              </a>
            )}
            {email && (
              <a href={emailHref} className={styles.navLink}>
                Email
              </a>
            )}
            {hasLocalManagerServer && (
              <a href="/dashboard" className={styles.navLink}>
                Dashboard
              </a>
            )}
            <a href={resumePath} className={styles.primaryBtn} download>
              Download Resume
            </a>
          </div>
        </header>

        <motion.section
          className={styles.hero}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { delayChildren: 0.1, staggerChildren: 0.12 },
            },
          }}
        >
          <motion.div className={styles.heroContent} variants={sectionVariants}>
            <p className={styles.eyebrow}>{heroEyebrow}</p>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroLead}>{heroLead}</p>
            <div className={styles.contactRow}>
              {email && (
                <a className={styles.primaryBtn} href={emailHref}>
                  Let&apos;s Work Together
                </a>
              )}
              {phone && (
                <a className={styles.secondaryBtn} href={phoneHref}>
                  {phoneDisplay}
                </a>
              )}
            </div>
            <p className={styles.location}>{locationText}</p>
          </motion.div>

          <motion.div className={styles.heroVisual} variants={sectionVariants}>
            <div className={styles.portraitShell}>
              <Image
                src={portraitSrc}
                alt={portraitAlt}
                width={1024}
                height={1536}
                className={styles.portrait}
                priority
              />
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className={styles.sectionHeader}>
            <h2>{getString(sections?.capabilities?.title, 'Core Capabilities')}</h2>
            <p>{getString(sections?.capabilities?.description)}</p>
          </div>
          <div className={styles.skillGrid}>
            {skillGroups.map((group) => (
              <article key={group.title} className={styles.skillCard}>
                <h3>{group.title}</h3>
                <ul>
                  {group.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className={styles.sectionHeader}>
            <h2>{getString(sections?.experience?.title, 'Experience Timeline')}</h2>
            <p>{getString(sections?.experience?.description)}</p>
          </div>
          <div className={styles.timeline}>
            {experiences.map((item) => (
              <article key={`${item.company}-${item.role}`} className={styles.timelineItem}>
                <div className={styles.timelineMeta}>
                  <p className={styles.role}>{item.role}</p>
                  <p className={styles.company}>
                    {item.company} • {item.location}
                  </p>
                  <p className={styles.period}>{item.period}</p>
                </div>
                <ul className={styles.points}>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className={styles.sectionHeader}>
            <h2>{getString(sections?.education?.title, 'Education')}</h2>
            <p>{getString(sections?.education?.description)}</p>
          </div>
          <div className={styles.educationGrid}>
            {education.map((item) => (
              <article key={`${item.school}-${item.degree}`} className={styles.educationCard}>
                <p className={styles.period}>{item.period}</p>
                <h3>{item.degree}</h3>
                <p className={styles.company}>{item.school}</p>
                <p>{item.details}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={sectionVariants}
        >
          <div className={styles.sectionHeader}>
            <h2>{getString(sections?.languages?.title, 'Languages')}</h2>
            <p>{getString(sections?.languages?.description)}</p>
          </div>
          <div className={styles.languageStrip}>
            {spokenLanguages.map((language) => (
              <span key={language}>{language}</span>
            ))}
          </div>
        </motion.section>

        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className={styles.sectionHeader}>
            <h2>{getString(sections?.projects?.title, 'Featured Project Work')}</h2>
            <p>{getString(sections?.projects?.description)}</p>
          </div>

          <div className={styles.projectGrid}>
            {works.map((project, projectIndex) => {
              const projectId = `${project.title}-${projectIndex}`
              const totalSlides = project.swiperImages.length || 1
              const activeIndex = projectSlides[project.title] ?? 0
              const safeIndex = activeIndex % totalSlides
              const activeMediaPath = toPublicPath(
                project.swiperImages[safeIndex] || project.image
              )
              const activeMediaType = getProjectMediaType(
                project.swiperImages[safeIndex] || project.image
              )
              const liveUrl = toLinkHref(project.liveUrl)
              const isProjectVisible = Boolean(visibleProjects[projectId])
              const mediaLoadKey = `${projectId}-${safeIndex}-${activeMediaPath}`
              const isMediaLoaded = Boolean(loadedProjectMedia[mediaLoadKey])

              return (
                <article
                  key={projectId}
                  className={styles.projectCard}
                  data-project-id={projectId}
                  ref={(node) => {
                    if (node) {
                      projectCardRefs.current.set(projectId, node)
                    } else {
                      projectCardRefs.current.delete(projectId)
                    }
                  }}
                >
                  <div className={styles.projectImageFrame}>
                    {!isProjectVisible ? (
                      <div className={styles.projectMediaPlaceholder}>
                        <span className={styles.projectMediaSpinner} aria-hidden="true" />
                        <p className={styles.projectMediaLabel}>Media loads on scroll</p>
                      </div>
                    ) : (
                      <>
                        {activeMediaType === 'video' ? (
                          <video
                            key={mediaLoadKey}
                            src={activeMediaPath}
                            className={styles.projectVideo}
                            controls
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={() =>
                              markProjectMediaLoaded(mediaLoadKey)
                            }
                            onLoadedData={() => markProjectMediaLoaded(mediaLoadKey)}
                            onCanPlay={() => markProjectMediaLoaded(mediaLoadKey)}
                          />
                        ) : (
                          <Image
                            src={activeMediaPath}
                            alt={`${project.title} slide ${safeIndex + 1}`}
                            fill
                            sizes="(max-width: 700px) 100vw, (max-width: 1040px) 50vw, 33vw"
                            className={styles.projectImage}
                            loading="lazy"
                            onLoadingComplete={() =>
                              markProjectMediaLoaded(mediaLoadKey)
                            }
                          />
                        )}

                        {!isMediaLoaded && (
                          <div className={styles.projectMediaLoader}>
                            <span
                              className={styles.projectMediaSpinner}
                              aria-hidden="true"
                            />
                            <p className={styles.projectMediaLabel}>
                              Loading media...
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {totalSlides > 1 && (
                    <div className={styles.projectSliderControls}>
                      <button
                        type="button"
                        className={styles.projectSliderButton}
                        onClick={() =>
                          changeProjectSlide(project.title, totalSlides, -1)
                        }
                      >
                        Prev
                      </button>
                      <div className={styles.projectSliderDots}>
                        {project.swiperImages.map((slidePath, slideIndex) => (
                          <button
                            key={`${project.title}-${slidePath}`}
                            type="button"
                            className={`${styles.projectSliderDot} ${
                              safeIndex === slideIndex
                                ? styles.projectSliderDotActive
                                : ''
                            }`}
                            onClick={() =>
                              setProjectSlide(project.title, slideIndex)
                            }
                            aria-label={`Go to ${project.title} slide ${
                              slideIndex + 1
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className={styles.projectSliderButton}
                        onClick={() =>
                          changeProjectSlide(project.title, totalSlides, 1)
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                  <p className={styles.projectCategory}>{project.category}</p>
                  <h3>{project.modal.title}</h3>
                  <p>{project.modal.description}</p>
                  <div className={styles.projectTags}>
                    {project.modal.categories.map((item) => (
                      <span key={`${project.title}-${item}`}>{item}</span>
                    ))}
                  </div>
                  <div className={styles.projectMetaRow}>
                    <p className={styles.projectSlideCount}>
                      Slide {safeIndex + 1} of {totalSlides}
                    </p>
                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.projectActionLink}
                      >
                        {project.liveLabel}
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          className={styles.ctaSection}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={sectionVariants}
        >
          <p>{getString(cta.lead)}</p>
          <h2>{getString(cta.title)}</h2>
          <div className={styles.contactRow}>
            {email && (
              <a href={emailHref} className={styles.primaryBtn}>
                {ctaEmailLabel}
              </a>
            )}
            {phone && (
              <a href={phoneHref} className={styles.secondaryBtn}>
                {ctaPhoneLabel}
              </a>
            )}
          </div>
        </motion.section>
      </main>
    </>
  )
}
