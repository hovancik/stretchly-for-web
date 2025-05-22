import preprocess from 'svelte-preprocess'

const config = {
  preprocess: [
    preprocess({
      // Using the updated SCSS configuration to avoid deprecation warnings
      scss: {
        prependData: '@use "src/variables.scss" as *;',
        renderSync: true, // Use renderSync for better performance
        implementation: 'sass' // Use the dart-sass implementation explicitly
      }
    })
  ]
}

export default config
