const path = require('path')

module.exports = {
  config {
    stats: {
      errorDetails: true // --display-error-details
    }
  },
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
}