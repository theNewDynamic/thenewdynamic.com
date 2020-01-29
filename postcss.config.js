const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./layouts/**/*.html", "./assets/js/**/*.{js,vue}"],
  extractors: [
    {
      extractor: class {
        static extract(content) {
          //console.log(process.env.NODE_ENV);
          return content.match(/[A-z0-9-:\/]+/g);
          //return content.match(/[A-z0-9-:\/]+/g) || [];
        }
      },
      extensions: ["vue", "html", "js"]
    }
  ],
  whitelist: []
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
