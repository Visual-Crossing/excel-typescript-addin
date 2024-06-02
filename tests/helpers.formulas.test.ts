import { extractFormulaArgsSection, replaceOrInsertArgs } from '../src/helpers/helpers.formulas';

describe('getFormulaArgsSection Tests', () => {
  test('Formula with args should return args with quotes', () => {
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=h;cols=1;rows=5;\")")).toBe("\"dir=h;cols=1;rows=5;\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=\" & $A$1 & \";cols=1;rows=5;\")")).toBe("\"dir=\" & $A$1 & \";cols=1;rows=5;\"");
  });
});

describe('replaceOrInsertArgs Tests', () => {
  test('Replace existing arg should update the value', () => {
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "cols", "cols=5;")).toBe("\"dir=h;cols=5;rows=5;\"");
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "rows", "rows=1;")).toBe("\"dir=h;cols=1;rows=1;\"");
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "dir", "dir=v;")).toBe("\"dir=v;cols=1;rows=5;\"");
  });

  test('Insert new arg should append the arg at the end', () => {
    expect(replaceOrInsertArgs("\"dir=h;rows=5;\"", "cols", "cols=5;")).toBe("\"dir=h;rows=5;cols=5;\"");
  });
});