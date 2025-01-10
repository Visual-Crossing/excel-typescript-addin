export interface IFormulaUpdaterService {
    generateUpdatedFormula(currentFormula: string, currentColsRows: string, arrayDataCols: number, arrayDataRows: number): string;
}