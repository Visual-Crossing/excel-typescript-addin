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

export function replaceOrInsertArgs(args: string, argName: string, replaceValue: string): string {
    const argNamePos: number = args.indexOf(argName);

    if (argNamePos === -1) {
        const argsWithoutSpaces: string =  args.replace(" ", "");
        const lastChar: string = argsWithoutSpaces.substring(argsWithoutSpaces.length - 1, argsWithoutSpaces.length);

        if (lastChar === '\"') {
            const secondLastChar: string = argsWithoutSpaces.substring(argsWithoutSpaces.length - 2, argsWithoutSpaces.length - 1);

            if (secondLastChar === ";") {
                let char: string | null = null;
                let index: number = args.length;

                do {
                    index--;
                    char = args.substring(index, index + 1)
                } while (char !== ";" && index > 0)

                return `${args.substring(0, index + 1)}${replaceValue}\"`;
            }
            else {
                let char: string | null = null;
                let index: number = args.length;

                do {
                    index--;
                    char = args.substring(index, index + 1)
                } while (char !== "\"" && index > 0)

                return `${args.substring(0, index)};${replaceValue}\"`;
            }
        }
        else {
            return  `${args} & \";${replaceValue}\"`;
        }
    }

    let argEndPos: number = args.indexOf(";", argNamePos);

    if (argEndPos === -1) {
        argEndPos = args.indexOf("\"", argNamePos) - 1;
    }

    return args.replace(args.substring(argNamePos, argEndPos + 1), replaceValue);
}

export function extractFormulaArgsSection(formula: string): string | null {
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
                return trimmedFormula.substring(index + 1, trimmedFormula.length - 1);
            }
        }
    }

    return null;
}