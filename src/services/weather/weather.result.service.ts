import Container, { Service } from 'typedi';
import { IFormulaUpdaterService } from '../../types/services/updaters/formula.updater.service.type';
import { getArrayDataCols, getArrayDataRows } from '../../helpers/helpers.formulas';
import { IWeatherResultService } from '../../types/services/weather.result.service.type';
import { ICacheService } from '../../types/services/cache.service.type';
import { getCacheService } from '../../helpers/helpers.services';
import { NA_DATA } from '../../shared/constants';

import { HumidityFieldService } from '../fields/humidity.field.service';
import { PrecipitationFieldService } from '../fields/precipitation.field.service';
import { PressureFieldService } from '../fields/pressure.field.service';
import { WindDirFieldService } from '../fields/winddir.field.service';
import { WeatherObserver } from 'src/types/weather.observer.type';

@Service({ transient: true })
export class WeatherResult implements IWeatherResultService {
    public Observer: WeatherObserver;

    private FormulaCellValue: string | number | Date;
    private OutputArrayData: any[][] = [];

    public create(): IWeatherResultService {
        return new WeatherResult();
    }

    public getFormulaCellValue(): string | number | Date {
        return this.FormulaCellValue;
    }

    public toArray(validate: (arrayData: any[]) => boolean): any[] {
        if (!this.Observer) {
            throw new Error();
        }

        if (this.Observer.Error) {
            this.OutputArrayData.push([this.Observer.Error]);
        } else { 
            const cacheService: ICacheService = getCacheService();
            const cacheItemString: string | null | undefined = cacheService.get(this.Observer.CacheId);

            if (!cacheItemString) {
                this.OutputArrayData.push([NA_DATA]);
            }
            else {
                const cacheItemObject = JSON.parse(cacheItemString);

                if (!cacheItemObject || !cacheItemObject.values || cacheItemObject.values.length < 1) {
                    this.OutputArrayData.push([NA_DATA]);
                } else {
                    if (!this.Observer.Fields?.length) {
                        this.Observer.Fields = [new HumidityFieldService(), new PressureFieldService(), new WindDirFieldService()];
                        //this.Observer.Fields = [new HumidityFieldService()];
                    }
                    
                    //ToDo: Consider using multiple services
                    if (this.Observer.IncludeHeaders) {
                        this.Observer.Fields.forEach((field) => this.OutputArrayData.push([field.getTitle(), field.getValue(cacheItemObject)]));
                    } else {
                        this.Observer.Fields.forEach((field) => this.OutputArrayData.push([field.getValue(cacheItemObject)]));
                    }
                }
            }
        }

        if (!validate(this.OutputArrayData)) {
            this.OutputArrayData = [];
            this.OutputArrayData.push(['#N/A Overflow!']);
            
        }

        this.FormulaCellValue = this.OutputArrayData[0][0];

        if (this.Observer.InitialFormula) {
            const arrayDataColsOut = getArrayDataCols(this.OutputArrayData, this.Observer.ArrayDataPrinter.getPrintDirection());
            const arrayDataRowsOut = getArrayDataRows(this.OutputArrayData, this.Observer.ArrayDataPrinter.getPrintDirection());

            const formulaUpdaterService = Container.get<IFormulaUpdaterService>('service.updater.formula');
            this.OutputArrayData[0][0] = formulaUpdaterService.generateUpdatedFormula(this.Observer.InitialFormula, this.Observer.ArrayDataColumnsIn, this.Observer.ArrayDataRowsIn, arrayDataColsOut, arrayDataRowsOut);
        }

        return this.OutputArrayData;
    }
}