import Vue from 'vue';
import VueRouter from 'vue-router';
import Store from 'store';

import Index from 'pages/Index.vue';
import Err404 from 'pages/404.vue';
import LogPage from 'pages/Log.vue';

import AuthRoutes from './modules/auth';
import PaymentRoutes from './modules/payment';
import WidgetRoutes from './modules/widget';
import AmoRoutes from './modules/amo';
import AccountRoutes from './modules/account';
import UserRoutes from './modules/user';
import NewsRoutes from './modules/news';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Index,
            name: 'index',
            meta: {
                name: 'Главная',
            },
        },
        {
            path: '/404',
            component: Err404,
            name: 'page404',
        },
        {
            path: '/log',
            component: LogPage,
            name: 'log',
        },

        // Миксины по сущностям
        ...AuthRoutes,
        ...PaymentRoutes,
        ...WidgetRoutes,
        ...AccountRoutes,
        ...UserRoutes,
        ...NewsRoutes,
        ...AmoRoutes,
    ],
});

router.beforeEach((to, from, next) => {
    if (!to.matched.length) {
        next({
            path: '/404',
        }); // всегда так или иначе нужно вызвать next()!
    }

    if (to.matched.some(record => !record.meta.withoutAuth)) {
        // этот путь требует авторизации, проверяем залогинен ли
        // пользователь, и если нет, перенаправляем на страницу логина
        if (!Store.getters.isLoggedIn) {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath,
                },
            });
        } else {
            next();
        }
    } else {
        next(); // всегда так или иначе нужно вызвать next()!
    }
});

export default router;
