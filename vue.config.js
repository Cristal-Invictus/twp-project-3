const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // Désactive ESLint temporairement
  chainWebpack: config => {
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .include.add(/node_modules/)
      .end()
      .type('javascript/auto');
  },
})
