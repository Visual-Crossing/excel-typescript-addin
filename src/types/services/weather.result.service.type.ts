import { PrintDirections } from "../../helpers/helpers.args";
import { IFieldService } from "./field.service.type";
import { CacheItem } from "../cache-item.type";

export interface IWeatherResultService {
    CacheItem: CacheItem;
    DestinationAddress: string;

    CurrentFormula: string;
    CurrentCols: number;
    CurrentRows: number;

    PrintDirection: PrintDirections;
    Fields: IFieldService[];
    IncludeTitle: boolean;
    UseExcelErrors: boolean;

    create(): IWeatherResultService;
    getFormulaCellValue(): string | number | Date;
    toArray(validate: (arrayData: any[]) => boolean) : any[];
}