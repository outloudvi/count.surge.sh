const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',

    entry: './src/index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },

    devtool: 'inline-source-map',
    devServer: {
        contentBase: './',
        hot: true
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: [
            '.ts',
            '.js'
        ]
    }
};