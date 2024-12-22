import { Service } from 'typedi';
import { IDateParserService } from '../../types/parsers/date.parser.type';

@Service()
export class DateParserService implements IDateParserService {
    public parse(value: any) : Date {
        const INVALID_DATE: string = '#Invalid date!';

        if (!value) {
            throw new Error(INVALID_DATE);
        }

        let result: Date;

        if (value instanceof Date) {
            result =  value as Date;
        } else if (typeof value === 'number') {
            result =  new Date(Date.UTC(0, 0, (value as number) - 1));
        } else if (typeof value === 'string') {
            result =  new Date(value as string);
        } else {
            throw new Error(INVALID_DATE);
        }

        if (!result || !this.isValidDate(result)) {
            throw new Error(INVALID_DATE);
        }

        return result;
    }

    private isValidDate(value: Date) : boolean {
        return !isNaN(value.getDate());
    }
}