const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: ["babel-polyfill", "./src/index-reactnative.js"],
	mode: "production",
	output: {
		path: path.resolve(__dirname, "build"),
		filename: "bundle.js",
		library: "cloudy",
		libraryTarget: "commonjs2",
		pathinfo: true,
	},
	resolve: {
		mainFields: ["react-native", "module", "main"],
		aliasFields: ["react-native"],
		alias: {
			fs: "memfs",
			inherits$: path.resolve(__dirname, "node_modules/inherits"),
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
	module: {
		rules: [
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
		tls: "empty",
		dgram: "empty",
		dns: "empty",
		"child_process": "empty",
		console: false,
	}
};
