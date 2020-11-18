/** @typedef { import('tailwindcss/defaultConfig') } DefaultConfig */
/** @typedef { import('tailwindcss/defaultTheme') } DefaultTheme */
/** @typedef { DefaultConfig & { theme: { extend: DefaultTheme } } } TailwindConfig */

const typographyStyles = require('@tailwindcss/typography/src/styles')

/** @type {TailwindConfig} */
module.exports = {
  purge: [],
  theme: {
    colors: {
      transparent: 'transparent',
      realBlack: '#000000',
      black: '#353637',
      brandOrange: '#FE8E11',
      brandRed: '#ED1B24',
      darkGreen: '#174018',
      darkGrey: '#6F7071',
      grey: '#ECEDED',
      lightGreen: '#F0F9DF',
      lightGrey: '#F8F8F8',
      mildGrey: '#C0C1C1',
      pastel: '#FFEFE3',
      white: '#FFFFFF',
    },
    spacing: {
      '1': '5px',
      '2': '10px',
      '3': '15px',
      '4': '20px',
      '5': '40px',
      '6': '80px',
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    fontSize: {
      XXL: ["54.93px", {
        lineHeight: "54.93px",
        letterSpacing: "-0.02em"
      }],
      XL: ["43.95px", {
        lineHeight: "43.95px",
        letterSpacing: "-0.02em"
      }],
      L: ["35.16px", {
        lineHeight: "38.68px",
      }],
      M: ["28.13px", {
        lineHeight: "33.76px",
      }],
      S: ["22.5px", {
        lineHeight: "29.25px",
        letterSpacing: "-0.01em"
      }],
      Small: ["22.5px", {
        lineHeight: "29.25px",
        letterSpacing: "-0.01em"
      }],
      XS: ["18px", {
        lineHeight: "23.4px",
      }],
      XXS: ["14.4px", {
        lineHeight: "18.72px",
      }],
      XXXS: ["11.52px", "13.82px"]
    },
    // Add to the default
    extend: {
      fontFamily: {
        serif: "'Source Serif Pro', serif",
        sans: "'Work Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      },
      fontWeight: {
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
        600: 600,
        700: 700,
        800: 800,
        900: 900,
      }
    },
    typography: (theme) => ({
      default: {
        css: {
          color: theme('colors.black'),
          fontFamily: theme('fontFamily.serif'),
          fontSize: "22.5px",
          lineHeight: "29.25px",
          letterSpacing: "-0.01em",
          img: {
            width: '100%'
          },
          strong: {
            fontFamily: theme('fontFamily.sans'),
            fontWeight: '600'
          },
          '.standout': {
            ...typographyStyles.default.css[0].blockquote,
            paddingLeft: "0.75em"
          },
          '.standout p:first-of-type::before': {
            ...typographyStyles.default.css[0]['blockquote p:first-of-type::before']
          },
          '.standout p:last-of-type::before': {
            ...typographyStyles.default.css[0]['blockquote p:last-of-type::after']
          }
        }
      }
    })
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
