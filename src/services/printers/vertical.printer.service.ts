import { PrintDirections } from '../../helpers/helpers.args';
import { IArrayDataPrinter, IArrayDataPrinterWithCaller } from '../../types/printers/printer.type';

export class ArrayDataVerticalPrinterService implements IArrayDataPrinterWithCaller {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public getPrinterExcludingCaller(): IArrayDataPrinter {
        return new ArrayDataExcludeCallerVerticalPrinterService();
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 0; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i]]);
                }
        
                if (sheetRowCount && arrayDataForPrint.length > 1 && (callerCell.rowIndex + (arrayDataForPrint.length - 1)) < sheetRowCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
                } else if (sheetRowCount && arrayDataForPrint.length > 1) {
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

export class ArrayDataExcludeCallerVerticalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 0; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i][0]]);
                }
        
                if (sheetRowCount && arrayDataForPrint.length > 1 && ((callerCell.rowIndex + (arrayDataForPrint.length - 1)) < sheetRowCount)) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
                } else if (sheetRowCount && arrayDataForPrint.length > 1) {
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