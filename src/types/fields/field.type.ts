export interface IField<T> {
    getTitle(): string;
    getValue(jsonData: any): T;
}