import { Order } from '@/vars/OderAttr';

export type BaseParams = {
    page: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: Order;
};
