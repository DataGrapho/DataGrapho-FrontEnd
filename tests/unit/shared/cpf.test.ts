import { describe, expect, it } from 'vitest'
import { formatCpfInput, isValidCpfFormatted } from '@/shared/utils/cpf'

describe('cpf utils', () => {
  it('formata cpf enquanto digita', () => {
    expect(formatCpfInput('52998224725')).toBe('529.982.247-25')
    expect(formatCpfInput('529982')).toBe('529.982')
  })

  it('valida cpf formatado', () => {
    expect(isValidCpfFormatted('529.982.247-25')).toBe(true)
    expect(isValidCpfFormatted('52998224725')).toBe(false)
  })
})
