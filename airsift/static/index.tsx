import "./global.css"
// Must be the first import
// if (process.env.NODE_ENV === 'development') {
//   console.log("Preact is in development mode")
//   // Must use require here as import statements are only allowed
//   // to exist at top-level.
//   require("preact/debug");
// }
// import "preact/devtools";
import dustboxMap from './dustboxMap'
dustboxMap()
