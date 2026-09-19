// The 4-state classification behind Beschikbaarheidsoverzicht's color
// legend (Hele dag / Specifieke tijd / Niet beschikbaar / Niet ingevuld) —
// shared with the Roostereditor's assignment dropdown so both read the
// exact same status for a given employee/day, not two copies that could
// drift apart.
export type AvailabilityStatus = 'allDay' | 'specific' | 'unavailable' | 'notSubmitted'

export function getAvailabilityStatus(
  row: { is_available: boolean; is_all_day: boolean } | undefined | null
): AvailabilityStatus {
  if (!row) return 'notSubmitted'
  if (!row.is_available) return 'unavailable'
  return row.is_all_day ? 'allDay' : 'specific'
}

// Solid dot colors — a small indicator needs more contrast than the pastel
// cell backgrounds Beschikbaarheidsoverzicht uses for the same 4 states.
export const AVAILABILITY_STATUS_DOT_CLASS: Record<AvailabilityStatus, string> = {
  allDay: 'bg-green-500',
  specific: 'bg-amber-400',
  unavailable: 'bg-red-500',
  notSubmitted: 'bg-gray-300',
}
