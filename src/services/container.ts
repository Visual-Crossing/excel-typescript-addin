import { Container } from 'typedi';
import { PrecipitationFieldService } from './fields/precipitation.field.service';
import { VerticalPrinterOptionalArgParserService } from './optional-args/parsers/printers/vertical-printer.parser.service';
import { ArrayColSizeOptionalArgParserService } from './optional-args/parsers/array-size/array-col-size.parser.service';
import { ArrayRowSizeOptionalArgParserService } from './optional-args/parsers/array-size/array-row-size.parser.service';
import { OfficeSettingsService } from './settings/office-settings.service';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { DateParserService } from './dates/date.parser.service';
import { ArraySizeOptionalArgParserService } from './optional-args/parsers/array-size/array-size.parser.service';
import { HorizontalPrinterOptionalArgParserService } from './optional-args/parsers/printers/horizontal-printer.parser.service';

export class DI {
  static registerServices() {
      Container.set([
        { id: 'service.settings', value: new OfficeSettingsService() },
        { id: 'service.cache', value: new BrowserSessionCacheService() },
        { id: 'service.parser.date', value: new DateParserService() }
      ]);

      Container.set([
        { id: 'service.parser.arg', value: new VerticalPrinterOptionalArgParserService() },
        { id: 'service.parser.arg', value: new HorizontalPrinterOptionalArgParserService() },
        { id: 'service.parser.arg', value: new ArraySizeOptionalArgParserService() },
        { id: 'service.parser.arg', value: new PrecipitationFieldService() }
      ]);

      Container.set([
        { id: 'service.parser.arg.size', value: new ArrayColSizeOptionalArgParserService() },
        { id: 'service.parser.arg.size', value: new ArrayRowSizeOptionalArgParserService() }
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