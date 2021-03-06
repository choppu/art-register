const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './dapp/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      { 
        test: /\.css$/, 
        use: ['style-loader', 'css-loader'] 
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            }
          },
        ],
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 9000,
    host: '0.0.0.0'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'create.html',
      template: 'dapp/create.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'arts.html',
      template: 'dapp/arts.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'dapp/index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'art.html',
      template: 'dapp/art.html'
    })
  ]  
};