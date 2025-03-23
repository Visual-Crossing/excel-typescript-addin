import { Service } from 'typedi';
import { IFieldService } from '../../types/services/field.service.type';
import { FieldService } from './field.service';
import { CacheItem } from '../../types/cache-item.type';

@Service({ global: true })
export class DescriptionFieldService extends FieldService<string> implements IFieldService {
    public getTitle(): string {
        return 'Description';
    }

    public getValue(cacheItem: CacheItem): string | null {
        return super.getFieldValueByName('description', cacheItem);
    }
}