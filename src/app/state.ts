import { CommandType } from './types'

export interface ICalculatorState {
  readonly displayValue: number
  handleDigit(digit: number): ICalculatorState
  add(): ICalculatorState
  // subtract()
  // multiply()
  // divide()
  // calculate()
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

  handleDigit(digit: number) {
    return new OperatorPendingCalculatorState(this.firstOperand * 10 + digit)
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

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.commandType,
      digit,
    )
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
    return new SecondOperandPendingCalculatorState(
      this.firstOperand + this.secondOperand,
      CommandType.Add,
    )
  }

  handleDigit(digit: number) {
    return new CalculationPendingCalculatorState(
      this.firstOperand,
      this.commandType,
      this.secondOperand * 10 + digit,
    )
  }
}
