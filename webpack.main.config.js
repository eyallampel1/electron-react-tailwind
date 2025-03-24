module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  externals: {
    'csv-parse/sync': 'commonjs2 csv-parse/sync',
    'worker_threads': 'commonjs2 worker_threads',
  },
  module: {
    rules: require('./webpack.rules'),
  },
};