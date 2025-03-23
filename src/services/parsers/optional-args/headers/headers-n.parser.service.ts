import { INVALID_PARAMETER_VALUE } from '../../../../shared/constants';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../../../types/weather.observer.type';

export class HeaderNOptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.localeCompare('headers=n', undefined, { sensitivity: 'base' }) === 0) {
            weatherObserver.IncludeHeaders = false;
            
            return true;
        } else if (value && value.startsWith('headers=') && value.localeCompare('headers=n', undefined, { sensitivity: 'base' }) !== 0 && value.localeCompare('headers=y', undefined, { sensitivity: 'base' }) !== 0) {
            throw new Error(`${INVALID_PARAMETER_VALUE} for parameter name 'headers'. Valid values are 'y' or 'n' only.`);
        } else {
            return false;
        }
    }
}