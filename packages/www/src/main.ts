import { createApp } from 'vue';
import '@/libs/sass/_main.scss';
import App from '@/App.vue';
import i18n from '@/i18n';
import {
    VueQueryPlugin,
    type VueQueryPluginOptions,
} from '@tanstack/vue-query';
import { QueryOptions } from '@/vars/QueryAttr';
import { createPinia } from 'pinia';
import { vSafeHtml } from '@/libs/directives/safe-html';
import { initRouter } from '@/router';
import VueCookies from 'vue-cookies';
import PrimeVue from 'primevue/config';
import { Preset } from './prime-vue';
import 'primeicons/primeicons.css';
import './vee-validate';
import Vue3Toastify, { toast, type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const pinia = createPinia();

initRouter().then((router) => {
    const app = createApp(App);

    app.directive('safe-html', vSafeHtml);

    app.use(VueCookies);

    app.config.globalProperties.$cookies;

    app.use(PrimeVue, {
        theme: {
            preset: Preset,
            options: {
                darkModeSelector: false || 'none',
            },
        },
    });
    app.use(i18n);
    app.use(pinia);
    app.use(VueQueryPlugin, {
        queryClientConfig: {
            defaultOptions: {
                queries: QueryOptions,
            },
        },
    } as VueQueryPluginOptions);
    app.use(router);
    app.use(Vue3Toastify, {
        autoClose: 3000,
        position: toast.POSITION.TOP_CENTER,
        transition: toast.TRANSITIONS.SLIDE,
    } as ToastContainerOptions);

    app.mount('#app');
});
