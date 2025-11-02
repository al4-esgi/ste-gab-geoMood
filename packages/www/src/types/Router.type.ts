import { RouteLocation, Router } from 'vue-router';

export type RouteMiddleware = (
    context: RouteContext,
) => Promise<string | false | void> | string | false | void;

export interface RouteContext {
    next: RouteNext;
    from: RouteLocation;
    router: Router;
    to: RouteLocation;
}

export type RouteNext = (...args: unknown[]) => void;
