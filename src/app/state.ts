import { Command, CommandType, OperatorType } from './types'
import { assertNever } from './helpers'

export interface ICalculatorState {
  readonly displayValue: number
  handleCommand(command: Command): ICalculatorState
}

export class OperatorPendingCalculatorState implements ICalculatorState {
  constructor(private readonly firstOperand: number) {}

  get displayValue(): number {
    return this.firstOperand
  }

  handleCommand(command: Command): ICalculatorState {
    switch (command.type) {
      case CommandType.ToggleNumberSign:
      case CommandType.Percent:
      case CommandType.Decimal:
      case CommandType.Calculate:
        return this

      case CommandType.Reset:
        return new OperatorPendingCalculatorState(0)

      case CommandType.Digit:
        return new OperatorPendingCalculatorState(
          this.firstOperand * 10 + command.value,
        )

      case CommandType.Operator:
        return new SecondOperandPendingCalculatorState(this.firstOperand, {
          type: CommandType.Operator,
          value: command.value,
        })

      default:
        return assertNever(command)
    }
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

  handleCommand(command: Command): ICalculatorState {
    switch (command.type) {
      case CommandType.ToggleNumberSign:
      case CommandType.Percent:
      case CommandType.Decimal:
      case CommandType.Calculate:
        return this

      case CommandType.Reset:
        return new OperatorPendingCalculatorState(0)

      case CommandType.Digit:
        return new CalculationPendingCalculatorState(
          this.firstOperand,
          this.command,
          command.value,
        )

      case CommandType.Operator:
        return new SecondOperandPendingCalculatorState(this.firstOperand, {
          type: CommandType.Operator,
          value: command.value,
        })

      default:
        return assertNever(command)
    }
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

  handleCommand(command: Command): ICalculatorState {
    switch (command.type) {
      case CommandType.ToggleNumberSign:
      case CommandType.Percent:
      case CommandType.Decimal:
        return this

      case CommandType.Calculate:
        return this.calculate()

      case CommandType.Reset:
        return new OperatorPendingCalculatorState(0)

      case CommandType.Digit:
        return new CalculationPendingCalculatorState(
          this.firstOperand,
          this.command,
          this.secondOperand * 10 + command.value,
        )

      case CommandType.Operator: {
        if (
          command.value === OperatorType.Add ||
          command.value === OperatorType.Subtract
        ) {
          return this.calculate({
            type: CommandType.Operator,
            value: command.value,
          })
        }

        return this.calculate({
          type: CommandType.Operator,
          value: command.value,
        })
      }

      default:
        return assertNever(command)
    }
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
