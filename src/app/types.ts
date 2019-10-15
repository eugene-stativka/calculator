export const enum CommandType {
  Reset,
  ToggleNumberSign,
  Percent,
  Operator,
  Digit,
  Decimal,
  Calculate,
}

export const enum OperatorType {
  Add,
  Subtract,
  Multiply,
  Divide,
}

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type Command =
  | Readonly<{ type: CommandType.Reset }>
  | Readonly<{ type: CommandType.ToggleNumberSign }>
  | Readonly<{ type: CommandType.Percent }>
  | Readonly<{ type: CommandType.Operator; value: OperatorType }>
  | Readonly<{ type: CommandType.Digit; value: Digit }>
  | Readonly<{ type: CommandType.Decimal }>
  | Readonly<{ type: CommandType.Calculate }>

export const enum KeyCode {
  Enter = 13,
  Esc = 27,
  Percent = 37,
  Star = 42,
  Plus = 43,
  Coma = 44,
  Minus = 45,
  Slash = 47,
  Zero = 48,
  Nine = 57,
  Equals = 61,
}
