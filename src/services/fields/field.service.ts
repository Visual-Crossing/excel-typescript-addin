import { CacheItem } from "../../types/cache-item.type";

export abstract class FieldService<T> {
    public getFieldValueByName(fieldName: string, cacheItem: CacheItem): T | null {
        if (!cacheItem || !cacheItem.values) {
            return null;
        }

        const keys = Object.keys(cacheItem.values);

        if (!keys || !keys.includes(fieldName)) {
            return null;
        }

        return cacheItem.values[fieldName];
    }
}