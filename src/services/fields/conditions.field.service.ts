import { Service } from 'typedi';
import { IFieldService } from '../../types/services/field.service.type';
import { FieldService } from './field.service';
import { CacheItem } from '../../types/cache-item.type';

@Service({ global: true })
export class ConditionsFieldService extends FieldService<string> implements IFieldService {
    public getTitle(): string {
        return 'Conditions';
    }

    public getValue(cacheItem: CacheItem): string | null {
        return super.getFieldValueByName('conditions', cacheItem);
    }
}