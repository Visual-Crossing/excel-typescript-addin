export interface IJobService {
    getId(): string;
    getAddress(): string;
    run(context: Excel.RequestContext): Promise<boolean>;
}