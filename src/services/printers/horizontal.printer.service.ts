import { transposeArray } from '../../helpers/helpers.array';
import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter } from '../../types/printers/printer.type';

export class ArrayDataHorizontalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                if (sheetColumnCount && ((callerCell.columnIndex + (arrayData.length - 1)) < sheetColumnCount)) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayData[0].length, arrayData.length).values = transposeArray(arrayData);
                } else if (sheetColumnCount && arrayData.length > 1) {
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