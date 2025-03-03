import { Queue } from "queue-typescript";
import { IJobService, jobTypes } from "../../types/services/jobs/job.service.type";
import { IJobsProcessorService } from "../../types/services/jobs/jobs-processor.service.type";

const RETRY_MS: number = 250;

export class JobsProcessorService<T> implements IJobsProcessorService<T> {
    private jobs: Queue<IJobService<T>> | null = null;
    private isJobsProcessingInProgress: boolean = false;

    // private activePrintJobs: Map<string, string | number | Date | null> | null = null;

    public add(job: IJobService<T>): void {
        if (!job) {
            return;
        }

        if (!this.jobs) {
            this.jobs = new Queue<IJobService<T>>();
        }
    
        // if (job.getType() === jobTypes.cleanUp) {
        //     this.jobs.prepend(job);
        // } else {
            this.jobs.enqueue(job);
        // }
    }

    // public removePrintJob(id: string): void {
    //     if (!id) {
    //         return;
    //     }

    //     if (this.activePrintJobs === null) {
    //         return;
    //     }

    //     if (!this.activePrintJobs.has(id)) {
    //         return;
    //     }

    //     this.activePrintJobs.delete(id);

    //     if (this.activePrintJobs.size === 0) {
    //         this.activePrintJobs = null;
    //     }
    // }

    // public printJobExists(id: string): boolean {
    //     if (!id) {
    //         return false;
    //     }

    //     if (this.activePrintJobs === null) {
    //         return false;
    //     }

    //     return this.activePrintJobs.has(id);
    // }

    public async process(): Promise<void> {
        if (this.jobs && this.jobs.length > 0 && !this.isJobsProcessingInProgress) {
            try {
                this.isJobsProcessingInProgress = true;

                return await Excel.run(async (context: Excel.RequestContext) => {
                    try {
                        while (this.jobs && this.jobs.length > 0) {
                            const job: IJobService<T> = this.jobs.front;

                            if (job) {
                                // if (job .getType() === jobTypes.print) {
                                //     if (this.activePrintJobs == null) {
                                //         this.activePrintJobs = new Map<string, string | number | Date>();
                                //     }

                                //     this.activePrintJobs.set(`${job.key}_${job.getAddress()}`, null);
                                // }

                                if (await job.run(context)) {
                                    this.jobs.dequeue();
                                }
                                else {
                                    const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
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
                            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
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
                    const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); this.process(); }, RETRY_MS);
                    return;
                }
            }
            finally {
                this.isJobsProcessingInProgress = false;
            }
        }
    }
}