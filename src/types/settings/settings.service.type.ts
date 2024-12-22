export interface ISettingsService {
    getApiKey(onSuccess: (apiKey: string | null | undefined) => void, onError?: (error: any) => void): void;
    getApiKeyAsync(): Promise<string | null | undefined>;
    setApiKeyAsync(apiKey: string): Promise<void>;

    getUnit(onSuccess: (unit: string) => void, onError?: (error: any) => void): void;
    getUnitAsync(): Promise<string>;
    setUnitAsync(unit: string): Promise<void>;
}