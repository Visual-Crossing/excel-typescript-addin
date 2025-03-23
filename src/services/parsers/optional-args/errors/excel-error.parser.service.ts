import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../../../types/weather.observer.type';

export class ExcelErrorOptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.localeCompare('errors=excel', undefined, { sensitivity: 'base' }) === 0) {
            weatherObserver.UseExcelErrors = true;
            
            return true;
        } else {
            return false;
        }
    }
}