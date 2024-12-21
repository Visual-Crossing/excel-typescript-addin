import { Container } from 'typedi';
import { ICache } from 'src/types/cache/cache.type';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { PrecipitationFieldService } from './fields/precipitation.field.service';

export function registerServices() {
    Container.set<ICache>({ value: new BrowserSessionCacheService() });

    // or for named services
    
    Container.set([
      { id: 'precip', value: new PrecipitationFieldService() },
    ]);
}

export function hasService(id: string): boolean {
  return Container.has(id);
}

export function getService<T>(id: string): T {
    return Container.get<T>(id);
}