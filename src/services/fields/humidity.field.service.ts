import { Service } from "typedi";
import { IFieldService } from "../../types/services/field.service.type";
import { FieldService } from "./field.service";
import { CacheItem } from "../../types/cache-item.type";

@Service({ global: true })
export class HumidityFieldService extends FieldService<number> implements IFieldService {
    public getTitle(): string {
        return 'Humidity';
    }

    public getValue(cacheItem: CacheItem): number | null {
        return super.getFieldValueByName('humidity', cacheItem);
    }
}