const path = require('path')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('babel-preset-latest')
const pageId = require('spike-page-id')
const Collections = require('spike-collections')

const locals = {}
const collections = new Collections({
  addDataTo: locals,
  collections: {
    about: {
      files: 'about-us/**',
      paginate: {
        perPage: 3,
        template: 'views/_page_template.sgr',
        output: (n) => `posts/page${n}.html`
      }
    },
    posts: {
      files: 'posts/**',
      permalink: (p) => {
        const match = p.match(/^(\d+-\d+-\d+).*/)
        if (!match || !match[1]) throw new Error(`invalid date format: ${p}`)
        return { date: match[1] }
      },
      paginate: {
        perPage: 3,
        template: 'views/_page_template.sgr',
        output: (n) => `posts/page${n}.html`
      }
    },
    staff: {
      files: 'our-team/**',
      paginate: {
        perPage: 3,
        template: 'views/_page_template.sgr',
        output: (n) => `posts/page${n}.html`
      }
    }
  }
})

module.exports = {
  devtool: 'source-map',
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.css'
  },
  ignore: ['**/layout.sgr', '**/_*', '**/.*', '_cache/**', 'readme.md'],
  reshape: (ctx) => {
    return htmlStandards({
      root: 'views',
      webpack: ctx,
      locals: collections.locals(ctx, Object.assign({ pageId: pageId(ctx) }, locals))
    })
  },
  postcss: (ctx) => {
    // return cssStandards({ webpack: ctx, parser: false })
    return cssStandards({
      webpack: ctx,
      parser: false,
      minify: true,
      browsers: '> 1%, last 2 versions, Firefox ESR',
      features: {
        autoprefixer: false
      },
      rucksack: {
        autoprefixer: false,
        fallbacks: false,
        reporter: false
      }
    })
  },
  babel: { presets: [jsStandards] },
  plugins: [
    collections,
    new HardSourcePlugin({
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json'),
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache')
    })
  ]
}
