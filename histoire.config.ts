import { defineConfig } from 'histoire';
import { HstVue } from '@histoire/plugin-vue';
import { HstQuasar } from './src/histoire-plugin-quasar';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [ HstVue(),  HstQuasar()],
    setupFile: 'src/histoire.setup.ts',
});
