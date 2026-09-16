import { computed, ref, type Ref } from 'vue'

type SelectableRow = Record<string, unknown>

export function useDataTableSelection<T extends SelectableRow> (
  orderedRows: Ref<T[]>,
  rowKey: string,
) {
  const selectedKeys = ref<Set<string>>(new Set())
  const anchorKey = ref<string | null>(null)

  const selectedCount = computed(() => selectedKeys.value.size)

  function resolveRowKey (row: T) {
    return String(row[rowKey] ?? row._rowKey ?? '')
  }

  function isSelected (row: T) {
    return selectedKeys.value.has(resolveRowKey(row))
  }

  function isInteractiveTarget (target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], .v-field, .v-selection-control',
    ))
  }

  function selectSingle (key: string) {
    selectedKeys.value = new Set([key])
    anchorKey.value = key
  }

  function toggleKey (key: string) {
    const next = new Set(selectedKeys.value)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    selectedKeys.value = next
    anchorKey.value = key
  }

  function selectRange (fromKey: string, toKey: string) {
    const keys = orderedRows.value.map(resolveRowKey)
    const start = keys.indexOf(fromKey)
    const end = keys.indexOf(toKey)
    if (start === -1 || end === -1) {
      selectSingle(toKey)
      return
    }

    const [min, max] = start < end ? [start, end] : [end, start]
    selectedKeys.value = new Set(keys.slice(min, max + 1))
    anchorKey.value = toKey
  }

  function handleRowPointerDown (row: T, event: MouseEvent) {
    if (event.button !== 0) return
    if (isInteractiveTarget(event.target)) return

    const key = resolveRowKey(row)

    if (event.shiftKey && anchorKey.value) {
      selectRange(anchorKey.value, key)
      event.preventDefault()
      return
    }

    if (event.ctrlKey || event.metaKey) {
      toggleKey(key)
      return
    }

    selectSingle(key)
  }

  function toggleRowSelection (row: T, selected: boolean) {
    const key = resolveRowKey(row)
    const next = new Set(selectedKeys.value)

    if (selected) {
      next.add(key)
      anchorKey.value = key
    } else {
      next.delete(key)
      if (anchorKey.value === key) {
        anchorKey.value = next.values().next().value ?? null
      }
    }

    selectedKeys.value = next
  }

  function handleCheckboxPointerDown (row: T, event: MouseEvent) {
    if (event.button !== 0) return
    event.preventDefault()

    const key = resolveRowKey(row)

    if (event.shiftKey && anchorKey.value) {
      selectRange(anchorKey.value, key)
      return
    }

    if (event.ctrlKey || event.metaKey) {
      toggleKey(key)
      return
    }

    toggleRowSelection(row, !isSelected(row))
  }

  function toggleAllVisible (rows: T[], selected: boolean) {
    const keys = rows.map(resolveRowKey)
    const next = new Set(selectedKeys.value)

    if (selected) {
      keys.forEach(key => next.add(key))
      anchorKey.value = keys[keys.length - 1] ?? null
    } else {
      keys.forEach(key => next.delete(key))
    }

    selectedKeys.value = next
  }

  function clearSelection () {
    selectedKeys.value = new Set()
    anchorKey.value = null
  }

  function pruneMissingRows (availableKeys: Set<string>) {
    const next = new Set([...selectedKeys.value].filter(key => availableKeys.has(key)))
    if (next.size !== selectedKeys.value.size) {
      selectedKeys.value = next
    }
    if (anchorKey.value && !availableKeys.has(anchorKey.value)) {
      anchorKey.value = next.values().next().value ?? null
    }
  }

  function ensureRowSelected (row: T) {
    const key = resolveRowKey(row)
    if (!selectedKeys.value.has(key)) {
      selectSingle(key)
    }
  }

  return {
    selectedKeys,
    selectedCount,
    isSelected,
    handleRowPointerDown,
    ensureRowSelected,
    toggleRowSelection,
    handleCheckboxPointerDown,
    toggleAllVisible,
    clearSelection,
    pruneMissingRows,
  }
}
