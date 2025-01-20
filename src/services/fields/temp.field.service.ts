import { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { FieldService } from "./field.service";
import { ApiResponse } from "../../types/response/api-response.type";

@Service({ global: true })
export class TemperatureFieldService extends FieldService<number> implements IField {
    public getTitle(): string {
        return 'Temperature';
    }

    public getValue(apiResponse: ApiResponse): number | null {
        return super.getFieldValueByName('temp', apiResponse);
    }
}