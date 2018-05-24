const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        exclude: [
          path.resolve(__dirname, '..', 'node_modules')
        ],
        loader: 'babel-loader',
        options: {
          presets: ['react', 'env']
        }
      }
    ]
  },
  devtool: 'inline-source-map',
  target: 'web',
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    contentBase: path.resolve(__dirname, 'public')
  }
}
