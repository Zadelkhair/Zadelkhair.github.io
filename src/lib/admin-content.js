const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const ensureObject = (value, fallback = {}) => (isObject(value) ? value : fallback)

const ensureString = (value, fallback = '') =>
  typeof value === 'string' ? value : fallback

const ensureStringArray = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    : []

const ensureArray = (value) => (Array.isArray(value) ? value : [])

export const createId = (prefix = 'item') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const ensureId = (value, prefix) =>
  ensureString(value, createId(prefix))

export const toAssetPath = (path) => ensureString(path).replace(/^\/+/, '')

export const toPublicPath = (path) => {
  const normalized = toAssetPath(path)
  return normalized ? `/${normalized}` : ''
}

export const splitCommaList = (value) =>
  ensureString(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const joinCommaList = (value) => ensureStringArray(value).join(', ')

export const splitLines = (value) =>
  ensureString(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

export const joinLines = (value) => ensureStringArray(value).join('\n')

export const normalizeContent = (value) => {
  const content = ensureObject(value)

  const sections = ensureObject(content.sections)

  return {
    meta: {
      title: ensureString(content?.meta?.title),
      description: ensureString(content?.meta?.description),
    },
    brand: ensureString(content.brand),
    contact: {
      linkedinUrl: ensureString(content?.contact?.linkedinUrl),
      email: ensureString(content?.contact?.email),
      phone: ensureString(content?.contact?.phone),
      phoneDisplay: ensureString(content?.contact?.phoneDisplay),
      location: ensureString(content?.contact?.location),
      resumePath: ensureString(content?.contact?.resumePath),
    },
    hero: {
      eyebrow: ensureString(content?.hero?.eyebrow),
      title: ensureString(content?.hero?.title),
      lead: ensureString(content?.hero?.lead),
      portraitSrc: ensureString(content?.hero?.portraitSrc),
      portraitAlt: ensureString(content?.hero?.portraitAlt),
    },
    sections: {
      capabilities: {
        title: ensureString(sections?.capabilities?.title),
        description: ensureString(sections?.capabilities?.description),
      },
      experience: {
        title: ensureString(sections?.experience?.title),
        description: ensureString(sections?.experience?.description),
      },
      education: {
        title: ensureString(sections?.education?.title),
        description: ensureString(sections?.education?.description),
      },
      languages: {
        title: ensureString(sections?.languages?.title),
        description: ensureString(sections?.languages?.description),
      },
      projects: {
        title: ensureString(sections?.projects?.title),
        description: ensureString(sections?.projects?.description),
      },
    },
    cta: {
      lead: ensureString(content?.cta?.lead),
      title: ensureString(content?.cta?.title),
      emailLabel: ensureString(content?.cta?.emailLabel),
      phoneLabel: ensureString(content?.cta?.phoneLabel),
    },
    skillGroups: ensureArray(content.skillGroups).map((item) => ({
      id: ensureId(item?.id, 'skill'),
      title: ensureString(item?.title),
      list: ensureStringArray(item?.list),
    })),
    works: ensureArray(content.works).map((item) => ({
      id: ensureId(item?.id, 'project'),
      category: ensureString(item?.category),
      title: ensureString(item?.title),
      image: toAssetPath(item?.image),
      modal: {
        title: ensureString(item?.modal?.title),
        description: ensureString(item?.modal?.description),
        categories: ensureStringArray(item?.modal?.categories),
      },
      swiperImages: ensureStringArray(item?.swiperImages).map(toAssetPath),
    })),
    experiences: ensureArray(content.experiences).map((item) => ({
      id: ensureId(item?.id, 'experience'),
      role: ensureString(item?.role),
      company: ensureString(item?.company),
      location: ensureString(item?.location),
      period: ensureString(item?.period),
      points: ensureStringArray(item?.points),
    })),
    education: ensureArray(content.education).map((item) => ({
      id: ensureId(item?.id, 'education'),
      degree: ensureString(item?.degree),
      school: ensureString(item?.school),
      period: ensureString(item?.period),
      details: ensureString(item?.details),
    })),
    spokenLanguages: ensureStringArray(content.spokenLanguages),
  }
}
