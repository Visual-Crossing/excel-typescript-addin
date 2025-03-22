import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { PrecipitationProbabilityFieldService } from '../../../..//services/fields/precipitation-probability.field.service';

export class PrecipitationProbabilityFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'precipprob') {

            weatherObserver.Fields.push(new PrecipitationProbabilityFieldService());

            return true;
        } else {
            return false;
        }
    }
}