import { Service } from "typedi";
import { IMetadataService } from "../../types/services/jobs/metadata.service.type";

@Service()
export class MetadataService implements IMetadataService {
    MaxSheetRows: number;
    MaxSheetCols: number;
}