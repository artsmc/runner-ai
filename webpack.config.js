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
        rules: [{
            test: /\.hbs$/,
            use: [{
                loader: 'handlebars-loader',
            },],
        },
        {
            test: /\.html$/,
            use: [{
                loader: 'file-loader',
                options: {
                    emitFile: false,
                    outputPath: 'dist/images',
                },
            },],
        },
        {
            test: /\.csv$/,
            loader: 'csv-loader',
            options: {
                dynamicTyping: true,
                header: true,
                skipEmptyLines: true,
            },
        },
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
        // All files with a '.ts' or '.tsx'
        // extension will be handled by 'ts-loader'
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
            // include: path.resolve(__dirname, 'src'),
            use: ['esbuild-loader'],
        },
        {
            test: /\.scss$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].build.css',
                    context: './',
                    outputPath: '/',
                    publicPath: '/dist',
                },
            },
            {
                loader: 'css-loader',
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true,
                },
            },
            ],
        },
        {
            test: /\.css$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        // you can specify a publicPath here
                        // by default it uses publicPath in webpackOptions.output
                        publicPath: '/dist/public/assets/css'
                    },
                },
                'css-loader',
            ],
        },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: './app/public',
                    to: './public/',
                },
                {
                    from: './app/views',
                    to: './views/',
                }
            ]
        }),
        new webpack.DefinePlugin({
            NODE_ENV:'development',
            'process.env': JSON.stringify(dotenv.config().parsed)
        }),
        new CompressionPlugin({
            algorithm: 'gzip',
        }),
    ],
});

const serverConfig = Object.assign({}, config, {
    entry: {
        server: './app/server.ts',
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, `dist/`),
        filename: 'server.js',
    },
    target: 'node',
    externals: nodeModules,
});
const appConfig = Object.assign({}, config, {
    entry: {
        styles: ['toastify-js/src/toastify.css', './app/public/assets/css/styles.js'],
        vendor: ['jquery', 'hammerjs', 'micromodal', 'toastify-js', '@selectize/selectize', 'owl.carousel'],
        app: [
            './app/public/assets/js/clipboard.min.js',
            './app/public/assets/js/jquery.lazy.min.js',
            './app/public/assets/js/jquery.hammer.js',
            './app/public/assets/js/fontawesome.min.js',
            './app/public/assets/js/webflow.js',
        ],
    },
    output: {
        path: path.resolve(__dirname, `dist/public/assets`),
        filename: './js/[name].js',
    },
    plugins: [
        new CompressionPlugin({
            algorithm: 'gzip',
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: './css/main.app.css',
            chunkFilename: './css/main.app.css',
        }),
    ],
    target: 'web',
});

module.exports = [serverConfig, appConfig];