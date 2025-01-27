import { IObservableService } from "../../types/services/observable.service.type";
import { DistinctQueue } from "../../types/queues/distinct.queue.type";

export abstract class ObservableService<T> implements IObservableService<T> {
    private observers: Map<string, DistinctQueue<CustomFunctions.Invocation, T>> | null = null;

    public onValidate: ((observer: T) => boolean);
    public onUpdate: ((observer: T) => void);

    public subscribe(groupId: string, observerKey: CustomFunctions.Invocation, observer: T): void {
        if (!groupId ||
            !observerKey) {
            throw new Error();
        }

        if (!observer) {
            return;
        }

        if (!this.observers) {
            this.observers = new Map<string, DistinctQueue<CustomFunctions.Invocation, T>>();
        }

        if (!this.observers.has(groupId)) {
            this.observers.set(groupId, new DistinctQueue<CustomFunctions.Invocation, T>());
        }
    
        const observers: DistinctQueue<CustomFunctions.Invocation, T> = this.observers.get(groupId)!;
    
        if (!observers) {
            throw new Error("Invalid internal state.");
        }
    
        observers.enqueue(observerKey, observer);
        this.observers.set(groupId, observers);
    }

    public update(groupId: string, getKey: (observer: T) => CustomFunctions.Invocation): void {
        if (!groupId) {
            throw new Error("Invalid id.");
        }

        if (!this.onValidate ||
            !this.onUpdate) {
            throw new Error("Invalid internal state.");
        }
        
        if (!this.observers || !this.observers.has(groupId)) {
            return;
        }

        const observers = this.observers.get(groupId);

        while (observers && observers.getLength() > 0) {
            const observer = observers.getFront();

            if (observer) {
                if (this.onValidate(observer)) {
                    this.onUpdate(observer);
                }
                
                observers.dequeue(getKey(observer));
            }
        }

        this.observers.delete(groupId);

        if (this.observers.size === 0) {
            this.observers = null;
        }
    }
}