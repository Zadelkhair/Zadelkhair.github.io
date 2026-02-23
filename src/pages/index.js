import Head from 'next/head'
import Image from 'next/image'
import { Sora, Work_Sans } from 'next/font/google'
import { motion } from 'framer-motion'
import { useState } from 'react'
import styles from '@/styles/Home.module.css'

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

const skillGroups = [
  {
    title: 'AI + Data Systems',
    list: ['LangChain', 'OpenAI', 'LLMs', 'Data Cleaning', 'Web Scraping'],
  },
  {
    title: 'Frontend & Mobile',
    list: ['React.js', 'Vue.js', 'React Native', 'Bootstrap'],
  },
  {
    title: 'Backend & APIs',
    list: ['Laravel', 'Node.js', 'Express.js', 'PHP', 'Python'],
  },
  {
    title: 'Infrastructure',
    list: ['AWS (EC2, S3, SES)', 'Docker', 'Git', 'Ubuntu/Linux', 'MongoDB'],
  },
]

const works = [
  {
    category: 'Fitness Platform',
    title: 'Mifithub',
    image: 'images/mifitLogo.png',
    modal: {
      title: 'Mifithub',
      description:
        'A fitness platform with mobile apps, a website, and a trainer dashboard for personalized fitness programs.',
      categories: ['Mobile App', 'Web Development'],
    },
    swiperImages: [
      'images/slide1.png',
      'images/slide2.png',
      'images/slide3.png',
      'images/slide4.png',
      'images/slide5.png',
    ],
  },
  {
    category: 'Real Estate Platform',
    title: 'Multilist',
    image: 'images/portfolio/multilist.png',
    modal: {
      title: 'Multilist',
      description:
        'A real estate platform with features like map search, ranking systems, and ad promotion.',
      categories: ['Web Development', 'UI/UX Design'],
    },
    swiperImages: [
      'images/multilist1.png',
      'images/multilist2.png',
      'images/multilist3.png',
      'images/multilist4.png',
    ],
  },
  {
    category: 'CRM System',
    title: 'Alliances',
    image: 'images/portfolio/alliances.png',
    modal: {
      title: 'Alliances CRM',
      description:
        'A CRM system for managing customer communication, lead tracking, and property management.',
      categories: ['Web Development', 'Database Management'],
    },
    swiperImages: ['images/alliances.png'],
  },
  {
    category: 'Educational application',
    title: 'Alkhayrat',
    image: 'images/portfolio/alkhayrat.png',
    modal: {
      title: 'Code Alkhayrat',
      description:
        'Applications (CODE ALKHAYRAT) to support driving students in preparing for the exam (codealkhayrat.com).',
      categories: ['Web Development'],
    },
    swiperImages: [
      'images/alkhayrat1.png',
      'images/alkhayrat2.png',
      'images/alkhayrat3.png',
      'images/alkhayrat4.png',
    ],
  },
]

const experiences = [
  {
    role: 'Full-Stack / AI Agent Developer (Internship)',
    company: 'QUALISO',
    location: 'Casablanca, Morocco',
    period: 'Apr 2025 - Aug 2025',
    points: [
      'Built a full AI-driven pipeline for scraping, cleaning, enriching, and estimating car market prices.',
      'Developed LangChain agents with multi-model orchestration to improve prediction quality on incomplete records.',
      'Shipped a production-ready Laravel + Vue dashboard for monitoring market trends and AI outputs.',
    ],
  },
  {
    role: 'IT Teacher',
    company: 'Ministry of National Education',
    location: 'Berrechid, Morocco',
    period: 'Oct 2022 - Present',
    points: [
      'Teach programming, algorithms, networking, and system fundamentals to high school students.',
      'Mentor technology club initiatives and hands-on innovation projects.',
      'Strengthen communication, leadership, and coaching through technical instruction.',
    ],
  },
  {
    role: 'Software Developer (Internship)',
    company: 'AGRI4.0',
    location: 'Agadir, Morocco',
    period: 'May 2021 - Sep 2021',
    points: [
      'Developed modules for a mobile agriculture management application.',
      'Contributed to API development, database design, and UML-based planning.',
      'Worked in a Git + Agile team environment focused on iterative delivery.',
    ],
  },
  {
    role: 'IT Technician',
    company: 'ALKHAYRAT',
    location: 'Berrechid, Morocco',
    period: 'Jan 2019 - Feb 2021',
    points: [
      'Maintained IT infrastructure and handled software/system deployments.',
      'Built and supported internal web/mobile full-stack solutions.',
      'Provided technical support and troubleshooting across teams.',
    ],
  },
]

const education = [
  {
    degree: 'BSc in Computer Science',
    school: 'Ibn Zohr University',
    period: '2017 - 2021',
    details:
      'Focus on software engineering, AI fundamentals, operating systems, networking, Java OOP, and database systems.',
  },
  {
    degree: 'Specialized Technician Diploma - IT Development Techniques',
    school:
      'Institute of Informatics, Commerce, and Management (OFPPT), Berrechid',
    period: '2017 - 2020',
    details:
      'Training in C++, Linux/Unix, SQL, web development, and client-server networking foundations.',
  },
  {
    degree: 'High School Diploma - Experimental Sciences',
    school: 'Lycée Oulad Hriz, Berrechid',
    period: '2017',
    details: 'Scientific track with emphasis on analytical reasoning.',
  },
]

const spokenLanguages = ['Arabic (Native)', 'English (B2)', 'French (B2)', 'German (B2)']

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const toPublicPath = (path) => `/${path.replace(/^\/+/, '')}`

export default function Home() {
  const [projectSlides, setProjectSlides] = useState(() =>
    works.reduce((accumulator, project) => {
      accumulator[project.title] = 0
      return accumulator
    }, {})
  )

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

  return (
    <>
      <Head>
        <title>Zadelkhair Abdelkoddous | Full-Stack & AI Developer</title>
        <meta
          name="description"
          content="Portfolio of Zadelkhair Abdelkoddous - Full-Stack and AI-focused developer building web, mobile, and intelligent software systems."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`${styles.main} ${sora.variable} ${workSans.variable}`}>
        <div className={styles.backgroundGlow} aria-hidden="true" />
        <div className={styles.texture} aria-hidden="true" />

        <header className={styles.navbar}>
          <p className={styles.brand}>ZADELKHAIR ABDELKODDOUS</p>
          <div className={styles.navActions}>
            <a
              href="https://www.linkedin.com/in/abdelkoddouszad"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navLink}
            >
              LinkedIn
            </a>
            <a href="mailto:abdo.zad.raja2@gmail.com" className={styles.navLink}>
              Email
            </a>
            <a href="/abdelkoddous-zadelkhair-resume.pdf" className={styles.primaryBtn} download>
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
            <p className={styles.eyebrow}>Full-Stack Developer + AI Agent Builder</p>
            <h1 className={styles.heroTitle}>I build software that turns complex data into clear user decisions.</h1>
            <p className={styles.heroLead}>
              I am a Morocco-based developer with a strong foundation in web, mobile, and AI-integrated products. I
              focus on reliable backend architecture, intuitive interfaces, and practical model-powered features.
            </p>
            <div className={styles.contactRow}>
              <a className={styles.primaryBtn} href="mailto:abdo.zad.raja2@gmail.com">
                Let&apos;s Work Together
              </a>
              <a className={styles.secondaryBtn} href="tel:+212680096104">
                +212 680 096 104
              </a>
            </div>
            <p className={styles.location}>Based in Casablanca, Morocco</p>
          </motion.div>

          <motion.div className={styles.heroVisual} variants={sectionVariants}>
            <div className={styles.portraitShell}>
              <Image
                src="/images/profile/zadelkhair-profile.jpeg"
                alt="Portrait of Zadelkhair Abdelkoddous"
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
            <h2>Core Capabilities</h2>
            <p>
              A practical stack for shipping complete products, from data pipelines and APIs to polished frontends and
              mobile interfaces.
            </p>
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
            <h2>Experience Timeline</h2>
            <p>Roles focused on full-stack delivery, AI workflows, and technical mentorship.</p>
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
            <h2>Education</h2>
            <p>Academic training in computer science and software engineering fundamentals.</p>
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
            <h2>Languages</h2>
            <p>I work comfortably across multilingual environments and teams.</p>
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
            <h2>Featured Project Work</h2>
            <p>
              Portfolio projects from my previous work, including fitness,
              real-estate, CRM, and educational systems.
            </p>
          </div>

          <div className={styles.projectGrid}>
            {works.map((project) => {
              const totalSlides = project.swiperImages.length || 1
              const activeIndex = projectSlides[project.title] ?? 0
              const safeIndex = activeIndex % totalSlides
              const activeImage = toPublicPath(
                project.swiperImages[safeIndex] || project.image
              )

              return (
                <article key={project.title} className={styles.projectCard}>
                  <div className={styles.projectImageFrame}>
                    <Image
                      src={activeImage}
                      alt={`${project.title} slide ${safeIndex + 1}`}
                      fill
                      sizes="(max-width: 700px) 100vw, (max-width: 1040px) 50vw, 33vw"
                      className={styles.projectImage}
                    />
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
                  <p className={styles.projectSlideCount}>
                    Slide {safeIndex + 1} of {totalSlides}
                  </p>
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
          <p>Available for Full-Stack and AI-focused software opportunities.</p>
          <h2>Let&apos;s build useful technology with measurable impact.</h2>
          <div className={styles.contactRow}>
            <a href="mailto:abdo.zad.raja2@gmail.com" className={styles.primaryBtn}>
              abdo.zad.raja2@gmail.com
            </a>
            <a href="tel:+212680096104" className={styles.secondaryBtn}>
              Call Me
            </a>
          </div>
        </motion.section>
      </main>
    </>
  )
}
