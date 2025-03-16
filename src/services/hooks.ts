// import 'reflect-metadata';

import { Container } from 'typedi';
import { IWeatherResultsStoreService } from '../types/services/weather.result.store.service.type';
import { IJobsProcessorService } from '../types/services/jobs/jobs-processor.service.type';
import { WeatherObservableService } from './observables/weather.observable.service';
import { IMacroCounterService } from '../types/services/macro.counter.service.type';

export type InitHooksOverrideType = () => Promise<void>;

var isHooksInit = false;

export class Hooks {
  static initHooksOverride: InitHooksOverrideType | null = null;

  static async init() {
    if (!isHooksInit) {
      if (Hooks.initHooksOverride) {
        await Hooks.initHooksOverride();
      } else {
        await Hooks.initOnWorkbookCalcCompleteHook();
      }

      isHooksInit = true;
    }
  }

  static async onWorkbookCalcComplete(event: Excel.WorksheetCalculatedEventArgs) {
    const weatherObservableService = Container.get<WeatherObservableService>('service.observable.weather');
    const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');
    const macroCounterService = Container.get<IMacroCounterService>('service.counter.macro');

    if (weatherObservableService.getCount() === 0 && jobsProcessorService.getCount() === 0 && macroCounterService.getCount() === 0) {
        const weatherResultsStore = Container.get<IWeatherResultsStoreService>('service.results.store.weather');

        if (!weatherResultsStore) {
            throw new Error();
        }

        weatherResultsStore.clear();
    }
  }

  static async initOnWorkbookCalcCompleteHook() {
    await Excel.run(async (context) => {
      const worksheets = context.workbook.worksheets;
      worksheets.onCalculated.add(Hooks.onWorkbookCalcComplete);
  
      await context.sync();
    });
  }
}