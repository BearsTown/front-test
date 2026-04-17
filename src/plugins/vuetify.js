import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'carbonTheme',
    themes: {
      carbonTheme: {
        dark: false,
        colors: {
          primary:           '#059176',
          'primary-lighten': '#34B898',
          'primary-darken':  '#005746',
          accent:            '#00C853',
          secondary:         '#6D7882',
          background:        '#F4F5F6',
          surface:           '#FFFFFF',
          error:             '#D63D4A',
        }
      }
    }
  },
  defaults: {
    VBtn: { rounded: 'lg', elevation: 0 },
    VCard: { rounded: 'xl', elevation: 0 },
  }
})
