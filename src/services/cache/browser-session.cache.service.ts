import { ICacheService } from 'src/types/cache/cache.service.type';
import { Service } from 'typedi';


@Service()
export class BrowserSessionCacheService implements ICacheService {
  public generateId(keys: string[]): string {
    if (!keys || keys.length !== 3) {
      throw new Error('Invalid cache keys.');
    }

    return `${keys[0].toLowerCase()}_${keys[1].toLowerCase()}_${keys[2].toLowerCase()}`;
  }

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
