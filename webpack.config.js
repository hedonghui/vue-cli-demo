
const path = require('path'); //nodejs基本包（处理路径）
const HTMLPlugin = require('html-webpack-plugin');//自动生成html 插件
const webpack = require('webpack');
const ExtractPlugin = require('extract-text-webpack-plugin');//将css单独打包插件

const isDev = process.env.NODE_ENV ==='development'; //引入变量判断运行环境

const config = {
    target:'web',
    entry: path.join(__dirname,'src/index.js'),//webpack入口文件路径
    output:{                                   //编译出口路径及文件名
        filename:'bundle.[hash:8].js',        //这里使用 [hash].js(开发环境不用考虑浏览器缓存这些东西,随便弄都可) 
        path:path.join(__dirname,'dist')
    },
    module:{
        rules:[
            {
                test:/\.vue$/,
                loader:'vue-loader'
            },
            {
                test:/\.jsx$/,
                loader:'babel-loader'
            },
           
            {
                test:/\.(png|jpg|jpeg|svg|gif)$/,
                use:[
                    {
                        loader:'url-loader',
                        options:{
                            limit:2048,
                            name:'[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins:[
        /**
         * 给webpack在运行过程中判断生产环境还是开发环境，
         * 这可能会对开发模式和发布模式的构建允许不同的行为非常有用
         * 本demo并没有采用类似于vue-cli用于区分环境的3个配置文件（通过’isDev‘变量区分环境）
         * 更多关于DefinePlugin:
         * https://doc.webpack-china.org/plugins/define-plugin/#src/components/Sidebar/Sidebar.jsx
         */
        new webpack.DefinePlugin({
            'process.env':{
                NODE_ENV: isDev ? '"development"': '"production"'
            }
        }),
        //根据打包情况自动生成index.html
        new HTMLPlugin()
    ]
}

if(isDev){
    config.module.rules.push( {
        test:/\.css$/,
        use:['style-loader','css-loader']
    },
    {
        test:/\.styl/,
        use:[
            'style-loader',
            'css-loader',
            {
                loader:'postcss-loader',
                options:{
                    sourceMap:true
                }
            },
            'stylus-loader'
        ]
    })
    /**
     * 在生产环境中使用Source-map 
     * (https://doc.webpack-china.org/guides/development/#-source-map)
     * */
    config.devtool = '#cheap-module-eval-source-map'
    /**
     * 配置webpack-dev-server相关信息（端口号等）
     */
    config.devServer = {
        port:8001,
        host:'0.0.0.0',
        overlay:{
            errors:true
        },
        //开启模块热替换
        hot:true
    }
    /**
     * 添加模块热替换(HMR)所依赖的插件
     */
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
}else{
    config.entry = {
        app: path.join(__dirname,'src/index.js'),
        //这里声明类库文件打包入口(本demo没有用到vue-router..),后期开发用到的话可以在这里加入['vue','vue-router'....]
        vender:['vue']
    }
    /**
     * 打包文件输出路径,注意这里不能用 [hash].js, 否则类库打包文件hash与业务
     * 代码hash相同，导致浏览器缓存，webpack分离效果失去意义
     **/
    config.output.filename = '[name].[chunkhash:8].js'
    //css单独打包相关配置(代码分离：https://doc.webpack-china.org/plugins/extract-text-webpack-plugin/)
    config.module.rules.push({
        test:/\.styl/,
        use:ExtractPlugin.extract({
            fallback:'style-loader',
            use:[
                'css-loader',
                {
                    loader:'postcss-loader',
                    options:{
                        sourceMap:true
                    }
                },
                'stylus-loader'
            ]
        })
    },
    {
        test: /\.css$/,
        use: ExtractPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      }
)
    config.plugins.push(
        //将css 单独打包
        new ExtractPlugin('styles.[contentHash:8]-one.css'),
        new ExtractPlugin("styles.[contentHash:8]-two.css"),
        //将类库相关的代码如vue.js打包成[name].js实现业务代码与
        //类库代码分离(类库代码稳定性高,分离利于浏览器缓存)
        //更多：https://doc.webpack-china.org/guides/code-splitting/#-prevent-duplication-
        new webpack.optimize.CommonsChunkPlugin({
            name:'vender'
        }),
        //将webpack相关的代码单独打包到一个文件里面去
        //当有新的模块进来后不会改变先前模块的chunkHash (有利于浏览器缓存)
        new webpack.optimize.CommonsChunkPlugin({
            name:'runtime'
        })
    )
}


module.exports = config;