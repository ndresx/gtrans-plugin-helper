const path = require('path');
const WriteFilePlugin = require('write-file-webpack-plugin');

const PATH = {
  src: path.join(__dirname, '..', 'src'),
  dist: path.join(__dirname, '.', 'js'),
};

module.exports = {
  entry: path.join(PATH.src, 'index.js'),
  devServer: {
    contentBase: path.join(__dirname, '.'),
    port: 9001,
  },
  output: {
    path: PATH.dist,
    filename: 'bundle.js',
  },
  resolve: {
    modules: [PATH.src, 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [new WriteFilePlugin()],
};
