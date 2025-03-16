export interface IMacroCounterService {
    add(): void;
    remove(): void;
    getCount(): number;
}