const { DefinePlugin } = require('webpack');
const { spawnSync } = require('child_process');

module.exports = {
  entry: './src/components/main.tsx',
  module: {
    rules: [
      {
        test: /\.ts|.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' }, // to inject the result into the DOM as a style block
          { loader: 'css-modules-typescript-loader' }, // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
          { loader: 'css-loader', options: { modules: true } }, // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
          { loader: 'sass-loader' }, // to convert SASS to CSS
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'resources/',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'resources/fonts/',
            },
          },
        ],
      },
    ],
  },
  watch: true,
  watchOptions: {
    poll: true,
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
  },
  output: {
    filename: 'resources/app.bundle.js',
    sourceMapFilename: 'resources/app.bundle.js.map',
    path: __dirname,
  },
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  plugins: [
    new DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('clearConsole', () => {
          process.stdout.write('\033c');
        });

        // compiler.hooks.afterCompile.tap('jest', compilation => {
        //   // https://stackoverflow.com/a/43285131/863110
        //   spawnSync(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['test'], {stdio:'inherit'});
        // });
      },
    },
  ],
};
