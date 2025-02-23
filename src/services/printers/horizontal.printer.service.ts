import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter, IArrayDataPrinterWithCaller } from '../../types/printers/printer.type';

export class ArrayDataHorizontalPrinterService implements IArrayDataPrinterWithCaller {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public getPrinterExcludingCaller(): IArrayDataPrinter {
        return new ArrayDataExcludeCallerHorizontalPrinterService();
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                if (arrayData.length > 0 && (callerCell.columnIndex + (arrayData.length - 1)) < sheetColumnCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, 1, arrayData.length).values = [arrayData];
                } else if (arrayData.length > 0) {
                    //ToDo
                } else {
                    callerCell.formulas = arrayData[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

export class ArrayDataExcludeCallerHorizontalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 1; i < arrayData.length; i++) {
                    arrayDataForPrint.push(arrayData[i]);
                }

                if (arrayDataForPrint.length > 0 && (callerCell.columnIndex + arrayDataForPrint.length) < sheetColumnCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex + 1, 1, arrayDataForPrint.length).values = [arrayDataForPrint];
                } else if (arrayDataForPrint.length > 0) {
                    //ToDo
                } else {
                    callerCell.formulas = arrayData[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}