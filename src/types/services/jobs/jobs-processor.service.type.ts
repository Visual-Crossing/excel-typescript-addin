import { IJobService } from "./job.service.type";

export interface IJobsProcessorService {
    add(job: IJobService): void;
    process(): Promise<void>;
}