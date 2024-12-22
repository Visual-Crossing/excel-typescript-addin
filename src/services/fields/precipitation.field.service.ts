import { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { FieldService } from "./field.service";

@Service({ global: true })
export class PrecipitationFieldService extends FieldService<number> implements IField<number> {
    public getTitle(): string {
        return 'Precipitation';
    }

    public getValue(jsonData: any): number {
        return super.getValue(jsonData, '');
    }
}