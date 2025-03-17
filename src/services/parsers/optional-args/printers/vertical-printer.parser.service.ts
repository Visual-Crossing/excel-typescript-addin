import { INVALID_PARAMETER_VALUE } from '../../../../shared/constants';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../../../types/weather.observer.type';
import { ArrayDataVerticalPrinterService } from '../../../printers/vertical.printer.service';

export class VerticalPrinterOptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.localeCompare('dir=v', undefined, { sensitivity: 'base' }) === 0) {
            weatherObserver.ArrayDataPrinter = new ArrayDataVerticalPrinterService();
            
            return true;
        } else if (value && value.startsWith('dir=') && value.localeCompare('dir=v', undefined, { sensitivity: 'base' }) !== 0 && value.localeCompare('dir=h', undefined, { sensitivity: 'base' }) !== 0) {
            throw new Error(`${INVALID_PARAMETER_VALUE} for parameter name 'dir'. Valid values are 'v' or 'h' only.`);
        } else {
            return false;
        }
    }
}