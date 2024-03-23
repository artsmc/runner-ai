const dotenv = require('dotenv');
var fs = require('fs');
var webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const smp = new SpeedMeasurePlugin();
const handler = (percentage, message, ...args) => {
    // e.g. Output each progress message directly to the console:
    // console.info(percentage, message, ...args);
};

new webpack.ProgressPlugin(handler);
const isProd = process.env.NODE_ENV === 'production';

const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

const config = smp.wrap({
    mode: isProd ? 'production' : 'development',
    cache: {
        type: 'filesystem',
        allowCollectingMemory: true,
        compression: 'gzip',
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, './'),
        ],
        extensions: [
            '.webpack.js',
            '.html',
            '.hbs',
            '.csv',
            '.png',
            '.web.js',
            '.ts',
            '.tsx',
            '.js',
            '.mjs'
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true, // webpack@1.x
                            disable: true, // webpack@2.x and newer
                        },
                    },
                ],
            },
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'es6',
                    tsconfigRaw: require('./tsconfig.json'),
                },
            },
            {
                test: /\.(jsx|js)$/i,
                use: ['esbuild-loader'],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV:'development',
            'process.env': JSON.stringify(dotenv.config().parsed)
        }),
        new CompressionPlugin({
            algorithm: 'gzip',
        }),
    ],
});

module.exports = Object.assign({}, config, {
    entry: {
        server: './app/server/server.ts',
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, `dist/server/`),
        filename: 'server.js',
    },
    target: 'node',
    externals: nodeModules,
});