import { IJobService } from "./job.service.type";

export interface IJobsProcessorService<T> {
    add(job: IJobService<T>): void;
    removePrintJob(id: string): void;
    printJobExists(id: string): boolean;
    process(): Promise<void>;
}