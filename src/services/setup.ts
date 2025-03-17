// import 'reflect-metadata';

import { Container } from 'typedi';
import { VerticalPrinterOptionalArgParserService } from './parsers/optional-args/printers/vertical-printer.parser.service';
import { ArrayColSizeOptionalArgParserService } from './parsers/optional-args/array-size/array-col-size.parser.service';
import { ArrayRowSizeOptionalArgParserService } from './parsers/optional-args/array-size/array-row-size.parser.service';
import { OfficeSettingsService } from './settings/office-settings.service';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { ErrorParserService } from './parsers/error.parser.service';
import { DateParserService } from './parsers/date.parser.service';
import { ArraySizeOptionalArgParserService } from './parsers/optional-args/array-size/array-size.parser.service';
import { HorizontalPrinterOptionalArgParserService } from './parsers/optional-args/printers/horizontal-printer.parser.service';
import { HeaderNOptionalArgParserService } from './parsers/optional-args/headers/headers-n.parser.service';
import { HeaderYOptionalArgParserService } from './parsers/optional-args/headers/headers-y.parser.service';
import { WeatherObserverService } from './observers/weather.observer.service';
import { JobsProcessorService } from './jobs/jobs-processor.service';
import { MacroJobService } from './jobs/macro.job.service';
import { CleanUpJobService } from './jobs/cleanup.job.service';
import { FormulaUpdaterService } from './updaters/formula.updater.service';
import { MetadataService } from './metadata/metadata.service';
import { WeatherResult } from './weather/weather.result.service';
import { PrintJobService } from './jobs/print.job.service';
import { WeatherObservableService } from './observables/weather.observable.service';
import { WeatherRequest } from './weather/weather.request.service';
import { WeatherObserver } from '../types/weather.observer.type';
import { WeatherResultsStore } from './weather.result.store.service';
import { MacroCounterService } from './macro.counter.service';

import { PrecipitationFieldService } from './fields/precipitation.field.service';

export type RegisterServicesOverrideType = () => void;

export class Setup {
  static registerServicesOverride: RegisterServicesOverrideType | null = null;

  static init() {
    if (!Container.has('service.settings')) {
      if (Setup.registerServicesOverride) {
        Setup.registerServicesOverride();
      } else {
        Setup.registerServices();
      }
    }
  }

  static registerServices() {
      Container.set([
        { id: 'service.settings', value: new OfficeSettingsService() },
        { id: 'service.cache', value: new BrowserSessionCacheService() },
        { id: 'service.parser.error', value: new ErrorParserService() },
        { id: 'service.parser.date', value: new DateParserService() },
        { id: 'service.observer.weather', value: new WeatherObserverService() },
        { id: 'service.observable.weather', value: new WeatherObservableService() }
      ]);

      Container.set([
        { id: 'service.parser.arg', value: new VerticalPrinterOptionalArgParserService(), multiple: true },
        { id: 'service.parser.arg', value: new HorizontalPrinterOptionalArgParserService(), multiple: true },
        { id: 'service.parser.arg', value: new ArraySizeOptionalArgParserService(), multiple: true },
        { id: 'service.parser.arg', value: new HeaderYOptionalArgParserService(), multiple: true },
        { id: 'service.parser.arg', value: new HeaderNOptionalArgParserService(), multiple: true },
      ]);

      Container.set([
        { id: 'service.parser.arg.size', value: new ArrayColSizeOptionalArgParserService(), multiple: true },
        { id: 'service.parser.arg.size', value: new ArrayRowSizeOptionalArgParserService(), multiple: true }
      ]);

      Container.set([
        { id: 'service.jobs.processor', value: new JobsProcessorService<CustomFunctions.Invocation>() }
      ]);

      Container.set([
        { id: 'service.counter.macro', value: new MacroCounterService() }
      ]);

      Container.set([
        { id: 'service.job.macro', value: new MacroJobService, transient: true },
        { id: 'service.job.cleanup', value: new CleanUpJobService() },
        { id: 'service.job.print', value: new PrintJobService() }
      ]);

      Container.set([
        { id: 'service.updater.formula', value: new FormulaUpdaterService() }
      ]);

      Container.set([
        { id: 'service.metadata', value: new MetadataService() }
      ]);

      Container.set([
        { id: 'service.requests.weather', value: new WeatherRequest() },
        { id: 'service.results.weather', value: new WeatherResult() },
        { id: 'service.results.store.weather', value: new WeatherResultsStore() }
      ]);

      Container.set([
        { id: 'precip', value: new PrecipitationFieldService() }
      ]);
  }
}