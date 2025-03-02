import { PrintDirections } from "../../helpers/helpers.args";
import { IFieldService } from "./field.service.type";
import { CacheItem } from "../cache-item.type";
import { Matrix } from "../matrix.type";

export interface IMatrixService {
    CurrentFormula: string;
    CurrentColsRows: string;
    Fields: IFieldService[];
    PrintDirection: PrintDirections;
    CacheItem: CacheItem;

    IncludeTitle: boolean;

    create(): IMatrixService;
    toMatrix(): Matrix;
}