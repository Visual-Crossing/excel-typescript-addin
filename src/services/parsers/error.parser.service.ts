import { Service } from 'typedi';
import { IErrorParserService } from '../../types/services/parsers/error.parser.service.type';

@Service()
export class ErrorParserService implements IErrorParserService {
    public getErrorInfo(error: any) : string {
        const NA_ERROR: string = '#N/A Error';

        if (error) {
          if (error.message) {
            return `${NA_ERROR} - (${error.message})`;
          } else if (error.name) {
            return `${NA_ERROR} - (${error.name})`;
          }
        }
      
        return `${NA_ERROR}!`;
    }
}