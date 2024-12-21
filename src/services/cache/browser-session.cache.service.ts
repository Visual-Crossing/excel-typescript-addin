import { Service } from 'typedi';
import { ICache } from 'src/types/cache/cache.type';

@Service({ global: true })
export class BrowserSessionCacheService implements ICache {
  public has(id: string): boolean {
    const cacheItem: string | null = window.sessionStorage.getItem(id);
    
    if (cacheItem) {
        return true;
    }

    return false;
  }

  public get(id: string): string | null {
    return window.sessionStorage.getItem(id);
  }

  public set(id: string, value: string): void {
    window.sessionStorage.setItem(id, value);
  }

  public remove(id: string): void {
    window.sessionStorage.removeItem(id);
  }
}
