import { IArrayDataPrinter } from "../../printers/printer.type";
import { IJobService } from "./job.service.type";
import { IWeatherResultService } from "../weather.result.service.type";

export interface IPrintJobService<T> extends IJobService<T> {
    InitialFormula: any;
    WeatherResult: IWeatherResultService;
    ArrayDataPrinter: IArrayDataPrinter;
    Invocation: T;

    create(): IPrintJobService<T>;
}