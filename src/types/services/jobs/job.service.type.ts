export enum jobTypes {
    cleanUp,
    formulaCapture,
    print
}

export interface IJobService<T> {
    key?: string;

    getId(): T;
    getType(): jobTypes;
    getAddress(): string;
    run(context: Excel.RequestContext): Promise<boolean>;
}