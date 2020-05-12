const purgecss = require("@fullhuman/postcss-purgecss")({
  content: [ './hugo_stats.json' ],
  defaultExtractor: (content) => {
      let els = JSON.parse(content).htmlElements;
      return els.tags.concat(els.classes, els.ids);
  },
  whitelist: []
});
/* Currenlty, as of Hugo .69.0, the some classed are not picked up and added to the json file.
Once it's fixed we'll be able to use it.
const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [ './hugo_stats.json' ],
  defaultExtractor: (content) => {
      let els = JSON.parse(content).htmlElements;
      return els.tags.concat(els.classes, els.ids);
  }
});
*/
module.exports = {
  plugins: [
    require("postcss-import")({
      path: ["assets/css"]
    }),
    require("tailwindcss")("./assets/css/tailwind.config.js"),
    require("autoprefixer"),
    ...(process.env.HUGO_ENV !== "development" ? [purgecss] : [])
  ]
};
