export const enum CommandType {
  Add,
  Subtract,
  Multiply,
  Divide,
  Digit,
  Reset,
  Calculate,
}

export type Command =
  | Readonly<{ type: CommandType.Digit; value: number }>
  | Readonly<{ type: CommandType.Reset }>
  | Readonly<{ type: CommandType.Calculate }>
  | Readonly<{ type: CommandType.Add }>
  | Readonly<{ type: CommandType.Subtract }>
  | Readonly<{ type: CommandType.Multiply }>
  | Readonly<{ type: CommandType.Divide }>
