import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { DescriptionFieldService } from '../../../../services/fields/description.field.service';

export class DescriptionFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'description') {

            weatherObserver.Fields.push(new DescriptionFieldService());

            return true;
        } else {
            return false;
        }
    }
}