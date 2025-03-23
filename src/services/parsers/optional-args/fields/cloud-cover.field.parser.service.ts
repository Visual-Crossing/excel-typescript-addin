import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { CloudCoverFieldService } from '../../../../services/fields/cloud-cover.field.service';

export class CloudCoverFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'cloudcover') {

            weatherObserver.Fields.push(new CloudCoverFieldService());

            return true;
        } else {
            return false;
        }
    }
}