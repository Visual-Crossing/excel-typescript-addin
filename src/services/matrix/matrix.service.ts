import { IFormulaUpdaterService } from "../../types/updaters/formula.updater.service.type";
import { getArrayDataCols, getArrayDataRows } from "../../helpers/helpers.formulas";
import { IMatrixService } from "../../types/matrix/matrix.service.type";
import { Matrix } from "../../types/matrix/matrix.type";
import Container, { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { PrintDirections } from "../../helpers/helpers.args";

@Service({ transient: true })
export class MatrixService implements IMatrixService {
    public CurrentFormula: string;
    public CurrentColsRows: string;
    public Fields: IField[];
    public PrintDirection: PrintDirections;
    public JsonData: object;

    public IncludeTitle: boolean = false;
    public UseFormulaForCaller: boolean = true;

    public toMatrix(): Matrix {
        if (!this.CurrentFormula || !this.Fields?.length || !this.JsonData || !this.PrintDirection) {
            throw new Error();
        }

        const outputArrayData: any[][] = [];
        
        //ToDo: Use multiple services
        if (this.IncludeTitle) {
            this.Fields.forEach((field) => outputArrayData.push([field.getTitle(), field.getValue(this.JsonData)]));
        } else {
            this.Fields.forEach((field) => outputArrayData.push([field.getValue(this.JsonData)]));
        }

        const formulaCellDisplayValue: string | number | Date = outputArrayData[0][0];

        if (this.UseFormulaForCaller) {
            //ToDo: Use services
            const arrayDataCols = getArrayDataCols(outputArrayData, this.PrintDirection);
            const arrayDataRows = getArrayDataRows(outputArrayData, this.PrintDirection);

            const formulaUpdaterService = Container.get<IFormulaUpdaterService>('service.updater.formula');
            outputArrayData[0][0] = formulaUpdaterService.generateUpdatedFormula(this.CurrentFormula, this.CurrentColsRows, arrayDataCols, arrayDataRows)
        }

        const matrix: Matrix = { FormulaCellDisplayValue: formulaCellDisplayValue, OutputArrayData: outputArrayData };

        return matrix;
    }
}