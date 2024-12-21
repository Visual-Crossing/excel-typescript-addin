import { Container } from 'typedi';
import { ICache } from 'src/types/cache/cache.type';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { PrecipitationFieldService } from './fields/precipitation.field.service';
import { PrintDirectionParameterService } from './parameters/print-direction.parameter-processor.service';
import { ArrayDataVerticalPrinterService } from './printers/vertical.printer.service';
import { ArrayDataHorizontalPrinterService } from './printers/horizontal.printer.service';
import { ColumnsParameterService } from './parameters/columns.parameter-processor.service';
import { RowsParameterService } from './parameters/rows.parameter-processor.service';

export function registerServices() {
    Container.set<ICache>({ value: new BrowserSessionCacheService() });

    // or for named services
    
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

export function hasService(id: string): boolean {
  return Container.has(id);
}

export function getService<T>(id: string): T {
    return Container.get<T>(id);
}