import { CommandType } from './types'

export interface ICalculatorState {
  readonly displayValue: number
  handleDigit(digit: number): ICalculatorState
  add(): ICalculatorState
  multiply(): ICalculatorState
  subtract(): ICalculatorState
  divide(): ICalculatorState
  calculate(): ICalculatorState
}

export class OperatorPendingCalculatorState implements ICalculatorState {
  constructor(private readonly firstOperand: number) {}

  get displayValue(): number {
    return this.firstOperand
  }

  add() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Add,
    )
  }

  subtract() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Subtract,
    )
  }

  divide() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Divide,
    )
  }

  multiply() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Multiply,
    )
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
    private readonly commandType: CommandType,
  ) {}

  get displayValue(): number {
    return this.firstOperand
  }

  add() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Add,
    )
  }

  subtract() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Subtract,
    )
  }

  divide() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Divide,
    )
  }

  multiply() {
    return new SecondOperandPendingCalculatorState(
      this.firstOperand,
      CommandType.Multiply,
    )
  }

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.commandType,
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
    private readonly commandType: CommandType,
    private readonly secondOperand: number,
  ) {}

  get displayValue(): number {
    return this.secondOperand
  }

  add() {
    return this.calculate(CommandType.Add)
  }

  multiply() {
    return this.calculate(CommandType.Multiply)
  }

  subtract() {
    return this.calculate(CommandType.Subtract)
  }

  divide() {
    return this.calculate(CommandType.Divide)
  }

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.commandType,
      this.secondOperand * 10 + digit,
    )
  }

  calculate(commandType: CommandType = this.commandType) {
    const firstOperand = (() => {
      switch (this.commandType) {
        case CommandType.Add:
          return this.firstOperand + this.secondOperand

        case CommandType.Subtract:
          return this.firstOperand - this.secondOperand

        case CommandType.Multiply:
          return this.firstOperand * this.secondOperand

        case CommandType.Divide:
          return this.firstOperand / this.secondOperand

        default:
          throw new Error(`Invalid command type ${this.commandType}`)
      }
    })()

    return new SecondOperandPendingCalculatorState(firstOperand, commandType)
  }
}
