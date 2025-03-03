import Container from 'typedi';
import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { IMetadataService } from '../../types/services/jobs/metadata.service.type';
import { IWeatherResultService } from '../../types/services/weather.result.service.type';
import { IWeatherResultsStoreService } from '../../types/services/weather.result.store.service.type';

export class ArrayDataVerticalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public print(weatherResult: IWeatherResultService, destination: Excel.Range): boolean {
        try {
            const metadataService = Container.get<IMetadataService>('service.metadata');
            const maxSheetCols: number = metadataService.MaxSheetCols;
            const maxSheetRows: number = metadataService.MaxSheetRows;

            if (maxSheetCols === 0 || maxSheetRows === 0) {
                throw new Error();
            }

            const arrayData: any[] = weatherResult.toArray((arrayData: any[]) => {
                return arrayData && arrayData.length > 0 && arrayData[0].length > 0 &&
                    (destination.columnIndex + (arrayData[0].length - 1)) <= maxSheetCols &&
                    (destination.rowIndex + (arrayData.length - 1)) <= maxSheetRows;
            });

            const weatherResultsStore = Container.get<IWeatherResultsStoreService>('service.results.store.weather');
            weatherResultsStore.addOrUpdate(weatherResult);

            destination.worksheet.getRangeByIndexes(destination.rowIndex, destination.columnIndex, arrayData.length, arrayData[0].length).values = arrayData;

            return true;
        }
        catch {
            return false;
        }
    }
}