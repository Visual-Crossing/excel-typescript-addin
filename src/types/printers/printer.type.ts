import { PrintDirections } from "../../helpers/helpers.args";

export interface IArrayDataPrinter {
    getPrintDirection(): PrintDirections;
    print(callerCell: Excel.Range, sheetColumnCount: number, sheetRowCount: number, arrayData: any[]): boolean;
}

export interface IArrayDataPrinterWithCaller extends IArrayDataPrinter {
    getPrinterExcludingCaller(): IArrayDataPrinter;
}