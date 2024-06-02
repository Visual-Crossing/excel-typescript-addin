import { extractFormulaArgsSection } from '../src/helpers/helpers.formulas';

describe('getFormulaArgsSection Tests', () => {
  test('Formula with args should return args with quotes', () => {
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=h;cols=1;rows=5;\")")).toBe("\"dir=h;cols=1;rows=5;\"");
    expect(extractFormulaArgsSection("=VC.WEATHER(\"London\", \"2024-04-02\", \"dir=\" & $A$1 & \";cols=1;rows=5;\")")).toBe("\"dir=\" & $A$1 & \";cols=1;rows=5;\"");
  });
});