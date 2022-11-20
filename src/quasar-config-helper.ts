// async function quasarSharedConfig(
//   quasarAppPackage: string = "@quasar/app-vite",
// ) {
//   const  extensionRunner = await import(
//     `${quasarAppPackage}/lib/app-extension/extensions-runner`
//   );
//   const getQuasarCtx = await import(
//     `${quasarAppPackage}/lib/helpers/get-quasar-ctx`
//   );
//   const QuasarConfFile = await import(
//     `${quasarAppPackage}/lib/quasar-config-file`
//   );

//   const ctx = getQuasarCtx({
//     mode: 'spa',
//     target: void 0,
//     debug: false,
//     dev: true,
//     prod: false,
//   });

//   // register app extensions
//   await extensionRunner.registerExtensions(ctx);

//   return {
//     quasarAppPackage,
//     QuasarConfFile,
//     ctx,
//   };
// }


// async function quasarViteConfig(quasarAppPackage: string) {
//   const { QuasarConfFile, ctx } = await quasarSharedConfig(
//     quasarAppPackage,
//   );

//   const quasarConfFile = new QuasarConfFile({ ctx });

//   const quasarConf = await quasarConfFile.read();
//   if (quasarConf.error !== void 0) {
//     console.log(quasarConf.error);
//   }

//   const generateConfig = await import(
//     `${quasarAppPackage}/lib/modes/spa/spa-config`
//   );

//   // [1] -> https://github.com/cypress-io/cypress/issues/22505#issuecomment-1277855100
//   // [1] Make sure to use the root for predictability
//   quasarConf.publicPath = '/';

//   const result = await generateConfig['vite'](quasarConf);

//   // [1] Delete base so it can correctly be set by Cypress
//   delete result.base;

//   return result;
// }


// export function injectViteConfig() {
//   return  quasarViteConfig()
// }
