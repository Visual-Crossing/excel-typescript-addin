export function getCell(address: string, context: Excel.RequestContext): Excel.Range {
    const sheet = getSheet(address, context);
    const caller = sheet.getRange(address);

    if (!caller) {
        throw new Error(`Unable to get cell address '${address}'.`);
    }

    return caller;
}

export async function getSheetColumnCount(address: string, context: Excel.RequestContext): Promise<number> {
    const sheet = getSheet(address, context);

    // sheet.load();
    // await context.sync();
    // sheet.getRange().load();
    // await context.sync();
    const range: Excel.Range = sheet.getRange();
    range.load("columnCount");

    await context.sync();

    return range.columnCount;
}

export async function getSheetRowCount(address: string, context: Excel.RequestContext): Promise<number>  {
    const sheet = getSheet(address, context);

    // sheet.load();
    // await context.sync();
    // sheet.getRange().load();
    // await context.sync();
    const range: Excel.Range = sheet.getRange();
    range.load("rowCount");

    await context.sync();

    return range.rowCount;
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