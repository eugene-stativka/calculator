import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core'
import { Subject } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  scan,
  share,
  startWith,
} from 'rxjs/operators'
import { Command, CommandType, KeyCode, OperatorType } from './types'
import { ICalculatorState, OperatorPendingCalculatorState } from './state'
import { ReactiveComponent } from './reactive.component'

@Component({
  selector: 'calc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends ReactiveComponent {
  readonly state: Readonly<{ displayValue: number }>

  private readonly command$ = new Subject<Command>()

  constructor() {
    super()

    const state$ = this.command$.pipe(
      scan<Command, ICalculatorState>(
        (prevState, command) => prevState.handleCommand(command),
        new OperatorPendingCalculatorState(0),
      ),
      distinctUntilChanged(),
      share(),
    )

    this.state = this.connect({
      displayValue: state$.pipe(
        map(state => state.displayValue),
        startWith(0),
        distinctUntilChanged(),
      ),
    })
  }

  reset() {
    this.command$.next({ type: CommandType.Reset })
  }

  toggleNumberSign() {
    this.command$.next({ type: CommandType.Reset })
  }

  percent() {
    this.command$.next({ type: CommandType.Percent })
  }

  divide() {
    this.command$.next({
      type: CommandType.Operator,
      value: OperatorType.Divide,
    })
  }

  handleDigit(value: number) {
    this.command$.next({ type: CommandType.Digit, value })
  }

  multiply() {
    this.command$.next({
      type: CommandType.Operator,
      value: OperatorType.Multiply,
    })
  }

  subtract() {
    this.command$.next({
      type: CommandType.Operator,
      value: OperatorType.Subtract,
    })
  }

  add() {
    this.command$.next({ type: CommandType.Operator, value: OperatorType.Add })
  }

  decimal() {
    this.command$.next({ type: CommandType.Decimal })
  }

  calculate() {
    this.command$.next({ type: CommandType.Calculate })
  }

  @HostListener('document:keypress', ['$event.keyCode'])
  handleKeyPress(keyCode: number) {
    switch (true) {
      case KeyCode.Zero <= keyCode && keyCode <= KeyCode.Nine:
        this.handleDigit(keyCode - 48)
        break

      case keyCode === KeyCode.Star:
        this.multiply()
        break

      case keyCode === KeyCode.Plus:
        this.add()
        break

      case keyCode === KeyCode.Minus:
        this.subtract()
        break

      case keyCode === KeyCode.Slash:
        this.divide()
        break

      case keyCode === KeyCode.Percent:
        this.percent()
        break

      case keyCode === KeyCode.Coma:
        this.decimal()
        break

      case keyCode === KeyCode.Enter || keyCode === KeyCode.Equals:
        this.calculate()
        break
    }
  }

  // Esc key on MacBook's TouchBar works only with keydown event
  @HostListener('document:keydown', ['$event.keyCode'])
  handleKeyDown(keyCode: number) {
    if (keyCode === KeyCode.Esc) {
      this.reset()
    }
  }
}
