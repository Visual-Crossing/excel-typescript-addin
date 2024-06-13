export interface IArrayDataPrinter {
    print(callerCell: Excel.Range, arrayData: any[]): Promise<boolean>;
}

export class ArrayDataVerticalPrinter implements IArrayDataPrinter {
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

export class ArrayDataHorizontalPrinter implements IArrayDataPrinter {
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