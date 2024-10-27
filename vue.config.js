const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',  
  outputDir: 'dist',   
  productionSourceMap: false,
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'MC PixelArt Creator'
      return args
    })
  }
})
