const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: "production",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "source/icons", to: "icons" },
        { from: "source/_locales", to: "_locales" },
        { from: "source/templates/chrome/*", to: "../build", flatten : true },
      ],
    }),
    new MiniCssExtractPlugin(),
  ],
  entry: {
    popup      : [ "./source/popup.ts" ],
    options    : [ "./source/options.ts" ],
    background : [ "./source/background.ts" ],
    style      : [
      "./source/libraries/lajw/ui/popup.css",
      "./source/libraries/lajw/ui/button.css",
      "./source/libraries/lajw/ui/input.css",
      "./source/libraries/lajw/ui/folder.css",
      "./source/libraries/lajw/ui/separator.css",
      "./source/style.css",
    ]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'build'),
  },
  module : {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, 
            options: { publicPath: "source" }
          },
          {
             loader: "css-loader",
             options : { url : false }
          },
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  devtool : "source-map",
}
