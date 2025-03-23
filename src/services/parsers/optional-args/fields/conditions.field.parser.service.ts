import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { ConditionsFieldService } from '../../../..//services/fields/conditions.field.service';

export class ConditionsFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'conditions') {

            weatherObserver.Fields.push(new ConditionsFieldService());

            return true;
        } else {
            return false;
        }
    }
}