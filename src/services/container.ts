import { Container } from 'typedi';
import { ICache } from '../types/cache/cache.type';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { PrecipitationFieldService } from './fields/precipitation.field.service';
import { PrintDirectionParameterService } from './parameters/print-direction.parameter-processor.service';
import { ArrayDataVerticalPrinterService } from './printers/vertical.printer.service';
import { ArrayDataHorizontalPrinterService } from './printers/horizontal.printer.service';
import { ColumnsParameterService } from './parameters/columns.parameter-processor.service';
import { RowsParameterService } from './parameters/rows.parameter-processor.service';
import { ISettings } from '../types/settings/settings.type';
import { OfficeSettingsService } from './settings/office-settings.service';
import { WeatherObserverService } from './observers/weather.observer.service';
import { IDateService } from '../types/dates/date-service.type';
import { DateService } from './dates/date.service';

export class DI {
  static registerServices() {
      Container.set<ICache>({ value: new BrowserSessionCacheService() });
      Container.set<ISettings>({ value: new OfficeSettingsService() });
      Container.set<IDateService>({ value: new DateService() });

      Container.set({ value: new WeatherObserverService() });

      Container.set([
        { id: 'dir', value: new PrintDirectionParameterService() }
      ]);

      Container.set([
        { id: 'v', value: new ArrayDataVerticalPrinterService() },
        { id: 'h', value: new ArrayDataHorizontalPrinterService() }
      ]);

      Container.set([
        { id: 'cols', value: new ColumnsParameterService() },
        { id: 'rows', value: new RowsParameterService() }
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