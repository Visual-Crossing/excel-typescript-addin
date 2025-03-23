export interface IErrorParserService {
    getErrorInfo(error: any) : string | CustomFunctions.Error;
}