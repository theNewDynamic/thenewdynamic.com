module.exports = {
	theme: {
		extend: {
			colors: {
				notwhite: {
					100: "#FEFEFF",
					200: "#FDFEFE",
					300: "#FBFDFD",
					400: "#F9FBFC",
					500: "#F6F9FB",
					600: "#DDE0E2",
					700: "#949597",
					800: "#6F7071",
					900: "#4A4B4B"
				},
				primary: {
					100: "#F5E7EB",
					200: "#E5C2CD",
					300: "#D69DAF",
					400: "#B75474",
					500: "#980A38",
					600: "#890932",
					700: "#5B0622",
					800: "#440519",
					900: "#2E0311"
				},
				secondary: {
					100: "#FFFAEC",
					200: "#FEF2D0",
					300: "#FDEAB3",
					400: "#FCDB7A",
					500: "#FBCB41",
					600: "#E2B73B",
					700: "#977A27",
					800: "#715B1D",
					900: "#4B3D14"
				},
				tertiary: {
					100: "#FAF0EE",
					200: "#F2D9D4",
					300: "#EBC1BB",
					400: "#DB9387",
					500: "#CC6554",
					600: "#B85B4C",
					700: "#7A3D32",
					800: "#5C2D26",
					900: "#3D1E19"
				}
			},
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
