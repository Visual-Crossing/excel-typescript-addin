export interface IRequestService<T> {
    fetchData(observer: T): Promise<string | void>;
    onSuccessResponse(observer: T, response: Response): Promise<string | void>;
}