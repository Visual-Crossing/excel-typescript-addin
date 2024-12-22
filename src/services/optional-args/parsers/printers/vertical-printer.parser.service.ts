import { INVALID_PARAMETER_VALUE } from '../../../../shared/constants';
import { IOptionalArgParser } from '../../../../types/optional-args/parser.type';
import { WeatherObserver } from '../../../../types/observers/weather.observer.type';
import { ArrayDataVerticalPrinterService } from '../../../../services/printers/vertical.printer.service';

export class VerticalPrinterOptionalArgParserService implements IOptionalArgParser {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'dir=v') {
            weatherObserver.Printer = new ArrayDataVerticalPrinterService();
            
            return true;
        } else if (value && value.startsWith('dir=')) {
            throw new Error(`${INVALID_PARAMETER_VALUE} for parameter name 'dir'. Valid values are 'v' or 'h' only.`);
        } else {
            return false;
        }
    }
}