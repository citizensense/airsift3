/** @typedef { import('tailwindcss/defaultConfig') } DefaultConfig */
/** @typedef { import('tailwindcss/defaultTheme') } DefaultTheme */
/** @typedef { DefaultConfig & { theme: { extend: DefaultTheme } } } TailwindConfig */

const typographyStyles = require('@tailwindcss/typography/src/styles')

/** @type {TailwindConfig} */
module.exports = {
  purge: [
    './airsift/**/*.py',
    './airsift/**/*.html',
    './airsift/**/*.js',
    './airsift/**/*.jsx',
    './airsift/**/*.ts',
    './airsift/**/*.tsx'
  ],
  theme: {
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
      L: ["40px", {
        lineHeight: "40px",
      }],
      M: ["28px", {
        lineHeight: "32px",
      }],
      S: ["20px", {
        lineHeight: "26px",
      }],
      XS: ["18px", {
        lineHeight: "24px",
      }],
      XXS: ["13px", {
        lineHeight: "13px",
      }],
    },
    // Add to the default
    extend: {
      colors: {
        "brand": "#33ccff",
        "highlightGreen": "#39f986",
        "darkBlue": "#2e03da",
        "softBlack": "#343e3c",
        "midDarker": "#585e5f",
        "mid": "#8299a5",
        "light": "#ecf1f6",
        "white": "#fafafa",
        "realWhite": "#FFF",
        "purple air": "#ac44a7",
        "laqn": "#3f7d98",
        "5-10": "#f0f27c",
        "10-25": "#ffb48a",
        "25-50": "#ff8695",
        "50+": "#cf96c8",
        "black": "#000000",
        "error": "#ff2f61"
      },
      fontFamily: {
        default: "'SF Pro Text', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
        cousine: "Cousine, 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
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
      },
      opacity: {
        10: '0.1',
        20: '0.2',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        80: '0.8',
        90: '0.9',
        100: '1'
      }
    },
    typography: (theme) => ({
      default: {
        css: {
          color: theme('colors.black'),
          fontFamily: theme('fontFamily.default'),
          fontSize: theme('XS'),
          img: {
            width: '100%'
          },
          strong: {
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
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
