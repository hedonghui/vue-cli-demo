##从零搭建vue-cli

*原创不易，如需转载请联系作者并注明出处*\n
vue-cli的出现为vue工程化前端开发工作流提供了开箱即用的构建配置，减轻了烦人的webpack配置流程。但高度封装
的cli带来方便的同时，很多人却很少去关注轮子的内部结构，以至于当使用vue-cli需要手动配置一些东西（如编译less,scss,实现代码压缩，移动端适配等配置）的时候往往无从下手。废话不多说，下面我们来看看如何基于webpack模仿vue-cli实现vue项目工程化。

> 如果本demo对你学习和理解vue-cli有帮助，请给我个star~~谢谢
> 本demo github地址: [https://github.com/hedonghui/vue-cli-demo][1]

##目录
1.webpack初始化及webpack周边相关配置
2.静态资源加载及css与处理器
3.webpack-dev-server及开发模式相关配置
4.配置vue的jsx写法及postcss相关
5.css单独分离打包
6.代码分离及生产环境浏览器缓存相关

## 通过webpack搭建vue工程

首先我们来看看本文章demo完成后的整体packgage.json的包依赖结构：

![clipboard.png](/img/bV27UJ)

下面我们来对这里面的所有包作用进行大体分析：
(本demo将不同环境webpack相关配置写在同一个config.js，packgage.js里基本不区分dependencies devDependencies，有异与 vue-cli官方将不同环境配置分开不同文件的方式，,读者可以根据webpack官
方文档推荐的[webpack-merge工具][1]并参考vue-cli源码进行相关配置。**对于学习无伤大雅**)

### vue相关初始化
首先新建一个文件夹，打开命令行窗口进行 npm init 初始化

![clipboard.png](/img/bV271E)

先来看看安装的这几个包：

>1.webpack---------此处省略200字
>2.vue-----------Vue包
>3.css-loader--------------处理打包css文件
>4.vue-loader---------------处理打包.vue文件(依赖于css-loader, vue-template-compiler)
>5.vue-template-compiler ----------------处理vue模板<template>

###webpack.config.js相关配置

![clipboard.png](/img/bV276S)



目前我们装了vue相关的几个包，并在webpack.config.js里面配置了打包入口和出口相关的内容，接着我们去配置以下package.json下script脚本以启动我们的webpack打包

![clipboard.png](/img/bV2779)

细心的朋友应该已经发现了我们配置了build和dev两个选项来区分生产环境和开发环境。其实在vue-cli或者其他的webpack相关搭建的工程中，单纯的将html,css,js代码打包到一起远远不能满足我们的需求，因此，webpack为我们提供了丰富的插件和相关配置来实现**代码分割**、**类库代码与业务代码分开打包**、**模块热替换**、**babel转码**、**webpack-dev-server**、**css预处理**等相关功能。

**

下面我们逐一来看这这个东西的配置与实现
-------------------

**
## cross-env##
由于我们的webpack.config都写在同一个配置文件里面，在实现生产环境和开发环境中针对不同操作系统开发平台的不同，我们引入cross-env来实现同意管理，通过在webpack.config.js中判断是否为开发模式进行不同的配置


![clipboard.png](/img/bV28ch)

![clipboard.png](/img/bV28bp)

##webpack-dev-server 与热更新 (一个微服务)


![clipboard.png](/img/bV28cZ)

##babel以及postcss相关配置

babel是一个能将jsx以及es6等转码成javascript代码的转码工具，vue2后支持jsx写法，我们在webpack中也引入babel babel-loader等相关，使其能将vue中的jsx转码。babel相关配置在babelrc文件中，如下

![clipboard.png](/img/bV28gd)

在这个demo的babel配置中，我们只配置了两个基本项，可以对比下vue-cli中更多的相关配置

```
{
//这里是指明了转码规则env项是借助插件babel-preset-env，下面这个配置说的是babel对es6,es7,es8进行转
//码，并且设置amd,commonjs这样的模块化文件，不进行转码
  "presets": [
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }],
    "stage-2"
  ],
// 下面这个选项是引用插件来处理代码的转换，transform-runtime用来处理全局函数和优化babel编译
//transform-vue-jsx 顾名思义是 transform vue-jsx  to javascript
//至于下面test 是提前设置的环境变量，如果没有设置BABEL_ENV则使用NODE_ENV，如果都没有设置默认
//就是development,  instanbul是一个用来测试转码后代码的工具
  "plugins": ["transform-vue-jsx", "transform-runtime"],
  "env": {
    "test": {
      "presets": ["env", "stage-2"],
      "plugins": ["transform-vue-jsx", "transform-es2015-modules-commonjs", "dynamic-import-node"]
    }
  }
}
```

*看晕了没？单单一个babelrc配置文件就有那么多配置*

**不虚！**本demo只是配置了基本重要项能实现大部分功能(其实关键在于让你大体理解vue-cli这个轮子是怎么构建起来的)

> 我们继续往下看
##postcss.config.js

 * postcss.config.js主要用来配置css相关的内容
 * 在vue-cli里面默认有三个插件postcss-import postcss-url autoprefixer（我这里只弄了一个）
 * 在这个文件里我们还可以配置移动端适配相关的东西，通过引入一些插件可以自动化为我们处理屏幕适配
 * 问题，具体内容我就不在这里展开
 * 相关文章可以看看这篇：https://www.w3cplus.com/mobile/vw-layout-in-vue.html

![clipboard.png](/img/bV28mT)
##代码分离以及做浏览器缓存
   webpack是一个一切以js为中心的打包工具，但是在生产模式中将所有东西都打包到bundlejs里面不利于做浏览器
缓存,类库文件都是大牛们造给广大码农的轮子，其稳定性高、可靠，所以在生产环境中可以进行浏览器缓存，不必跟随着业务代码经常更新，减少网络请求资料的消耗，webpack官方为我们提供一个叫extract-text-webpack-plugin插件来分离css样式，同时vue-cli里面还对类库代码（如vue.js），webpack相关代码与我们的业务代码进行分离，这里起作用的是这两个东东：**new webpack.optimize.CommonsChunkPlugin()** &nbsp; &nbsp; 
**new webpack.optimize.CommonsChunkPlugin()**

我们来看一看本demo中production相关的配置:

![clipboard.png](/img/bV28sP)

![clipboard.png](/img/bV28ti)

> ##最后来总结一下

其实vue-cli总体上来说是为我们配置了
* 开发环境下的 webpack-dev-server及热更新babel、懒加载、样式打包等
* 生产环境下的分离打包，单独打包，根据chunkhash处理浏览器缓存,代码压缩等
* 当然在vue-cli中还有关于eslint相关的代码规范配置在本文中没有讲到(其实是不太会)

最后本demo还有关于懒加载以及代码压缩部分需要去完善，其实简单的代码压缩也就几行代码
下面附上webpack官方文档的小示例：



![clipboard.png](/img/bV28yc)


至于...懒加载..我再琢磨琢磨（逃


本demo源码在这里[  [1]: https://github.com/hedonghui/vue-cli-demo][1]
