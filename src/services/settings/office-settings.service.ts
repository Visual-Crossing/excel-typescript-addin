import { DEFAULT_UNIT } from '../../settings/settings';
import { ISettings } from '../../types/settings/settings.type';

const API_KEY_SETTING: string = 'Visual Crossing API Key';
const UNIT_SETTING: string = 'Visual Crossing Unit';

export class OfficeSettingsService implements ISettings {
    public getApiKey(onSuccess: (apiKey: string | null | undefined) => void, onError?: (error: any) => void): void {
        OfficeRuntime.storage.getItem(API_KEY_SETTING)
            .then((apiKey: string | null) => {
                onSuccess(apiKey);
            })
            .catch((error: any) => {
                if (onError) {
                    onError(error);
                }
            });
    }

    public async getApiKeyAsync(): Promise<string | null | undefined> {
        return await OfficeRuntime.storage.getItem(API_KEY_SETTING);
    }

    public async setApiKeyAsync(apiKey: string): Promise<void> {
        await OfficeRuntime.storage.setItem(API_KEY_SETTING, apiKey);
    }

    public getUnit(onSuccess: (unit: string) => void, onError?: (error: any) => void): void {
        OfficeRuntime.storage.getItem(UNIT_SETTING)
            .then((unit: string | null) => {
                if (unit) {
                    onSuccess(unit);
                } else {
                    onSuccess(DEFAULT_UNIT);
                }
            })
            .catch((error: any) => {
                if (onError) {
                    onError(error);
                }
            });
    }
    
    public async getUnitAsync(): Promise<string> {
        let unit = await OfficeRuntime.storage.getItem(UNIT_SETTING);

        if (!unit) {
            unit = DEFAULT_UNIT;
        }
        
        return unit;
    }

    public async setUnitAsync(unit: string): Promise<void> {
        await OfficeRuntime.storage.setItem(UNIT_SETTING, unit);
    }
    
}