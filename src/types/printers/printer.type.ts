import { PrintDirections } from '../../helpers/helpers.args';
import { IWeatherResultService } from '../services/weather.result.service.type';

export interface IArrayDataPrinter {
    getPrintDirection(): PrintDirections;
    print(weatherResult: IWeatherResultService, destination: Excel.Range): boolean;
}