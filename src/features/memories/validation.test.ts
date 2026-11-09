import { describe, expect, it } from 'vitest'
import { MAX_PHOTO_BYTES, buildPhotoPath, validateMemory, validatePhoto } from './validation'

const USER = '123e4567-e89b-12d3-a456-426614174000'
const FILE_ID = '9b2f1c3a-5d6e-4f70-8a91-b2c3d4e5f607'
const ok = { title: 'Sunrise', note: '', takenOn: '', tripId: '' }

describe('validateMemory', () => {
  it('accepts valid input', () => expect(validateMemory(ok)).toEqual({}))
  it('requires a title and limits it to 120 characters', () => {
    expect(validateMemory({ ...ok, title: '  ' }).title).toBeDefined()
    expect(validateMemory({ ...ok, title: 'a'.repeat(120) }).title).toBeUndefined()
    expect(validateMemory({ ...ok, title: 'a'.repeat(121) }).title).toMatch(/120/)
  })
  it('limits the note to 2000 characters', () => {
    expect(validateMemory({ ...ok, note: 'a'.repeat(2000) }).note).toBeUndefined()
    expect(validateMemory({ ...ok, note: 'a'.repeat(2001) }).note).toMatch(/2000/)
  })
  it('accepts an empty or valid date and rejects a malformed one', () => {
    expect(validateMemory({ ...ok, takenOn: '2027-03-09' }).takenOn).toBeUndefined()
    expect(validateMemory({ ...ok, takenOn: '09/03/2027' }).takenOn).toBeDefined()
    expect(validateMemory({ ...ok, takenOn: '2027-13-45' }).takenOn).toBeDefined()
  })
})

describe('validatePhoto', () => {
  it('allows no file', () => expect(validatePhoto(null)).toBeNull())
  it('allows JPEG, PNG and WebP up to 5 MB', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(validatePhoto({ type, size: 1000 })).toBeNull()
    expect(validatePhoto({ type: 'image/png', size: MAX_PHOTO_BYTES })).toBeNull()
  })
  it('rejects other types with a clear message', () => {
    expect(validatePhoto({ type: 'image/gif', size: 10 })).toMatch(/JPEG, PNG or WebP/)
    expect(validatePhoto({ type: 'application/pdf', size: 10 })).toMatch(/JPEG, PNG or WebP/)
    expect(validatePhoto({ type: '', size: 10 })).toMatch(/JPEG, PNG or WebP/)
  })
  it('rejects files over 5 MB and empty files', () => {
    expect(validatePhoto({ type: 'image/jpeg', size: MAX_PHOTO_BYTES + 1 })).toMatch(/5 MB or smaller/)
    expect(validatePhoto({ type: 'image/jpeg', size: 0 })).toMatch(/empty/)
  })
})

describe('buildPhotoPath', () => {
  it('puts the file in the user folder with a uuid name', () => {
    expect(buildPhotoPath(USER, 'image/jpeg', FILE_ID)).toBe(`${USER}/${FILE_ID}.jpg`)
  })
  it('takes the extension from the MIME type', () => {
    expect(buildPhotoPath(USER, 'image/png', FILE_ID)).toMatch(/\.png$/)
    expect(buildPhotoPath(USER, 'image/webp', FILE_ID)).toMatch(/\.webp$/)
  })
  it('generates a random uuid name when none is given', () => {
    const a = buildPhotoPath(USER, 'image/jpeg')
    const b = buildPhotoPath(USER, 'image/jpeg')
    expect(a).toMatch(new RegExp(`^${USER}/[0-9a-f-]{36}\\.jpg$`))
    expect(a).not.toBe(b)
  })
  it('rejects unsupported types and unsafe ids, so no user-controlled path reaches storage', () => {
    expect(() => buildPhotoPath(USER, 'image/gif', FILE_ID)).toThrow(/Unsupported/)
    expect(() => buildPhotoPath('../other-user', 'image/png', FILE_ID)).toThrow(/Invalid user id/)
    expect(() => buildPhotoPath('', 'image/png', FILE_ID)).toThrow(/Invalid user id/)
    expect(() => buildPhotoPath(USER, 'image/png', '../../evil')).toThrow(/Invalid file id/)
  })
})
