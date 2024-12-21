import { WeatherObserver } from "src/helpers/helpers.args";
import { getService } from "../container";
import { IArrayDataPrinterWithCaller } from "src/types/printers/printer.type";
import { INVALID_PARAMETER_VALUE } from "src/shared/constants";
import { IParameterProcessor } from "src/types/parameters/parameter-processor.type";

export class PrintDirectionParameterService implements IParameterProcessor {
    public process(value: any, weatherObserver: WeatherObserver): void {
        const ERROR_MSG: string = "for parameter name 'dir'. Valid values are 'v' or 'h' only.";
        
        if (!value) {
            throw new Error(`${INVALID_PARAMETER_VALUE} ${ERROR_MSG}`);
        }
        
        const printer: IArrayDataPrinterWithCaller = getService(value); 
        
        if (!printer) {
            throw new Error(`${INVALID_PARAMETER_VALUE} '${value}' ${ERROR_MSG}`);
        }

        weatherObserver.Printer = printer;
    }
}