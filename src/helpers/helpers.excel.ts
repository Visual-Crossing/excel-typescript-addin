export async function getCell(address: string, context: Excel.RequestContext): Promise<Excel.Range> {
    const sheet = getSheet(address, context);

    sheet.load();
    await sheet.context.sync();

    const cell = sheet.getRange(address);

    if (!cell) {
        throw new Error(`Unable to get cell address '${address}'.`);
    }
    
    cell.load();
    await cell.context.sync();

    return cell;
}

export async function getSheetColumnsMax(address: string, context: Excel.RequestContext): Promise<number> {
    const sheet = getSheet(address, context);

    sheet.load();
    await sheet.context.sync();

    const range: Excel.Range = sheet.getRange();
    range.load("columnCount");

    await range.context.sync();

    return range.columnCount;
}

export async function getSheetRowsMax(address: string, context: Excel.RequestContext): Promise<number>  {
    const sheet = getSheet(address, context);

    sheet.load();
    await sheet.context.sync();

    const range: Excel.Range = sheet.getRange();
    range.load("rowCount");

    await range.context.sync();

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