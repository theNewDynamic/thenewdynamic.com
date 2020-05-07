const colors = require('./colors.json')

module.exports = {
	theme: {
		extend: {
			colors,
			minHeight: {
				"80v": "80vh"
			},
			fontFamily: {
				sans: [
					"Mark",
					"Roboto",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					'"Noto Sans"',
					"sans-serif",
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"'
				]
			},
			opacity: {
				"70": "0.7"
			},
			width: {
				disk: "585px"
			},
			spacing: {
				full: "100%"
			}
		},
		container: {
			center: true,
			padding: "1rem"
		}
	},
	plugins: [require("@tailwindcss/ui")]
};
