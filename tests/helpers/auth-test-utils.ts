import { defineComponent } from 'vue'

export const AuthFormStub = defineComponent({
  name: 'AuthForm',
  emits: ['submit'],
  template: '<form data-test="auth-form" @submit.prevent="$emit(\'submit\')"><slot /></form>',
})

export const AuthFormCardStub = defineComponent({
  name: 'AuthFormCard',
  template: '<section data-test="auth-form-card"><slot /></section>',
})

export const InputStub = defineComponent({
  name: 'Input',
  props: {
    id: { type: String, default: '' },
    modelValue: { type: String, default: '' },
    type: { type: String, default: 'text' },
    errorMessages: { type: [String, Array], default: '' },
  },
  emits: ['update:modelValue'],
  template: `
    <div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <p v-if="errorMessages" role="alert">{{ Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages }}</p>
    </div>
  `,
})

export const ButtonStub = defineComponent({
  name: 'Button',
  props: {
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  template: '<button :type="type" :disabled="disabled || loading"><slot /></button>',
})

export const AUTH_PAGE_STUBS = {
  AuthForm: AuthFormStub,
  AuthFormCard: AuthFormCardStub,
  Input: InputStub,
  Button: ButtonStub,
}
