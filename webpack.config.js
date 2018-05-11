const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
	entry: "./src/index-reactnative.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
		library: "cloudy",
		libraryTarget: "umd",
	},
	resolve: {
		aliasFields: ["react-native", "browser"],
	},
	externals : {
		"react-native" : {
			commonjs: "react-native",
			// root: "react-native",
		}
	},
	devtool: "cheap-source-map",
	optimization: {
		minimizer: [
			/*new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true,
				uglifyOptions: {
					safari10: false,
					compress: {
						inline: 0,
					},
					passes: 2,
				},
			}),*/
		],
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /babel/,
				use: {
					loader: "babel-loader",
					options: {
						plugins: [require("babel-plugin-transform-object-assign")],
						babelrc: false,
					}
				}
			}
		]
	},	  
};
