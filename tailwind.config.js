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
        "blue": {
                "50": "#F2F4F8",
                "100": "#E0E8EF",
                "200": "#AAC4D6",
                "300": "#74A9C8",
                "400": "#5590B0",
                "500": "#3A7898",
                "600": "#1E5D78",
                "700": "#0D4453",
                "800": "#0A3B48",
                "900": "#08333D",
                "950": "#041E25"
        },
        "teal": {
                "50": "#F0F6F7",
                "100": "#D8EAED",
                "200": "#90BCC5",
                "300": "#6FA3AE",
                "400": "#5A8B94",
                "500": "#4E7D86",
                "600": "#466F78",
                "700": "#3B5F67",
                "800": "#305057",
                "900": "#264047",
                "950": "#1C3037"
        },
        "emerald": {
                "50": "#F0F6F7",
                "100": "#D8EAED",
                "200": "#90BCC5",
                "300": "#6FA3AE",
                "400": "#5A8B94",
                "500": "#4E7D86",
                "600": "#466F78",
                "700": "#3B5F67",
                "800": "#305057",
                "900": "#264047",
                "950": "#1C3037"
        },
        "green": {
                "50": "#F0F6F7",
                "100": "#D8EAED",
                "200": "#90BCC5",
                "300": "#6FA3AE",
                "400": "#5A8B94",
                "500": "#4E7D86",
                "600": "#466F78",
                "700": "#3B5F67",
                "800": "#305057",
                "900": "#264047",
                "950": "#1C3037"
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
