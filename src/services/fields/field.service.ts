export abstract class FieldService<T> {
    public getValue(jsonData: any, fieldName: string): T {
        throw new Error("Method not implemented.");
    }
}