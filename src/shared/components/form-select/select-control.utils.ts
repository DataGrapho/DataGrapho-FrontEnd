export function hasSelectValue (value: unknown) {
  return value !== null && value !== undefined && value !== ''
}

export function resolveSelectLabel (
  value: unknown,
  items: readonly unknown[],
  itemTitle: string,
  itemValue: string,
  placeholder: string,
) {
  if (!hasSelectValue(value)) return placeholder

  const match = items.find((entry) => {
    const record = entry as Record<string, unknown>
    return record[itemValue] === value
  }) as Record<string, unknown> | undefined

  if (match) return String(match[itemTitle] ?? '')

  return String(value)
}
