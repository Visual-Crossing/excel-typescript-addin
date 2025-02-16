import { IJobService } from "./job.service.type";
import { IPrintJobService } from "./print.job.service.type";

export interface IJobsProcessorService<T> {
    add(job: IJobService<T>): void;
    exists(id: T): boolean;
    process(): Promise<void>;
}