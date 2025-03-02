import { PrintDirections } from "../../helpers/helpers.args";

export interface IArrayDataPrinter {
    getPrintDirection(): PrintDirections;
    print(callerCell: Excel.Range, arrayData: any[]): boolean;
}