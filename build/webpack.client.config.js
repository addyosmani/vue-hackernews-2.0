const webpack = require('webpack')
const base = require('./webpack.base.config')
const vueConfig = require('./vue-loader.config')

const config = Object.assign({}, base, {
  resolve: {
    alias: {
      'create-api': './create-api-client.js'
    }
  },
  plugins: (base.plugins || []).concat([
    // strip comments in Vue code
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ])
})

if (process.env.NODE_ENV === 'production') {
  // Use ExtractTextPlugin to extract CSS into a single file
  // so it's applied on initial render
  const ExtractTextPlugin = require('extract-text-webpack-plugin')
  const SWPrecachePlugin = require('sw-precache-webpack-plugin')

  // vueConfig is already included in the config via LoaderOptionsPlugin
  // here we overwrite the loader config for <style lang="stylus">
  // so they are extracted.
  vueConfig.loaders = {
    stylus: ExtractTextPlugin.extract({
      loader: 'css-loader!stylus-loader',
      fallbackLoader: 'vue-style-loader' // <- this is a dep of vue-loader
    })
  }

  config.plugins.push(
    new ExtractTextPlugin('styles.css'),
    // this is needed in webpack 2 for minifying CSS
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // minify JS
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new SWPrecachePlugin({
      cacheId: 'vue-hn',
      filename: 'service-worker.js'
    })
  )
}

module.exports = config
