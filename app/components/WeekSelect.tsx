'use client'

export default function WeekSelect({
  basePath,
  weekStartDate,
  options,
}: {
  basePath: string
  weekStartDate: string
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={weekStartDate}
      onChange={(e) => {
        // Deliberately a full navigation, not router.push: the new week's data
        // must always be fetched fresh, sidestepping client-side route caching.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `${basePath}?week=${e.target.value}`
      }}
      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
