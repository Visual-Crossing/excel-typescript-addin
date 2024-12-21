const API_KEY_SETTING: string = "Visual Crossing API Key";
const UNIT_SETTING: string = "Visual Crossing Unit";

export const DEFAULT_UNIT: string = "us";

export async function getApiKeyFromSettingsAsync(): Promise<string | null | undefined> {
    return await OfficeRuntime.storage.getItem(API_KEY_SETTING);
}

export function getApiKeyFromSettings(callback: (apiKey: string | null | undefined) => void): void {
    OfficeRuntime.storage.getItem(API_KEY_SETTING)
        .then((apiKey: string | null) => {
            callback(apiKey);
        })
        .catch((error: any) => {
            //ToDo
        });
}

export async function storeApiKeyAsync(apiKey: string): Promise<void> {
    await OfficeRuntime.storage.setItem(API_KEY_SETTING, apiKey);
}

export async function getUnitFromSettingsAsync(): Promise<string | null | undefined> {
    return await OfficeRuntime.storage.getItem(UNIT_SETTING);
}

export function getUnitFromSettings(callback: (unit: string | null | undefined) => void): void {
    OfficeRuntime.storage.getItem(UNIT_SETTING)
        .then((unit: string | null) => {
            callback(unit);
        })
        .catch((error: any) => {
            //ToDo
        });
}

export async function setUnitAsync(unit: string): Promise<void> {
    await OfficeRuntime.storage.setItem(UNIT_SETTING, unit);
}
