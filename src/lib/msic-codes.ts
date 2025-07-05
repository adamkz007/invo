// @ts-expect-error: JSON import assertion for Next.js
import msicJson from '../../../msic.json' assert { type: 'json' };

export interface MSICCode {
  code: string;
  description: string;
  category?: string;
}

export async function getMsicCodes(): Promise<MSICCode[]> {
  const res = await fetch('/msic.json');
  const msicJson = await res.json();
  return msicJson.map((item: any) => ({
    code: item.Code,
    description: item.Description,
    category: item["MSIC Category Reference"] || undefined,
  }));
} 