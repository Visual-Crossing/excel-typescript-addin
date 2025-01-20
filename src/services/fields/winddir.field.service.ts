import { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { FieldService } from "./field.service";
import { ApiResponse } from "../../types/response/api-response.type";

@Service({ global: true })
export class WindDirFieldService extends FieldService<number> implements IField {
    public getTitle(): string {
        return 'Wind Direction';
    }

    public getValue(apiResponse: ApiResponse): number | null {
        return super.getFieldValueByName('winddir', apiResponse);
    }
}