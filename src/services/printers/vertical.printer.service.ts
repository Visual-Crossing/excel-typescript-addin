import Container from 'typedi';
import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { IMetadataService } from '../../types/services/jobs/metadata.service.type';

export class ArrayDataVerticalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public print(callerCell: Excel.Range, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const metadataService = Container.get<IMetadataService>('service.metadata');
                const maxSheetRows: number = metadataService.MaxSheetRows;

                if (maxSheetRows === 0) {
                    throw new Error();
                }

                if ((callerCell.rowIndex + (arrayData.length - 1)) < maxSheetRows) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayData.length, arrayData[0].length).values = arrayData;
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