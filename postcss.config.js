const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [ './hugo_stats.json' ],
  defaultExtractor: (content) => {
      let els = JSON.parse(content).htmlElements;
      return els.tags.concat(els.classes, els.ids);
  }
});

module.exports = {
  plugins: [
    require("postcss-import")({
      path: ["assets/css"]
    }),
    require("tailwindcss")("./assets/css/tailwindcss.config.js"),
    require("autoprefixer"),
    ...(process.env.NODE_ENV !== "development" ? [purgecss] : [])
  ]
};
