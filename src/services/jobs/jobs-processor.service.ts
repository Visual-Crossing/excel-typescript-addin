import { Service } from 'typedi';
import { Queue } from 'queue-typescript';
import { IJobService } from '../../types/services/jobs/job.service.type';
import { IJobsProcessorService } from '../../types/services/jobs/jobs-processor.service.type';

const RETRY_MS: number = 250;

@Service()
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

    public getCount(): number {
        return this.jobs !== null ? this.jobs.length : 0;
    }

    private retry(): void {
        if (this.jobs && this.jobs.length > 0) {
            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
        }
    }

    public async process(): Promise<void> {
        if (this.jobs && this.jobs.length > 0 && !this.isJobsProcessingInProgress) {
            try {
                this.isJobsProcessingInProgress = true;

                await Excel.run(async (context: Excel.RequestContext) => {
                    try {
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
                        this.retry();
                        return;
                    }
                    finally {
                        this.isJobsProcessingInProgress = false;
                    }
                });
            }
            catch {
                this.retry();
                return;
            }
            finally {
                this.isJobsProcessingInProgress = false;
            }
        }
    }
}