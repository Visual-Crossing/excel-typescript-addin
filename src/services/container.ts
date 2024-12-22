import { Container } from 'typedi';
import { PrecipitationFieldService } from './fields/precipitation.field.service';
import { PrintDirectionParameterService } from './parameters/print-direction.parameter-processor.service';
import { ArrayDataVerticalPrinterService } from './printers/vertical.printer.service';
import { ArrayDataHorizontalPrinterService } from './printers/horizontal.printer.service';
import { ArrayColSizeOptionalArgParserService } from './parameters/parsers/array-col-size.parser.service';
import { ArrayRowSizeOptionalArgParserService } from './parameters/parsers/array-row-size.parser.service';
import { WeatherObserverService } from './observers/weather.observer.service';
import { IDateParserService } from '../types/dates/date.parser.type';
import { IPrintJob } from 'src/types/jobs/print.job.type';
import { PrintJobService } from './jobs/print.job.service';
import { OfficeSettingsService } from './settings/office-settings.service';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { DateParserService } from './dates/date.parser.service';
import { ArraySizeOptionalArgParserService } from './parameters/parsers/array-size.parser.service';

export class DI {
  static registerServices() {
      Container.set([
        { id: 'service.settings', value: new OfficeSettingsService() },
        { id: 'service.cache', value: new BrowserSessionCacheService() },
        { id: 'service.parser.date', value: new DateParserService() }
      ]);

      Container.set([
        { id: 'service.parser.arg', value: new PrintDirectionParameterService() },
        { id: 'service.parser.arg', value: new ArrayDataVerticalPrinterService() },
        { id: 'service.parser.arg', value: new ArrayDataHorizontalPrinterService() },
        { id: 'service.parser.arg', value: new ArraySizeOptionalArgParserService() },
        { id: 'service.parser.arg', value: new PrecipitationFieldService() }
      ]);

      Container.set([
        { id: 'service.parser.arg.size', value: new ArrayColSizeOptionalArgParserService() },
        { id: 'service.parser.arg.size', value: new ArrayRowSizeOptionalArgParserService() }
      ]);

      Container.set([
        { id: 'dir', value: new PrintDirectionParameterService() }
      ]);

      Container.set([
        { id: 'v', value: new ArrayDataVerticalPrinterService() },
        { id: 'h', value: new ArrayDataHorizontalPrinterService() }
      ]);
      
      Container.set([
        { id: 'cols', value: new ArrayColSizeOptionalArgParserService() },
        { id: 'rows', value: new ArrayRowSizeOptionalArgParserService() }
      ]);

      Container.set([
        { id: 'precip', value: new PrecipitationFieldService() }
      ]);
  }

  // static hasService(id: string): boolean {
  //   return Container.has(id);
  // }

  // static getService<T>(id: string): T {
  //     return Container.get<T>(id);
  // }

  // static getService<T>(type: T): T {
  //   return Container.get<T>(typeof type);
  // }
}