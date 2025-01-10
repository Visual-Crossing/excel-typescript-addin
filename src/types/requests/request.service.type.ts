export interface IRequestService<T> {
    fetchData(observer: T): Promise<string>;
    onSuccessResponse(observer: T, response: Response): Promise<string>;
}