import { IFormulaUpdaterService } from "../../types/services/formula-updater.service.type";

export class FormulaUpdaterService implements IFormulaUpdaterService {
    public generateUpdatedFormula(currentFormula: string, currentColsRows: string, arrayCols: number, arrayRows: number): string {
        if (!currentFormula || !arrayCols || !arrayRows) {
            throw new Error();
        }
        
        if (currentColsRows && currentFormula.includes(currentColsRows)) {
            const updatedFormula = currentFormula.replace(currentColsRows, `cols=${arrayCols};rows=${arrayRows};`);
            return updatedFormula;
        }
        else {
            const currentFormulaTrimmed = currentFormula.trim();
            const updatedFormula = `${currentFormulaTrimmed.substring(0, currentFormulaTrimmed.length - 1)}, "cols=${arrayCols};rows=${arrayRows};")`;

            return updatedFormula;
        }
    }
}