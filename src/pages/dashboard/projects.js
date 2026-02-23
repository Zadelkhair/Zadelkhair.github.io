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
import {
  createId,
  joinCommaList,
  normalizeContent,
  splitCommaList,
  toAssetPath,
  toPublicPath,
} from '@/lib/admin-content'

const emptyProject = () => ({
  id: createId('project'),
  category: 'New Category',
  title: 'New Project',
  image: '',
  modal: {
    title: 'New Project',
    description: '',
    categories: [],
  },
  swiperImages: [],
})

export default function DashboardProjects() {
  const [content, setContent] = useState(null)
  const [selectedId, setSelectedId] = useState('')
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
      const normalized = normalizeContent(payload)
      setContent(normalized)
      setSelectedId((current) => current || normalized.works[0]?.id || '')
      setNotice('Project catalog loaded.')
    } catch (loadError) {
      setError(`${loadError.message} Start the manager with "npm run serve:local".`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const projects = content?.works || []

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedId) || null,
    [projects, selectedId]
  )

  const setProjects = (updater) => {
    setContent((current) => {
      if (!current) {
        return current
      }

      const nextWorks = updater(current.works)
      return { ...current, works: nextWorks }
    })
  }

  const updateSelectedProject = (updater) => {
    if (!selectedId) {
      return
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedId ? updater(project) : project
      )
    )
  }

  const createProject = () => {
    const next = emptyProject()
    setProjects((currentProjects) => [...currentProjects, next])
    setSelectedId(next.id)
    setNotice('New project created. Fill the form and save.')
  }

  const deleteProject = (projectId) => {
    const confirmed = window.confirm('Delete this project? This cannot be undone until saved.')
    if (!confirmed) {
      return
    }

    setProjects((currentProjects) => currentProjects.filter((item) => item.id !== projectId))

    if (projectId === selectedId) {
      const remaining = projects.filter((item) => item.id !== projectId)
      setSelectedId(remaining[0]?.id || '')
    }

    setNotice('Project removed from draft. Save to persist.')
  }

  const save = async () => {
    if (!content) {
      return false
    }

    setIsSaving(true)
    setError('')

    try {
      await saveContent(content)
      setNotice('Projects saved successfully.')
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
      setNotice(`Projects saved and static site rebuilt in ${response.durationMs} ms.`)
    } catch (rebuildError) {
      setError(rebuildError.message)
    } finally {
      setIsRebuilding(false)
    }
  }

  const uploadMainImage = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !selectedProject) {
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const payload = await uploadImage({ file, folder: 'projects' })
      const nextPath = toAssetPath(payload.relativePath || payload.publicPath)

      updateSelectedProject((project) => ({
        ...project,
        image: nextPath,
        swiperImages:
          project.swiperImages.length > 0
            ? project.swiperImages
            : [nextPath],
      }))

      setNotice('Project image uploaded. Save to persist.')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  const uploadSlides = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''

    if (!selectedProject || files.length === 0) {
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const result = await uploadImage({ file, folder: 'projects/slides' })
          return toAssetPath(result.relativePath || result.publicPath)
        })
      )

      updateSelectedProject((project) => ({
        ...project,
        swiperImages: [...project.swiperImages, ...uploads],
      }))

      setNotice(`${uploads.length} slide image(s) uploaded. Save to persist.`)
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
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
        className={styles.btnSecondary}
        onClick={createProject}
        disabled={isLoading || isSaving || isRebuilding}
      >
        New Project
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
        <title>Admin Projects</title>
        <meta
          name="description"
          content="Projects administration with CRUD tables, forms, and image uploaders."
        />
      </Head>

      <AdminLayout
        title="Projects"
        description="Create, update, and delete portfolio projects with dedicated image and slide uploaders."
        actions={actions}
        notice={notice}
        error={error}
      >
        <section className={styles.split}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Project Table</h2>
              <p>{projects.length} total entries.</p>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Slides</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className={project.id === selectedId ? styles.rowActive : ''}
                    >
                      <td>{project.title}</td>
                      <td>{project.category}</td>
                      <td>{project.swiperImages.length}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.btnGhost}
                            onClick={() => setSelectedId(project.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.btnDanger}
                            onClick={() => deleteProject(project.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Project Form</h2>
              <p>{selectedProject ? `Editing ${selectedProject.title}` : 'Select or create a project.'}</p>
            </div>

            {!selectedProject ? (
              <p className={styles.helperText}>No project selected.</p>
            ) : (
              <div className={styles.formGridSingle}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="project-title">Title</label>
                    <input
                      id="project-title"
                      className={styles.input}
                      value={selectedProject.title}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          title: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="project-category">Category</label>
                    <input
                      id="project-category"
                      className={styles.input}
                      value={selectedProject.category}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          category: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="project-modal-title">Card title</label>
                    <input
                      id="project-modal-title"
                      className={styles.input}
                      value={selectedProject.modal.title}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          modal: { ...project.modal, title: event.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="project-tags">Tags (comma separated)</label>
                    <input
                      id="project-tags"
                      className={styles.input}
                      value={joinCommaList(selectedProject.modal.categories)}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          modal: {
                            ...project.modal,
                            categories: splitCommaList(event.target.value),
                          },
                        }))
                      }
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label htmlFor="project-description">Description</label>
                    <textarea
                      id="project-description"
                      className={styles.textarea}
                      value={selectedProject.modal.description}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          modal: { ...project.modal, description: event.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="project-image-path">Main image path</label>
                    <input
                      id="project-image-path"
                      className={styles.input}
                      value={selectedProject.image}
                      onChange={(event) =>
                        updateSelectedProject((project) => ({
                          ...project,
                          image: toAssetPath(event.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="project-image-upload">Upload main image</label>
                    <input
                      id="project-image-upload"
                      type="file"
                      accept="image/*"
                      className={styles.input}
                      onChange={uploadMainImage}
                      disabled={isUploading}
                    />
                    <p className={styles.helperText}>
                      {isUploading ? 'Uploading...' : 'Image uploads to /public/images/uploads/projects'}
                    </p>
                  </div>
                </div>

                {selectedProject.image ? (
                  <div className={styles.previewFrame}>
                    <img
                      src={toPublicPath(selectedProject.image)}
                      alt={`${selectedProject.title} preview`}
                    />
                  </div>
                ) : null}

                <article className={styles.panel}>
                  <div className={styles.panelHeader}>
                    <h3>Slides</h3>
                    <div className={styles.inlineGroup}>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={() =>
                          updateSelectedProject((project) => ({
                            ...project,
                            swiperImages: [...project.swiperImages, project.image || ''],
                          }))
                        }
                      >
                        Add Slide Row
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.input}
                        onChange={uploadSlides}
                        disabled={isUploading}
                      />
                    </div>
                  </div>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Path</th>
                          <th>Preview</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.swiperImages.map((slide, index) => (
                          <tr key={`${selectedProject.id}-${index}`}>
                            <td>{index + 1}</td>
                            <td>
                              <input
                                className={styles.input}
                                value={slide}
                                onChange={(event) =>
                                  updateSelectedProject((project) => ({
                                    ...project,
                                    swiperImages: project.swiperImages.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? toAssetPath(event.target.value)
                                        : item
                                    ),
                                  }))
                                }
                              />
                            </td>
                            <td>
                              {slide ? (
                                <a
                                  href={toPublicPath(slide)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open
                                </a>
                              ) : (
                                '--'
                              )}
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.btnDanger}
                                onClick={() =>
                                  updateSelectedProject((project) => ({
                                    ...project,
                                    swiperImages: project.swiperImages.filter(
                                      (_, itemIndex) => itemIndex !== index
                                    ),
                                  }))
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </article>

                <div className={styles.chipList}>
                  {selectedProject.modal.categories.map((tag) => (
                    <span key={`${selectedProject.id}-${tag}`} className={styles.chip}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      </AdminLayout>
    </>
  )
}
