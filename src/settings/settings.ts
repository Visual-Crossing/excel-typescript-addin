const API_KEY_SETTING: string = "Visual Crossing API Key";
const UNIT_SETTING: string = "Visual Crossing Unit";

export async function getApiKeyAsync(): Promise<string | null> {
    return await OfficeRuntime.storage.getItem(API_KEY_SETTING);
}

export async function storeApiKeyAsync(apiKey: string): Promise<void> {
    await OfficeRuntime.storage.setItem(API_KEY_SETTING, apiKey);
}

export async function getUnitAsync(): Promise<string | null> {
    return await OfficeRuntime.storage.getItem(UNIT_SETTING);
}

export async function storeUnitAsync(unit: string): Promise<void> {
    await OfficeRuntime.storage.setItem(UNIT_SETTING, unit);
}
