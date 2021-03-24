const path = require("path");

module.exports = {
  context: path.resolve(__dirname, "webpackjs"),
  // webpack folder’s entry js — excluded from jekll’s build process.
  entry: {
    micromobility: "./micromobility-data.js",
    signal_projects: "./signal-projects.js",
  },
  output: {
    // we’re going to put the generated file in the assets folder so jekyll will grab it.
    // if using GitHub Pages, use the following:
    // path: "assets/javascripts"
    // path: "./components/js/",
    // filename: "bundle.js"
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "assets/js"),
  },
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        resolve: { extensions: [".js", ".jsx", ".css"] }, //add '.css' "root": __dirname
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader",
            options: {
              bypassOnDebug: true, // webpack@1.x
              disable: true, // webpack@2.x and newer
              outputPath: "images",
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: "65-90",
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        use: {
          loader: "file-loader?name=[name].[ext]", // <-- retain original file name
        },
      },
    ],
  },
};
