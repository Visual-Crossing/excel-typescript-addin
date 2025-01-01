import { Container } from 'typedi';
import { PrecipitationFieldService } from './fields/precipitation.field.service';
import { VerticalPrinterOptionalArgParserService } from './parsers/optional-args/printers/vertical-printer.parser.service';
import { ArrayColSizeOptionalArgParserService } from './parsers/optional-args/array-size/array-col-size.parser.service';
import { ArrayRowSizeOptionalArgParserService } from './parsers/optional-args/array-size/array-row-size.parser.service';
import { OfficeSettingsService } from './settings/office-settings.service';
import { BrowserSessionCacheService } from './cache/browser-session.cache.service';
import { DateParserService } from './parsers/date.parser.service';
import { ArraySizeOptionalArgParserService } from './parsers/optional-args/array-size/array-size.parser.service';
import { HorizontalPrinterOptionalArgParserService } from './parsers/optional-args/printers/horizontal-printer.parser.service';
import { WeatherObserverService } from './observers/weather.observer.service';
import { JobsProcessorService } from './jobs/jobs-processor.service';
import { FormulaCaptureJobService } from './jobs/formula-capture.job.service';
import { CleanUpJobService } from './jobs/clean-up.job.service';

export type RegisterServicesOverrideType = () => void;

export class Setup {
  static registerServicesOverride: RegisterServicesOverrideType | null = null;

  static registerServices() {
      Container.set([
        { id: 'service.settings', value: new OfficeSettingsService() },
        { id: 'service.cache', value: new BrowserSessionCacheService() },
        { id: 'service.parser.date', value: new DateParserService() },
        { id: 'service.observer.weather', value: new WeatherObserverService() }
      ]);

      Container.set([
        { id: 'service.parser.arg', value: new VerticalPrinterOptionalArgParserService() },
        { id: 'service.parser.arg', value: new HorizontalPrinterOptionalArgParserService() },
        { id: 'service.parser.arg', value: new ArraySizeOptionalArgParserService() },
      ]);

      Container.set([
        { id: 'service.parser.arg.size', value: new ArrayColSizeOptionalArgParserService() },
        { id: 'service.parser.arg.size', value: new ArrayRowSizeOptionalArgParserService() }
      ]);

      Container.set([
        { id: 'service.jobs.processor', value: new JobsProcessorService() }
      ]);

      Container.set([
        { id: 'service.job.formula.capture', value: new FormulaCaptureJobService() },
        { id: 'service.job.cleanup', value: new CleanUpJobService() }
      ]);

      // Container.set([
      //   { id: 'precip', value: new PrecipitationFieldService() }
      // ]);
  }
}