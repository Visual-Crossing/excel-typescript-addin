import { Service } from 'typedi';
import { IErrorParserService } from '../../types/services/parsers/error.parser.service.type';
import { NA_ERROR } from '../../shared/constants';

@Service()
export class ErrorParserService implements IErrorParserService {
    public getErrorInfo(error: any) : string | CustomFunctions.Error {
        if (error) {
          if (error.message) {
            return `${NA_ERROR} - ${error.message}`;
          } else if (error.name) {
            return `${NA_ERROR} - ${error.name}`;
          }
        }
      
        return new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable);
    }
}