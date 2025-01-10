import { PrintDirections } from "../../helpers/helpers.args";
import { IField } from "../fields/field.type";
import { Matrix } from "./matrix.type";

export interface IMatrixService {
    CurrentFormula: string;
    CurrentColsRows: string;
    Fields: IField[];
    PrintDirection: PrintDirections;
    JsonData: object;

    IncludeTitle: boolean;
    UseFormulaForCaller: boolean;

    toMatrix(): Matrix;
}