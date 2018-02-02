/**
 * postcss.config.js主要用来配置css相关的内容
 * 在vue-cli里面默认有三个插件postcss-import postcss-url autoprefixer（我这里只弄了一个）
 * 在这个文件里我们还可以配置移动端适配相关的东西，通过引入一些插件可以自动化为我们处理屏幕适配
 * 问题，具体内容我就不在这里展开
 * 相关文章可以看看这篇：https://www.w3cplus.com/mobile/vw-layout-in-vue.html
 */
const autoprefixer = require('autoprefixer');
//autoprefixer插件是用来自动处理浏览器css前缀(-webkit-)的一个插件
module.exports = {
    plugins:[
        autoprefixer()
    ]
}