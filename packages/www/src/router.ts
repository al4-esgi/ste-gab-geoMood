import { createRouter, createWebHistory, Router } from 'vue-router';
import i18n from '@/i18n';
import { defaultLocale } from '@/i18n';
import { Language } from '@/vars/LanguageAttr';
import { RouteContext, RouteMiddleware } from './types/Router.type';
import { routes } from './routes/routes';

export const initRouter = async () => {
    const router = createRouter({
        history: createWebHistory(),
        routes,
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }
            return { top: 0, behavior: 'smooth' };
        },
    });

    function nextFactory(
        context: RouteContext,
        middleware: RouteMiddleware[],
        nextIndex: number,
    ) {
        const subsequentMiddleware = middleware[nextIndex];

        if (!subsequentMiddleware) {
            return context.next;
        }

        return async () => {
            const nextMiddleware = nextFactory(
                context,
                middleware,
                nextIndex + 1,
            );
            await subsequentMiddleware({ ...context, next: nextMiddleware });
        };
    }

    router.beforeEach(async (to, from, next) => {
        let middleware: RouteMiddleware[] = [];

        if (to.meta.middleware) {
            const routeMiddlewares = Array.isArray(to.meta.middleware)
                ? to.meta.middleware
                : [to.meta.middleware];
            middleware = middleware.concat(routeMiddlewares);
        }

        if (to.meta.forceLang) {
            i18n.global.locale.value = to.meta.forceLang as Language;
        } else {
            i18n.global.locale.value = defaultLocale();
        }

        document.title = (to.meta.title as string) || 'GeoMood';

        const context = {
            from,
            next,
            router,
            to,
        };
        const nextMiddleware = nextFactory(context, middleware, 1);

        return middleware.length ? await middleware[0]({ ...context, next: nextMiddleware }) : next();
    });

    return router;
};
