import { NextResponse } from 'next/server';

export function safeErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status = 500,
): NextResponse {
  if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
    console.error(fallbackMessage, error);
  } else if (error instanceof Error) {
    console.error(fallbackMessage);
  } else {
    console.error(fallbackMessage, error);
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? fallbackMessage
      : error instanceof Error
        ? `${fallbackMessage}: ${error.message}`
        : fallbackMessage;

  return NextResponse.json({ error: message }, { status });
}
