import { IObservableService } from '../../types/services/observable.service.type';
import { DistinctQueue } from '../../types/queues/distinct.queue.type';

export abstract class ObservableService<T> implements IObservableService<T> {
    private Observers: Map<string, DistinctQueue<CustomFunctions.Invocation, T>> | null = null;

    public onValidate: ((observer: T) => boolean);
    public onUpdate: ((observer: T) => void);

    public getCount(): number {
        return this.Observers !== null ? this.Observers.size : 0;
    }

    public abstract observe(observer: T): string | number | Date;

    private isSubscribed(groupId: string, observerKey: CustomFunctions.Invocation): boolean {
        if (!groupId ||
            !observerKey) {
            throw new Error();
        }

        if (!this.Observers || !this.Observers.has(groupId)) {
            return false;
        }

        const observers: DistinctQueue<CustomFunctions.Invocation, T> = this.Observers.get(groupId)!;

        if (!observers) {
            throw new Error("Invalid internal state.");
        }

        return observers.hasKey(observerKey);
    }

    public subscribe(groupId: string, observerKey: CustomFunctions.Invocation, observer: T): void {
        if (this.isSubscribed(groupId, observerKey)) {
            return;
        }

        if (!observer) {
            return;
        }

        if (!this.Observers) {
            this.Observers = new Map<string, DistinctQueue<CustomFunctions.Invocation, T>>();
        }

        if (!this.Observers.has(groupId)) {
            this.Observers.set(groupId, new DistinctQueue<CustomFunctions.Invocation, T>());
        }
    
        const observers: DistinctQueue<CustomFunctions.Invocation, T> = this.Observers.get(groupId)!;
    
        if (!observers) {
            throw new Error("Invalid internal state.");
        }
    
        observers.enqueue(observerKey, observer);
        this.Observers.set(groupId, observers);
    }

    public update(groupId: string, getKey: (observer: T) => CustomFunctions.Invocation): void {
        if (!groupId) {
            throw new Error("Invalid group id.");
        }

        if (!this.onValidate ||
            !this.onUpdate) {
            throw new Error("Invalid internal state.");
        }
        
        if (!this.Observers || !this.Observers.has(groupId)) {
            return;
        }

        const observers = this.Observers.get(groupId);

        while (observers && observers.getLength() > 0) {
            const observer = observers.getFront();

            if (observer) {
                if (this.onValidate(observer)) {
                    this.onUpdate(observer);
                }
                
                observers.dequeue(getKey(observer));
            } else {
                throw new Error();
            }
        }

        this.Observers.delete(groupId);

        if (this.Observers.size === 0) {
            this.Observers = null;
        }
    }
}