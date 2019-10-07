export enum CommandType {
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
