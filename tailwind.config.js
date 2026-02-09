/** @type {import('tailwindcss').Config} */
            module.exports = {
              darkMode: 'class',
              content: [
                './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
                './src/components/**/*.{js,ts,jsx,tsx,mdx}',
                './src/app/**/*.{js,ts,jsx,tsx,mdx}',
              ],
              theme: {
                extend: {
                  colors: {
        "teal": {
                "50": "#f0f9f9",
                "100": "#d9f2f2",
                "200": "#b3e5e5",
                "300": "#8cd8d8",
                "400": "#40bfbf",
                "500": "#008b8b",
                "600": "#007d7d",
                "700": "#006868",
                "800": "#005454",
                "900": "#004545"
        }
},
                  fontFamily: {
        "inter": [
                "Inter",
                "sans-serif"
        ],
        "serif": [
                "Playfair Display",
                "serif"
        ],
        "sans": [
                "Inter",
                "sans-serif"
        ]
},
                },
              },
              plugins:  [],
            };
