const { DefinePlugin } = require('webpack');
const { spawnSync } = require('child_process');

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
    poll: true
  },
  resolve: {
    modules: ['node_modules'],
    extensions: [ '.ts', '.tsx', '.js', '.json' ]
  },
  output: {
    filename: 'resources/app.bundle.js',
    sourceMapFilename: 'resources/app.bundle.js.map',
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

        // compiler.hooks.afterCompile.tap('jest', compilation => {
        //   // https://stackoverflow.com/a/43285131/863110
        //   spawnSync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['test'], {stdio:'inherit'});
        // });
      }
    }
  ]
}