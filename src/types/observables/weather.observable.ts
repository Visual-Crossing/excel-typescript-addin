import { WeatherArgs } from "src/helpers/helpers.args";
import { Observable } from "./observable";
import { getCacheItem } from "src/cache/cache";
import { generateArrayData } from "src/helpers/helpers.array-data";
import { addJob } from "src/helpers/helpers.jobs";
import { PrintJob } from "../job";

export class WeatherObservable extends Observable<WeatherArgs> {
    private constructor() {
        super();

        this.onValidate = ((observer: WeatherArgs) => { 
            if (observer && observer.Invocation && observer.Invocation.address) { 
                return true; 
            } else { 
                return false;
            } 
        });

        this.onUpdate = ((observer: WeatherArgs) => { 
            const cacheItem = getCacheItem(observer.CacheId);

            if (cacheItem) {
                const cacheItemString = cacheItem as string;

                if (cacheItemString) {
                    const cacheItemObject = JSON.parse(cacheItemString);

                    if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                        const arrayData: any[] | null = generateArrayData(observer, cacheItemObject.values);

                        if (arrayData && arrayData.length > 0){
                            addJob(new PrintJob(observer.OriginalFormula, arrayData, observer.Printer, observer.SheetColumnCount!, observer.SheetRowCount!, observer.Invocation));
                        }
                    }
                }
            }
        });
    }
}