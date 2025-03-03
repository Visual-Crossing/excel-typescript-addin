import Container, { Service } from "typedi";
import { IFormulaUpdaterService } from "../../types/services/updaters/formula.updater.service.type";
import { getArrayDataCols, getArrayDataRows } from "../../helpers/helpers.formulas";
import { IWeatherResultService } from "../../types/services/weather.result.service.type";
import { IFieldService } from "../../types/services/field.service.type";
import { PrintDirections } from "../../helpers/helpers.args";
import { CacheItem } from "../../types/cache-item.type";

import { HumidityFieldService } from "../fields/humidity.field.service";
import { PrecipitationFieldService } from "../fields/precipitation.field.service";
import { PressureFieldService } from "../fields/pressure.field.service";
import { WindDirFieldService } from "../fields/winddir.field.service";

@Service({ transient: true })
export class WeatherResult implements IWeatherResultService {
    public CacheItem: CacheItem;
    public DestinationAddress: string;

    public CurrentFormula: string;
    public CurrentCols: number;
    public CurrentRows: number;

    public PrintDirection: PrintDirections;
    public Fields: IFieldService[];
    public IncludeTitle: boolean;
    public UseExcelErrors: boolean;

    private formulaCellValue: string | number | Date;
    private outputArrayData: any[][] = [];

    public create(): IWeatherResultService {
        return new WeatherResult();
    }

    public getFormulaCellValue(): string | number | Date {
        return this.formulaCellValue;
    }

    public toArray(validate: (arrayData: any[]) => boolean): any[] {
        if (!this.CacheItem || ((!this.CacheItem.values || this.CacheItem.values.length) && !this.CacheItem.error)) {
            this.outputArrayData.push(["#N/A Data!"]);
        } else if (this.CacheItem.error) {
            this.outputArrayData.push([this.CacheItem.error]);
        } else {
            if (!this.Fields?.length) {
                this.Fields = [new HumidityFieldService(), new PressureFieldService(), new WindDirFieldService()];
            }
            
            //ToDo: Consider using multiple services
            if (this.IncludeTitle) {
                this.Fields.forEach((field) => this.outputArrayData.push([field.getTitle(), field.getValue(this.CacheItem)]));
            } else {
                this.Fields.forEach((field) => this.outputArrayData.push([field.getValue(this.CacheItem)]));
            }
        }

        if (!validate(this.outputArrayData)) {
            this.outputArrayData = [];
            this.outputArrayData.push(["#N/A Overflow!"]);
            
        }

        this.formulaCellValue = this.outputArrayData[0][0];

        if (this.CurrentFormula) {
            const arrayDataCols = getArrayDataCols(this.outputArrayData, this.PrintDirection);
            const arrayDataRows = getArrayDataRows(this.outputArrayData, this.PrintDirection);

            const formulaUpdaterService = Container.get<IFormulaUpdaterService>('service.updater.formula');
            this.outputArrayData[0][0] = formulaUpdaterService.generateUpdatedFormula(this.CurrentFormula, this.CurrentCols, this.CurrentRows, arrayDataCols, arrayDataRows);
        }

        return this.outputArrayData;
    }

    // public toMatrix(): Matrix {
    //     // if (!this.CurrentFormula || !this.Fields?.length || !this.JsonData || !this.PrintDirection) {
    //     //     throw new Error();
    //     // }

    //     if (!this.Fields?.length) {
    //         this.Fields = [new HumidityFieldService(), new PressureFieldService(), new WindDirFieldService()];
    //     }

    //     if (!this.CacheItem?.values && !this.CacheItem?.error) {
    //         return { FormulaCellDisplayValue: PROCESSING };
    //     }

    //     const outputArrayData: any[][] = [];
        
    //     if (this.CacheItem.error) {
    //         outputArrayData.push([this.CacheItem.error]);
    //     } else {
    //         this.IncludeTitle = true;
    //         //ToDo: Consider using multiple services
    //         if (this.IncludeTitle) {
    //             this.Fields.forEach((field) => outputArrayData.push([field.getTitle(), field.getValue(this.CacheItem)]));
    //         } else {
    //             this.Fields.forEach((field) => outputArrayData.push([field.getValue(this.CacheItem)]));
    //         }
    //     }

    //     const formulaCellDisplayValue: string | number | Date = outputArrayData[0][0];

    //     if (this.CurrentFormula) {
    //         //ToDo: Use services
    //         const arrayDataCols = getArrayDataCols(outputArrayData, this.PrintDirection);
    //         const arrayDataRows = getArrayDataRows(outputArrayData, this.PrintDirection);

    //         const formulaUpdaterService = Container.get<IFormulaUpdaterService>('service.updater.formula');
    //         outputArrayData[0][0] = formulaUpdaterService.generateUpdatedFormula(this.CurrentFormula, this.CurrentColsRows, arrayDataCols, arrayDataRows)
    //     }

    //     const matrix: Matrix = { FormulaCellDisplayValue: formulaCellDisplayValue, OutputArrayData: outputArrayData };

    //     return matrix;
    // }
}