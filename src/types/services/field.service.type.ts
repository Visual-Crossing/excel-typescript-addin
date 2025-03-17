import { CacheItem } from '../cache-item.type';

export interface IFieldService {
    getTitle(): string;
    getValue(cacheItem: CacheItem): string | number | Date | null;
}