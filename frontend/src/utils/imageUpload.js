/**
 * imageUpload.js
 *
 * Shared utility for uploading image/document files to ImgBB's free hosting API.
 * Returns a permanent, publicly accessible HTTPS URL.
 *
 * Setup:
 *   1. Create a free account at https://api.imgbb.com/
 *   2. Copy your API key from the dashboard
 *   3. Add VITE_IMGBB_API_KEY=<your_key> to .env
 *
 * ImgBB limits: 32 MB max per file, supports JPEG, PNG, GIF, TIFF, BMP, WebP, PDF
 * Docs: https://api.imgbb.com/
 */

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

/**
 * Convert a File to a base64 string (without the data: prefix).
 * ImgBB accepts base64 encoded images via the `image` form field.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => {
      // result is like "data:image/jpeg;base64,/9j/4AAQ..."
      // ImgBB wants only the part after the comma
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

/**
 * Upload a single File to ImgBB.
 *
 * @param {File}   file       - The file to upload
 * @param {string} [name]     - Optional display name (defaults to file.name)
 * @returns {Promise<string>} - Resolves with the permanent HTTPS URL of the uploaded image
 * @throws  {Error}           - With a human-readable message on any failure
 */
export async function uploadToImgBB(file, name) {
  const key = import.meta.env.VITE_IMGBB_API_KEY

  if (!key) {
    throw new Error(
      'VITE_IMGBB_API_KEY is not configured. ' +
      'Get a free API key from https://api.imgbb.com/ and add it to your .env file.'
    )
  }

  const base64 = await fileToBase64(file)

  const form = new FormData()
  form.append('key',   key)
  form.append('image', base64)
  form.append('name',  name || file.name)

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${key}`, {
    method: 'POST',
    body:   form,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`ImgBB upload failed (${response.status}): ${text || response.statusText}`)
  }

  const json = await response.json()

  if (!json.success) {
    throw new Error(`ImgBB rejected the upload: ${json.error?.message || JSON.stringify(json)}`)
  }

  // json.data.url      — direct image URL (used for display / backend storage)
  // json.data.display_url — same, slightly shorter version
  const url = json.data?.url || json.data?.display_url
  if (!url) {
    throw new Error('ImgBB returned success but no URL in response.')
  }

  return url
}

/**
 * Upload multiple files sequentially, returning an array of permanent URLs
 * in the same order as the input files array.
 *
 * @param {File[]}   files           - Array of files to upload
 * @param {function} [onProgress]    - Optional callback(uploaded, total) called after each upload
 * @returns {Promise<string[]>}      - Array of permanent HTTPS URLs
 */
export async function uploadManyToImgBB(files, onProgress) {
  const urls = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadToImgBB(files[i])
    urls.push(url)
    if (onProgress) onProgress(i + 1, files.length)
  }
  return urls
}
