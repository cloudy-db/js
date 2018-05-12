const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: [
		// "./lib/core-js/custom.js",
		"babel-polyfill",
		"./src/index-reactnative.js",
	],
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
			debug$: "debug/src/browser.js",
			debug$: "debug/src/browser.js",
			"create-hash$": "create-hash/browser.js",
			"randombytes$": "randombytes/browser.js",
			"ipfs/src/core/runtime/config-nodejs.js": "ipfs/src/core/runtime/config-browser.js",
			"ipfs/src/core/runtime/libp2p-nodejs.js": "ipfs/src/core/runtime/libp2p-browser.js",
			"ipfs/src/core/runtime/repo-nodejs.js": "ipfs/src/core/runtime/repo-browser.js",
			"ipfs/src/core/runtime/dns-nodejs.js": "ipfs/src/core/runtime/dns-browser.js",
			"stream": "readable-stream",
			"joi": "joi-browser",
			"readable-stream/readable.js": "readable-stream/readable-browser.js",
			"readable-stream/writable.js": "readable-stream/writable-browser.js",
			"readable-stream/duplex.js": "readable-stream/duplex-browser.js",
			"readable-stream/lib/internal/streams/stream.js": "readable-stream/lib/internal/streams/stream-browser.js",
		},
	},
	externals : {
		"react-native": "react-native",
		"fs-ext": {
			commonjs: "fs-ext",
		},
	},
	devtool: "inline-cheap-source-map",
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
						compact: false,
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
		process: true,
		crypto: true,
	}
};
