module.exports = {
  // ...existing code...
  module: {
    rules: [
      // ...existing rules...
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          // ...existing exclusions...
          /node_modules\/react-github-login/
        ],
      },
      // ...existing rules...
    ],
  },
  // ...existing code...
};
