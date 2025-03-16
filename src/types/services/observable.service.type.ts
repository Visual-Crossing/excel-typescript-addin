export interface IObservableService<T> {
    onValidate: ((observer: T) => boolean);
    onUpdate: ((observer: T) => void);

    getCount(): number;
    isSubscribed(groupId: string, observerKey: CustomFunctions.Invocation): boolean;
    subscribe(groupId: string, observerKey: CustomFunctions.Invocation, observer: T): void;
    update(groupId: string, getKey: (observer: T) => CustomFunctions.Invocation): void;
}