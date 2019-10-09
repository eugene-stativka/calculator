import { Command, CommandType, OperatorType } from './types'
import { assertNever } from './helpers'

export abstract class CalculatorState {
  abstract readonly displayValue: number

  handleCommand(command: Command): CalculatorState {
    switch (command.type) {
      case CommandType.ToggleNumberSign:
      case CommandType.Percent:
      case CommandType.Decimal:
        return this

      case CommandType.Reset:
        return DEFAULT_CALCULATOR_STATE

      case CommandType.Calculate:
        return this.handleCalculate()

      case CommandType.Digit:
        return this.handleDigit(command.value)

      case CommandType.Operator:
        return this.handleOperator(command.value)

      default:
        return assertNever(command)
    }
  }

  protected abstract handleCalculate(): CalculatorState
  protected abstract handleDigit(digit: number): CalculatorState
  protected abstract handleOperator(operator: OperatorType): CalculatorState
}

class OperatorPendingCalculatorState extends CalculatorState {
  constructor(public readonly displayValue: number) {
    super()
  }

  protected handleCalculate() {
    return this
  }

  protected handleDigit(digit: number) {
    return new OperatorPendingCalculatorState(this.displayValue * 10 + digit)
  }

  protected handleOperator(operator: OperatorType) {
    return new SecondOperandPendingCalculatorState(this.displayValue, {
      type: CommandType.Operator,
      value: operator,
    })
  }
}

class SecondOperandPendingCalculatorState extends CalculatorState {
  constructor(
    public readonly displayValue: number,
    private readonly command: Command,
  ) {
    super()
  }

  protected handleCalculate() {
    return this
  }

  protected handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.displayValue,
      this.command,
      digit,
    )
  }

  protected handleOperator(operator: OperatorType) {
    return new SecondOperandPendingCalculatorState(this.displayValue, {
      type: CommandType.Operator,
      value: operator,
    })
  }
}

class CalculationPendingCalculatorState extends CalculatorState {
  constructor(
    private readonly firstOperand: number,
    private readonly command: Command,
    public readonly displayValue: number,
  ) {
    super()
  }

  protected handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.command,
      this.displayValue * 10 + digit,
    )
  }

  protected handleOperator(operator: OperatorType) {
    if (operator === OperatorType.Add || operator === OperatorType.Subtract) {
      return this.handleCalculate({
        type: CommandType.Operator,
        value: operator,
      })
    }

    return this.handleCalculate({
      type: CommandType.Operator,
      value: operator,
    })
  }

  protected handleCalculate(command: Command = this.command) {
    if (this.command.type !== CommandType.Operator) {
      throw new Error(
        'Invalid state! CalculationPendingCalculatorState should have only Operator command type',
      )
    }

    const firstOperand = (() => {
      switch (this.command.value) {
        case OperatorType.Add:
          return this.firstOperand + this.displayValue

        case OperatorType.Subtract:
          return this.firstOperand - this.displayValue

        case OperatorType.Multiply:
          return this.firstOperand * this.displayValue

        case OperatorType.Divide:
          return this.firstOperand / this.displayValue

        default:
          throw new Error(`Invalid operator type ${this.command.value}`)
      }
    })()

    return new SecondOperandPendingCalculatorState(firstOperand, command)
  }
}

export const DEFAULT_CALCULATOR_STATE = new OperatorPendingCalculatorState(0)
