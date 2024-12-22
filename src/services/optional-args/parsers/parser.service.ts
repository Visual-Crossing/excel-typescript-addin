export abstract class OptionalArgParserService {
    public getErrorMessage(value: string): string {
        return `#Invalid parameter: '${value}'!`;
    }
}