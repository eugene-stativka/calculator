export function assertNever(value: never): never {
  throw new Error(`unreachable code ${value}`)
}
