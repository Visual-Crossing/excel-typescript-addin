import { INVALID_PARAMETER_VALUE } from '../../../../shared/constants';
import { IOptionalArgParser } from '../../../../types/optional-args/parser.type';
import { WeatherObserver } from '../../../../types/observers/weather.observer.type';
import { ArrayDataHorizontalPrinterService } from '../../../../services/printers/horizontal.printer.service';

export class HorizontalPrinterOptionalArgParserService implements IOptionalArgParser {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'dir=h') {
            weatherObserver.Printer = new ArrayDataHorizontalPrinterService();
            
            return true;
        } else if (value && value.startsWith('dir=')) {
            throw new Error(`${INVALID_PARAMETER_VALUE} for parameter name 'dir'. Valid values are 'v' or 'h' only.`);
        } else {
            return false;
        }
    }
}