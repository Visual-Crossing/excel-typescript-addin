import { IJobService } from './job.service.type';

export interface ICleanUpJobService<T, U> extends IJobService<U> {
    Observer: T;

    create(): ICleanUpJobService<T, U>;
}