import Container from 'typedi';
import { transposeArray } from '../../helpers/helpers.array';
import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { IMetadataService } from '../../types/services/jobs/metadata.service.type';


export class ArrayDataHorizontalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public print(callerCell: Excel.Range, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const metadataService = Container.get<IMetadataService>('service.metadata');
                const maxSheetCols: number = metadataService.MaxSheetCols;

                if (maxSheetCols === 0) {
                    throw new Error();
                }

                if ((callerCell.columnIndex + (arrayData.length - 1)) < maxSheetCols) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayData[0].length, arrayData.length).values = transposeArray(arrayData);
                } else if (arrayData.length > 1) {
                    //ToDo
                } else {
                    callerCell.formulas = arrayData[0][0];
                }
            } else if (callerCell) {
                //ToDo
            }

            return true;
        }
        catch {
            return false;
        }
    }
}