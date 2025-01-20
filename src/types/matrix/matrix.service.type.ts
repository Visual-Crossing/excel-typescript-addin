import { PrintDirections } from "../../helpers/helpers.args";
import { IField } from "../fields/field.type";
import { ApiResponse } from "../response/api-response.type";
import { Matrix } from "./matrix.type";

export interface IMatrixService {
    CurrentFormula: string;
    CurrentColsRows: string;
    Fields: IField[];
    PrintDirection: PrintDirections;
    ApiResponse: ApiResponse;

    IncludeTitle: boolean;
    UseFormulaForCaller: boolean;

    toMatrix(): Matrix;
}