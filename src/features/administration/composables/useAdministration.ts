import { computed, ref, watch } from 'vue'
import { getAuthenticatedSession } from '@/features/auth/services/auth-session.service'
import { hasSuperuserAccess } from '@/features/auth/services/user-permissions.service'
import {
  createEmpresa,
  createFilial,
  createPerfil,
  createSetor,
  deleteEmpresa,
  deleteFilial,
  deletePerfil,
  deleteSetor,
  listEmpresas,
  listFiliais,
  listPerfis,
  listSetores,
  mapAdministrationError,
  updateEmpresa,
  updateFilial,
  updatePerfil,
  updateSetor,
} from '@/features/administration/services/administration.service'
import { isApiNotFoundError } from '@/shared/services/api-error.mapper'
import type {
  AdministrationEmpresa,
  AdministrationFilial,
  AdministrationPerfil,
  AdministrationSetor,
  EmpresaFormDraft,
  FilialFormDraft,
  PerfilFormDraft,
  SetorFormDraft,
} from '@/features/administration/types/administration.types'
import type { DataTableColumn, DataTableRow } from '@/features/datatable/types/shared-table.types'

function filterRows<T extends Record<string, unknown>>(rows: T[], query: string, keys: string[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rows

  return rows.filter((row) =>
    keys.some((key) => String(row[key] ?? '').toLowerCase().includes(normalized)),
  )
}

function buildEmpresaForm(empresa?: AdministrationEmpresa): EmpresaFormDraft {
  return {
    nome: empresa?.nome ?? '',
    cnpj: empresa?.cnpj ?? '',
    endereco: empresa?.endereco ?? '',
    ativo: empresa?.ativo ?? true,
  }
}

function buildFilialForm(filial?: AdministrationFilial): FilialFormDraft {
  return {
    empresa: filial?.empresa ?? null,
    nome: filial?.nome ?? '',
    endereco: filial?.endereco ?? '',
    ativo: filial?.ativo ?? true,
  }
}

function buildSetorForm(setor?: AdministrationSetor): SetorFormDraft {
  return {
    filial: setor?.filial ?? null,
    nome: setor?.nome ?? '',
    descricao: setor?.descricao ?? '',
    ativo: setor?.ativo ?? true,
  }
}

function buildPerfilForm(perfil?: AdministrationPerfil): PerfilFormDraft {
  return {
    nome: perfil?.nome ?? '',
    descricao: perfil?.descricao ?? '',
    ativo: perfil?.ativo ?? true,
  }
}

export function useAdministration() {
  const session = getAuthenticatedSession()
  const hasSuperuserPermission = hasSuperuserAccess(session)

  const activeTab = ref('empresas')
  const loading = ref(false)
  const saving = ref(false)
  const loadError = ref('')
  const dialogError = ref('')

  const empresas = ref<AdministrationEmpresa[]>([])
  const filiais = ref<AdministrationFilial[]>([])
  const setores = ref<AdministrationSetor[]>([])
  const perfis = ref<AdministrationPerfil[]>([])

  const empresaSearch = ref('')
  const filialSearch = ref('')
  const setorSearch = ref('')
  const perfilSearch = ref('')

  const empresaDialogOpen = ref(false)
  const empresaDetailOpen = ref(false)
  const filialDialogOpen = ref(false)
  const setorDialogOpen = ref(false)
  const perfilDialogOpen = ref(false)

  const editingEmpresaId = ref<number | null>(null)
  const selectedEmpresaId = ref<number | null>(null)
  const deletingEmpresa = ref(false)
  const detailError = ref('')
  const editingFilialId = ref<number | null>(null)
  const editingSetorId = ref<number | null>(null)
  const editingPerfilId = ref<number | null>(null)

  const empresaForm = ref<EmpresaFormDraft>(buildEmpresaForm())
  const filialForm = ref<FilialFormDraft>(buildFilialForm())
  const setorForm = ref<SetorFormDraft>(buildSetorForm())
  const perfilForm = ref<PerfilFormDraft>(buildPerfilForm())

  const empresaColumns: DataTableColumn[] = [
    { key: 'nome', label: 'Nome', minWidth: '180px' },
    { key: 'cnpj', label: 'CNPJ', minWidth: '160px' },
    { key: 'ativo', label: 'Status', width: '110px' },
  ]

  const filialColumns: DataTableColumn[] = [
    { key: 'nome', label: 'Nome', minWidth: '180px' },
    { key: 'empresa_nome', label: 'Empresa', minWidth: '180px' },
    { key: 'ativo', label: 'Status', width: '110px' },
  ]

  const setorColumns: DataTableColumn[] = [
    { key: 'nome', label: 'Nome', minWidth: '180px' },
    { key: 'filial_nome', label: 'Filial', minWidth: '180px' },
    { key: 'ativo', label: 'Status', width: '110px' },
  ]

  const perfilColumns: DataTableColumn[] = [
    { key: 'nome', label: 'Nome', minWidth: '180px' },
    { key: 'descricao', label: 'Descricao', minWidth: '220px' },
    { key: 'ativo', label: 'Status', width: '110px' },
  ]

  const empresaMap = computed(() => new Map(empresas.value.map((item) => [item.id_empresa, item.nome])))
  const filialMap = computed(() => new Map(filiais.value.map((item) => [item.id_filial, item.nome])))

  const selectedEmpresa = computed(() =>
    empresas.value.find((item) => item.id_empresa === selectedEmpresaId.value) ?? null,
  )

  const selectedEmpresaFiliais = computed(() =>
    filiais.value.filter((item) => item.empresa === selectedEmpresaId.value),
  )

  const selectedEmpresaFilialIds = computed(() =>
    new Set(selectedEmpresaFiliais.value.map((item) => item.id_filial)),
  )

  const selectedEmpresaSetores = computed(() =>
    setores.value.filter((item) => selectedEmpresaFilialIds.value.has(item.filial)),
  )

  const empresaRows = computed<DataTableRow[]>(() =>
    filterRows(
      empresas.value.map((item) => ({
        id_empresa: item.id_empresa,
        nome: item.nome,
        cnpj: item.cnpj,
        ativo: item.ativo,
      })),
      empresaSearch.value,
      ['nome', 'cnpj'],
    ),
  )

  const filialRows = computed<DataTableRow[]>(() =>
    filterRows(
      filiais.value.map((item) => ({
        id_filial: item.id_filial,
        nome: item.nome,
        empresa_nome: empresaMap.value.get(item.empresa) ?? '—',
        ativo: item.ativo,
      })),
      filialSearch.value,
      ['nome', 'empresa_nome'],
    ),
  )

  const setorRows = computed<DataTableRow[]>(() =>
    filterRows(
      setores.value.map((item) => ({
        id_setor: item.id_setor,
        nome: item.nome,
        filial_nome: filialMap.value.get(item.filial) ?? '—',
        ativo: item.ativo,
      })),
      setorSearch.value,
      ['nome', 'filial_nome'],
    ),
  )

  const perfilRows = computed<DataTableRow[]>(() =>
    filterRows(
      perfis.value.map((item) => ({
        id_perfil: item.id_perfil,
        nome: item.nome,
        descricao: item.descricao ?? '—',
        ativo: item.ativo,
      })),
      perfilSearch.value,
      ['nome', 'descricao'],
    ),
  )

  async function loadAll() {
    if (!hasSuperuserPermission) return

    loading.value = true
    loadError.value = ''

    try {
      const [empresasData, filiaisData, setoresData, perfisData] = await Promise.all([
        listEmpresas(),
        listFiliais(),
        listSetores(),
        listPerfis(),
      ])

      empresas.value = empresasData
      filiais.value = filiaisData
      setores.value = setoresData
      perfis.value = perfisData
    } catch (error) {
      loadError.value = mapAdministrationError(error, 'Nao foi possivel carregar os dados administrativos.')
    } finally {
      loading.value = false
    }
  }

  function openEmpresaDetail(row: DataTableRow) {
    if (!row.id_empresa) return

    detailError.value = ''
    selectedEmpresaId.value = Number(row.id_empresa)
    empresaDetailOpen.value = true
  }

  function openEmpresaDialog(empresaId?: number | null) {
    dialogError.value = ''
    if (empresaId != null) {
      const empresa = empresas.value.find((item) => item.id_empresa === empresaId)
      editingEmpresaId.value = empresaId
      empresaForm.value = buildEmpresaForm(empresa)
    } else {
      editingEmpresaId.value = null
      empresaForm.value = buildEmpresaForm()
    }
    empresaDialogOpen.value = true
  }

  function openEmpresaEditFromDetail() {
    const id = selectedEmpresaId.value
    if (!id) return

    openEmpresaDialog(id)
    empresaDetailOpen.value = false
  }

  function openFilialEditFromDetail(idFilial: number) {
    openFilialDialog({ id_filial: idFilial })
    empresaDetailOpen.value = false
  }

  async function deleteSelectedEmpresa() {
    if (!selectedEmpresaId.value || deletingEmpresa.value) return

    deletingEmpresa.value = true
    detailError.value = ''

    try {
      await deleteEmpresa(selectedEmpresaId.value)
    } catch (error) {
      if (!isApiNotFoundError(error)) {
        detailError.value = mapAdministrationError(error, 'Nao foi possivel excluir a empresa.')
        return
      }
    } finally {
      deletingEmpresa.value = false
    }

    empresaDetailOpen.value = false
    selectedEmpresaId.value = null
    await loadAll()
  }

  watch(empresaDetailOpen, (open) => {
    if (!open) {
      detailError.value = ''
      if (!empresaDialogOpen.value) {
        selectedEmpresaId.value = null
      }
    }
  })

  watch(empresaDialogOpen, (open) => {
    if (!open && !empresaDetailOpen.value) {
      editingEmpresaId.value = null
    }
  })

  async function deleteEntity(
    deleteFn: () => Promise<void>,
    errorMessage: string,
  ) {
    saving.value = true
    dialogError.value = ''

    try {
      await deleteFn()
      await loadAll()
    } catch (error) {
      if (isApiNotFoundError(error)) {
        await loadAll()
        return
      }

      dialogError.value = mapAdministrationError(error, errorMessage)
    } finally {
      saving.value = false
    }
  }

  function handleEmpresaEditRow(row: DataTableRow) {
    if (!row.id_empresa) return
    openEmpresaDialog(Number(row.id_empresa))
  }

  async function handleEmpresaDeleteRows(rows: DataTableRow[]) {
    const row = rows[0]
    if (!row?.id_empresa) return
    await deleteEntity(
      () => deleteEmpresa(Number(row.id_empresa)),
      'Nao foi possivel excluir a empresa.',
    )
  }

  function handleFilialEditRow(row: DataTableRow) {
    openFilialDialog(row)
  }

  async function handleFilialDeleteRows(rows: DataTableRow[]) {
    const row = rows[0]
    if (!row?.id_filial) return
    await deleteEntity(
      () => deleteFilial(Number(row.id_filial)),
      'Nao foi possivel excluir a filial.',
    )
  }

  function handleSetorEditRow(row: DataTableRow) {
    openSetorDialog(row)
  }

  async function handleSetorDeleteRows(rows: DataTableRow[]) {
    const row = rows[0]
    if (!row?.id_setor) return
    await deleteEntity(
      () => deleteSetor(Number(row.id_setor)),
      'Nao foi possivel excluir o setor.',
    )
  }

  function handlePerfilEditRow(row: DataTableRow) {
    openPerfilDialog(row)
  }

  async function handlePerfilDeleteRows(rows: DataTableRow[]) {
    const row = rows[0]
    if (!row?.id_perfil) return
    await deleteEntity(
      () => deletePerfil(Number(row.id_perfil)),
      'Nao foi possivel excluir o perfil.',
    )
  }

  function openFilialDialog(row?: DataTableRow) {
    dialogError.value = ''
    if (row?.id_filial) {
      const filial = filiais.value.find((item) => item.id_filial === row.id_filial)
      editingFilialId.value = Number(row.id_filial)
      filialForm.value = buildFilialForm(filial)
    } else {
      editingFilialId.value = null
      filialForm.value = buildFilialForm()
    }
    filialDialogOpen.value = true
  }

  function openSetorDialog(row?: DataTableRow) {
    dialogError.value = ''
    if (row?.id_setor) {
      const setor = setores.value.find((item) => item.id_setor === row.id_setor)
      editingSetorId.value = Number(row.id_setor)
      setorForm.value = buildSetorForm(setor)
    } else {
      editingSetorId.value = null
      setorForm.value = buildSetorForm()
    }
    setorDialogOpen.value = true
  }

  function openPerfilDialog(row?: DataTableRow) {
    dialogError.value = ''
    if (row?.id_perfil) {
      const perfil = perfis.value.find((item) => item.id_perfil === row.id_perfil)
      editingPerfilId.value = Number(row.id_perfil)
      perfilForm.value = buildPerfilForm(perfil)
    } else {
      editingPerfilId.value = null
      perfilForm.value = buildPerfilForm()
    }
    perfilDialogOpen.value = true
  }

  async function saveEmpresa() {
    saving.value = true
    dialogError.value = ''

    try {
      if (editingEmpresaId.value) {
        await updateEmpresa(editingEmpresaId.value, empresaForm.value)
      } else {
        await createEmpresa(empresaForm.value)
      }

      empresaDialogOpen.value = false
      await loadAll()
    } catch (error) {
      dialogError.value = mapAdministrationError(error, 'Nao foi possivel salvar a empresa.')
    } finally {
      saving.value = false
    }
  }

  async function saveFilial() {
    if (!filialForm.value.empresa) {
      dialogError.value = 'Selecione a empresa da filial.'
      return
    }

    saving.value = true
    dialogError.value = ''

    try {
      const payload = {
        ...filialForm.value,
        empresa: filialForm.value.empresa,
      }

      if (editingFilialId.value) {
        await updateFilial(editingFilialId.value, payload)
      } else {
        await createFilial(payload)
      }

      filialDialogOpen.value = false
      await loadAll()
    } catch (error) {
      dialogError.value = mapAdministrationError(error, 'Nao foi possivel salvar a filial.')
    } finally {
      saving.value = false
    }
  }

  async function saveSetor() {
    if (!setorForm.value.filial) {
      dialogError.value = 'Selecione a filial do setor.'
      return
    }

    saving.value = true
    dialogError.value = ''

    try {
      const payload = {
        ...setorForm.value,
        filial: setorForm.value.filial,
      }

      if (editingSetorId.value) {
        await updateSetor(editingSetorId.value, payload)
      } else {
        await createSetor(payload)
      }

      setorDialogOpen.value = false
      await loadAll()
    } catch (error) {
      dialogError.value = mapAdministrationError(error, 'Nao foi possivel salvar o setor.')
    } finally {
      saving.value = false
    }
  }

  async function savePerfil() {
    saving.value = true
    dialogError.value = ''

    try {
      if (editingPerfilId.value) {
        await updatePerfil(editingPerfilId.value, perfilForm.value)
      } else {
        await createPerfil(perfilForm.value)
      }

      perfilDialogOpen.value = false
      await loadAll()
    } catch (error) {
      dialogError.value = mapAdministrationError(error, 'Nao foi possivel salvar o perfil.')
    } finally {
      saving.value = false
    }
  }

  return {
    activeTab,
    deletingEmpresa,
    detailError,
    dialogError,
    editingEmpresaId,
    editingFilialId,
    editingPerfilId,
    editingSetorId,
    empresaColumns,
    empresaDetailOpen,
    empresaDialogOpen,
    empresaForm,
    empresaRows,
    empresaSearch,
    empresas,
    filialColumns,
    filialDialogOpen,
    filialForm,
    filialRows,
    filialSearch,
    filiais,
    handleEmpresaDeleteRows,
    handleEmpresaEditRow,
    handleFilialDeleteRows,
    handleFilialEditRow,
    handlePerfilDeleteRows,
    handlePerfilEditRow,
    handleSetorDeleteRows,
    handleSetorEditRow,
    hasSuperuserPermission,
    loadAll,
    loadError,
    loading,
    openEmpresaDetail,
    openEmpresaDialog,
    openEmpresaEditFromDetail,
    openFilialEditFromDetail,
    deleteSelectedEmpresa,
    openFilialDialog,
    openPerfilDialog,
    openSetorDialog,
    perfilColumns,
    perfilDialogOpen,
    perfilForm,
    perfilRows,
    perfilSearch,
    perfis,
    saveEmpresa,
    saveFilial,
    savePerfil,
    saveSetor,
    saving,
    setorColumns,
    setorDialogOpen,
    setorForm,
    setorRows,
    setorSearch,
    selectedEmpresa,
    selectedEmpresaFiliais,
    selectedEmpresaSetores,
  }
}
