// import 'reflect-metadata';

import { Container } from 'typedi';
// import {container} from "tsyringe";
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
import { FormulaUpdaterService } from './updaters/formula.updater.service';
import { MatrixService } from './matrix/matrix.service';
import { PrintJobService } from './jobs/print.job.service';
import { WeatherObservableService } from './observables/weather.observable.service';
import { WeatherRequest } from './requests/weather.request.service';
import { IFormulaCaptureJobService } from '../types/services/jobs/formula-capture.job.service.type';
import { WeatherObserver } from '../types/weather.observer.type';

export type RegisterServicesOverrideType = () => void;

export class Setup {
  static registerServicesOverride: RegisterServicesOverrideType | null = null;

  static initialise() {
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
        { id: 'service.parser.date', value: new DateParserService() },
        { id: 'service.observer.weather', value: new WeatherObserverService() },
        { id: 'service.observable.weather', value: new WeatherObservableService() }
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
        { id: 'service.job.formula.capture', value: new FormulaCaptureJobService, transient: true, multiple: true },
        { id: 'service.job.cleanup', value: new CleanUpJobService() },
        { id: 'service.job.print', value: new PrintJobService() }
      ]);

      // container.register<IFormulaCaptureJobService<WeatherObserver>>('service.job.formula.capture', {
      //   useClass: FormulaCaptureJobService
      // });

      Container.set([
        { id: 'service.updater.formula', value: new FormulaUpdaterService() }
      ]);

      Container.set([
        { id: 'service.matrix', value: new MatrixService() }
      ]);

      Container.set([
        { id: 'service.requests.weather', value: new WeatherRequest() }
      ]);

      //WeatherRequest

      // Container.set([
      //   { id: 'precip', value: new PrecipitationFieldService() }
      // ]);
  }
}