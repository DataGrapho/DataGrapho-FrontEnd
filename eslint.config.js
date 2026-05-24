import vuetify from 'eslint-config-vuetify'

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '*.min.js',
    ],
  },
  ...vuetify(),
]
