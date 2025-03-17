import { IJobService } from './job.service.type';

export interface IPrintJobService<T, U> extends IJobService<U> {
    Result: T;

    create(): IPrintJobService<T, U>;
}