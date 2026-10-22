import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DominioAcessoPanel from '@/features/administration/components/DominioAcessoPanel.vue'
import {
  concederDominio,
  getDominioAcessos,
  retirarDominio,
} from '@/features/administration/services/dominio-acesso.service'

vi.mock('@/features/administration/services/dominio-acesso.service', () => ({
  getDominioAcessos: vi.fn(),
  concederDominio: vi.fn(),
  retirarDominio: vi.fn(),
}))

const SwitchStub = defineComponent({
  props: { modelValue: Boolean, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('input', {
      type: 'checkbox',
      checked: props.modelValue,
      disabled: props.disabled,
      onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).checked),
    })
  },
})

const SectionStub = defineComponent({
  setup(_, { slots }) {
    return () => h('section', slots.default?.())
  },
})

const RESPOSTA = {
  alvo: { nivel: 'filial' as const, id: 1, nome: 'Filial 1' },
  diretos: [{ id: 7, dominio: 'convenio', nome: 'Convênio médico' }],
  herdados: [{ dominio: 'vendas', nome: 'Vendas e pedidos', nivel: 'empresa' as const, origem: 'Empresa A' }],
  dominios_ativos: [
    { chave: 'convenio', nome: 'Convênio médico' },
    { chave: 'vendas', nome: 'Vendas e pedidos' },
    { chave: 'estoque', nome: 'Estoque' },
  ],
}

function montar() {
  return mount(DominioAcessoPanel, {
    props: { nivel: 'filial', alvoId: 1 },
    global: {
      stubs: {
        DetailViewSection: SectionStub,
        'v-switch': SwitchStub,
        InlineMessage: true,
      },
    },
  })
}

function checkboxes(wrapper: ReturnType<typeof montar>) {
  return wrapper.findAll('input[type="checkbox"]')
}

describe('DominioAcessoPanel', () => {
  beforeEach(() => {
    vi.mocked(getDominioAcessos).mockReset().mockResolvedValue(RESPOSTA)
    vi.mocked(concederDominio).mockReset().mockResolvedValue({})
    vi.mocked(retirarDominio).mockReset().mockResolvedValue({})
  })

  it('mostra concessão direta removível, herdada bloqueada e domínio livre desligado', async () => {
    const wrapper = montar()
    await flushPromises()

    const [direto, herdado, livre] = checkboxes(wrapper).map((input) => input.element as HTMLInputElement)
    expect(direto.checked).toBe(true)
    expect(direto.disabled).toBe(false)
    expect(herdado.checked).toBe(true)
    expect(herdado.disabled).toBe(true)
    expect(livre.checked).toBe(false)
    expect(wrapper.text()).toContain('Herdado de Empresa A')
  })

  it('concede um domínio livre ao alvo atual', async () => {
    const wrapper = montar()
    await flushPromises()

    await checkboxes(wrapper)[2].setValue(true)
    await flushPromises()

    expect(concederDominio).toHaveBeenCalledWith('estoque', 'filial', 1)
  })

  it('retira a concessão direta pelo id', async () => {
    const wrapper = montar()
    await flushPromises()

    await checkboxes(wrapper)[0].setValue(false)
    await flushPromises()

    expect(retirarDominio).toHaveBeenCalledWith(7)
    expect(concederDominio).not.toHaveBeenCalled()
  })

  it('mostra mensagem quando o servidor recusa a leitura', async () => {
    vi.mocked(getDominioAcessos).mockRejectedValue(new Error('falhou'))
    const wrapper = montar()
    await flushPromises()

    expect(checkboxes(wrapper)).toHaveLength(0)
  })
})
