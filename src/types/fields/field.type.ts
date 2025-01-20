import { ApiResponse } from "../response/api-response.type";

export interface IField {
    getTitle(): string;
    getValue(apiResponse: ApiResponse): string | number | Date | null;
}