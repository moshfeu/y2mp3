const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/components/main.tsx',
  module: {
    rules: [
      {
        test: /\.ts|.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader",   // translates CSS into CommonJS
          "sass-loader"   // compiles Sass to CSS, using Node Sass by default
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'resources/',
            }
          },
        ],
      }
    ]
  },
  watch: true,
  watchOptions: {
    poll: 1000
  },
  resolve: {
    modules: ['node_modules'],
    extensions: [ '.ts', '.tsx', '.js', '.json' ]
  },
  output: {
    filename: 'resources/app.bundle.js',
    sourceMapFilename: 'maps/app.[chunkhash].map.js',
    path: __dirname
  },
  mode: 'production',
  target: 'node',
  plugins: [
    new DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false
    })
  ],
  devtool: 'source-map'
}
