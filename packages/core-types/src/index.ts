import "./global";

export type ValueOf<T> = T[keyof T];

export type Brand<T, U> = T & { __brand: U };

export const isStringLiteral = <T extends readonly string[]>(
  x: string,
  literals: T,
): x is T[number] =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  (literals as readonly string[]).includes(x);

export const isEnumMember = <E extends Readonly<Record<string, string>>>(
  x: string,
  enumObj: E,
): x is ValueOf<E> => Object.values(enumObj).includes(x);
