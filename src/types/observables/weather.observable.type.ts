import { WeatherObserver } from "src/helpers/helpers.args";
import { Observable } from "./observable.type";
import { getCacheItem } from "src/cache/cache";
import { generateArrayData } from "src/helpers/helpers.array-data";
import { addJob } from "src/helpers/helpers.jobs";
import { PrintJobService } from "src/services/jobs/print.job.service";

export class WeatherObservable extends Observable<WeatherObserver> {
    private constructor() {
        super();

        this.onValidate = ((observer: WeatherObserver) => this.onValidateHandler(observer));
        this.onUpdate = ((observer: WeatherObserver) => this.onUpdateHandler(observer));
    }

    private onValidateHandler(observer: WeatherObserver) {
        if (observer && observer.Invocation && observer.Invocation.address) { 
            return true; 
        } else { 
            return false;
        } 
    }

    private onUpdateHandler(observer: WeatherObserver) {
        if (!observer) {
            return;
        }
        
        const cacheItem = getCacheItem(observer.CacheId);

        if (cacheItem) {
            const cacheItemString = cacheItem as string;

            if (cacheItemString) {
                const cacheItemObject = JSON.parse(cacheItemString);

                if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                    const arrayData: any[] | null = generateArrayData(observer, cacheItemObject.values);

                    if (arrayData && arrayData.length > 0){
                        addJob(new PrintJobService(observer.OriginalFormula, arrayData, observer.Printer, observer.SheetColumnCount!, observer.SheetRowCount!, observer.Invocation));
                    }
                }
            }
        }
    }
}