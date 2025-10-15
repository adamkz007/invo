import { Prisma } from '@prisma/client';

type DecimalInput = Prisma.Decimal | number | string | null | undefined;

export function toNumber(value: DecimalInput, precision = 2): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return round(value, precision);
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : round(parsed, precision);
  }

  return round(value.toNumber(), precision);
}

export function toDecimal(value: DecimalInput): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) {
    return value;
  }

  return new Prisma.Decimal(value ?? 0);
}

function round(value: number, precision: number) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}
