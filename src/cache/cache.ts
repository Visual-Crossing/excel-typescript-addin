export function generateCacheId(location: string, date: string, unit: string): string {
    return `${location.toLowerCase()}_${date.toLowerCase()}_${unit.toLowerCase()}`;
}

export function cacheItemExists(cacheId: string): boolean {
    const cacheItem: string | null = window.sessionStorage.getItem(cacheId);
    
    if (cacheItem) {
        return true;
    }

    return false;
}

export function getCacheItem(cacheId: string): string | null {
    return window.sessionStorage.getItem(cacheId);
}

export function setCacheItem(cacheId: string, value: string): void {
    return window.sessionStorage.setItem(cacheId, value);
}

export function removeCacheItem(cacheId: string): void {
    window.sessionStorage.removeItem(cacheId);
}