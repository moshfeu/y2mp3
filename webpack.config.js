const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/main.tsx',
  module: {
    rules: [
      {
        test: /\.ts|.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  watch: true,
  resolve: {
    modules: ['node_modules'],
    extensions: [ '.ts', '.tsx', '.js', '.json' ]
  },
  output: {
    filename: 'app.bundle.js',
    path: path.join(__dirname, 'src')
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
