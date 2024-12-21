import { Queue } from "queue-typescript";

const INVALID_KEY_ERROR_MSG: string = "Invalid key.";
const INVALID_QUEUE_STATE_ERROR_MSG: string = "Invalid queue state.";

export class DistinctQueue<T, U> {
    private keys: Set<T> | null = null;
    private queue: Queue<U> | null = null;

    public hasKey(key: T): boolean {
        if (!key) {
            throw new Error(INVALID_KEY_ERROR_MSG);
        }

        if (!this.keys) {
            return false;
        }

        return this.keys.has(key);
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

    public getFront(): U | null {
        if (!this.queue) {
            return null;
        }

        return this.queue.front;
    }

    public enqueue(key: T, item: U): void{
        if (!this.keys) {
            this.keys = new Set<T>();
        }

        if (!this.keys.has(key)) {
            this.keys.add(key);

            if (!this.queue) {
                this.queue = new Queue<U>();
            }

            this.queue.enqueue(item);
        }
    }

    public remove(item: U): void {
        if (!item) {
            return;
        }

        if (!this.queue) {
            return;
        }

        this.queue.remove(item);
    }

    public dequeue(key: T): U | null {
        try {
            if (!key) {
                throw new Error(INVALID_KEY_ERROR_MSG);
            }

            if (!this.keys && !this.queue) {
                return null;
            }

            if (!this.keys) {
                throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
            }

            if (!this.queue) {
                throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
            }

            if (this.keys.size !== this.queue.length) {
                throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
            }

            if (this.queue.length === 0) {
                return null;
            }

            const item = this.queue.dequeue();
            this.keys.delete(key);

            if (this.keys.size !== this.queue.length) {
                throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
            }

            return item;
        }
        finally {
            if (this.keys && this.queue) {
                if (this.keys.size !== this.queue.length) {
                    throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
                }

                if (this.keys.size === 0 &&
                    this.queue.length === 0) {
                    this.keys = null;
                    this.queue = null;
                }
            } else if (!this.keys && !this.queue) {
                // Do nothing
            } else if (!this.keys || !this.queue) {
                throw new Error(INVALID_QUEUE_STATE_ERROR_MSG);
            }
        }
    }
}