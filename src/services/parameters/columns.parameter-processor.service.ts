import { WeatherObserver } from "src/helpers/helpers.args";
import { IParameterProcessor } from "src/types/parameters/parameter-processor.type";

export class ColumnsParameterService implements IParameterProcessor {
    public process(value: any, weatherObserver: WeatherObserver): void {
        if (!value) {
            weatherObserver.Columns = 1;
            return;
        }
        
        try {
            weatherObserver.Columns = parseInt(value, 10);
        }
        catch {
            weatherObserver.Columns = 1;
        }
    }
}