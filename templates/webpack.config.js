const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESManglePlugin = require('esmangle-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const FailPlugin = require('webpack-fail-plugin');
const OrderAndHashPlugin = require('./order-and-hash-plugin');
const htmlTemplateContent = require('./html-template-content');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const PORT = process.env.PORT || 55555;
const DEFAULT_OPTIONS = {
    appDir    : './app',
    buildDir  : './app-build',
    testDir   : './app-test',
    releaseDir: './app-release',
    port      : PORT,
    names     : 'app*, release'
};
const unminify = process.env.UNMINIFIED || 'false';
const linting = process.env.LINT || 'false';
const publicPath = process.env.PUBLIC_PATH || ('http://localhost:' + PORT + '/');
const outputDir = process.env.MODE === 'release' ? DEFAULT_OPTIONS.releaseDir : DEFAULT_OPTIONS.buildDir;

var plugins = [
    new CleanPlugin([outputDir], {root: process.cwd(), verbose: false}),
    new webpack.DefinePlugin({
        BUILD_VERSION            : process.env.BUILD_VERSION || JSON.stringify('development'),
        DEFINE_LOGGING_IS_ENABLED: process.env.LOGGING_IS_ENABLED || 'false'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
        jQuery         : 'jquery',
        $              : 'jquery',
        'window.jQuery': 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'js/vendor-[hash].js'),
    new ExtractTextPlugin('css/[name]-[id]-[contenthash].css'),

    new ExtractTextPlugin('indexhtml.html'),
    new HtmlWebpackPlugin({
        filename       : 'index.html',
        excludeChunks  : ['manifest', 'indexhtml'],
        templateContent: htmlTemplateContent('indexhtml', false), // custom html template with support for inject tag
        minify         : false,
        inject         : false
    }),
    FailPlugin
];
if (linting === 'true') {
    plugins.push(new StyleLintPlugin({
        failOnError: true,
        syntax     : 'scss'
    }));
}
if (unminify == 'false') {
    plugins.push(new ESManglePlugin({
        exclude: /(test|indexhtml).\w+.js$/i  // breakage occurs if we don't exclude entry points for index.html, test
    }));
    plugins.push(new OrderAndHashPlugin());
}

module.exports = {
    entry        : {
        vendor     : [
            path.join(__dirname, '/app/vendor.js')
        ],
        'index'    : [
            path.join(__dirname, './app/index.js'),
            path.join(__dirname, './app/index.scss')
        ],
        'indexhtml': [
            path.join(__dirname, './app/index.html')
        ]
    },
    devtool      : 'source-map',
    output       : {
        path         : outputDir,
        filename     : '[name]-[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        publicPath   : publicPath
    },
    devServer    : {
        // https://webpack.js.org/configuration/stats
        stats: {
            hash        : true,
            version     : true,
            timings     : true,
            assets      : false,
            chunks      : false,
            modules     : false,
            reasons     : false,
            children    : false,
            source      : false,
            errors      : true,
            errorDetails: true,
            warnings    : true,
            publicPath  : false
        },
        port : PORT
    },
    plugins      : plugins,
    resolve      : {
        extensions        : ['', '.js'],
        modulesDirectories: [
            'node_modules',
            'bower_components'
        ]
    },
    resolveLoader: {
        modulesDirectories: [
            'node_modules',
            'bower_components'
        ]
    },
    // https://github.com/webpack-contrib/jshint-loader
    jshint    : {
        emitErrors: true,
        failOnHint: false,
    },
    module       : {
        preLoaders: [
            //{
            //    test  : /\.css$/,
            //    loader: 'csslint'
            //},
            {
                test   : /\.js$/i,
                loader : 'jshint-loader',
                exclude: /node_modules/
            }
        ],
        loaders   : [
            {
                test   : /\angular.js$/i,
                include: /node_modules\/angular/i,
                loader : 'exports-loader?angular'
            },

            {
                test  : /\.json$/,
                loader: 'json-loader'
            },
            {
                test  : /index\.html$/,
                loader: ExtractTextPlugin.extract('html?minimize=false&attrs=img:src link:href')
            },
            {
                test  : /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', '!css-loader?minimize&sourceMap!resolve-url-loader?sourceMap!sass-loader?sourceMap')
            },
            {
                test  : /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', '!css-loader?minimize&sourceMap!resolve-url-loader?sourceMap')
            },
            {
                test  : /\.(ico|gif|jpg|jpeg|png|svg)$/,
                loader: 'file-loader?name=[md5:hash:hex:20].[ext]!image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
            },
            {
                test  : /\.(eot|ttf|otf)([#?].*)?$/i,
                loader: 'file-loader?name=[md5:hash:hex:20].[ext]'
            },
            {
                test  : /\.woff2?([#?].*)?$/i,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[md5:hash:hex:20].[ext]'
            },
            {
                test  : /\.(mp3|mp4)$/,
                loader: 'file-loader?name=[md5:hash:hex:20].[ext]'
            },

            {
                test  : /\.js$/,
                loader: 'ng-annotate-loader?sourceMap!adjust-sourcemap-loader?format=absolute!nginject-loader?sourceMap&deprecate&singleQuote!babel-loader?sourceMap&ignore=buffer&compact=false&cacheDirectory=.babel'
            },
            {
                test   : /\.html$/,
                exclude: /index\.html$/,
                loader : 'html-loader?interpolate&removeComments=false&attrs=img:src link:href'
            }
        ]
    }
};