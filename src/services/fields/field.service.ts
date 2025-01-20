import { ApiResponse } from "../../types/response/api-response.type";

export abstract class FieldService<T> {
    public getFieldValueByName(fieldName: string, apiResponse: ApiResponse): T | null {
        if (!apiResponse || !apiResponse.values) {
            return null;
        }

        const keys = Object.keys(apiResponse.values);

        if (!keys || !keys.includes(fieldName)) {
            return null;
        }

        return apiResponse.values[fieldName];
    }
}