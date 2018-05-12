const path = require("path");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const objectAssignTransform = require("babel-plugin-transform-object-assign");
const NodeSourcePlugin = require("webpack/lib/node/NodeSourcePlugin");

module.exports = {
	entry: ["babel-polyfill", "./src/index-reactnative.js"],
	mode: "production",
	target: "webworker",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle2.js",
		library: "cloudy",
		libraryTarget: "commonjs2",
	},
	resolve: {
		aliasFields: ["react-native"],
	},
	externals : {
		"react-native": "react-native",
	},
	devtool: "",
	optimization: {
		minimizer: [],
	},
	/*plugins: [
		new MinifyPlugin({
			// minifyOpts
		}, {
			// pluginOpts
		})
	],*/
	plugins: [
		new webpack.DefinePlugin({
			//"self": {}
		}),
	],
	module: {
		rules: [
			/*{
				test: /\.js$/,
				exclude: /babel/,
				loader: 'string-replace-loader',
				options: {
					search: "var _extends = Object\.assign \\|\\|",
					replace: "var _extends =",
					flags: "g",
				}
			},*/
			{
				test: /\.js$/,
				exclude: /babel/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["react-native"],
						plugins: [],
						babelrc: false,
						cacheDirectory: true,
					}
				},
			},
		],

	},
};
