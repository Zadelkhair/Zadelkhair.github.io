const formatApiError = (message, status) => {
  const error = new Error(message)
  if (typeof status === 'number') {
    error.status = status
  }
  return error
}

const UPLOAD_LIMITS = {
  document: 10 * 1024 * 1024,
  image: 8 * 1024 * 1024,
  video: 50 * 1024 * 1024,
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'ogv', 'ogg', 'mov'])

const extensionFromName = (name) => {
  const safeName = typeof name === 'string' ? name : ''
  const parts = safeName.split('.')
  if (parts.length < 2) {
    return ''
  }
  return parts[parts.length - 1].toLowerCase()
}

const getAssetType = (file) => {
  const mimeType = (file?.type || '').toLowerCase()
  const extension = extensionFromName(file?.name || '')

  if (mimeType.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return 'image'
  }
  if (mimeType.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) {
    return 'video'
  }
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return 'document'
  }
  return null
}

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  const text = await response.text()

  let payload = {}
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { raw: text }
    }
  }

  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}.`
    throw formatApiError(message, response.status)
  }

  return payload
}

export const getContent = async () => {
  const payload = await fetchJson('/api/content')
  return payload?.content || {}
}

export const saveContent = (content) =>
  fetchJson('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })

export const getHealth = () => fetchJson('/api/health')

export const getSiteInfo = () => fetchJson('/api/site-info')

export const rebuildSite = () =>
  fetchJson('/api/rebuild', {
    method: 'POST',
  })

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file.'))
    }

    reader.readAsDataURL(file)
  })

export const uploadImage = async ({ file, folder = 'general' }) => {
  return uploadAsset({ file, folder, mode: 'image' })
}

export const uploadAsset = async ({ file, folder = 'general', mode = 'any' }) => {
  if (!file) {
    throw new Error('No file selected.')
  }

  const assetType = getAssetType(file)
  if (!assetType) {
    throw new Error('Unsupported file type. Use image, video, or PDF.')
  }

  if (mode === 'image' && assetType !== 'image') {
    throw new Error('Please upload an image file.')
  }
  if (mode === 'video' && assetType !== 'video') {
    throw new Error('Please upload a video file.')
  }
  if (mode === 'document' && assetType !== 'document') {
    throw new Error('Please upload a PDF document.')
  }
  if (mode === 'media' && assetType !== 'image' && assetType !== 'video') {
    throw new Error('Please upload image or video files.')
  }

  const sizeLimit = UPLOAD_LIMITS[assetType] || UPLOAD_LIMITS.image
  if (typeof file.size === 'number' && file.size > sizeLimit) {
    const limitMb = Math.round(sizeLimit / (1024 * 1024))
    throw new Error(`File exceeds ${limitMb}MB upload limit.`)
  }

  const dataUrl = await fileToDataUrl(file)

  return fetchJson('/api/admin/upload-asset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder,
      filename: file.name,
      dataUrl,
    }),
  })
}
