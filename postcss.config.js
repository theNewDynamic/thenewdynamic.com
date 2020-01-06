module.exports = {
  plugins: [
    require('tailwindcss')("./assets/tailwindcss.config.js"),
    require('autoprefixer'),
    ...(process.env.NODE_ENV !== "development"
    ? [
        require("@fullhuman/postcss-purgecss")({
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
          whitelist: [
          ]
        })
      ]
    : []) //If Development, do not use PurgeCSS
  ]
}