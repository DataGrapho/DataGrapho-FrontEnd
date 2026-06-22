import vuetify from 'eslint-config-vuetify'

export default [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
    ],
  },
  ...vuetify(),
]
