export interface ICache {
    has(id: string): boolean;
    get(id: string): string | null;
    set(id: string, value: string): void;
    remove(id: string): void;
}