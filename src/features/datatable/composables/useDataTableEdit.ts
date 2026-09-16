import { computed, ref, type Ref } from 'vue'
import { createCatalogoDepara } from '@/features/datatable/services/catalogo-depara.service'
import {
  createDepara,
  deleteDepara,
  getDepara,
  updateDepara,
} from '@/features/datatable/services/depara.service'
import type {
  CatalogoDeparaListItem,
  DeparaCreatePayload,
  DeparaDetailItem,
  DeparaListItem,
  DeparaUpdatePayload,
  EditableDeparaRow,
} from '@/features/datatable/types/depara.types'
import type { DataTableColumn } from '@/features/datatable/types/shared-table.types'
import {
  DEPARA_REQUIRED_FIELD_LABELS,
  isDeparaRequiredFieldEmpty,
} from '@/features/datatable/utils/depara-row-validation'
import { extractApiErrorMessage } from '@/features/datatable/utils/depara-api-errors'
import { ApiError } from '@/shared/services/http'

type RowErrors = Record<string, string>

type UndoAction =
  | { type: 'add_row', rowKey: string }
  | { type: 'create', rowKey: string, id: number }
  | { type: 'update', rowKey: string, id: number, before: EditableDeparaRow }
  | { type: 'delete', row: EditableDeparaRow }

let newRowCounter = 0

function createEditableRow (row: DeparaListItem): EditableDeparaRow {
  return {
    ...row,
    _rowKey: String(row.id_depara),
    _isNew: false,
    _isDirty: false,
    newCatalogoTabela: null,
  }
}

function cloneEditableRow (row: EditableDeparaRow): EditableDeparaRow {
  return {
    id_depara: row.id_depara,
    id_catalogo: row.id_catalogo,
    catalogo_tabela: row.catalogo_tabela,
    codigo_origem: row.codigo_origem,
    codigo_destino: row.codigo_destino,
    descricao_origem: row.descricao_origem ?? '',
    descricao_destino: row.descricao_destino ?? '',
    newCatalogoTabela: row.newCatalogoTabela ?? null,
    ativo: row.ativo,
    criado_em: row.criado_em,
    _rowKey: row._rowKey,
    _isNew: row._isNew,
    _isDirty: row._isDirty,
  }
}

function snapshotRows (rows: EditableDeparaRow[]) {
  return new Map(rows.map(row => [row._rowKey, cloneEditableRow(row)]))
}

function listItemFromEditable (row: EditableDeparaRow): DeparaListItem {
  return {
    id_depara: row.id_depara,
    id_catalogo: row.id_catalogo,
    catalogo_tabela: row.catalogo_tabela,
    codigo_origem: row.codigo_origem,
    codigo_destino: row.codigo_destino,
    descricao_origem: row.descricao_origem ?? null,
    descricao_destino: row.descricao_destino ?? null,
    ativo: row.ativo,
    criado_em: row.criado_em,
  }
}

function editableRowsEqual (left: EditableDeparaRow, right: EditableDeparaRow) {
  return left.id_catalogo === right.id_catalogo
    && left.catalogo_tabela === right.catalogo_tabela
    && (left.newCatalogoTabela ?? null) === (right.newCatalogoTabela ?? null)
    && left.codigo_origem === right.codigo_origem
    && left.codigo_destino === right.codigo_destino
    && (left.descricao_origem ?? '') === (right.descricao_origem ?? '')
    && (left.descricao_destino ?? '') === (right.descricao_destino ?? '')
    && left.ativo === right.ativo
}

function buildRevertPayload (row: EditableDeparaRow): DeparaUpdatePayload {
  return {
    id_catalogo: row.id_catalogo,
    codigo_origem: String(row.codigo_origem).trim(),
    codigo_destino: String(row.codigo_destino).trim(),
    descricao_origem: normalizeOptionalText(row.descricao_origem),
    descricao_destino: normalizeOptionalText(row.descricao_destino),
    ativo: Boolean(row.ativo),
  }
}

function normalizeOptionalText (value: unknown) {
  const text = String(value ?? '').trim()
  return text ? text : null
}

function rowHasUnsavedLocalChanges (
  row: EditableDeparaRow,
  originalSnapshot: Map<string, EditableDeparaRow>,
) {
  if (row._isNew) return true

  const original = originalSnapshot.get(row._rowKey)
  if (!original) return Boolean(row._isDirty)

  return row._isDirty && !editableRowsEqual(row, original)
}

function createBlankRow (defaultCatalogoId: number | null, catalogos: CatalogoDeparaListItem[]): EditableDeparaRow {
  newRowCounter += 1
  const tempKey = `new-${newRowCounter}`
  const defaultCatalogo = catalogos.find(item => item.id_catalogo === defaultCatalogoId)

  return {
    id_depara: -newRowCounter,
    id_catalogo: defaultCatalogo?.id_catalogo ?? 0,
    catalogo_tabela: defaultCatalogo?.tabela_origem ?? '',
    codigo_origem: '',
    codigo_destino: '',
    descricao_origem: '',
    descricao_destino: '',
    newCatalogoTabela: null,
    ativo: true,
    criado_em: '',
    _rowKey: tempKey,
    _isNew: true,
    _isDirty: true,
  }
}

export function useDataTableEdit (
  sourceRows: Ref<DeparaListItem[]>,
  columns: Ref<DataTableColumn[]>,
  defaultCatalogoId: Ref<number | null>,
  catalogos: Ref<CatalogoDeparaListItem[]>,
) {
  const editMode = ref(false)
  const editableRows = ref<EditableDeparaRow[]>([])
  const originalSnapshot = ref<Map<string, EditableDeparaRow>>(new Map())
  const sessionSnapshot = ref<EditableDeparaRow[]>([])
  const undoStack = ref<UndoAction[]>([])
  const lastModifiedRowKey = ref<string | null>(null)
  const rowErrors = ref<Record<string, RowErrors>>({})
  const saving = ref(false)
  const saveMessage = ref('')
  const saveError = ref('')

  const hasPendingChanges = computed(() => {
    if (undoStack.value.length > 0) return true

    return editableRows.value.some(row =>
      rowHasUnsavedLocalChanges(row, originalSnapshot.value),
    )
  })
  const loadingDetails = ref(false)
  const persistTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const persistingRows = new Set<string>()

  function clearPersistTimer (rowKey: string) {
    const timer = persistTimers.get(rowKey)
    if (timer) clearTimeout(timer)
    persistTimers.delete(rowKey)
  }

  function clearAllPersistTimers () {
    for (const rowKey of persistTimers.keys()) {
      clearPersistTimer(rowKey)
    }
  }

  function schedulePersistRow (rowKey: string) {
    clearPersistTimer(rowKey)
    persistTimers.set(rowKey, setTimeout(() => {
      void persistRow(rowKey)
    }, 1200))
  }

  function detailToListItem (detail: DeparaDetailItem, row: EditableDeparaRow): DeparaListItem {
    const catalogo = catalogos.value.find(item => item.id_catalogo === detail.id_catalogo)
    return {
      id_depara: detail.id_depara,
      id_catalogo: detail.id_catalogo,
      catalogo_tabela: catalogo?.tabela_origem ?? row.catalogo_tabela,
      codigo_origem: detail.codigo_origem,
      codigo_destino: detail.codigo_destino,
      descricao_origem: detail.descricao_origem ?? row.descricao_origem ?? null,
      descricao_destino: detail.descricao_destino ?? row.descricao_destino ?? null,
      ativo: detail.ativo,
      criado_em: detail.criado_em,
    }
  }

  function pushUndo (action: UndoAction) {
    undoStack.value = [...undoStack.value, action]
  }

  function replaceRowInList (rowKey: string, nextRow: EditableDeparaRow) {
    editableRows.value = editableRows.value.map(row =>
      row._rowKey === rowKey ? nextRow : row,
    )
    originalSnapshot.value.set(rowKey, cloneEditableRow(nextRow))

    if (nextRow.id_depara > 0) {
      const listItem = listItemFromEditable(nextRow)
      const existingIndex = sourceRows.value.findIndex(item => item.id_depara === listItem.id_depara)
      if (existingIndex >= 0) {
        sourceRows.value = sourceRows.value.map((item, index) =>
          index === existingIndex ? listItem : item,
        )
      } else {
        sourceRows.value = [...sourceRows.value, listItem]
      }
    }
  }

  function removeRowFromLists (rowKey: string, idDepara?: number) {
    editableRows.value = editableRows.value.filter(row => row._rowKey !== rowKey)
    originalSnapshot.value.delete(rowKey)
    delete rowErrors.value[rowKey]

    if (idDepara && idDepara > 0) {
      sourceRows.value = sourceRows.value.filter(item => item.id_depara !== idDepara)
    }
  }

  async function safeDeleteDepara (id: number) {
    try {
      const response = await deleteDepara(id)
      if (response?.success === false) {
        throw new Error(response.error ?? 'Nao foi possivel desfazer item criado.')
      }
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) {
        throw error
      }
    }
  }

  function applyPersistedRow (
    rowKey: string,
    listItem: DeparaListItem,
    descriptions: {
      descricao_origem?: string | null
      descricao_destino?: string | null
    },
  ) {
    const persistedRow: EditableDeparaRow = {
      ...createEditableRow(listItem),
      descricao_origem: descriptions.descricao_origem ?? '',
      descricao_destino: descriptions.descricao_destino ?? '',
      newCatalogoTabela: null,
      _rowKey: rowKey,
    }

    editableRows.value = editableRows.value.map(row =>
      row._rowKey === rowKey ? persistedRow : row,
    )

    const existingIndex = sourceRows.value.findIndex(item => item.id_depara === listItem.id_depara)
    if (existingIndex >= 0) {
      sourceRows.value = sourceRows.value.map((item, index) =>
        index === existingIndex ? listItem : item,
      )
    } else {
      sourceRows.value = [...sourceRows.value, listItem]
    }

    originalSnapshot.value.delete(rowKey)
    originalSnapshot.value.set(persistedRow._rowKey, cloneEditableRow(persistedRow))

    const { [rowKey]: _removed, ...restErrors } = rowErrors.value
    rowErrors.value = restErrors
  }

  async function loadRowDescriptions (row: EditableDeparaRow): Promise<EditableDeparaRow> {
    if (row._isNew || row.id_depara <= 0) return row

    const response = await getDepara(row.id_depara)
    if (!response.success) return row

    return {
      ...row,
      descricao_origem: response.data.descricao_origem ?? '',
      descricao_destino: response.data.descricao_destino ?? '',
    }
  }

  async function enterEditMode () {
    loadingDetails.value = true
    editMode.value = true
    rowErrors.value = {}
    saveMessage.value = ''
    saveError.value = ''

    try {
      const baseRows = sourceRows.value.map(createEditableRow)
      editableRows.value = await Promise.all(baseRows.map(loadRowDescriptions))
      originalSnapshot.value = snapshotRows(editableRows.value)
      sessionSnapshot.value = editableRows.value.map(row => cloneEditableRow(row))
      undoStack.value = []
      lastModifiedRowKey.value = null
    } catch {
      saveError.value = 'Nao foi possivel carregar os dados para edicao.'
      exitEditMode()
    } finally {
      loadingDetails.value = false
    }
  }

  function exitEditMode () {
    clearAllPersistTimers()
    editMode.value = false
    editableRows.value = []
    originalSnapshot.value = new Map()
    sessionSnapshot.value = []
    undoStack.value = []
    lastModifiedRowKey.value = null
    rowErrors.value = {}
    saveMessage.value = ''
    saveError.value = ''
  }

  async function undoLastChange () {
    clearAllPersistTimers()

    saving.value = true
    saveError.value = ''
    saveMessage.value = ''

    try {
      const dirtyRowKey = lastModifiedRowKey.value
        ?? editableRows.value.find(row => rowHasUnsavedLocalChanges(row, originalSnapshot.value))?._rowKey
        ?? null

      if (dirtyRowKey) {
        const row = editableRows.value.find(item => item._rowKey === dirtyRowKey)
        if (row) {
          if (row._isNew) {
            removeRowFromLists(dirtyRowKey)
            const lastAction = undoStack.value.at(-1)
            if (lastAction?.type === 'add_row' && lastAction.rowKey === dirtyRowKey) {
              undoStack.value = undoStack.value.slice(0, -1)
            }
          } else {
            const original = originalSnapshot.value.get(dirtyRowKey)
            if (original) {
              replaceRowInList(dirtyRowKey, cloneEditableRow(original))
            }
          }
        }
        lastModifiedRowKey.value = null
        return
      }

      const action = undoStack.value.at(-1)
      if (!action) return

      undoStack.value = undoStack.value.slice(0, -1)

      if (action.type === 'add_row') {
        removeRowFromLists(action.rowKey)
        return
      }

      if (action.type === 'create') {
        await safeDeleteDepara(action.id)
        removeRowFromLists(action.rowKey, action.id)
        return
      }

      if (action.type === 'update') {
        const response = await updateDepara(action.id, buildRevertPayload(action.before))
        if (!response.data) {
          throw new Error('Nao foi possivel desfazer alteracao.')
        }

        const revertedRow: EditableDeparaRow = {
          ...cloneEditableRow(action.before),
          _rowKey: action.rowKey,
          _isDirty: false,
          _isNew: false,
        }
        replaceRowInList(action.rowKey, revertedRow)
        return
      }

      if (action.type === 'delete') {
        const response = await createDepara({
          id_catalogo: action.row.id_catalogo,
          codigo_origem: String(action.row.codigo_origem).trim(),
          codigo_destino: String(action.row.codigo_destino).trim(),
          descricao_origem: normalizeOptionalText(action.row.descricao_origem),
          descricao_destino: normalizeOptionalText(action.row.descricao_destino),
          ativo: Boolean(action.row.ativo),
        })
        if (!response.success || !response.data) {
          throw new Error(response.error ?? 'Nao foi possivel restaurar item excluido.')
        }

        const listItem = detailToListItem(response.data, action.row)
        const restoredRow: EditableDeparaRow = {
          ...createEditableRow(listItem),
          descricao_origem: action.row.descricao_origem ?? '',
          descricao_destino: action.row.descricao_destino ?? '',
          _rowKey: action.row._rowKey,
        }
        editableRows.value = [...editableRows.value, restoredRow]
        originalSnapshot.value.set(restoredRow._rowKey, cloneEditableRow(restoredRow))
        sourceRows.value = [...sourceRows.value, listItem]
      }
    } catch (error) {
      saveError.value = error instanceof ApiError
        ? extractApiErrorMessage(error.details, error.message)
        : error instanceof Error
          ? error.message
          : 'Nao foi possivel desfazer a alteracao.'
    } finally {
      saving.value = false
      lastModifiedRowKey.value = null
    }
  }

  function addRow () {
    const row = createBlankRow(defaultCatalogoId.value, catalogos.value)
    editableRows.value = [...editableRows.value, row]
    pushUndo({ type: 'add_row', rowKey: row._rowKey })
    lastModifiedRowKey.value = row._rowKey
  }

  function removeRow (rowKey: string) {
    editableRows.value = editableRows.value.filter(row => row._rowKey !== rowKey)
    delete rowErrors.value[rowKey]
  }

  function updateCatalogCell (
    rowKey: string,
    value: {
      id_catalogo: number | null
      catalogo_tabela: string
      newCatalogoTabela: string | null
    },
  ) {
    editableRows.value = editableRows.value.map(row => {
      if (row._rowKey !== rowKey) return row
      return {
        ...row,
        id_catalogo: value.id_catalogo ?? 0,
        catalogo_tabela: value.catalogo_tabela,
        newCatalogoTabela: value.newCatalogoTabela,
        _isDirty: true,
      }
    })

    delete rowErrors.value[rowKey]?.catalogo_tabela
    if (rowErrors.value[rowKey] && Object.keys(rowErrors.value[rowKey]).length === 0) {
      const { [rowKey]: _removed, ...rest } = rowErrors.value
      rowErrors.value = rest
    }

    lastModifiedRowKey.value = rowKey
    schedulePersistRow(rowKey)
  }

  function updateCell (rowKey: string, columnKey: string, value: unknown) {
    const column = columns.value.find(current => current.key === columnKey)
    if (!column?.editable) return

    const nextValue = column.editType === 'number'
      ? value === '' || value === null ? null : Number(value)
      : value

    editableRows.value = editableRows.value.map(current => {
      if (current._rowKey !== rowKey) return current
      return {
        ...current,
        [columnKey]: nextValue,
        _isDirty: true,
      }
    })

    if (rowErrors.value[rowKey]?.[columnKey]) {
      const { [columnKey]: _removed, ...rest } = rowErrors.value[rowKey]
      rowErrors.value = { ...rowErrors.value, [rowKey]: rest }
    }

    lastModifiedRowKey.value = rowKey
    schedulePersistRow(rowKey)
  }

  function validateRow (row: EditableDeparaRow): RowErrors {
    const errors: RowErrors = {}

    for (const [fieldKey, label] of Object.entries(DEPARA_REQUIRED_FIELD_LABELS)) {
      if (isDeparaRequiredFieldEmpty(row, fieldKey)) {
        errors[fieldKey] = label
      }
    }

    return errors
  }

  async function resolveCatalogoId (row: EditableDeparaRow): Promise<number> {
    if (row.id_catalogo && row.id_catalogo > 0 && !row.newCatalogoTabela) {
      return Number(row.id_catalogo)
    }

    const tabela = (row.newCatalogoTabela ?? row.catalogo_tabela ?? '').trim()
    if (!tabela) throw new Error('Catalogo / tabela e obrigatorio.')

    const existing = catalogos.value.find(catalogo =>
      catalogo.tabela_origem.toLocaleLowerCase('pt-BR') === tabela.toLocaleLowerCase('pt-BR'),
    )
    if (existing) return existing.id_catalogo

    const response = await createCatalogoDepara({ tabela_origem: tabela, ativo: true })
    if (!response.success || !response.data) {
      throw new Error(response.error ?? 'Nao foi possivel criar o catalogo.')
    }

    catalogos.value = [...catalogos.value, response.data]
    return response.data.id_catalogo
  }

  function buildUpdatePayload (row: EditableDeparaRow, original: EditableDeparaRow): DeparaUpdatePayload {
    const payload: DeparaUpdatePayload = {}
    const editableColumns = columns.value.filter(column =>
      column.editable && column.editType !== 'catalog',
    )

    for (const column of editableColumns) {
      const fieldKey = column.apiField ?? column.key
      const currentValue = row[column.key as keyof EditableDeparaRow]
      const originalValue = original[column.key as keyof EditableDeparaRow]

      if (currentValue !== originalValue) {
        Object.assign(payload, { [fieldKey]: currentValue })
      }
    }

    return payload
  }

  async function buildCreatePayload (row: EditableDeparaRow): Promise<DeparaCreatePayload> {
    const id_catalogo = await resolveCatalogoId(row)
    row.id_catalogo = id_catalogo
    row.catalogo_tabela = catalogos.value.find(item => item.id_catalogo === id_catalogo)?.tabela_origem ?? row.catalogo_tabela

    return {
      id_catalogo,
      codigo_origem: String(row.codigo_origem).trim(),
      codigo_destino: String(row.codigo_destino).trim(),
      descricao_origem: normalizeOptionalText(row.descricao_origem),
      descricao_destino: normalizeOptionalText(row.descricao_destino),
      ativo: Boolean(row.ativo),
    }
  }

  async function persistRow (rowKey: string) {
    if (persistingRows.has(rowKey)) return

    const row = editableRows.value.find(current => current._rowKey === rowKey)
    if (!row || (!row._isDirty && !row._isNew)) return

    const errors = validateRow(row)
    if (Object.keys(errors).length > 0) {
      rowErrors.value = { ...rowErrors.value, [rowKey]: errors }
      return
    }

    persistingRows.add(rowKey)
    saving.value = true
    saveError.value = ''

    try {
      if (row._isNew) {
        const response = await createDepara(await buildCreatePayload(row))
        if (!response.success || !response.data) {
          throw new Error(response.error ?? 'Resposta invalida ao criar item.')
        }

        pushUndo({
          type: 'create',
          rowKey,
          id: response.data.id_depara,
        })
        undoStack.value = undoStack.value.filter(
          action => !(action.type === 'add_row' && action.rowKey === rowKey),
        )

        applyPersistedRow(rowKey, detailToListItem(response.data, row), {
          descricao_origem: row.descricao_origem,
          descricao_destino: row.descricao_destino,
        })
        return
      }

      const original = originalSnapshot.value.get(rowKey)
      if (!original) return

      const beforePersist = cloneEditableRow(original)

      const workingRow = { ...row }
      if (workingRow.newCatalogoTabela || workingRow.id_catalogo !== original.id_catalogo) {
        workingRow.id_catalogo = await resolveCatalogoId(workingRow)
      }

      const payload = buildUpdatePayload(workingRow, original)
      if (workingRow.newCatalogoTabela || workingRow.id_catalogo !== original.id_catalogo) {
        payload.id_catalogo = workingRow.id_catalogo
      }
      if (Object.keys(payload).length === 0) return

      const response = await updateDepara(workingRow.id_depara, payload)
      if (!response.data) {
        throw new Error('Resposta invalida ao atualizar item.')
      }

      pushUndo({
        type: 'update',
        rowKey,
        id: workingRow.id_depara,
        before: beforePersist,
      })

      applyPersistedRow(rowKey, detailToListItem(response.data, workingRow), {
        descricao_origem: workingRow.descricao_origem,
        descricao_destino: workingRow.descricao_destino,
      })
    } catch (error) {
      const message = error instanceof ApiError
        ? extractApiErrorMessage(error.details, error.message)
        : error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar a linha.'
      rowErrors.value = { ...rowErrors.value, [rowKey]: { form: message } }
      saveError.value = message
    } finally {
      persistingRows.delete(rowKey)
      saving.value = persistingRows.size > 0
    }
  }

  async function deleteExistingRows (rows: EditableDeparaRow[]) {
    if (rows.length === 0) return true

    clearAllPersistTimers()
    saving.value = true
    saveError.value = ''
    let hasFailure = false

    try {
      for (const row of rows) {
        if (row._isNew) {
          removeRow(row._rowKey)
          continue
        }

        pushUndo({ type: 'delete', row: cloneEditableRow(row) })

        try {
          const response = await deleteDepara(row.id_depara)
          if (!response.success) {
            hasFailure = true
            saveError.value = response.error ?? 'Nao foi possivel excluir a linha.'
            continue
          }

          removeRowFromLists(row._rowKey, row.id_depara)
          sessionSnapshot.value = sessionSnapshot.value.filter(item => item.id_depara !== row.id_depara)
        } catch (error) {
          hasFailure = true
          saveError.value = error instanceof ApiError
            ? extractApiErrorMessage(error.details, 'Erro ao excluir linha.')
            : 'Erro ao excluir linha.'
        }
      }
    } finally {
      saving.value = false
    }

    return !hasFailure
  }

  async function deleteExistingRow (row: EditableDeparaRow) {
    return deleteExistingRows([row])
  }

  async function reloadEditSession () {
    clearAllPersistTimers()
    rowErrors.value = {}
    saveMessage.value = ''
    saveError.value = ''

    const baseRows = sourceRows.value.map(createEditableRow)
    editableRows.value = await Promise.all(baseRows.map(loadRowDescriptions))
    originalSnapshot.value = snapshotRows(editableRows.value)
    sessionSnapshot.value = editableRows.value.map(item => cloneEditableRow(item))
    undoStack.value = []
    lastModifiedRowKey.value = null
  }

  return {
    editMode,
    editableRows,
    rowErrors,
    saving,
    loadingDetails,
    saveMessage,
    saveError,
    hasPendingChanges,
    enterEditMode,
    exitEditMode,
    undoLastChange,
    discardChanges: undoLastChange,
    addRow,
    removeRow,
    updateCell,
    updateCatalogCell,
    deleteExistingRow,
    deleteExistingRows,
    reloadEditSession,
  }
}
