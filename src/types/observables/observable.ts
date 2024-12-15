import { DistinctQueue } from "../distinct-queue";

export class Observable<T> {
    private observers: Map<string, DistinctQueue<string, T>> | null = null;

    public onValidate: ((observer: T) => boolean) | undefined;
    public onUpdate: ((observer: T) => void) | undefined;

    public subscribe(groupId: string, observerId: string, observer: T): void {
        if (!groupId ||
            !observerId) {
            throw new Error("Invalid id.");
        }

        if (!observer) {
            return;
        }

        if (!this.observers) {
            this.observers = new Map<string, DistinctQueue<string, T>>();
        }

        if (!this.observers.has(groupId)) {
            this.observers.set(groupId, new DistinctQueue<string, T>());
        }
    
        const observers: DistinctQueue<string, T> = this.observers.get(groupId)!;
    
        if (!observers) {
            throw new Error("Invalid internal state.");
        }
    
        observers.enqueue(observerId, observer);
    }

    public update(groupId: string): void {
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
                
                observers.remove(observer);
            }
        }

        this.observers.delete(groupId);

        if (this.observers.size === 0) {
            this.observers = null;
        }
    }
}