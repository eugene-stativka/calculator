import { Command, CommandType, OperatorType } from './types'

export interface ICalculatorState {
  readonly displayValue: number
  handleDigit(digit: number): ICalculatorState
  handleOperator(operatorType: OperatorType): ICalculatorState
  calculate(): ICalculatorState
}

export class OperatorPendingCalculatorState implements ICalculatorState {
  constructor(private readonly firstOperand: number) {}

  get displayValue(): number {
    return this.firstOperand
  }

  handleOperator(operatorType: OperatorType) {
    return new SecondOperandPendingCalculatorState(this.firstOperand, {
      type: CommandType.Operator,
      value: operatorType,
    })
  }

  handleDigit(digit: number) {
    return new OperatorPendingCalculatorState(this.firstOperand * 10 + digit)
  }

  calculate() {
    return this
  }
}

export class SecondOperandPendingCalculatorState implements ICalculatorState {
  constructor(
    private readonly firstOperand: number,
    private readonly command: Command,
  ) {}

  get displayValue(): number {
    return this.firstOperand
  }

  handleOperator(operatorType: OperatorType) {
    return new SecondOperandPendingCalculatorState(this.firstOperand, {
      type: CommandType.Operator,
      value: operatorType,
    })
  }

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.command,
      digit,
    )
  }

  calculate() {
    return this
  }
}

export class CalculationPendingCalculatorState implements ICalculatorState {
  constructor(
    private readonly firstOperand: number,
    private readonly command: Command,
    private readonly secondOperand: number,
  ) {}

  get displayValue(): number {
    return this.secondOperand
  }

  handleOperator(operatorType: OperatorType) {
    return this.calculate({ type: CommandType.Operator, value: operatorType })
  }

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.command,
      this.secondOperand * 10 + digit,
    )
  }

  calculate(command: Command = this.command) {
    if (this.command.type !== CommandType.Operator) {
      throw new Error(
        'Invalid state! CalculationPendingCalculatorState should have only Operator command type',
      )
    }

    const firstOperand = (() => {
      switch (this.command.value) {
        case OperatorType.Add:
          return this.firstOperand + this.secondOperand

        case OperatorType.Subtract:
          return this.firstOperand - this.secondOperand

        case OperatorType.Multiply:
          return this.firstOperand * this.secondOperand

        case OperatorType.Divide:
          return this.firstOperand / this.secondOperand

        default:
          throw new Error(`Invalid operator type ${this.command.value}`)
      }
    })()

    return new SecondOperandPendingCalculatorState(firstOperand, command)
  }
}
