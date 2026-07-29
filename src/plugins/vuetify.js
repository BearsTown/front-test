import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

const carbonTheme = {
  dark: false,
  colors: {
    primary: '#1B6EF3',
    'primary-darken-1': '#1452C4',
    secondary: '#00C853',
    accent: '#1B6EF3',
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    background: '#F4F6F9',
    surface: '#FFFFFF',
  },
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'carbonTheme',
    themes: { carbonTheme },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
