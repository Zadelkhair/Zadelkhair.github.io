import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import styles from '@/styles/Admin.module.css'
import { getContent, rebuildSite, saveContent } from '@/lib/admin-api'
import {
  createId,
  joinCommaList,
  joinLines,
  normalizeContent,
  splitCommaList,
  splitLines,
} from '@/lib/admin-content'

const emptySkill = () => ({
  id: createId('skill'),
  title: 'New Skill Group',
  list: [],
})

const emptyExperience = () => ({
  id: createId('experience'),
  role: 'New Role',
  company: '',
  location: '',
  period: '',
  points: [],
})

const emptyEducation = () => ({
  id: createId('education'),
  degree: 'New Degree',
  school: '',
  period: '',
  details: '',
})

export default function DashboardCareer() {
  const [content, setContent] = useState(null)
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [selectedExperienceId, setSelectedExperienceId] = useState('')
  const [selectedEducationId, setSelectedEducationId] = useState('')
  const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(-1)

  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRebuilding, setIsRebuilding] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError('')

    try {
      const payload = await getContent()
      const normalized = normalizeContent(payload)
      setContent(normalized)
      setSelectedSkillId((current) => current || normalized.skillGroups[0]?.id || '')
      setSelectedExperienceId(
        (current) => current || normalized.experiences[0]?.id || ''
      )
      setSelectedEducationId((current) => current || normalized.education[0]?.id || '')
      setSelectedLanguageIndex((current) => {
        if (current >= 0 && current < normalized.spokenLanguages.length) {
          return current
        }
        return normalized.spokenLanguages.length > 0 ? 0 : -1
      })
      setNotice('Career sections loaded.')
    } catch (loadError) {
      setError(`${loadError.message} Start the manager with "npm run serve:local".`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!content) {
      return false
    }

    setIsSaving(true)
    setError('')

    try {
      await saveContent(content)
      setNotice('Career sections saved successfully.')
      return true
    } catch (saveError) {
      setError(saveError.message)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const saveAndRebuild = async () => {
    const ok = await save()
    if (!ok) {
      return
    }

    setIsRebuilding(true)

    try {
      const response = await rebuildSite()
      setNotice(`Career sections saved and rebuilt in ${response.durationMs} ms.`)
    } catch (rebuildError) {
      setError(rebuildError.message)
    } finally {
      setIsRebuilding(false)
    }
  }

  const skills = content?.skillGroups || []
  const experiences = content?.experiences || []
  const education = content?.education || []
  const languages = content?.spokenLanguages || []

  const selectedSkill = useMemo(
    () => skills.find((item) => item.id === selectedSkillId) || null,
    [skills, selectedSkillId]
  )

  const selectedExperience = useMemo(
    () => experiences.find((item) => item.id === selectedExperienceId) || null,
    [experiences, selectedExperienceId]
  )

  const selectedEducation = useMemo(
    () => education.find((item) => item.id === selectedEducationId) || null,
    [education, selectedEducationId]
  )

  const selectedLanguage =
    selectedLanguageIndex >= 0 ? languages[selectedLanguageIndex] || '' : ''

  const setSkillGroups = (updater) => {
    setContent((current) => ({ ...current, skillGroups: updater(current.skillGroups) }))
  }

  const setExperiences = (updater) => {
    setContent((current) => ({ ...current, experiences: updater(current.experiences) }))
  }

  const setEducation = (updater) => {
    setContent((current) => ({ ...current, education: updater(current.education) }))
  }

  const setLanguages = (updater) => {
    setContent((current) => ({ ...current, spokenLanguages: updater(current.spokenLanguages) }))
  }

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

  return (
    <>
      <Head>
        <title>Admin Career</title>
        <meta
          name="description"
          content="Career administration with CRUD forms and tables for skills, experience, education, and languages."
        />
      </Head>

      <AdminLayout
        title="Career"
        description="Manage skills, experience entries, education history, and spoken languages using structured forms."
        actions={actions}
        notice={notice}
        error={error}
      >
        <section className={styles.sectionStack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Skill Groups</h2>
              <div className={styles.inlineGroup}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    const item = emptySkill()
                    setSkillGroups((items) => [...items, item])
                    setSelectedSkillId(item.id)
                    setNotice('Skill group added. Save to persist.')
                  }}
                >
                  Add Skill Group
                </button>
                {selectedSkill ? (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      const confirmed = window.confirm('Delete selected skill group?')
                      if (!confirmed) return
                      const next = skills.filter((item) => item.id !== selectedSkill.id)
                      setSkillGroups(() => next)
                      setSelectedSkillId(next[0]?.id || '')
                      setNotice('Skill group removed from draft.')
                    }}
                  >
                    Delete Selected
                  </button>
                ) : null}
              </div>
            </div>

            <section className={styles.split}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Items</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((item) => (
                      <tr key={item.id} className={item.id === selectedSkillId ? styles.rowActive : ''}>
                        <td>{item.title}</td>
                        <td>{item.list.length}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setSelectedSkillId(item.id)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.formGridSingle}>
                {!selectedSkill ? (
                  <p className={styles.helperText}>Select a skill group to edit.</p>
                ) : (
                  <>
                    <div className={styles.field}>
                      <label htmlFor="skill-title">Group title</label>
                      <input
                        id="skill-title"
                        className={styles.input}
                        value={selectedSkill.title}
                        onChange={(event) =>
                          setSkillGroups((items) =>
                            items.map((item) =>
                              item.id === selectedSkill.id
                                ? { ...item, title: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="skill-list">Skills (comma separated)</label>
                      <textarea
                        id="skill-list"
                        className={styles.textarea}
                        value={joinCommaList(selectedSkill.list)}
                        onChange={(event) =>
                          setSkillGroups((items) =>
                            items.map((item) =>
                              item.id === selectedSkill.id
                                ? { ...item, list: splitCommaList(event.target.value) }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Experience</h2>
              <div className={styles.inlineGroup}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    const item = emptyExperience()
                    setExperiences((items) => [...items, item])
                    setSelectedExperienceId(item.id)
                    setNotice('Experience entry added.')
                  }}
                >
                  Add Experience
                </button>
                {selectedExperience ? (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      const confirmed = window.confirm('Delete selected experience entry?')
                      if (!confirmed) return
                      const next = experiences.filter((item) => item.id !== selectedExperience.id)
                      setExperiences(() => next)
                      setSelectedExperienceId(next[0]?.id || '')
                      setNotice('Experience entry removed from draft.')
                    }}
                  >
                    Delete Selected
                  </button>
                ) : null}
              </div>
            </div>

            <section className={styles.split}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Period</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((item) => (
                      <tr key={item.id} className={item.id === selectedExperienceId ? styles.rowActive : ''}>
                        <td>{item.role}</td>
                        <td>{item.company}</td>
                        <td>{item.period}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setSelectedExperienceId(item.id)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.formGridSingle}>
                {!selectedExperience ? (
                  <p className={styles.helperText}>Select an experience entry to edit.</p>
                ) : (
                  <>
                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label htmlFor="experience-role">Role</label>
                        <input
                          id="experience-role"
                          className={styles.input}
                          value={selectedExperience.role}
                          onChange={(event) =>
                            setExperiences((items) =>
                              items.map((item) =>
                                item.id === selectedExperience.id
                                  ? { ...item, role: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="experience-company">Company</label>
                        <input
                          id="experience-company"
                          className={styles.input}
                          value={selectedExperience.company}
                          onChange={(event) =>
                            setExperiences((items) =>
                              items.map((item) =>
                                item.id === selectedExperience.id
                                  ? { ...item, company: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="experience-location">Location</label>
                        <input
                          id="experience-location"
                          className={styles.input}
                          value={selectedExperience.location}
                          onChange={(event) =>
                            setExperiences((items) =>
                              items.map((item) =>
                                item.id === selectedExperience.id
                                  ? { ...item, location: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="experience-period">Period</label>
                        <input
                          id="experience-period"
                          className={styles.input}
                          value={selectedExperience.period}
                          onChange={(event) =>
                            setExperiences((items) =>
                              items.map((item) =>
                                item.id === selectedExperience.id
                                  ? { ...item, period: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="experience-points">Bullet points (one per line)</label>
                      <textarea
                        id="experience-points"
                        className={styles.textarea}
                        value={joinLines(selectedExperience.points)}
                        onChange={(event) =>
                          setExperiences((items) =>
                            items.map((item) =>
                              item.id === selectedExperience.id
                                ? { ...item, points: splitLines(event.target.value) }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Education</h2>
              <div className={styles.inlineGroup}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    const item = emptyEducation()
                    setEducation((items) => [...items, item])
                    setSelectedEducationId(item.id)
                    setNotice('Education entry added.')
                  }}
                >
                  Add Education
                </button>
                {selectedEducation ? (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      const confirmed = window.confirm('Delete selected education entry?')
                      if (!confirmed) return
                      const next = education.filter((item) => item.id !== selectedEducation.id)
                      setEducation(() => next)
                      setSelectedEducationId(next[0]?.id || '')
                      setNotice('Education entry removed from draft.')
                    }}
                  >
                    Delete Selected
                  </button>
                ) : null}
              </div>
            </div>

            <section className={styles.split}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Degree</th>
                      <th>School</th>
                      <th>Period</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {education.map((item) => (
                      <tr key={item.id} className={item.id === selectedEducationId ? styles.rowActive : ''}>
                        <td>{item.degree}</td>
                        <td>{item.school}</td>
                        <td>{item.period}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setSelectedEducationId(item.id)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.formGridSingle}>
                {!selectedEducation ? (
                  <p className={styles.helperText}>Select an education entry to edit.</p>
                ) : (
                  <>
                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label htmlFor="education-degree">Degree</label>
                        <input
                          id="education-degree"
                          className={styles.input}
                          value={selectedEducation.degree}
                          onChange={(event) =>
                            setEducation((items) =>
                              items.map((item) =>
                                item.id === selectedEducation.id
                                  ? { ...item, degree: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="education-school">School</label>
                        <input
                          id="education-school"
                          className={styles.input}
                          value={selectedEducation.school}
                          onChange={(event) =>
                            setEducation((items) =>
                              items.map((item) =>
                                item.id === selectedEducation.id
                                  ? { ...item, school: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="education-period">Period</label>
                        <input
                          id="education-period"
                          className={styles.input}
                          value={selectedEducation.period}
                          onChange={(event) =>
                            setEducation((items) =>
                              items.map((item) =>
                                item.id === selectedEducation.id
                                  ? { ...item, period: event.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="education-details">Details</label>
                      <textarea
                        id="education-details"
                        className={styles.textarea}
                        value={selectedEducation.details}
                        onChange={(event) =>
                          setEducation((items) =>
                            items.map((item) =>
                              item.id === selectedEducation.id
                                ? { ...item, details: event.target.value }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Languages</h2>
              <div className={styles.inlineGroup}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setLanguages((items) => [...items, 'New Language'])
                    setSelectedLanguageIndex(languages.length)
                    setNotice('Language added.')
                  }}
                >
                  Add Language
                </button>
                {selectedLanguageIndex >= 0 ? (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      const confirmed = window.confirm('Delete selected language?')
                      if (!confirmed) return
                      const next = languages.filter((_, index) => index !== selectedLanguageIndex)
                      setLanguages(() => next)
                      setSelectedLanguageIndex(next.length > 0 ? 0 : -1)
                      setNotice('Language removed from draft.')
                    }}
                  >
                    Delete Selected
                  </button>
                ) : null}
              </div>
            </div>

            <section className={styles.split}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((item, index) => (
                      <tr
                        key={`${item}-${index}`}
                        className={index === selectedLanguageIndex ? styles.rowActive : ''}
                      >
                        <td>{item}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setSelectedLanguageIndex(index)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.formGridSingle}>
                {selectedLanguageIndex < 0 ? (
                  <p className={styles.helperText}>Select a language entry to edit.</p>
                ) : (
                  <div className={styles.field}>
                    <label htmlFor="language-label">Language label</label>
                    <input
                      id="language-label"
                      className={styles.input}
                      value={selectedLanguage}
                      onChange={(event) =>
                        setLanguages((items) =>
                          items.map((item, index) =>
                            index === selectedLanguageIndex ? event.target.value : item
                          )
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </section>
          </article>
        </section>
      </AdminLayout>
    </>
  )
}
