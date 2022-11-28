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
      "./source/components/popup.css",
      "./source/components/button.css",
      "./source/components/input.css",
      "./source/components/folder.css",
      "./source/components/separator.css",
      "./source/style.css",
    ]
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, 'build'),
    iife: false,
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
  devtool : "source-map"
}
