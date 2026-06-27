import { reactive, ref } from 'vue'

export function useDataTableContextMenu<T> () {
  const menu = reactive({
    open: false,
    x: 0,
    y: 0,
  })
  const contextRow = ref<T | null>(null)

  function openContextMenu (event: MouseEvent, row: T) {
    event.preventDefault()
    event.stopPropagation()
    menu.x = event.clientX
    menu.y = event.clientY
    contextRow.value = row
    menu.open = true
  }

  function closeContextMenu () {
    menu.open = false
    contextRow.value = null
  }

  return {
    menu,
    contextRow,
    openContextMenu,
    closeContextMenu,
  }
}
