<template>
  <main class="administration-page">
    <InlineMessage
      v-if="!hasSuperuserPermission"
      messages="Voce nao possui permissao para acessar este modulo."
      align="start"
    />

    <template v-else>
      <header class="administration-page__header">
        <div>
          <h1 class="administration-page__title text-display-h4">Administracao</h1>
          <p class="administration-page__subtitle text-body-small">
            Cadastre empresas, filiais, setores e perfis.
          </p>
        </div>
      </header>

      <v-tabs v-model="activeTab" class="administration-page__tabs" color="primary">
        <v-tab value="empresas">Empresas</v-tab>
        <v-tab value="filiais">Filiais</v-tab>
        <v-tab value="setores">Setores</v-tab>
        <v-tab value="perfis">Perfis</v-tab>
      </v-tabs>

      <div class="administration-page__panel">
        <AdministrationEntityTab
          v-show="activeTab === 'empresas'"
          v-model:search-model="empresaSearch"
          class="administration-page__tab-panel"
          search-placeholder="Buscar empresas"
          add-label="Adicionar empresa"
          :columns="empresaColumns"
          :rows="empresaRows"
          row-key="id_empresa"
          empty-text="Nenhuma empresa cadastrada."
          :loading="loading"
          :error="loadError"
          @add="openEmpresaDialog()"
          @row-click="openEmpresaDetail"
          @edit-row="handleEmpresaEditRow"
          @delete-rows="handleEmpresaDeleteRows"
        />

        <AdministrationEntityTab
          v-show="activeTab === 'filiais'"
          v-model:search-model="filialSearch"
          class="administration-page__tab-panel"
          search-placeholder="Buscar filiais"
          add-label="Adicionar filial"
          :columns="filialColumns"
          :rows="filialRows"
          row-key="id_filial"
          empty-text="Nenhuma filial cadastrada."
          :loading="loading"
          :error="loadError"
          @add="openFilialDialog()"
          @row-click="openFilialDialog"
          @edit-row="handleFilialEditRow"
          @delete-rows="handleFilialDeleteRows"
        />

        <AdministrationEntityTab
          v-show="activeTab === 'setores'"
          v-model:search-model="setorSearch"
          class="administration-page__tab-panel"
          search-placeholder="Buscar setores"
          add-label="Adicionar setor"
          :columns="setorColumns"
          :rows="setorRows"
          row-key="id_setor"
          empty-text="Nenhum setor cadastrado."
          :loading="loading"
          :error="loadError"
          @add="openSetorDialog()"
          @row-click="openSetorDialog"
          @edit-row="handleSetorEditRow"
          @delete-rows="handleSetorDeleteRows"
        />

        <AdministrationEntityTab
          v-show="activeTab === 'perfis'"
          v-model:search-model="perfilSearch"
          class="administration-page__tab-panel"
          search-placeholder="Buscar perfis"
          add-label="Adicionar perfil"
          :columns="perfilColumns"
          :rows="perfilRows"
          row-key="id_perfil"
          empty-text="Nenhum perfil cadastrado."
          :loading="loading"
          :error="loadError"
          @add="openPerfilDialog()"
          @row-click="openPerfilDialog"
          @edit-row="handlePerfilEditRow"
          @delete-rows="handlePerfilDeleteRows"
        />
      </div>

      <EmpresaDetailDialog
        v-model="empresaDetailOpen"
        :empresa="selectedEmpresa"
        :filiais="selectedEmpresaFiliais"
        :setores="selectedEmpresaSetores"
        :deleting="deletingEmpresa"
        :error-message="detailError"
        @edit="openEmpresaEditFromDetail"
        @delete="deleteSelectedEmpresa"
        @edit-filial="openFilialEditFromDetail"
      />

      <AdministrationDialog
        v-model="empresaDialogOpen"
        :title="editingEmpresaId ? 'Editar empresa' : 'Adicionar empresa'"
        :saving="saving"
        :error-message="dialogError"
        @save="saveEmpresa"
      >
        <Input v-model="empresaForm.nome" field-label="Nome" placeholder="Nome da empresa" />
        <Input v-model="empresaForm.cnpj" field-label="CNPJ" placeholder="00.000.000/0000-00" />
        <Input v-model="empresaForm.endereco" field-label="Endereco" placeholder="Endereco completo" />
        <FormSelect
          v-model="empresaForm.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
        />
      </AdministrationDialog>

      <AdministrationDialog
        v-model="filialDialogOpen"
        :title="editingFilialId ? 'Editar filial' : 'Adicionar filial'"
        :saving="saving"
        :error-message="dialogError"
        @save="saveFilial"
      >
        <FormSelect
          id="filial-empresa"
          v-model="filialForm.empresa"
          field-label="Empresa"
          :items="empresas"
          item-title="nome"
          item-value="id_empresa"
          placeholder="Selecione a empresa"
        />
        <Input v-model="filialForm.nome" field-label="Nome" placeholder="Nome da filial" />
        <Input v-model="filialForm.endereco" field-label="Endereco" placeholder="Endereco completo" />
        <FormSelect
          v-model="filialForm.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
        />
      </AdministrationDialog>

      <AdministrationDialog
        v-model="setorDialogOpen"
        :title="editingSetorId ? 'Editar setor' : 'Adicionar setor'"
        :saving="saving"
        :error-message="dialogError"
        @save="saveSetor"
      >
        <FormSelect
          id="setor-filial"
          v-model="setorForm.filial"
          field-label="Filial"
          :items="filiais"
          item-title="nome"
          item-value="id_filial"
          placeholder="Selecione a filial"
        />
        <Input v-model="setorForm.nome" field-label="Nome" placeholder="Nome do setor" />
        <Input v-model="setorForm.descricao" field-label="Descricao" placeholder="Descricao do setor" />
        <FormSelect
          v-model="setorForm.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
        />
      </AdministrationDialog>

      <AdministrationDialog
        v-model="perfilDialogOpen"
        :title="editingPerfilId ? 'Editar perfil' : 'Adicionar perfil'"
        :saving="saving"
        :error-message="dialogError"
        @save="savePerfil"
      >
        <Input v-model="perfilForm.nome" field-label="Nome" placeholder="Nome do perfil" />
        <Input v-model="perfilForm.descricao" field-label="Descricao" placeholder="Descricao do perfil" />
        <FormSelect
          v-model="perfilForm.ativo"
          field-label="Status"
          item-title="title"
          item-value="value"
          :items="STATUS_OPTIONS"
          placeholder="Status"
        />
      </AdministrationDialog>
    </template>
  </main>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import Input from '@/shared/components/input/Input.vue'
  import FormSelect from '@/shared/components/form-select/FormSelect.vue'
  import InlineMessage from '@/shared/components/inline-message/InlineMessage.vue'
  import { STATUS_OPTIONS } from '@/shared/constants/status-options'
  import AdministrationDialog from '@/features/administration/components/AdministrationDialog.vue'
  import AdministrationEntityTab from '@/features/administration/components/AdministrationEntityTab.vue'
  import EmpresaDetailDialog from '@/features/administration/components/EmpresaDetailDialog.vue'
  import { useAdministration } from '@/features/administration/composables/useAdministration'

  const {
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
    loadAll,
  } = useAdministration()

  onMounted(() => {
    void loadAll()
  })
</script>

<style scoped lang="scss">
  @use '@/shared/styles/content-page' as content-page;
  @use '@/shared/styles/page-vuetify-fields' as page-fields;

  .administration-page {
    @include content-page.content-page-shell;
    overflow: hidden;
    gap: 12px;

    @media (max-width: 900px) {
      gap: 8px;
    }
  }

  .administration-page__header {
    @include content-page.content-page-header;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .administration-page__title {
    @include content-page.content-page-title;
  }

  .administration-page__subtitle {
    @include page-fields.page-subtitle;
  }

  .administration-page__tabs {
    flex: 0 0 auto;
    margin-bottom: 0;
    flex-shrink: 0;
    @include page-fields.page-tabs;

    :deep(.v-slide-group) {
      width: 100%;
    }

    :deep(.v-slide-group__content) {
      display: flex;
      width: 100%;
    }

    :deep(.v-tab) {
      min-width: 0;
      flex: 1 1 0;
      max-width: none;
      padding-inline: 8px;
    }

    :deep(.v-tab__content) {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .administration-page__panel {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  .administration-page__tab-panel {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }
</style>
