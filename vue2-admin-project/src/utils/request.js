import axios from 'axios'
import { Message } from 'element-ui'

// 自动根据环境切换接口地址
const getBaseURL = () => {
    // 本地开发环境（连本地后端）
    if (process.env.NODE_ENV === 'development') {
        return 'http://47.238.253.222:3001'
    }
    // 测试环境（连你的服务器）
    if (process.env.VUE_APP_ENV === 'test') {
        return 'http://47.238.253.222:3001'
    }
    // 生产环境
    return 'http://47.238.253.222:3001'
}

// 创建 axios 实例
const service = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    // 新增：设置请求头默认格式
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器：添加token认证
service.interceptors.request.use(
    config => {
        // 从本地存储获取token并添加到请求头
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.token = token // ✅ 关键修复：和后端对应
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code !== 200) {
            Message.error(res.msg || '请求失败')
            return Promise.reject(res)
        }
        return res
    },
    error => {
        let errorMsg = '请求失败'
        if (error.response) {
            const status = error.response.status
            const data = error.response.data || {} // ✅ 修复

            switch (status) {
                case 401:
                    errorMsg = '登录已过期，请重新登录'
                    localStorage.removeItem('token')
                    localStorage.removeItem('username')
                    window.location.href = '/login'
                    break
                case 403:
                    errorMsg = '没有权限访问该资源'
                    break
                case 404:
                    errorMsg = '请求的资源不存在'
                    break
                case 500:
                    errorMsg = '服务器内部错误'
                    break
                default:
                    errorMsg = data.msg || data.message || '请求错误 ' + status // ✅ 修复
            }
        } else if (error.request) {
            errorMsg = '服务器已连接，但未返回响应，请检查接口/参数'
        }
        Message.error(errorMsg)
        return Promise.reject(error)
    }
)

export default service