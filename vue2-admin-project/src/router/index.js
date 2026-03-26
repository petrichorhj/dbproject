import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout/Layout'
import Login from "@/views/Login";
import UserList from '@/components/UserList'
import SystemSetting from '@/components/SystemSetting'
import DataChart from '@/components/DataChart'
import Doubao from "@/views/Doubao";
import PdfKeywordRecognition from "@/views/PdfKeyword"; // 引入 PDF 关键字页面
import MStand from '@/views/MStand'
import Wallet from '@/views/Wallet'
import OrderRecord from '@/views/OrderRecord'
import NoteList from '@/views/NoteList'


Vue.use(Router)
    // 解决 NavigationDuplicated 重复导航问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => {
        // 如果是重复导航错误，就忽略它
        if (err.name !== 'NavigationDuplicated') throw err
    })
}
const router = new Router({
    routes: [
        // 登录页
        {
            path: "/login",
            name: "Login",
            component: Login,
            meta: { requiresAuth: false }, // 不需要登录
        }, {
            path: '/',
            component: Layout,
            meta: { requiresAuth: true }, // 需要登录
            children: [
                { path: '', redirect: '/login' },
                { path: 'user', name: 'UserList', component: UserList },
                { path: 'setting', name: 'SystemSetting', component: SystemSetting },
                { path: 'chart', name: 'DataChart', component: DataChart },
                { path: "doubao", name: "Doubao", component: Doubao },
                { path: "pdf-keyword", name: "PdfKeywordRecognition", component: PdfKeywordRecognition }, // 新增路由
                { path: 'mstand', name: 'MStand', component: MStand },
                { path: 'wallet', name: 'Wallet', component: Wallet },
                { path: '/order-record', name: 'OrderRecord', component: OrderRecord },
                { path: 'note', name: 'NoteList', component: NoteList }
            ]
        }
    ]
})


// 路由守卫：未登录拦截
router.beforeEach((to, from, next) => {
    // 判断是否需要登录
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem("token");
        if (token) {
            // 已登录，放行
            next();
        } else {
            // 未登录，跳登录页
            next({ path: "/login" });
            Vue.prototype.$message.warning("请先登录！");
        }
    } else {
        // 不需要登录，放行
        next();
    }
});

export default router;