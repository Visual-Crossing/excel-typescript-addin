import { IFormulaUpdaterService } from "../../types/services/formula-updater.service.type";
import { getArrayDataCols, getArrayDataRows } from "../../helpers/helpers.formulas";
import { IMatrixService } from "../../types/services/matrix.service.type";
import { Matrix } from "../../types/matrix.type";
import Container, { Service } from "typedi";
import { IFieldService } from "../../types/services/field.service.type";
import { PrintDirections } from "../../helpers/helpers.args";
import { PrecipitationFieldService } from "../fields/precipitation.field.service";
import { HumidityFieldService } from "../fields/humidity.field.service";
import { PROCESSING } from "../../shared/constants";
import { CacheItem } from "../../types/cache-item.type";

@Service({ transient: true })
export class MatrixService implements IMatrixService {
    public CurrentFormula: string;
    public CurrentColsRows: string;
    public Fields: IFieldService[];
    public PrintDirection: PrintDirections;
    public CacheItem: CacheItem;

    public IncludeTitle: boolean = false;
    public UseFormulaForCaller: boolean = true;

    public create(): IMatrixService {
        return new MatrixService();
    }

    public toMatrix(): Matrix {
        // if (!this.CurrentFormula || !this.Fields?.length || !this.JsonData || !this.PrintDirection) {
        //     throw new Error();
        // }

        if (!this.Fields?.length) {
            this.Fields = [new HumidityFieldService()];
        }

        if (!this.CacheItem?.values) {
            return { FormulaCellDisplayValue: PROCESSING };
        }

        const outputArrayData: any[][] = [];

        //ToDo: Use multiple services
        if (this.IncludeTitle) {
            this.Fields.forEach((field) => outputArrayData.push([field.getTitle(), field.getValue(this.CacheItem)]));
        } else {
            this.Fields.forEach((field) => outputArrayData.push([field.getValue(this.CacheItem)]));
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