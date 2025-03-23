export interface IRequestService<T> {
    fetchData(observer: T): Promise<string | void | CustomFunctions.Error>;
    onSuccessResponse(observer: T, response: Response): Promise<string | void | CustomFunctions.Error>;
}