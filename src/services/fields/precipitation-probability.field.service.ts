import { Service } from "typedi";
import { IFieldService } from "../../types/services/field.service.type";
import { FieldService } from "./field.service";
import { CacheItem } from "../../types/cache-item.type";

@Service({ global: true })
export class PrecipitationProbabilityFieldService extends FieldService<number> implements IFieldService {
    public getTitle(): string {
        return 'Precipitation Probability';
    }

    public getValue(cacheItem: CacheItem): number | null {
        return super.getFieldValueByName('precipprob', cacheItem);
    }
}