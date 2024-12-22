import { IArrayDataPrinterWithCaller } from '../../types/printers/printer.type';
import { INVALID_PARAMETER_VALUE } from '../../shared/constants';
import { IOptionalArgParser } from '../../types/parameters/parser.type';
import { WeatherObserver } from '../../types/observers/weather.observer.type';
import Container from 'typedi';

export class PrintDirectionParameterService implements IOptionalArgParser {
    public tryParse(value: any, weatherObserver: WeatherObserver): boolean {
        const ERROR_MSG: string = "for parameter name 'dir'. Valid values are 'v' or 'h' only.";
        
        if (!value) {
            throw new Error(`${INVALID_PARAMETER_VALUE} ${ERROR_MSG}`);
        }
        
        const printer: IArrayDataPrinterWithCaller = Container.get(value); 
        
        if (!printer) {
            throw new Error(`${INVALID_PARAMETER_VALUE} '${value}' ${ERROR_MSG}`);
        }

        weatherObserver.Printer = printer;
        
        return true;
    }
}