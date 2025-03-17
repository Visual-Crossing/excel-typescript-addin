export enum JobTypes {
    cleanUp,
    macro,
    print
}

export interface IJobService<T> {
    key?: string;

    getId(): T;
    getType(): JobTypes;
    getAddress(): string;
    run(context: Excel.RequestContext): Promise<boolean>;
}