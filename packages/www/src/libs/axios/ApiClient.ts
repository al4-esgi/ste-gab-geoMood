import i18n from '@/i18n';
import axios, { type RawAxiosRequestHeaders } from 'axios';
import handleAcceptLanguageInterceptor from '@/libs/axios/interceptors/handleAcceptLanguageInterceptor';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => {
    const headers: RawAxiosRequestHeaders = {
        'Accept-Language': i18n.global.locale.value,
    };

    return headers;
};

const Http = axios.create({
    headers: getHeaders(),
    baseURL: BASE_URL,
});

Http.interceptors.request.use(handleAcceptLanguageInterceptor);

export default Http;
