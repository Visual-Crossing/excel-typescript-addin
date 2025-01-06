export interface IField {
    getTitle(): string;
    getValue(jsonData: object): string | number | Date;
}