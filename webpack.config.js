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
          "sass-loader",  // compiles Sass to CSS, using Node Sass by default
          "postcss-loader"
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'resources/',
            }
          },
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'resources/fonts/'
            }
        }]
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
  mode: 'development',
  target: 'node',
  plugins: [
    new DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false
    }),
    {
      apply: compiler => {
        compiler.hooks.beforeCompile.tap('clearConsole', compilation => {
          process.stdout.write('\033c');
        });
      }
    }
  ],
  devtool: 'source-map'
}
