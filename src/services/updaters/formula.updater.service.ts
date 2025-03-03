import { IFormulaUpdaterService } from "../../types/services/updaters/formula.updater.service.type";

export class FormulaUpdaterService implements IFormulaUpdaterService {
    public generateUpdatedFormula(currentFormula: string, currentCols: number, currentRows: number, arrayDataCols: number, arrayDataRows: number): string {
        if (!currentFormula || !arrayDataCols || !arrayDataRows) {
            throw new Error();
        }
        
        const currentColsRows: string = `cols=${currentCols};rows=${currentRows};`;

        if (currentColsRows && currentFormula.includes(currentColsRows)) {
            const updatedFormula = currentFormula.replace(currentColsRows, `cols=${arrayDataCols};rows=${arrayDataRows};`);
            return updatedFormula;
        }
        else {
            const currentFormulaTrimmed = currentFormula.trim();
            const updatedFormula = `${currentFormulaTrimmed.substring(0, currentFormulaTrimmed.length - 1)}, "cols=${arrayDataCols};rows=${arrayDataRows};")`;

            return updatedFormula;
        }
    }
}