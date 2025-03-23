import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../../../types/weather.observer.type';

export class CustomErrorOptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.localeCompare('errors=custom', undefined, { sensitivity: 'base' }) === 0) {
            weatherObserver.UseExcelErrors = false;
            
            return true;
        } else {
            return false;
        }
    }
}