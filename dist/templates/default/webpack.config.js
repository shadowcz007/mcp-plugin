const path = require('path')
const package = require('./package.json')
module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: package.name + '.cjs',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2'
    }
  }
}
