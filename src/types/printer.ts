import { PrintDirections } from "../helpers/helpers.args";

export interface IArrayDataPrinter {
    getPrintDirection(): PrintDirections;
    print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean>;
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

    public async print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean> {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 0; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i]]);
                }
        
                callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
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

    public async print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean> {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 1; i < arrayData.length; i++) {
                    arrayDataForPrint.push([arrayData[i]]);
                }
        
                callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, arrayDataForPrint.length, 1).values = arrayDataForPrint;
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
        return new ArrayDataExcludingCallerHorizontalPrinter();
    }

    public async print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean> {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                // const arrayDataForPrint: any[] = [];
    
                // for (let i = 1; i < values.length; i++) {
                //     arrayDataForPrint.push(values[i]);
                // }

                callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, 1, arrayData.length).values = [arrayData];
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

export class ArrayDataExcludingCallerHorizontalPrinter implements IArrayDataPrinter {
    public getPrintDirection(): PrintDirections {
        return PrintDirections.Horizontal;
    }

    public async print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean> {
        try {
            if (callerCell && arrayData && arrayData.length > 0) {
                const arrayDataForPrint: any[] = [];
    
                for (let i = 1; i < arrayData.length; i++) {
                    arrayDataForPrint.push(arrayData[i]);
                }

                callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex, 1, arrayData.length).values = [arrayDataForPrint];
            }

            return true;
        }
        catch {
            return false;
        }
    }
}