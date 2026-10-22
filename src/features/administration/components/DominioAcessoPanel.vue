<template>
  <DetailViewSection
    title="Domínios de IA"
    icon="sparkling-line"
    class="dominio-acesso-panel"
  >
    <InlineMessage
      v-if="errorMessage"
      :messages="errorMessage"
      align="start"
    />

    <p v-else-if="loading" class="dominio-acesso-panel__empty text-body-small">
      Carregando domínios...
    </p>

    <p v-else-if="linhas.length === 0" class="dominio-acesso-panel__empty text-body-small">
      Nenhum domínio de IA está ativo no servidor.
    </p>

    <ul v-else class="dominio-acesso-panel__list">
      <li
        v-for="linha in linhas"
        :key="linha.chave"
        class="dominio-acesso-panel__item"
      >
        <div class="dominio-acesso-panel__texto">
          <span class="dominio-acesso-panel__nome text-body-small">{{ linha.nome }}</span>

          <span
            v-if="linha.origem"
            class="dominio-acesso-panel__origem text-body-caption"
          >
            Herdado de {{ linha.origem }}
          </span>
        </div>

        <v-switch
          :model-value="linha.liberado"
          :disabled="saving || linha.bloqueado"
          :aria-label="`Liberar ${linha.nome} para ${rotuloNivel}`"
          color="primary"
          density="compact"
          hide-details
          inset
          @update:model-value="(valor) => alternar(linha, !!valor)"
        />
      </li>
    </ul>
  </DetailViewSection>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import DetailViewSection from '@/shared/components/detail-view-dialog/DetailViewSection.vue'
  import { ApiError } from '@/shared/services/http'
  import {
    concederDominio,
    getDominioAcessos,
    retirarDominio,
  } from '@/features/administration/services/dominio-acesso.service'
  import type {
    DominioAcessoNivel,
    DominioAcessoResponse,
  } from '@/features/administration/types/dominio-acesso.types'

  type Linha = {
    chave: string
    nome: string
    liberado: boolean
    bloqueado: boolean
    origem: string | null
    concessaoId: number | null
  }

  const props = defineProps<{
    nivel: DominioAcessoNivel
    alvoId: number
  }>()

  const ROTULOS_NIVEL: Record<DominioAcessoNivel, string> = {
    empresa: 'a empresa',
    filial: 'a filial',
    setor: 'o setor',
    usuario: 'o usuário',
  }

  const rotuloNivel = computed(() => ROTULOS_NIVEL[props.nivel])
  const dados = ref<DominioAcessoResponse | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const linhas = computed<Linha[]>(() => {
    const atual = dados.value
    if (!atual) return []

    return atual.dominios_ativos.map((dominio) => {
      const direto = atual.diretos.find((item) => item.dominio === dominio.chave)
      const herdado = atual.herdados.find((item) => item.dominio === dominio.chave)

      if (direto) {
        return {
          chave: dominio.chave,
          nome: dominio.nome,
          liberado: true,
          bloqueado: false,
          origem: null,
          concessaoId: direto.id,
        }
      }

      if (herdado) {
        return {
          chave: dominio.chave,
          nome: dominio.nome,
          liberado: true,
          bloqueado: true,
          origem: `${herdado.origem} (${ROTULOS_NIVEL[herdado.nivel].replace(/^(a|o) /, '')})`,
          concessaoId: null,
        }
      }

      return {
        chave: dominio.chave,
        nome: dominio.nome,
        liberado: false,
        bloqueado: false,
        origem: null,
        concessaoId: null,
      }
    })
  })

  async function carregar() {
    loading.value = true
    errorMessage.value = ''
    try {
      dados.value = await getDominioAcessos(props.nivel, props.alvoId)
    } catch (error) {
      dados.value = null
      errorMessage.value = mensagemErro(error, 'Não foi possível carregar os domínios deste item.')
    } finally {
      loading.value = false
    }
  }

  async function alternar(linha: Linha, liberar: boolean) {
    saving.value = true
    errorMessage.value = ''
    try {
      if (liberar) {
        await concederDominio(linha.chave, props.nivel, props.alvoId)
      } else if (linha.concessaoId !== null) {
        await retirarDominio(linha.concessaoId)
      }
      await carregar()
    } catch (error) {
      errorMessage.value = mensagemErro(error, 'Não foi possível atualizar o acesso ao domínio.')
    } finally {
      saving.value = false
    }
  }

  function mensagemErro(error: unknown, padrao: string) {
    if (error instanceof ApiError && error.details && typeof error.details === 'object') {
      const detalhe = (error.details as { error?: unknown }).error
      if (typeof detalhe === 'string' && detalhe) return detalhe
    }
    return padrao
  }

  watch(() => [props.nivel, props.alvoId] as const, carregar, { immediate: true })
</script>

<style scoped lang="scss">
  .dominio-acesso-panel__empty {
    margin: 0;
    color: rgb(var(--v-theme-on-surface-variant, 120, 120, 120));
  }

  .dominio-acesso-panel__list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .dominio-acesso-panel__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(var(--v-theme-on-surface), 0.04);
  }

  .dominio-acesso-panel__texto {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .dominio-acesso-panel__origem {
    color: rgb(var(--v-theme-on-surface-variant, 120, 120, 120));
  }
</style>
