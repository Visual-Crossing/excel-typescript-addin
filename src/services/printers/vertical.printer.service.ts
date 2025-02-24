import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter } from '../../types/printers/printer.type';

export class ArrayDataVerticalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                if (sheetRowCount && ((callerCell.rowIndex + (arrayData.length - 1)) < sheetRowCount)) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayData.length, arrayData[0].length).values = arrayData;
                } else if (sheetRowCount && arrayData.length > 1) {
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