import { PrintDirections } from "../helpers/helpers.args";

export interface IArrayDataPrinter {
    getPrintDirection(): PrintDirections;
    print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean;
}

export interface IArrayDataPrinterWithCaller extends IArrayDataPrinter {
    getPrinterExcludingCaller(): IArrayDataPrinter;
}

export class ArrayDataVerticalPrinter implements IArrayDataPrinterWithCaller {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Vertical;
    }

    public getPrinterExcludingCaller(): IArrayDataPrinter {
        return new ArrayDataExcludeCallerVerticalPrinter();
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 0; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i]]);
                }
        
                if ((callerCell.rowIndex + (arrayDataForPrint.length - 1)) < sheetRowCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
                }
                else {
                    callerCell.formulas[0][0] = callerCell.formulas[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

export class ArrayDataExcludeCallerVerticalPrinter implements IArrayDataPrinter {
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
        
                if ((callerCell.rowIndex + arrayDataForPrint.length)  < sheetRowCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
                }
                else {
                    callerCell.formulas[0][0] = callerCell.formulas[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

export class ArrayDataHorizontalPrinter implements IArrayDataPrinterWithCaller {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public getPrinterExcludingCaller(): IArrayDataPrinter {
        return new ArrayDataExcludeCallerHorizontalPrinter();
    }

    public print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                if ((callerCell.columnIndex + (arrayData.length - 1)) < sheetColumnCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, 1, arrayData.length).values = [arrayData];
                }
                else {
                    callerCell.formulas[0][0] = callerCell.formulas[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

export class ArrayDataExcludeCallerHorizontalPrinter implements IArrayDataPrinter {
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

                if ((callerCell.columnIndex + arrayDataForPrint.length) < sheetColumnCount) {
                    callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex + 1, 1, arrayDataForPrint.length).values = [arrayDataForPrint];
                }
                else {
                    callerCell.formulas[0][0] = callerCell.formulas[0][0];
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}