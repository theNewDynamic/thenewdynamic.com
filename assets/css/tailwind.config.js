const colors = require("./colors.json");

module.exports = {
	theme: {
		linearGradientColors: {
			// defaults to {}
			tmd: "#f00",
			"red-blue": ["#f00", "#00f"],
			"red-green-blue": ["#f00", "#0f0", "#00f"],
			"primary-light": [
				"#410252 0%",
				"#63004c, 16%",
				"#810045 33%",
				"#9f003e 50%",
				"#bc0435 66%",
				"#da0c2b 83%",
				"#f8141d 100%",
			],
			primary: [
				"#410252 0%",
				"#63004c, 16%",
				"#810045 33%",
				"#9f003e 50%",
				"#bc0435 66%",
				"#AE0C40 83%",
				"#980A38 100%",
			],
			"black-white-with-stops": ["#000", "#000 45%", "#fff 55%", "#fff"],
		},
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
				fontSize: theme("fontSize.lg"),
				lineHeight: theme("lineHeight.relaxed"),
				"> * + *": {
					marginTop: "1em",				
				},
				h1: {
					extends: "h1",
					color: theme("colors.gray.900"),
				},
				h2: {
					extends: "h2",
					color: theme("colors.gray.900"),
				},
				h3: {
					extends: "h3",
					color: theme("colors.gray.900"),
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
				pre: {
					borderRadius: theme("borderRadius.md"),
					fontSize: theme("fontSize.base"),
					overflow: theme("overflow.scroll"),
					padding: "18px",
				},
				code: {
					"white-space": "pre-wrap",
					borderRadius: theme('borderRadius.default'),
					backgroundColor: theme('colors.gray.800'),
					color: theme('colors.gray.200'),
					padding: '0 .5rem',
					fontSize: theme('fontSize.sm'),
					display: 'inline-block',
				},
				blockquote: {
					backgroundColor: theme("colors.gray.100"),
					borderRadius: theme("borderRadius.md"),
					color: theme("colors.black"),
					fontSize: theme("fontSize.4xl"),
					fontFamily: theme("fontFamily.serif"),
					fontWeight: theme("fontWeight.bold"),
					padding: theme("padding.8"),
				},
			},
		}),
		extend: {
			colors,
			screens: {
				"-sm": { max: "638px" },
			},
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
				code: [
					"Consolas",
					"Monaco",
					"Andale Mono",
					"Ubuntu Mono",
					"monospace"
				]
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
	variants: {
		borderWidth: ["responsive", "hover", "focus"],
	},
	plugins: [
		require("@tailwindcss/ui"),
		require("tailwindcss-gradients"),
		require("tailwindcss-typography")({
			componentPrefix: "", // the prefix to use for text style classes
		}),
	],
};
