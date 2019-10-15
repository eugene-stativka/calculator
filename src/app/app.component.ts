import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core'
import { Meta, MetaDefinition, Title } from '@angular/platform-browser'
import { Subject } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  scan,
  share,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators'
import { Command, CommandType, Digit, KeyCode, OperatorType } from './types'
import { DEFAULT_CALCULATOR_STATE, CalculatorState } from './state'
import { ReactiveComponent } from './reactive.component'

@Component({
  selector: 'calc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent extends ReactiveComponent {
  readonly state: Readonly<{ displayValue: string }>

  private readonly command$ = new Subject<Command>()

  constructor(meta: Meta, title: Title) {
    super()

    const state$ = this.command$.pipe(
      scan<Command, CalculatorState>(
        (prevState, command) => prevState.handleCommand(command),
        DEFAULT_CALCULATOR_STATE,
      ),
      distinctUntilChanged(),
      share(),
    )

    this.state = this.connect({
      displayValue: state$.pipe(
        map(state => state.displayValue || '0'),
        startWith('0'),
        distinctUntilChanged(),
      ),
    })

    this.onInit$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          title.setTitle(APP_TITLE)

          META_TAGS.forEach(tag => meta.updateTag(tag))
        }),
      )
      .subscribe()
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

  handleDigit(value: Digit) {
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
        this.handleDigit((keyCode - KeyCode.Zero).toString() as Digit)
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

const APP_IMAGE_PATH = '/assets/logo.svg'

const APP_TITLE = 'Calculator'

const META_TAGS: ReadonlyArray<MetaDefinition> = [
  { name: 'description', content: APP_TITLE },
  { name: 'theme-color', content: '#C3002F' },
  { name: 'twitter:card', content: 'summary' },
  { name: 'twitter:image', content: APP_IMAGE_PATH },
  { name: 'twitter:title', content: APP_TITLE },
  { name: 'twitter:description', content: APP_TITLE },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  {
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'black-translucent',
  },
  { name: 'apple-mobile-web-app-title', content: APP_TITLE },
  { name: 'apple-touch-startup-image', content: APP_IMAGE_PATH },
  { property: 'og:title', content: APP_TITLE },
  { property: 'og:description', content: APP_TITLE },
  { property: 'og:image', content: APP_IMAGE_PATH },
]
