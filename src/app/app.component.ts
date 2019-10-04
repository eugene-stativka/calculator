import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core'
import { Observable, Subject } from 'rxjs'
import { distinctUntilChanged, map, scan, share } from 'rxjs/operators'
import { assertNever } from './helpers'
import { Command, CommandType } from './types'
import { ICalculatorState, OperatorPendingCalculatorState } from './state'

@Component({
  selector: 'calc-root',
  template: `
    <main>{{ displayValue$ | async }}</main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly displayValue$: Observable<number>

  private readonly command$ = new Subject<Command>()

  constructor() {
    const state = this.command$.pipe(
      scan<Command, ICalculatorState>((prevState, command) => {
        switch (command.type) {
          case CommandType.Reset:
            return new OperatorPendingCalculatorState(0)

          case CommandType.Calculate: {
            return prevState
          }

          case CommandType.Add:
            return prevState.add()

          case CommandType.Subtract:
            return prevState

          case CommandType.Multiply:
            return prevState

          case CommandType.Divide:
            return prevState

          case CommandType.Digit: {
            return prevState.handleDigit(command.value)
          }

          default:
            return assertNever(command)
        }
      }, new OperatorPendingCalculatorState(0)),
      share(),
    )

    this.displayValue$ = state.pipe(
      map(state => state.displayValue),
      distinctUntilChanged(),
    )
  }

  @HostListener('document:keypress', ['$event.keyCode'])
  handleKeyUp(keyCode: number) {
    switch (true) {
      case 48 <= keyCode && keyCode <= 57:
        this.command$.next({ type: CommandType.Digit, value: keyCode - 48 })
        break

      case keyCode === 42:
        this.command$.next({ type: CommandType.Multiply })
        break

      case keyCode === 43:
        this.command$.next({ type: CommandType.Add })
        break

      case keyCode === 45:
        this.command$.next({ type: CommandType.Subtract })
        break

      case keyCode === 47:
        this.command$.next({ type: CommandType.Divide })
        break

      case keyCode === 27:
        this.command$.next({ type: CommandType.Reset })
        break

      case keyCode === 13 || keyCode === 61:
        this.command$.next({ type: CommandType.Calculate })
        break
    }
  }
}
