import { Queue } from "queue-typescript";
import { IJobService } from "../../types/jobs/job.service.type";
import { IJobsProcessorService } from "../../types/jobs/jobs-processor.service.type";

const RETRY_MS: number = 250;

export class JobsProcessorService implements IJobsProcessorService {
    private jobs: Queue<IJobService> | null = null;
    private isJobsProcessingInProgress: boolean = false;

    public add(job: IJobService): void {
        if (!job) {
            return;
        }

        if (!this.jobs) {
            this.jobs = new Queue<IJobService>();
        }
    
        this.jobs.enqueue(job);
    }

    public async process(): Promise<void> {
        if (this.jobs && this.jobs.length > 0 && !this.isJobsProcessingInProgress) {
            try {
                this.isJobsProcessingInProgress = true;

                return await Excel.run(async (context: Excel.RequestContext) => {
                    try {
                        while (this.jobs && this.jobs.length > 0) {
                            const job: IJobService = this.jobs.front;

                            if (await job.run(context)) {
                                this.jobs.dequeue();
                            }
                            else {
                                const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await this.process(); }, RETRY_MS);
                                return;
                            }
                        }

                        this.jobs = null;
                    }
                    catch {
                        if (this.jobs && this.jobs.length > 0) {
                            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await this.process(); }, RETRY_MS);
                            return;
                        }
                    }
                    finally {
                        this.isJobsProcessingInProgress = false;
                    }
                });
            }
            catch {
                if (this.jobs && this.jobs.length > 0) {
                    const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await this.process(); }, RETRY_MS);
                    return;
                }
            }
            finally {
                this.isJobsProcessingInProgress = false;
            }
        }
    }
}