import { INVALID_PARAMETER_VALUE } from '../../../../shared/constants';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../../../types/weather.observer.type';

export class HeaderYOptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'headers=y') {
            weatherObserver.IncludeTitle = true;
            
            return true;
        } else if (value && value.startsWith('headers=') && !value.startsWith('headers=y')) {
            throw new Error(`${INVALID_PARAMETER_VALUE} for parameter name 'headers'. Valid values are 'y' or 'n' only.`);
        } else {
            return false;
        }
    }
}