// import 'reflect-metadata';

import { Container } from 'typedi';
import { IWeatherResultsStoreService } from '../types/services/weather.result.store.service.type';

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
    const weatherResultsStore = Container.get<IWeatherResultsStoreService>('service.results.store.weather');

    if (!weatherResultsStore) {
      throw new Error();
    }

    weatherResultsStore.clear();
  }

  static async initOnWorkbookCalcCompleteHook() {
    await Excel.run(async (context) => {
      const worksheets = context.workbook.worksheets;
      worksheets.onCalculated.add(Hooks.onWorkbookCalcComplete);
  
      await context.sync();
    });
  }
}