import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { PrecipitationFieldService } from '../../../../services/fields/precipitation.field.service';

export class PrecipitationFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'precip') {

            weatherObserver.Fields.push(new PrecipitationFieldService());

            return true;
        } else {
            return false;
        }
    }
}