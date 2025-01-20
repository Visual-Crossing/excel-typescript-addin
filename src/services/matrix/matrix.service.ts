import { IFormulaUpdaterService } from "../../types/updaters/formula.updater.service.type";
import { getArrayDataCols, getArrayDataRows } from "../../helpers/helpers.formulas";
import { IMatrixService } from "../../types/matrix/matrix.service.type";
import { Matrix } from "../../types/matrix/matrix.type";
import Container, { Service } from "typedi";
import { IField } from "../../types/fields/field.type";
import { PrintDirections } from "../../helpers/helpers.args";
import { PrecipitationFieldService } from "../fields/precipitation.field.service";
import { HumidityFieldService } from "../fields/humidity.field.service";
import { PROCESSING } from "../../shared/constants";
import { ApiResponse } from "../../types/response/api-response.type";

@Service({ transient: true })
export class MatrixService implements IMatrixService {
    public CurrentFormula: string;
    public CurrentColsRows: string;
    public Fields: IField[];
    public PrintDirection: PrintDirections;
    public ApiResponse: ApiResponse;

    public IncludeTitle: boolean = false;
    public UseFormulaForCaller: boolean = true;

    public toMatrix(): Matrix {
        // if (!this.CurrentFormula || !this.Fields?.length || !this.JsonData || !this.PrintDirection) {
        //     throw new Error();
        // }

        if (!this.Fields?.length) {
            this.Fields = [new HumidityFieldService()];
        }

        if (!this.ApiResponse?.values) {
            return { FormulaCellDisplayValue: PROCESSING };
        }

        const outputArrayData: any[][] = [];

        //ToDo: Use multiple services
        if (this.IncludeTitle) {
            this.Fields.forEach((field) => outputArrayData.push([field.getTitle(), field.getValue(this.ApiResponse)]));
        } else {
            this.Fields.forEach((field) => outputArrayData.push([field.getValue(this.ApiResponse)]));
        }

        const formulaCellDisplayValue: string | number | Date = outputArrayData[0][0];

        if (this.UseFormulaForCaller && this.CurrentFormula) {
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