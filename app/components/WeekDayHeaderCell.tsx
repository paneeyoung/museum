export default function WeekDayHeaderCell({ dayLabel, dayNumber }: { dayLabel: string; dayNumber: number }) {
  return (
    <th className="border border-gray-200 bg-white p-2 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{dayLabel}</p>
      <p className="text-base font-bold text-gray-900">{dayNumber}</p>
    </th>
  )
}
