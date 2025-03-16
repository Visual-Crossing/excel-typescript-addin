import { Service } from 'typedi';
import { IMacroCounterService } from '../types/services/macro.counter.service.type';

@Service()
export class MacroCounterService implements IMacroCounterService {
    private counter: number = 0;

    public add(): void {
        this.counter++;
    }

    public remove(): void {
        this.counter--;
    }
    
    public getCount(): number {
        return this.counter;
    }
}