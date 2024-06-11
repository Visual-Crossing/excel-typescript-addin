import { Queue } from "queue-typescript";

const INVALID_QUEUE_STATE_ERROR_MSG: string = "Invalid queue state.";

export class DistinctQueue<T> {
    private keys: Set<T> | null;
    private queue: Queue<T> | null;

    public constructor() {
        this.keys = new Set<T>();
        this.queue = new Queue<T>();
    }

    public getLength(): number {
        if (!this.keys && !this.queue) {
            return 0;
        }

        if (!this.keys || !this.queue) {
            throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
        }

        if (this.keys.size !== this.queue.length) {
            throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
        }

        return this.queue.length;
    }

    public getFront(): T | null {
        if (!this.queue) {
            return null;
        }

        return this.queue.front;
    }

    public enqueue(item: T): void{
        if (!this.keys) {
            this.keys = new Set<T>();
        }

        if (!this.keys.has(item)) {
            this.keys.add(item);

            if (!this.queue) {
                this.queue = new Queue<T>();
            }

            this.queue.enqueue(item);
        }
    }

    public dequeue(): T | null{
        if (!this.queue) {
            return null;
        }

        if (!this.keys) {
            throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
        }

        if (this.queue.length !== this.keys.size) {
            throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
        }

        if (this.queue.length === 0) {
            this.queue = null;
            this.keys = null;

            return null;
        }

        const item = this.queue.dequeue();
        this.keys.delete(item);

        if (this.queue.length !== this.keys.size) {
            throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
        }

        if (this.queue.length === 0) {
            this.queue = null;
            this.keys = null;
        }

        return item;
    }
}