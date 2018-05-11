const path = require("path");

module.exports = {
	entry: "./src/index-reactnative.js",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
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
};
