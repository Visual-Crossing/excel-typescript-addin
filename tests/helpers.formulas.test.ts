import { extractFormulaArgsSection, replaceOrInsertArgs } from '../src/helpers/helpers.formulas';

describe('getFormulaArgsSection Tests', () => {
  test('Formula with args should return args with quotes', () => {
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=h;cols=1;rows=5;\")")).toBe("\"dir=h;cols=1;rows=5;\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=h;\")")).toBe("\"dir=h;\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=h\")")).toBe("\"dir=h\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=\" & $A$1 & \";cols=1;rows=5;\")")).toBe("\"dir=\" & $A$1 & \";cols=1;rows=5;\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", IF(C9=\"v\", \"dir=v\", \"dir=h\"))")).toBe("IF(C9=\"v\", \"dir=v\", \"dir=h\")");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", IF(OR(C9=\"v\", C9=\"vertical\"), \"dir=v\", \"dir=h\"))")).toBe("IF(OR(C9=\"v\", C9=\"vertical\"), \"dir=v\", \"dir=h\")");
  });
});

describe('replaceOrInsertArgs Tests', () => {
  test('Replace existing arg should update the value', () => {
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "cols", "cols=5;")).toBe("\"dir=h;cols=5;rows=5;\"");
    expect(replaceOrInsertArgs("\"dir=h;cols =1;rows=5;\"", "cols", "cols=5;")).toBe("\"dir=h;cols=5;rows=5;\"");
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "rows", "rows=1;")).toBe("\"dir=h;cols=1;rows=1;\"");
    expect(replaceOrInsertArgs("\"dir=h;cols=1;rows=5;\"", "dir", "dir=v;")).toBe("\"dir=v;cols=1;rows=5;\"");
    expect(replaceOrInsertArgs("\"dir=\" & $A$1 & \";cols=1;rows=5;\"", "cols", "cols=3;")).toBe("\"dir=\" & $A$1 & \";cols=3;rows=5;\"");
    expect(replaceOrInsertArgs("IF(OR(C9=\"v\", C9=\"vertical\"), \"dir=v;cols=1;rows=3;\", \"dir=h;cols=1;rows=3;\")", "cols", "cols=3;")).toBe("IF(OR(C9=\"v\", C9=\"vertical\"), \"dir=v;cols=3;rows=3;\", \"dir=h;cols=3;rows=3;\")");
  });

  test('Replace existing arg without the trailing semi-colon should update the value and add a trailing semi-colon', () => {
    expect(replaceOrInsertArgs("\"dir=h\"", "dir", "dir=v;")).toBe("\"dir=v;\"");
  });

  test('Insert new arg should append the arg at the end', () => {
    expect(replaceOrInsertArgs("\"dir=h;rows=5;\"", "cols", "cols=5;")).toBe("\"dir=h;rows=5;cols=5;\"");
    expect(replaceOrInsertArgs("\"dir=h;rows=5;   \"", "cols", "cols=5;")).toBe("\"dir=h;rows=5;   cols=5;\"");
  });

  test('Insert new arg without the trailing semi-colon should insert the new arg and value and add a trailing semi-colon', () => {
    expect(replaceOrInsertArgs("\"dir=h\"", "cols", "cols=1;")).toBe("\"dir=h;cols=1;\"");
  });
});