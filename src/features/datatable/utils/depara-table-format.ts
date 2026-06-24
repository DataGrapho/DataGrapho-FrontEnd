export function formatDeparaCellValue (columnKey: string, value: unknown) {
  if (value === null || value === undefined || value === '') return '-'

  if (columnKey === 'id_depara') {
    const numeric = Number(value)
    if (Number.isFinite(numeric) && numeric < 0) return '-'
  }

  return String(value)
}
