const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const HOST = process.env.HOST || '127.0.0.1'
const PORT = Number(process.env.PORT || 8080)
const ROOT_DIR = path.resolve(__dirname, '..')
const STATIC_DIR = path.join(ROOT_DIR, process.env.STATIC_DIR || 'out')
const CONTENT_FILE = path.join(ROOT_DIR, 'src', 'data', 'site-content.json')
const MAX_REQUEST_BODY_BYTES = 2 * 1024 * 1024
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const MAX_UPLOAD_BODY_BYTES = 64 * 1024 * 1024
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'images', 'uploads')

const MIME_TO_EXTENSION = {
  'application/pdf': 'pdf',
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/m4v': 'm4v',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
}

const UPLOAD_LIMITS_BY_TYPE = {
  document: 10 * 1024 * 1024,
  image: MAX_UPLOAD_BYTES,
  video: 50 * 1024 * 1024,
}

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

let isBuilding = false

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

const sendText = (res, statusCode, body) => {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

const readRequestBody = (req, maxBytes = MAX_REQUEST_BODY_BYTES) =>
  new Promise((resolve, reject) => {
    let body = ''
    let totalBytes = 0
    let tooLarge = false

    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      if (tooLarge) {
        return
      }

      totalBytes += Buffer.byteLength(chunk)
      if (totalBytes > maxBytes) {
        tooLarge = true
        return
      }
      body += chunk
    })

    req.on('end', () => {
      if (tooLarge) {
        reject(new Error(`Request body too large (limit ${(maxBytes / (1024 * 1024)).toFixed(0)}MB).`))
        return
      }
      resolve(body)
    })
    req.on('error', reject)
  })

const readContentFile = () => {
  const raw = fs.readFileSync(CONTENT_FILE, 'utf8')
  return JSON.parse(raw)
}

const writeContentFile = (content) => {
  const serialized = `${JSON.stringify(content, null, 2)}\n`
  fs.writeFileSync(CONTENT_FILE, serialized, 'utf8')
  return serialized
}

const sanitizeSegment = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '')

const sanitizeFilename = (value) => {
  const name = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return name || 'image'
}

const isInsidePath = (targetPath, rootPath) => {
  const relative = path.relative(rootPath, targetPath)
  return (
    relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
  )
}

const JPEG_SOI = Buffer.from([0xff, 0xd8, 0xff])
const JPEG_EOI = Buffer.from([0xff, 0xd9])
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const GIF87A_SIGNATURE = Buffer.from('GIF87a')
const GIF89A_SIGNATURE = Buffer.from('GIF89a')
const RIFF_SIGNATURE = Buffer.from('RIFF')
const WEBP_SIGNATURE = Buffer.from('WEBP')

const hasPrefix = (buffer, signature) =>
  buffer.length >= signature.length &&
  buffer.subarray(0, signature.length).equals(signature)

const isJpegBuffer = (buffer) => hasPrefix(buffer, JPEG_SOI)

const isPngBuffer = (buffer) => hasPrefix(buffer, PNG_SIGNATURE)

const isGifBuffer = (buffer) =>
  hasPrefix(buffer, GIF87A_SIGNATURE) || hasPrefix(buffer, GIF89A_SIGNATURE)

const isWebpBuffer = (buffer) => {
  if (buffer.length < 12) {
    return false
  }

  return (
    buffer.subarray(0, 4).equals(RIFF_SIGNATURE) &&
    buffer.subarray(8, 12).equals(WEBP_SIGNATURE)
  )
}

const isSvgBuffer = (buffer) => {
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 1024)).trimStart()
  return text.startsWith('<svg') || text.startsWith('<?xml')
}

const isPdfBuffer = (buffer) =>
  buffer.length >= 5 && buffer.subarray(0, 5).toString('utf8') === '%PDF-'

const isMp4LikeBuffer = (buffer) => {
  if (buffer.length < 12) {
    return false
  }

  return buffer.subarray(4, 8).toString('ascii') === 'ftyp'
}

const isWebmBuffer = (buffer) =>
  buffer.length >= 4 &&
  buffer[0] === 0x1a &&
  buffer[1] === 0x45 &&
  buffer[2] === 0xdf &&
  buffer[3] === 0xa3

const isOggBuffer = (buffer) =>
  buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'OggS'

const detectMimeFromBuffer = (buffer) => {
  if (isJpegBuffer(buffer)) return 'image/jpeg'
  if (isPngBuffer(buffer)) return 'image/png'
  if (isGifBuffer(buffer)) return 'image/gif'
  if (isWebpBuffer(buffer)) return 'image/webp'
  if (isSvgBuffer(buffer)) return 'image/svg+xml'
  if (isPdfBuffer(buffer)) return 'application/pdf'
  if (isWebmBuffer(buffer)) return 'video/webm'
  if (isOggBuffer(buffer)) return 'video/ogg'
  if (isMp4LikeBuffer(buffer)) return 'video/mp4'
  return null
}

const extractEmbeddedJpeg = (buffer) => {
  const startIndex = buffer.indexOf(JPEG_SOI)
  if (startIndex < 0) {
    return null
  }

  let endIndex = -1
  for (let index = buffer.length - 2; index >= startIndex; index -= 1) {
    if (buffer[index] === JPEG_EOI[0] && buffer[index + 1] === JPEG_EOI[1]) {
      endIndex = index + 2
      break
    }
  }

  if (endIndex <= startIndex + 16) {
    return null
  }

  const extracted = buffer.subarray(startIndex, endIndex)
  return isJpegBuffer(extracted) ? extracted : null
}

const normalizeImagePayload = (mimeType, buffer) => {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    if (isJpegBuffer(buffer)) {
      return { mimeType: 'image/jpeg', buffer }
    }

    const extracted = extractEmbeddedJpeg(buffer)
    if (extracted) {
      return { mimeType: 'image/jpeg', buffer: extracted }
    }
  } else if (mimeType === 'image/png' && isPngBuffer(buffer)) {
    return { mimeType: 'image/png', buffer }
  } else if (mimeType === 'image/gif' && isGifBuffer(buffer)) {
    return { mimeType: 'image/gif', buffer }
  } else if (mimeType === 'image/webp' && isWebpBuffer(buffer)) {
    return { mimeType: 'image/webp', buffer }
  } else if (mimeType === 'image/svg+xml' && isSvgBuffer(buffer)) {
    return { mimeType: 'image/svg+xml', buffer }
  }

  const detectedMimeType = detectMimeFromBuffer(buffer)
  if (detectedMimeType) {
    return { mimeType: detectedMimeType, buffer }
  }

  return null
}

const getUploadTypeByMime = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType === 'application/pdf') return 'document'
  return null
}

const normalizeUploadPayload = (mimeType, buffer) => {
  const uploadType = getUploadTypeByMime(mimeType)
  if (!uploadType) {
    return null
  }

  if (uploadType === 'image') {
    return normalizeImagePayload(mimeType, buffer)
  }

  if (uploadType === 'document') {
    if (isPdfBuffer(buffer)) {
      return { mimeType: 'application/pdf', buffer }
    }
    return null
  }

  // Video payload: trust declared mime after lightweight signature checks.
  if (mimeType === 'video/webm' && !isWebmBuffer(buffer)) {
    return null
  }
  if (mimeType === 'video/ogg' && !isOggBuffer(buffer)) {
    return null
  }
  if (
    (mimeType === 'video/mp4' ||
      mimeType === 'video/m4v' ||
      mimeType === 'video/quicktime') &&
    !isMp4LikeBuffer(buffer)
  ) {
    const detected = detectMimeFromBuffer(buffer)
    if (detected !== 'video/mp4') {
      return null
    }
  }

  return { mimeType, buffer }
}

const getSafeCandidates = (pathname) => {
  let decodedPath = pathname

  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    return []
  }

  const trimmed = decodedPath.replace(/^\/+/, '')
  const normalized = path.normalize(trimmed || 'index.html')

  if (normalized.startsWith('..')) {
    return []
  }

  const basePath = path.join(STATIC_DIR, normalized)

  if (!basePath.startsWith(STATIC_DIR)) {
    return []
  }

  const candidates = [basePath]

  if (!path.extname(basePath)) {
    candidates.push(`${basePath}.html`)
    candidates.push(path.join(basePath, 'index.html'))
  }

  return candidates
}

const tryStat = (filePath) =>
  new Promise((resolve) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        resolve(null)
        return
      }
      resolve(stats)
    })
  })

const getFileToServe = async (pathname) => {
  const candidates = getSafeCandidates(pathname)

  for (const candidate of candidates) {
    const stats = await tryStat(candidate)
    if (stats && stats.isFile()) {
      return { filePath: candidate, size: stats.size }
    }
  }

  const notFoundPath = path.join(STATIC_DIR, '404.html')
  const notFoundStats = await tryStat(notFoundPath)
  if (notFoundStats && notFoundStats.isFile()) {
    return { filePath: notFoundPath, size: notFoundStats.size, statusCode: 404 }
  }

  return null
}

const streamFile = (req, res, filePath, size, statusCode = 200) => {
  const extension = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[extension] || 'application/octet-stream'

  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': size,
    'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  const fileStream = fs.createReadStream(filePath)
  fileStream.on('error', () => {
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Failed to read static file.' })
    } else {
      res.destroy()
    }
  })

  fileStream.pipe(res)
}

const runBuild = () =>
  new Promise((resolve) => {
    exec('npm run build', { cwd: ROOT_DIR, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        stdout,
        stderr,
        exitCode: error ? error.code ?? 1 : 0,
      })
    })
  })

const getTopLevelFiles = () => {
  if (!fs.existsSync(STATIC_DIR)) {
    return []
  }

  return fs.readdirSync(STATIC_DIR)
}

const requestHandler = async (req, res) => {
  const hostHeader = req.headers.host || `${HOST}:${PORT}`
  const url = new URL(req.url || '/', `http://${hostHeader}`)
  const { pathname } = url

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      time: new Date().toISOString(),
      staticDir: STATIC_DIR,
      contentFile: CONTENT_FILE,
      hasContentFile: fs.existsSync(CONTENT_FILE),
      hasBuildOutput: fs.existsSync(STATIC_DIR),
      isBuilding,
    })
    return
  }

  if (pathname === '/api/site-info' && req.method === 'GET') {
    sendJson(res, 200, {
      rootDir: ROOT_DIR,
      staticDir: STATIC_DIR,
      topLevelOutputFiles: getTopLevelFiles(),
      endpoints: [
        '/api/health',
        '/api/site-info',
        '/api/content (GET, PUT)',
        '/api/admin/upload-asset (POST)',
        '/api/admin/upload-image (POST)',
        '/api/rebuild (POST)',
      ],
    })
    return
  }

  if (pathname === '/api/content' && req.method === 'GET') {
    if (!fs.existsSync(CONTENT_FILE)) {
      sendJson(res, 404, { error: `Content file not found at ${CONTENT_FILE}.` })
      return
    }

    try {
      const content = readContentFile()
      sendJson(res, 200, { filePath: CONTENT_FILE, content })
    } catch (error) {
      sendJson(res, 500, { error: 'Failed to read content file.', details: error.message })
    }
    return
  }

  if (pathname === '/api/content' && req.method === 'PUT') {
    let rawBody = ''
    try {
      rawBody = await readRequestBody(req)
    } catch (error) {
      sendJson(res, 413, { error: error.message })
      return
    }

    let payload
    try {
      payload = rawBody.length > 0 ? JSON.parse(rawBody) : {}
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body.' })
      return
    }

    const content =
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      payload.content &&
      typeof payload.content === 'object' &&
      !Array.isArray(payload.content)
        ? payload.content
        : payload

    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      sendJson(res, 400, { error: 'Body must be a JSON object.' })
      return
    }

    try {
      const serialized = writeContentFile(content)
      sendJson(res, 200, {
        ok: true,
        filePath: CONTENT_FILE,
        bytesWritten: Buffer.byteLength(serialized),
      })
    } catch (error) {
      sendJson(res, 500, { error: 'Failed to write content file.', details: error.message })
    }
    return
  }

  const isAssetUploadRoute = pathname === '/api/admin/upload-asset'
  const isImageUploadRoute = pathname === '/api/admin/upload-image'

  if ((isAssetUploadRoute || isImageUploadRoute) && req.method === 'POST') {
    let rawBody = ''
    try {
      rawBody = await readRequestBody(req, MAX_UPLOAD_BODY_BYTES)
    } catch (error) {
      sendJson(res, 413, { error: error.message })
      return
    }

    let payload = {}
    try {
      payload = rawBody.length > 0 ? JSON.parse(rawBody) : {}
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body.' })
      return
    }

    const dataUrl = typeof payload?.dataUrl === 'string' ? payload.dataUrl : ''
    const filename = sanitizeFilename(payload?.filename)
    const folder = String(payload?.folder || 'general')

    if (!dataUrl) {
      sendJson(res, 400, { error: 'dataUrl is required.' })
      return
    }

    const match = dataUrl.match(/^data:([a-zA-Z0-9+.-/]+);base64,(.+)$/)
    if (!match) {
      sendJson(res, 400, { error: 'Invalid data URL format.' })
      return
    }

    const requestedMimeType = match[1].toLowerCase()
    if (!MIME_TO_EXTENSION[requestedMimeType]) {
      sendJson(res, 400, {
        error: `Unsupported mime type: ${requestedMimeType}`,
      })
      return
    }

    const base64Data = match[2].replace(/\s/g, '')
    let fileBuffer
    try {
      fileBuffer = Buffer.from(base64Data, 'base64')
    } catch {
      sendJson(res, 400, { error: 'Invalid base64 image payload.' })
      return
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      sendJson(res, 400, { error: 'Uploaded image is empty.' })
      return
    }

    const normalizedAsset = normalizeUploadPayload(requestedMimeType, fileBuffer)
    if (!normalizedAsset) {
      sendJson(res, 400, {
        error: 'Uploaded file is not a valid supported asset.',
      })
      return
    }

    const finalMimeType = normalizedAsset.mimeType
    const finalBuffer = normalizedAsset.buffer
    const finalType = getUploadTypeByMime(finalMimeType)

    if (isImageUploadRoute && finalType !== 'image') {
      sendJson(res, 400, { error: 'This endpoint only accepts images.' })
      return
    }

    const extension = MIME_TO_EXTENSION[finalMimeType]
    if (!extension) {
      sendJson(res, 400, { error: `Unsupported mime type: ${finalMimeType}` })
      return
    }

    const sizeLimit = UPLOAD_LIMITS_BY_TYPE[finalType] || MAX_UPLOAD_BYTES
    if (finalBuffer.length > sizeLimit) {
      const sizeLimitMb = Math.round(sizeLimit / (1024 * 1024))
      sendJson(res, 413, {
        error: `File exceeds ${sizeLimitMb}MB upload limit for ${finalType}.`,
      })
      return
    }

    const folderSegments = folder
      .split('/')
      .map(sanitizeSegment)
      .filter(Boolean)
      .slice(0, 4)

    const safeSegments = folderSegments.length > 0 ? folderSegments : ['general']
    const targetDir = path.join(UPLOADS_DIR, ...safeSegments)

    if (!isInsidePath(targetDir, UPLOADS_DIR)) {
      sendJson(res, 400, { error: 'Unsafe upload folder path.' })
      return
    }

    const uniquePart = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    const finalName = `${filename}-${uniquePart}.${extension}`
    const absolutePath = path.join(targetDir, finalName)

    if (!isInsidePath(absolutePath, UPLOADS_DIR)) {
      sendJson(res, 400, { error: 'Unsafe upload file path.' })
      return
    }

    try {
      fs.mkdirSync(targetDir, { recursive: true })
      fs.writeFileSync(absolutePath, finalBuffer)

      const relativePath = path
        .join('images', 'uploads', ...safeSegments, finalName)
        .split(path.sep)
        .join('/')

      if (fs.existsSync(STATIC_DIR)) {
        const staticFilePath = path.join(STATIC_DIR, relativePath)
        const staticDir = path.dirname(staticFilePath)
        fs.mkdirSync(staticDir, { recursive: true })
        fs.writeFileSync(staticFilePath, finalBuffer)
      }

      sendJson(res, 200, {
        ok: true,
        type: finalType,
        mimeType: finalMimeType,
        bytes: finalBuffer.length,
        relativePath,
        publicPath: `/${relativePath}`,
      })
    } catch (error) {
      sendJson(res, 500, { error: 'Failed to store uploaded image.', details: error.message })
    }
    return
  }

  if (pathname === '/api/rebuild' && req.method === 'POST') {
    if (isBuilding) {
      sendJson(res, 409, { error: 'A build is already in progress.' })
      return
    }

    isBuilding = true
    const startedAt = Date.now()
    const result = await runBuild()
    isBuilding = false

    sendJson(res, result.ok ? 200 : 500, {
      ok: result.ok,
      exitCode: result.exitCode,
      durationMs: Date.now() - startedAt,
      stdout: result.stdout,
      stderr: result.stderr,
    })
    return
  }

  if (pathname.startsWith('/api/')) {
    sendJson(res, 404, { error: 'Unknown API route.' })
    return
  }

  if (!fs.existsSync(STATIC_DIR)) {
    sendText(
      res,
      500,
      `Build output not found at ${STATIC_DIR}. Run \"npm run build\" first.`
    )
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed.' })
    return
  }

  const resolved = await getFileToServe(pathname)

  if (!resolved) {
    sendJson(res, 404, { error: 'File not found.' })
    return
  }

  streamFile(req, res, resolved.filePath, resolved.size, resolved.statusCode || 200)
}

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch((error) => {
    sendJson(res, 500, { error: 'Unexpected server error.', details: error.message })
  })
})

server.listen(PORT, HOST, () => {
  // Keep startup logs short and copy-friendly.
  console.log(`Local manager server running at http://${HOST}:${PORT}`)
  console.log(`Serving static files from: ${STATIC_DIR}`)
})
