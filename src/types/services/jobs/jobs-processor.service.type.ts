import { IJobService } from './job.service.type';

export interface IJobsProcessorService<T> {
    add(job: IJobService<T>): void;
    getCount(): number;
    process(): Promise<void>;
}