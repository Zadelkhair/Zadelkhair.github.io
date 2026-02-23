const formatApiError = (message, status) => {
  const error = new Error(message)
  if (typeof status === 'number') {
    error.status = status
  }
  return error
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

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
  if (!file) {
    throw new Error('No file selected.')
  }

  if (typeof file.size === 'number' && file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image exceeds 8MB upload limit.')
  }

  const dataUrl = await fileToDataUrl(file)

  return fetchJson('/api/admin/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folder,
      filename: file.name,
      dataUrl,
    }),
  })
}
