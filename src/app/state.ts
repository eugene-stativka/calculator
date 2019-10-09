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
    return new SecondOperandPendingCalculatorState(this.displayValue, operator)
  }
}

class SecondOperandPendingCalculatorState extends CalculatorState {
  constructor(
    public readonly displayValue: number,
    private readonly operator: OperatorType,
  ) {
    super()
  }

  protected handleCalculate() {
    return this
  }

  protected handleDigit(digit: number) {
    return new CalculationPendingCalculatorState({
      displayValue: digit,
      firstOperand: this.displayValue,
      operator: this.operator,
      secondOperand: digit,
    })
  }

  protected handleOperator(operator: OperatorType) {
    return new SecondOperandPendingCalculatorState(this.displayValue, operator)
  }
}

class CalculationPendingCalculatorState extends CalculatorState {
  constructor(
    private readonly params: Readonly<{
      displayValue: number
      firstOperand: number
      operator: OperatorType
      secondOperand: number
      prioritizedOperator?: OperatorType.Multiply | OperatorType.Divide
    }>,
  ) {
    super()
  }

  get displayValue(): number {
    return this.params.displayValue
  }

  protected handleDigit(digit: number) {
    if (this.params.prioritizedOperator) {
      return new CalculationPendingCalculatorState({
        displayValue: digit,
        firstOperand: this.params.firstOperand,
        operator: this.params.operator,
        secondOperand: doMath(
          this.params.secondOperand,
          this.params.prioritizedOperator,
          digit,
        ),
      })
    }

    return new CalculationPendingCalculatorState({
      displayValue: digit,
      firstOperand: this.params.firstOperand,
      operator: this.params.operator,
      secondOperand: this.params.secondOperand * 10 + digit,
    })
  }

  protected handleOperator(operator: OperatorType) {
    if (operator === OperatorType.Add || operator === OperatorType.Subtract) {
      return new SecondOperandPendingCalculatorState(
        this.calculatedResult,
        operator,
      )
    }
    return new CalculationPendingCalculatorState({
      displayValue: this.displayValue,
      firstOperand: this.params.firstOperand,
      operator: this.params.operator,
      secondOperand: this.params.secondOperand,
      prioritizedOperator: operator,
    })
  }

  protected handleCalculate() {
    return new OperatorPendingCalculatorState(this.calculatedResult)
  }

  private get calculatedResult(): number {
    return doMath(
      this.params.firstOperand,
      this.params.operator,
      this.params.secondOperand,
    )
  }
}

function doMath(
  firstOperand: number,
  operator: OperatorType,
  secondOperand: number,
) {
  switch (operator) {
    case OperatorType.Add:
      return firstOperand + secondOperand

    case OperatorType.Subtract:
      return firstOperand - secondOperand

    case OperatorType.Multiply:
      return firstOperand * secondOperand

    case OperatorType.Divide:
      return firstOperand / secondOperand

    default:
      throw new Error(`Invalid operator type ${operator}`)
  }
}

export const DEFAULT_CALCULATOR_STATE = new OperatorPendingCalculatorState(0)
