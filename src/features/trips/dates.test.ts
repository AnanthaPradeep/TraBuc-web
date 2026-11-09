import { describe, expect, it } from 'vitest'
import { tripNights, validateTrip } from './dates'

describe('trip helpers', () => {
  it('counts nights', () => expect(tripNights('2027-07-12', '2027-07-19')).toBe(7))
  it('rejects end before start', () => {
    const e = validateTrip({ title: 'x', destinationSlug: 'kyoto', startDate: '2027-02-02', endDate: '2027-02-01', notes: '' })
    expect(e.endDate).toMatch(/on or after/)
  })
  it('requires title and destination', () => {
    const e = validateTrip({ title: ' ', destinationSlug: '', startDate: '', endDate: '', notes: '' })
    expect(Object.keys(e)).toEqual(['title', 'destinationSlug', 'startDate', 'endDate'])
  })
})
