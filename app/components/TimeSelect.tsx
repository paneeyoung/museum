'use client'

// 00:00, 00:15, 00:30 ... 23:45
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = String(Math.floor(i / 4)).padStart(2, '0')
  const minutes = String((i % 4) * 15).padStart(2, '0')
  return `${hours}:${minutes}`
})

const defaultClassName =
  'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none'

export default function TimeSelect({
  name,
  value,
  defaultValue,
  onChange,
  className,
}: {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  className?: string
}) {
  return (
    <select
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      className={className ?? defaultClassName}
    >
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  )
}
