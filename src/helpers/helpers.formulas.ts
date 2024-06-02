import { PrintDirections, WeatherArgs } from "./helpers.args";

export function getDataCols(cacheItemJson: any, printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return Object.keys(cacheItemJson).length - 1;
    }
    else {
        return 1;
    }
}

export function getDataRows(cacheItemJson: any, printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return 1;
    }
    else {
        return Object.keys(cacheItemJson).length - 1;
    }
}

export function replaceArgs(formula: string, searchString: string, replaceValue: string): string {
    const argNamePos: number = formula.indexOf(searchString);
    const argEndPos: number = formula.indexOf(";", argNamePos);

    return formula.replace(formula.substring(argNamePos, argEndPos + 1), replaceValue);
}

export function getFormulaArgsSection(formula: string): string | null {
    const trimmedFormula = formula.trim();
    let index: number = trimmedFormula.length;
    let openBracketsCount: number, closeBracketsCount: number, doubleQuotesCount: number;

    openBracketsCount = 0;
    closeBracketsCount = 0;
    doubleQuotesCount = 0;

    while (index > 0) {
        index--;
        const char: string = trimmedFormula.substring(index - 1, index);

        if (char === "(" || char === "[" || char === "{" || char === "<") {
            openBracketsCount++;
        }
        else if (char === ")" || char === "]" || char === "}" || char === ">") {
            closeBracketsCount++;
        }
        else if (char === '\"') {
            doubleQuotesCount++;
        }
        else if (char === ",") {
            if (openBracketsCount === closeBracketsCount && (doubleQuotesCount === 0 || doubleQuotesCount % 2 === 0)) {
                return trimmedFormula.substring(index, trimmedFormula.length - 1);
            }
        }
    }

    return null;
}