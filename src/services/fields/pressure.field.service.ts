import { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { FieldService } from "./field.service";
import { ApiResponse } from "../../types/response/api-response.type";

@Service({ global: true })
export class PressureFieldService extends FieldService<number> implements IField {
    public getTitle(): string {
        return 'Pressure';
    }

    public getValue(apiResponse: ApiResponse): number | null {
        return super.getFieldValueByName('pressure', apiResponse);
    }
}