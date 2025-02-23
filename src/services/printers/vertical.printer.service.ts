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
        
                if (arrayDataForPrint.length > 0 && (callerCell.rowIndex + (arrayDataForPrint.length - 1)) < sheetRowCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
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

export class ArrayDataExcludeCallerVerticalPrinterService implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 1; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i]]);
                }
        
                if (arrayDataForPrint.length > 0 && (callerCell.rowIndex + arrayDataForPrint.length)  < sheetRowCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
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