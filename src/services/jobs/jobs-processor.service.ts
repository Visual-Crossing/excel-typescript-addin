import { Service } from 'typedi';
import { Queue } from 'queue-typescript';
import { IJobService } from '../../types/services/jobs/job.service.type';
import { IJobsProcessorService } from '../../types/services/jobs/jobs-processor.service.type';

const RETRY_MS: number = 250;

@Service()
export class JobsProcessorService<T> implements IJobsProcessorService<T> {
    private Jobs: Queue<IJobService<T>> | null = null;
    private IsJobsProcessingInProgress: boolean = false;

    public add(job: IJobService<T>): void {
        if (!job) {
            return;
        }

        if (!this.Jobs) {
            this.Jobs = new Queue<IJobService<T>>();
        }

        this.Jobs.enqueue(job);
    }

    public getCount(): number {
        return this.Jobs !== null ? this.Jobs.length : 0;
    }

    private retry(): void {
        if (this.Jobs && this.Jobs.length > 0) {
            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
        }
    }

    public async process(): Promise<void> {
        if (this.Jobs && this.Jobs.length > 0 && !this.IsJobsProcessingInProgress) {
            try {
                this.IsJobsProcessingInProgress = true;

                await Excel.run(async (context: Excel.RequestContext) => {
                    try {
                        while (this.Jobs && this.Jobs.length > 0) {
                            const job: IJobService<T> = this.Jobs.front;

                            if (job) {
                                if (await job.run(context)) {
                                    this.Jobs.dequeue();
                                }
                                else {
                                    this.retry();
                                    return;
                                }
                            } else {
                                this.Jobs.dequeue();
                            }
                        }

                        this.Jobs = null;
                    }
                    catch {
                        this.retry();
                        return;
                    }
                    finally {
                        this.IsJobsProcessingInProgress = false;
                    }
                });
            }
            catch {
                this.retry();
                return;
            }
            finally {
                this.IsJobsProcessingInProgress = false;
            }
        }
    }
}