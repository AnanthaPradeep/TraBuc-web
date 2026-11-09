export const BUCKET = 'memory-photos'
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
/** Allowed MIME types and the file extension used for each. The original file name is never used. */
export const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const PHOTO_ACCEPT = Object.keys(PHOTO_TYPES).join(',')

export interface MemoryValues { title: string; note: string; takenOn: string; tripId: string }
export type MemoryErrors = Partial<Record<keyof MemoryValues, string>>

export function validateMemory(v: MemoryValues): MemoryErrors {
  const errors: MemoryErrors = {}
  const title = v.title.trim()
  if (!title) errors.title = 'Give your memory a title.'
  else if (title.length > 120) errors.title = 'Keep the title to 120 characters or fewer.'
  if (v.note.trim().length > 2000) errors.note = 'Keep the note to 2000 characters or fewer.'
  if (v.takenOn && (!/^\d{4}-\d{2}-\d{2}$/.test(v.takenOn) || Number.isNaN(Date.parse(v.takenOn)))) errors.takenOn = 'Enter a valid date.'
  return errors
}

/** Returns an error message, or null when the file can be uploaded. */
export function validatePhoto(file: { type: string; size: number } | null): string | null {
  if (!file) return null
  if (!(file.type in PHOTO_TYPES)) return 'Use a JPEG, PNG or WebP image.'
  if (file.size === 0) return 'That file is empty.'
  if (file.size > MAX_PHOTO_BYTES) return `Photos must be 5 MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  return null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Storage path for a new photo: {userId}/{uuid}.{ext}. The extension comes from the MIME type and the
 * name from a random UUID, so user-supplied file names (and any path tricks in them) never reach storage.
 */
export function buildPhotoPath(userId: string, mime: string, id: string = crypto.randomUUID()): string {
  if (!UUID.test(userId)) throw new Error('Invalid user id.')
  const ext = PHOTO_TYPES[mime]
  if (!ext) throw new Error('Unsupported image type.')
  if (!UUID.test(id)) throw new Error('Invalid file id.')
  return `${userId}/${id.toLowerCase()}.${ext}`
}
