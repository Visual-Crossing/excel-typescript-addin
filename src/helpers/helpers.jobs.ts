import { IJob } from "../types/job";
import { Queue } from "queue-typescript";

var jobs: Queue<IJob> | null = null;
var isJobsProcessingInProgress: boolean = false;

export async function processJobs(): Promise<void> {
    if (jobs && jobs.length > 0 && !isJobsProcessingInProgress) {
        try {
            isJobsProcessingInProgress = true;

            return await Excel.run(async (context: Excel.RequestContext) => {
                try {
                    while (jobs && jobs.length > 0) {
                        const job: IJob = jobs.front;

                        if (await job.run(context)) {
                            jobs.dequeue();
                        }
                        else {
                            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
                            return;
                        }
                    }

                    jobs = null;
                }
                catch {
                    if (jobs && jobs.length > 0) {
                        const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
                        return;
                    }
                }
                finally {
                    isJobsProcessingInProgress = false;
                }
            });
        }
        catch {
            if (jobs && jobs.length > 0) {
                const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
                return;
            }
        }
        finally {
            isJobsProcessingInProgress = false;
        }
    }
}

export function addJob(job: IJob) : void {
    if (!jobs) {
        jobs = new Queue<IJob>();
    }

    jobs.enqueue(job);
}