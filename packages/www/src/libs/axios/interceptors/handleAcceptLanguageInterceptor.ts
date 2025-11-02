import i18n from '@/i18n';
import type { InternalAxiosRequestConfig } from 'axios';

export async function handleAcceptLanguageInterceptor(
    response: InternalAxiosRequestConfig,
) {
    if (
        response.headers &&
        response?.headers['Accept-Language'] !== i18n.global.locale.value
    ) {
        response.headers['Accept-Language'] = i18n.global.locale.value;
    }
    return response;
}

export default handleAcceptLanguageInterceptor;
