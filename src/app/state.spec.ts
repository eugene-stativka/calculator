import { DEFAULT_CALCULATOR_STATE } from './state'
import { CommandType, OperatorType } from './types'

describe('CalculatorState', () => {
  it('should handle 2 + 2', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      })
        .handleCommand({ type: CommandType.Operator, value: OperatorType.Add })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('4')
  })

  it('should handle 3 - 4', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '3',
      })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Subtract,
        })
        .handleCommand({ type: CommandType.Digit, value: '4' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('-1')
  })

  it('should handle 3 * 4', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '3',
      })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Multiply,
        })
        .handleCommand({ type: CommandType.Digit, value: '4' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('12')
  })

  it('should handle 12 / 4', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '1',
      })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Divide,
        })
        .handleCommand({ type: CommandType.Digit, value: '4' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('3')
  })

  it('should handle 0.25 + 1.25', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({ type: CommandType.Decimal })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.Digit, value: '5' })
        .handleCommand({ type: CommandType.Operator, value: OperatorType.Add })
        .handleCommand({ type: CommandType.Digit, value: '1' })
        .handleCommand({ type: CommandType.Decimal })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.Digit, value: '5' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('1,5')
  })

  it('should handle 2 + 2 * 2', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      })
        .handleCommand({ type: CommandType.Operator, value: OperatorType.Add })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Multiply,
        })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('6')
  })

  it('should handle 10 - 2 / 40', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '1',
      })
        .handleCommand({ type: CommandType.Digit, value: '0' })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Subtract,
        })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Divide,
        })
        .handleCommand({ type: CommandType.Digit, value: '4' })
        .handleCommand({ type: CommandType.Digit, value: '0' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('9,95')
  })

  it('should reset', () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      }).handleCommand({ type: CommandType.Reset }).displayValue,
    ).toBe('')
  })

  it("should toggle first operand's sign", () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      }).handleCommand({ type: CommandType.ToggleNumberSign }).displayValue,
    ).toBe('-2')
  })

  it("should toggle second operand's sign", () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      })
        .handleCommand({ type: CommandType.Operator, value: OperatorType.Add })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.ToggleNumberSign })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('0')
  })

  it("should add second operand's sign on sign toggle after operator", () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Operator,
        value: OperatorType.Subtract,
      })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('-2')
  })

  it("should toggle third operand's sign", () => {
    expect(
      DEFAULT_CALCULATOR_STATE.handleCommand({
        type: CommandType.Digit,
        value: '2',
      })
        .handleCommand({ type: CommandType.Operator, value: OperatorType.Add })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({
          type: CommandType.Operator,
          value: OperatorType.Multiply,
        })
        .handleCommand({ type: CommandType.Digit, value: '2' })
        .handleCommand({ type: CommandType.ToggleNumberSign })
        .handleCommand({ type: CommandType.Calculate }).displayValue,
    ).toBe('-2')
  })
})
