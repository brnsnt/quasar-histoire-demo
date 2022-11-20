import { fileURLToPath } from 'url'
import { join } from 'path'
import type { Plugin } from 'histoire'
import type { UserConfig as ViteConfig } from 'vite'

const ignorePlugins = [
  'quasar:index-html-transform',
]

/**
 * Extract Quasar Vite Config
 * See: https://github.com/quasarframework/quasar-testing/blob/dev/packages/e2e-cypress/src/helpers/cct-dev-server/index.ts
 *
 */
async function quasarSharedConfig(
  quasarAppPackage: string,
) {
  const  extensionRunner = await import(
    `${quasarAppPackage}/lib/app-extension/extensions-runner`
  );
  const getQuasarCtx = await import(
    `${quasarAppPackage}/lib/helpers/get-quasar-ctx`
  );
  const QuasarConfFile = await import(
    `${quasarAppPackage}/lib/quasar-config-file`
  );

  const ctx = getQuasarCtx({
    mode: 'spa',
    target: void 0,
    debug: false,
    dev: true,
    prod: false,
  });

  // register app extensions
  await extensionRunner.registerExtensions(ctx);

  return {
    quasarAppPackage,
    QuasarConfFile,
    ctx,
  };
}

/**
 * Extract Quasar Vite Config
 * See: https://github.com/quasarframework/quasar-testing/blob/dev/packages/e2e-cypress/src/helpers/cct-dev-server/index.ts
 *
 */
async function quasarViteConfig(quasarAppPackage: string = "@quasar/app-vite") {
  const { QuasarConfFile, ctx } = await quasarSharedConfig(
    quasarAppPackage,
  );

  const quasarConfFile = new QuasarConfFile({ ctx });

  const quasarConf = await quasarConfFile.read();
  if (quasarConf.error !== void 0) {
    console.log(quasarConf.error);
  }

  const generateConfig = await import(
    `${quasarAppPackage}/lib/modes/spa/spa-config`
  );

  // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
  // [1] Make sure to use the root for predictability
  quasarConf.publicPath = '/';

  const result = await generateConfig['vite'](quasarConf);

  // [1] Delete base so it can correctly be set by Cypress
  delete result.base;

  return result;
}

/**
 * Histoire Plugin for Quasar Apps
 *
 * See Nuxt plugin: https://github.com/histoire-dev/histoire/blob/main/packages/histoire-plugin-nuxt/src/index.ts
 * @returns
 */
export function HstQuasar (): Plugin {

  return {
    name: '@histoire/plugin-quasar',

    async defaultConfig () {
      const viteConfig = await quasarViteConfig()

      const plugins = viteConfig.plugins.filter((p: any) => !ignorePlugins.includes(p?.name))
      return {
        vite: {
          //define: viteConfig.define,
          resolve: {
            alias: viteConfig.resolve.alias,
            extensions: viteConfig.resolve.extensions,
            dedupe: viteConfig.resolve.dedupe,
          },
          plugins,
          css: viteConfig.css,
          publicDir: viteConfig.publicDir,
          optimizeDeps: viteConfig.optimizeDeps,
          // @ts-expect-error Vue-specific config
          vue: viteConfig.vue,
        },

      }
    },

  }
}



/** Nuxt plugin
 * TODO remove */
async function useNuxtViteConfig () {
  const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
  const nuxt = await loadNuxt({
    ready: false,
    dev: true,
    overrides: {
      ssr: false,
    },
  })
  if (nuxt.options.builder as string !== '@nuxt/vite-builder') {
    throw new Error(`Histoire only supports Vite bundler, but Nuxt builder is currently set to '${nuxt.options.builder}'.`)
  }
  const runtimeDir = fileURLToPath(new URL('../runtime', import.meta.url))
  nuxt.options.build.templates.push(
    { src: join(runtimeDir, 'composables.mjs'), filename: 'histoire/composables.mjs' },
    { src: join(runtimeDir, 'components.mjs'), filename: 'histoire/components.mjs' },
  )
  nuxt.hook('imports:sources', presets => {
    const stubbedComposables = ['useNuxtApp']
    const appPreset = presets.find(p => p.from === '#app')
    appPreset.imports = appPreset.imports.filter(i => typeof i !== 'string' || !stubbedComposables.includes(i))
    presets.push({
      from: '#build/histoire/composables.mjs',
      imports: stubbedComposables,
    })
  })
  return {
    viteConfig: await new Promise<ViteConfig>((resolve) => {
      nuxt.hook('modules:done', () => {
        nuxt.hook('components:extend', (components) => {
          for (const name of ['NuxtLink']) {
            Object.assign(components.find(c => c.pascalName === name) || {}, {
              export: name,
              filePath: '#build/histoire/components.mjs',
            })
          }
        })
        nuxt.hook('vite:extendConfig', (config, { isClient }) => {
          // @ts-ignore
          if (isClient) resolve({ ...config })
        })
      })
      nuxt.ready().then(async () => {
        buildNuxt(nuxt)
      })
    }),
    nuxt,
  }
}
