export interface IFormulaUpdaterService {
    generateUpdatedFormula(currentFormula: string, currentCols: number, currentRows: number, arrayDataCols: number, arrayDataRows: number): string;
}