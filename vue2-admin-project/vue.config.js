const path = require('path')

module.exports = {
    // 🌟 关键修改：区分生产/测试/开发环境的基础路径
    publicPath: process.env.NODE_ENV === 'production' ?
        (process.env.VUE_APP_ENV === 'test' ? '/admin/' : './') : '/',
    outputDir: 'dist',
    assetsDir: 'static',
    productionSourceMap: false,
    devServer: {
        port: 8080,
        open: true,
        host: '0.0.0.0',
        proxy: {
            // ✅ 保留火山引擎豆包 API 代理
            '/doubao-api': {
                target: 'https://ark.cn-beijing.volces.com',
                changeOrigin: true,
                pathRewrite: { '^/doubao-api': '' },
                secure: true,
                timeout: 30000
            },
            // 🌟 修改：开发环境代理指向服务器后端（而非本地3000）
            '/api': {
                target: 'http://47.238.253.222:3001', // 你的服务器IP+后端端口
                changeOrigin: true
            }
        },
        client: {
            overlay: false // 关闭错误遮罩，方便看真实报错

        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@components': path.resolve(__dirname, 'src/components'),
                '@views': path.resolve(__dirname, 'src/views'),
                '@assets': path.resolve(__dirname, 'src/assets')
            }
        },
        performance: {
            hints: 'warning',
            maxAssetSize: 5 * 1024 * 1024,
            maxEntrypointSize: 5 * 1024 * 1024
        }
    },
    css: {
        sourceMap: process.env.NODE_ENV !== 'production',
        loaderOptions: {
            scss: {
                additionalData: `@import "@/assets/styles/variables.scss";`
            }
        }
    },
    chainWebpack: config => {
        config.plugins.delete('prefetch')
        config.plugins.delete('preload')
        if (process.env.NODE_ENV === 'production') {
            config.optimization.minimize(true)
            config.optimization.splitChunks({
                chunks: 'all'
            })
        }
    }
}