// Configuración de Tailwind (se carga justo después del CDN de Tailwind, en el <head>)
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mark: {
          bg: '#181a1b',
          card: '#222426',
          border: '#383c3e',
          text: '#e8e6e3',
          accent: '#458588',
          hover: '#326264'
        }
      }
    }
  }
}
