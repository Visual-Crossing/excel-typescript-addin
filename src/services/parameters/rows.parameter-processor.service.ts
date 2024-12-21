import { WeatherObserver } from "src/helpers/helpers.args";
import { IParameterProcessor } from "src/types/parameters/parameter-processor.type";

export class RowsParameterService implements IParameterProcessor {
    public process(value: any, weatherObserver: WeatherObserver): void {
        if (!value) {
            weatherObserver.Rows = 1;
            return;
        }
        
        try {
            weatherObserver.Rows = parseInt(value, 10);
        }
        catch {
            weatherObserver.Rows = 1;
        }
    }
}