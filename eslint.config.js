import vuetify from 'eslint-config-vuetify'
import vue from 'eslint-plugin-vue'

export default vuetify(
  {
    antfu: false,
    perfectionist: false,
    stylistic: false,
    unicorn: false,
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
    ],
    rules: {
      'curly': 'off',
      'vue/attributes-order': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: { vue },
    rules: {
      'vue/custom-event-name-casing': 'off',
    },
  },
)
