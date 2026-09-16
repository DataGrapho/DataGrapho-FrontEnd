const CPF_FORMATTED_PATTERN = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export function formatCpfInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function isCompleteCpfFormatted(value: string) {
  return CPF_FORMATTED_PATTERN.test(value)
}

export function isValidCpfDigits(digits: string) {
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let index = 0; index < 9; index += 1) {
    sum += Number(digits[index]) * (10 - index)
  }

  let check = (sum * 10) % 11
  if (check === 10) check = 0
  if (check !== Number(digits[9])) return false

  sum = 0
  for (let index = 0; index < 10; index += 1) {
    sum += Number(digits[index]) * (11 - index)
  }

  check = (sum * 10) % 11
  if (check === 10) check = 0
  return check === Number(digits[10])
}

export function isValidCpfFormatted(value: string) {
  if (!isCompleteCpfFormatted(value)) return false
  return isValidCpfDigits(value.replace(/\D/g, ''))
}
