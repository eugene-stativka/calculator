export const enum CommandType {
  Reset,
  ToggleNumberSign,
  Percent,
  Divide,
  Digit,
  Multiply,
  Subtract,
  Add,
  Decimal,
  Calculate,
}

export type Command =
  | Readonly<{ type: CommandType.Reset }>
  | Readonly<{ type: CommandType.ToggleNumberSign }>
  | Readonly<{ type: CommandType.Percent }>
  | Readonly<{ type: CommandType.Divide }>
  | Readonly<{ type: CommandType.Digit; value: number }>
  | Readonly<{ type: CommandType.Multiply }>
  | Readonly<{ type: CommandType.Subtract }>
  | Readonly<{ type: CommandType.Add }>
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
