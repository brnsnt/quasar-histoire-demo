import { defineSetupVue3 } from '@histoire/plugin-vue'
import { createPinia } from 'pinia'

// Import icon libraries

//import { Quasar } from 'quasar'
// Error while collecting story /.../quasar-project/src/components/ExampleComponent.story.vue:
// TypeError: Cannot read properties of undefined (reading 'prototype')
//  at /.../quasar-project/node_modules/quasar/dist/quasar.esm.prod.js:7:22681

export const setupVue3 = defineSetupVue3(({ app }) => {

    const pinia = createPinia()
    app.use(pinia)
    //app.use(Quasar,{plugins:['Notify']})
})
