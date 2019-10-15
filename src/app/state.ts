import { Command, CommandType, Digit, OperatorType } from './types'
import { assertNever } from './helpers'

interface BasicStateParams
  extends Readonly<{
    displayValue: string
  }> {}

export abstract class CalculatorState {
  constructor(protected readonly params: BasicStateParams) {}

  get displayValue(): string {
    return this.params.displayValue
  }

  handleCommand(command: Command): CalculatorState {
    switch (command.type) {
      case CommandType.Percent:
        return this

      case CommandType.ToggleNumberSign:
        return this.handleToggleNumberSign()

      case CommandType.Decimal:
        return this.handleDecimal()

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
  protected abstract handleDigit(digit: Digit): CalculatorState
  protected abstract handleDecimal(): CalculatorState
  protected abstract handleOperator(operator: OperatorType): CalculatorState
  protected abstract handleToggleNumberSign(): CalculatorState
}

class OperatorPendingCalculatorState extends CalculatorState {
  protected handleCalculate() {
    return this
  }

  protected handleDigit(digit: Digit) {
    return new OperatorPendingCalculatorState({
      ...this.params,
      displayValue: this.params.displayValue + digit,
    })
  }

  protected handleDecimal() {
    if (this.params.displayValue.includes(',')) {
      return this
    }

    return new OperatorPendingCalculatorState({
      ...this.params,
      displayValue: (this.params.displayValue || '0') + ',',
    })
  }

  protected handleOperator(operator: OperatorType) {
    return new SecondOperandPendingCalculatorState({
      ...this.params,
      displayValue: this.params.displayValue || '0',
      operator,
    })
  }

  protected handleToggleNumberSign() {
    return new OperatorPendingCalculatorState({
      ...this.params,
      displayValue: (parseFloat(this.params.displayValue) * -1).toString(),
    })
  }
}

class SecondOperandPendingCalculatorState extends CalculatorState {
  constructor(
    protected readonly params: BasicStateParams &
      Readonly<{
        operator: OperatorType
      }>,
  ) {
    super(params)
  }

  protected handleCalculate() {
    return this
  }

  protected handleDigit(digit: Digit) {
    return new CalculationPendingCalculatorState({
      ...this.params,
      displayValue: digit,
      firstOperand: parseDisplayToOperandValue(this.params.displayValue),
      secondOperand: digit,
    })
  }

  protected handleDecimal(): CalculatorState {
    if (this.params.displayValue.includes(',')) {
      return this
    }

    return new OperatorPendingCalculatorState({
      ...this.params,
      displayValue: (this.params.displayValue || '0') + ',',
    })
  }

  protected handleOperator(operator: OperatorType) {
    return new SecondOperandPendingCalculatorState({
      ...this.params,
      operator,
    })
  }

  protected handleToggleNumberSign(): CalculatorState {
    const parsedDisplayValue = parseDisplayToOperandValue(
      this.params.displayValue,
    )

    return new CalculationPendingCalculatorState({
      ...this.params,
      firstOperand: parsedDisplayValue,
      secondOperand: (parseFloat(parsedDisplayValue) * -1).toString(),
    })
  }
}

class CalculationPendingCalculatorState extends CalculatorState {
  constructor(
    protected readonly params: BasicStateParams &
      Readonly<{
        firstOperand: string
        operator: OperatorType
        secondOperand: string
        thirdOperand?: string
        prioritizedOperator?: OperatorType.Multiply | OperatorType.Divide
      }>,
  ) {
    super(params)
  }

  private get calculatedDisplayValue(): string {
    const secondOperand =
      this.params.prioritizedOperator && this.params.thirdOperand
        ? doMath(
            this.params.secondOperand,
            this.params.prioritizedOperator,
            this.params.thirdOperand,
          )
        : this.params.secondOperand

    const result = doMath(
      this.params.firstOperand,
      this.params.operator,
      secondOperand.toString(),
    )

    const decimalPart = result.toString().split(',')[1]

    const processedResult =
      decimalPart && decimalPart.length > 4 ? result.toFixed(4) : result

    return parseOperandToDisplayValue(processedResult.toString())
  }

  protected handleDigit(digit: string) {
    if (this.params.prioritizedOperator) {
      const displayValue = (this.params.thirdOperand || '') + digit

      return new CalculationPendingCalculatorState({
        ...this.params,
        displayValue,
        thirdOperand: displayValue,
      })
    }

    return new CalculationPendingCalculatorState({
      ...this.params,
      displayValue: this.params.displayValue + digit,
      secondOperand: this.params.secondOperand.includes('.')
        ? this.params.secondOperand + digit
        : this.params.secondOperand + '.' + digit,
    })
  }

  protected handleOperator(operator: OperatorType) {
    if (operator === OperatorType.Add || operator === OperatorType.Subtract) {
      return new SecondOperandPendingCalculatorState({
        ...this.params,
        displayValue: this.calculatedDisplayValue,
        operator,
      })
    }
    return new CalculationPendingCalculatorState({
      ...this.params,
      prioritizedOperator: operator,
    })
  }

  protected handleCalculate() {
    return new OperatorPendingCalculatorState({
      ...this.params,
      displayValue: this.calculatedDisplayValue,
    })
  }

  protected handleDecimal() {
    if (
      this.params.prioritizedOperator === undefined &&
      this.params.secondOperand.includes('.')
    ) {
      return this
    }

    return new CalculationPendingCalculatorState({
      ...this.params,
      displayValue: this.displayValue + ',',
    })
  }

  protected handleToggleNumberSign() {
    if (this.params.prioritizedOperator === undefined) {
      const secondOperand = (
        parseFloat(this.params.secondOperand) * -1
      ).toString()

      return new CalculationPendingCalculatorState({
        ...this.params,
        displayValue: parseOperandToDisplayValue(secondOperand),
        secondOperand,
      })
    }

    if (this.params.thirdOperand === undefined) {
      const secondOperand = (
        parseFloat(this.params.secondOperand) * -1
      ).toString()

      return new CalculationPendingCalculatorState({
        ...this.params,
        displayValue: parseOperandToDisplayValue(secondOperand),
        thirdOperand: secondOperand,
      })
    }

    const thirdOperand = (parseFloat(this.params.thirdOperand) * -1).toString()

    return new CalculationPendingCalculatorState({
      ...this.params,
      displayValue: parseOperandToDisplayValue(thirdOperand),
      thirdOperand,
    })
  }
}

function doMath(
  firstOperand: string,
  operator: OperatorType,
  secondOperand: string,
) {
  const firstOperandNumber = parseFloat(firstOperand)
  const secondOperandNumber = parseFloat(secondOperand)

  switch (operator) {
    case OperatorType.Add:
      return firstOperandNumber + secondOperandNumber

    case OperatorType.Subtract:
      return firstOperandNumber - secondOperandNumber

    case OperatorType.Multiply:
      return firstOperandNumber * secondOperandNumber

    case OperatorType.Divide:
      return firstOperandNumber / secondOperandNumber

    default:
      throw new Error(`Invalid operator type ${operator}`)
  }
}

function parseDisplayToOperandValue(displayValue: string): string {
  return displayValue.replace(',', '.')
}

function parseOperandToDisplayValue(displayValue: string): string {
  return displayValue.replace('.', ',')
}

export const DEFAULT_CALCULATOR_STATE = new OperatorPendingCalculatorState({
  displayValue: '',
})
