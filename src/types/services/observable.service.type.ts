export interface IObservableService<T> {
    onValidate: ((observer: T) => boolean);
    onUpdate: ((observer: T) => void);

    getCount(): number;
    observe(observer: T): string | number | Date;
    subscribe(groupId: string, observerKey: CustomFunctions.Invocation, observer: T): void;
    update(groupId: string, getKey: (observer: T) => CustomFunctions.Invocation): void;
}