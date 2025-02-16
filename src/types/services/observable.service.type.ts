export interface IObservableService<T> {
    onValidate: ((observer: T) => boolean);
    onUpdate: ((observer: T) => void);

    isObserved(groupId: string, observerKey: CustomFunctions.Invocation): boolean;
    subscribe(groupId: string, observerKey: CustomFunctions.Invocation, observer: T): void;
    update(groupId: string, getKey: (observer: T) => CustomFunctions.Invocation): void;
}