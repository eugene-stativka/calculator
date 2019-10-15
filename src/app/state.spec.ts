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
        .handleCommand({ type: CommandType.Digit, value: '4' }).displayValue,
    ).toBe('4')
  })
})
