const { JSDOM } = require("jsdom");
const { Schema } = require('@sanity/schema')
const { htmlToBlocks } = require('@sanity/block-tools')
const imageRule = require('./rules/image')
const shortcodeRule = require('./rules/shortcode')
const figureRule = require('./rules/figure')
const htmlRule = require('./rules/html')
const codeRule = require('./rules/code')
module.exports = function(html) {
  // Start with compiling a schema we can work against
  const defaultSchema = Schema.compile({
    name: 'myBlog',
    types: [
      {
        type: 'object',
        name: 'blogPost',
        fields: [
          {
            title: 'Body',
            name: 'body',
            type: 'array',
            of: [
              {type: 'block'},
              {type: 'image'}
            ],
          },
        ],
      },
    ],
  })

  const blockContentType = defaultSchema
    .get('blogPost')
    .fields.find((field) => field.name === 'body').type

  const wrappedHTML = `<html><body>${html}</body></html>`
  const blocks = htmlToBlocks(
    wrappedHTML,
    blockContentType,
    {
      parseHtml: (html) => new JSDOM(html).window.document,
      rules: [
        imageRule,
        shortcodeRule,
        htmlRule,
        codeRule,
        //figureRule
      ]
    }
  )

  return blocks
}