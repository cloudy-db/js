const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
	entry: "./src/index-reactnative.js",
	mode: "production",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
		library: "cloudy",
		libraryTarget: "commonjs2",
	},
	resolve: {
		aliasFields: ["react-native", "browser"],
	},
	externals : {
		"react-native" : "react-native",
	},
	devtool: "cheap-source-map",
	optimization: {
		minimizer: [], // let downstream application minimize it
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /babel/,
				loader: 'string-replace-loader',
				options: {
					search: "var _extends = Object\.assign \\|\\|",
					replace: "var _extends =",
					flags: "g",
				}
			},
			{
				test: /\.js$/,
				exclude: /babel/,
				use: {
					loader: "babel-loader",
					options: {
						plugins: [require("babel-plugin-transform-object-assign")],
						babelrc: false,
					}
				},
			},
		],

	},	  
};
