export interface IJob {
    getId(): string;
    getAddress(): string;
    run(context: Excel.RequestContext): Promise<boolean>;
}