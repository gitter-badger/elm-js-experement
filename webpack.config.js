var path = require("path");

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [
      'babel-polyfill',
      './src/index.js'
    ]
  },

  output: {
    path: path.resolve(__dirname + '/dist'),
    filename: '[name].js',
  },

  module: {
    loaders: [
      {
        test:    /\.html$/,
        exclude: /node_modules/,
        loader:  'file?name=[name].[ext]',
      },
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      }
    ]
  },

  devServer: {
    inline: true,
    stats: { colors: true },
  },
};
