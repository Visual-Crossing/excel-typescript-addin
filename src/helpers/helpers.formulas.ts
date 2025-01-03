import { PrintDirections, WeatherObserver } from "./helpers.args";

export function getArrayDataCols(values: any[], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return values.length;
    }
    else {
        return 1;
    }
}

export function getArrayDataRows(values: any[], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return 1;
    }
    else {
        return values.length;
    }
}

function checkAndFixArgsSyntax(args: string): string {
    let char: string | null = null;
    let index: number = args.length;

    do {
        index--;
        char = args.substring(index, index + 1)
    } while (char !== "\"" && index > 0)

    if (char === "\"" && index > 0) {
        do {
            index--;
            char = args.substring(index, index + 1)
        } while (char === " " && index > 0)

        if (char !== ";" && index > 0) {
            if (index + 1 < args.length - 1) {
                return `${args.substring(0, index + 1)};${args.substring(index + 1, args.length)}`;
            }
            else {
                return `${args.substring(0, index + 1)};\"`;
            }
        }
    }

    return args;
}

export function replaceOrInsertArgs(args: string, argName: string, replaceValue: string): string {
    const argsWithoutSpaces: string =  args.replace(" ", "");
    const lastChar: string = argsWithoutSpaces.substring(argsWithoutSpaces.length - 1, argsWithoutSpaces.length);
    
    if (lastChar === '\"') {
        args = checkAndFixArgsSyntax(args);
    }

    let argNameFoundCount: number = 0;
    let argNamePos: number = -1;

    do {
        argNamePos = args.indexOf(argName, argNamePos + 1);

        if (argNamePos === -1 && argNameFoundCount === 0) {
            if (lastChar === '\"') {
                return `${args.substring(0, args.length - 1)}${replaceValue}\"`;
            }
            else {
                return  `${args} & \";${replaceValue}\"`;
            }
        }
        else if (argNamePos !== -1) {
            argNameFoundCount++;

            let argEndPos: number = args.indexOf(";", argNamePos);
            args = args.replace(args.substring(argNamePos, argEndPos + 1), replaceValue);
        }
    } while (argNamePos !== -1)

    return args;
}

/*
* We need to extract the args section of the formula and cannot simply use the value passed into the VC.Weather function.
* This is because it might consist of other functions i.e it may not simply be a raw value.
* The args parameter must be the last parameter for this implementation to work correctly. 
*/
export function extractFormulaArgsSection(formula: string): string | null {
    if (!formula) {
        throw new Error("Invalid formula.");
    }

    const trimmedFormula = formula.trim();
    let index: number = trimmedFormula.length;

    let openBracketsCount: number = 0, closeBracketsCount: number = 0, doubleQuotesCount: number = 0;

    while (index > 1) {
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
                return trimmedFormula.substring(index + 1, trimmedFormula.length - 1);
            }
        }
    }

    return null;
}

export function getUpdatedFormula(weatherObserver: WeatherObserver, arrayCols: number, arrayRows: number): string {
    if (weatherObserver && weatherObserver.OptionalArg1 && weatherObserver.OriginalFormula) {
        const formulaArgsSection: string | null = extractFormulaArgsSection(weatherObserver.OriginalFormula);

        if (!formulaArgsSection) {
            throw new Error("Unexpected formula error.");
        }

        let updatedArgs = replaceOrInsertArgs(formulaArgsSection, "cols", `cols=${arrayCols};`);
        updatedArgs = replaceOrInsertArgs(updatedArgs, "rows", `rows=${arrayRows};`);

        const updatedFormula = weatherObserver.OriginalFormula.replace(formulaArgsSection, updatedArgs);
        return updatedFormula;
    }
    else if (weatherObserver && weatherObserver.OriginalFormula) {
        const originalFormulaTrimmed = weatherObserver.OriginalFormula.trim();
        const updatedFormula = `${originalFormulaTrimmed.substring(0, originalFormulaTrimmed.length - 1)}, "cols=${arrayCols};rows=${arrayRows};")`;

        return updatedFormula;
    }
    else {
        throw new Error("Unexpected error.");
    }
}