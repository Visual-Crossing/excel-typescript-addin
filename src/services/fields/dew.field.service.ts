import { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { FieldService } from "./field.service";
import { ApiResponse } from "../../types/response/api-response.type";

@Service({ global: true })
export class DewFieldService extends FieldService<number> implements IField {
    public getTitle(): string {
        return 'Dew';
    }

    public getValue(apiResponse: ApiResponse): number | null {
        return super.getFieldValueByName('dew', apiResponse);
    }
}