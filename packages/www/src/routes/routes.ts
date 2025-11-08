import EmptyLayout from '@/components/layout/EmptyLayout.vue';
import { RouteName } from '@/vars/RouteAttr';
import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: RouteName.HOME,
        component: () => import('@/views/home/Home.vue'),
        meta: {
            layout: EmptyLayout,
        },
    },
    {
        path: '/:pathMatch(.*)*',
        name: RouteName.NOT_FOUND,
        component: () => import('@/views/NotFound.vue'),
        meta: {
            layout: EmptyLayout,
        },
    },
];
