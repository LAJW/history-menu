const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const commonScripts = [
  "./source/libraries/lajw/typecheck-release.js",
  "./source/libraries/lajw/utils.js",
  "./source/libraries/lajw/instanceof.js",
]

module.exports = {
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
    popup      : [ ...commonScripts, "./source/popup.js" ],
    options    : [ ...commonScripts, "./source/options.js" ],
    background : [ ...commonScripts, "./source/background.js" ],
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
          }
        ]
      },
    ]
  }
}
