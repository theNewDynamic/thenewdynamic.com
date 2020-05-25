const colors = require("./colors.json");

module.exports = {
	theme: {
		textStyles: (theme) => ({
			heading: {
				output: false,
				fontWeight: theme("fontWeight.bold"),
				lineHeight: theme("lineHeight.tight"),
			},
			h1: {
				extends: "heading",
				fontSize: theme("fontSize.5xl"),
				"@screen sm": {
					fontSize: theme("fontSize.6xl"),
				},
			},
			h2: {
				extends: "heading",
				fontSize: theme("fontSize.4xl"),
				"@screen sm": {
					fontSize: theme("fontSize.5xl"),
				},
			},
			h3: {
				extends: "heading",
				fontSize: theme("fontSize.4xl"),
			},
			h4: {
				extends: "heading",
				fontSize: theme("fontSize.3xl"),
			},
			h5: {
				extends: "heading",
				fontSize: theme("fontSize.2xl"),
			},
			h6: {
				extends: "heading",
				fontSize: theme("fontSize.xl"),
			},
			link: {
				fontWeight: theme("fontWeight.bold"),
				color: theme("colors.blue.400"),
				"&:hover": {
					color: theme("colors.blue.600"),
					textDecoration: "underline",
				},
			},
			richText: {
				fontWeight: theme("fontWeight.normal"),
				fontSize: theme("fontSize.base"),
				lineHeight: theme("lineHeight.relaxed"),
				"> * + *": {
					marginTop: "1em",
					color: theme("colors.gray.700"),
				},
				h1: {
					extends: "h1",
				},
				h2: {
					extends: "h2",
				},
				h3: {
					extends: "h3",
				},
				h4: {
					extends: "h4",
				},
				h5: {
					extends: "h5",
				},
				h6: {
					extends: "h6",
				},
				ul: {
					marginLeft: "2rem",
					listStyleType: "disc",
				},
				ol: {
					listStyleType: "decimal",
				},
				a: {
					extends: "link",
				},
				"b, strong": {
					fontWeight: theme("fontWeight.bold"),
				},
				"i, em": {
					fontStyle: "italic",
				},
			},
		}),
		extend: {
			colors,
			minHeight: {
				"80v": "80vh",
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
					'"Noto Color Emoji"',
				],
			},
			opacity: {
				"70": "0.7",
			},
			width: {
				disk: "585px",
			},
			spacing: {
				full: "100%",
			},
		},
		container: {
			center: true,
			padding: "1rem",
		},
	},
	plugins: [
		require("@tailwindcss/ui"),
		require("tailwindcss-typography")({			
			componentPrefix: "", // the prefix to use for text style classes
		}),
	],
};
