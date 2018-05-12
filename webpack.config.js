const path = require("path");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const objectAssignTransform = require("babel-plugin-transform-object-assign");
const NodeSourcePlugin = require("webpack/lib/node/NodeSourcePlugin");

module.exports = {
	entry: ["babel-polyfill", "./src/index-reactnative.js"],
	mode: "production",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle1.js",
		library: "cloudy",
		libraryTarget: "commonjs2",
		pathinfo: true,
	},
	resolve: {
		aliasFields: ["react-native"],
		alias: {
			"fs": "memfs",
			"./node_modules/ipfs-repo/src/lock.js": "./node_modules/ipfs-repo/src/lock-memory.js",
		},
	},
	externals : {
		"react-native": "react-native",
		"fs-ext": {
			commonjs: "fs-ext",
		},
	},
	devtool: "",
	optimization: {
		minimizer: [],
	},
	plugins: [
		/* new MinifyPlugin({
			// minifyOpts
		}, {
			// pluginOpts
		}), */
		/* new webpack.ProvidePlugin({
			"self": "self-crypto",
		}), */
	],
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
	node: {
		net: "mock",
		// fs: "empty",
		tls: "empty",
		dgram: "empty",
		dns: "empty",
		"child_process": "empty",
	}
};
