import { Queue } from "queue-typescript";
import { IJobService } from "../../types/services/jobs/job.service.type";
import { IJobsProcessorService } from "../../types/services/jobs/jobs-processor.service.type";

const RETRY_MS: number = 250;

export class JobsProcessorService<T> implements IJobsProcessorService<T> {
    private jobs: Queue<IJobService<T>> | null = null;
    private isJobsProcessingInProgress: boolean = false;

    public add(job: IJobService<T>): void {
        if (!job) {
            return;
        }

        if (!this.jobs) {
            this.jobs = new Queue<IJobService<T>>();
        }

        this.jobs.enqueue(job);
    }

    private retry(): void {
        const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
    }

    public async process(): Promise<void> {
        if (this.jobs && this.jobs.length > 0 && !this.isJobsProcessingInProgress) {
            try {
                Excel.run(async (context: Excel.RequestContext) => {
                    try {
                        this.isJobsProcessingInProgress = true;

                        while (this.jobs && this.jobs.length > 0) {
                            const job: IJobService<T> = this.jobs.front;

                            if (job) {
                                if (await job.run(context)) {
                                    this.jobs.dequeue();
                                }
                                else {
                                    this.retry();
                                    return;
                                }
                            } else {
                                this.jobs.dequeue();
                            }
                        }

                        this.jobs = null;
                    }
                    catch {
                        if (this.jobs && this.jobs.length > 0) {
                            this.retry();
                            return;
                        }
                    }
                    finally {
                        this.isJobsProcessingInProgress = false;
                    }
                });
            }
            catch {
                this.isJobsProcessingInProgress = false;

                if (this.jobs && this.jobs.length > 0) {
                    this.retry();
                    return;
                }
            }
        }
    }
}