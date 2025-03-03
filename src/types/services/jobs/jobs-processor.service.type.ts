import { IJobService } from "./job.service.type";

export interface IJobsProcessorService<T> {
    add(job: IJobService<T>): void;
    process(): Promise<void>;
}