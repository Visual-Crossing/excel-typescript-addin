export function getCell(address: string, context: Excel.RequestContext): Excel.Range {
    const sheet = getSheet(address, context);
    const caller = sheet.getRange(address);

    if (!caller) {
        throw new Error(`Unable to get cell address '${address}'.`);
    }

    return caller;
}

export function getSheet(address: string, context: Excel.RequestContext): Excel.Worksheet {
    if (!context ||
        !context.workbook ||
        !context.workbook.worksheets) {
            throw new Error("Invalid Excel context.");
    }

    if (!address ||
        !address.includes("!")
    ) {
        throw new Error("Invalid Excel cell address.");
    }

    const sheetName = address.split("!")[0];

    if (!sheetName) {
        throw new Error(`Unable to identify the sheet name for address '${address}'.`);
    }

    const sheet = context.workbook.worksheets.getItem(sheetName);
    
    if (!sheet) {
        throw new Error(`Unable to get sheet '${sheetName}'.`);
    }

    return sheet;
}