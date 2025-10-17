import type { Company } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type CompanyRecord = Company & {
  addressLine1?: string | null;
};

export type CompanyDetails = CompanyRecord & {
  addressLine1: string | null;
  street: string | null;
  city: string | null;
  postcode: string | null;
  state: string | null;
  country: string | null;
};

export function parseCompanyAddress(company: CompanyRecord | null): CompanyDetails | null {
  if (!company) {
    return null;
  }

  const details: CompanyDetails = {
    ...company,
    addressLine1: company.addressLine1 ?? null,
    street: company.street ?? null,
    city: company.city ?? null,
    postcode: company.postcode ?? null,
    state: company.state ?? null,
    country: company.country ?? 'Malaysia',
  };

  if (details.street && details.city && details.postcode) {
    if (!details.addressLine1) {
      details.addressLine1 = details.street;
    }
    if (!details.address) {
      details.address = formatCompanyAddress(details);
    }
    return details;
  }

  if (details.addressLine1 && !details.street) {
    details.street = details.addressLine1;
  }

  if (details.street && details.city && details.postcode) {
    if (!details.addressLine1) {
      details.addressLine1 = details.street;
    }
    if (!details.address) {
      details.address = formatCompanyAddress(details);
    }
    return details;
  }

  const address = company.address ?? '';
  const parts = address.split(',').map((part) => part.trim());

  if (parts.length === 0) {
    return {
      ...details,
      street: details.street ?? '',
      addressLine1: details.addressLine1 ?? '',
      postcode: details.postcode ?? '',
      city: details.city ?? '',
      state: details.state ?? '',
      country: details.country ?? 'Malaysia',
    };
  }

  const street = details.street ?? parts[0] ?? '';
  const addressLine1 = details.addressLine1 ?? parts[0] ?? '';
  let postcode = details.postcode ?? '';
  let city = details.city ?? '';
  let state = details.state ?? '';
  let country = details.country ?? 'Malaysia';

  if (parts.length > 1) {
    const locationParts = parts[1].split(',').map((part) => part.trim());

    if (locationParts.length > 1) {
      country = details.country ?? locationParts[locationParts.length - 1] ?? 'Malaysia';
      const cityPostcodePart = locationParts[0];
      const postcodeMatch = cityPostcodePart.match(/^(\d+)/);

      if (postcodeMatch) {
        postcode = details.postcode ?? postcodeMatch[0];
        city = details.city ?? cityPostcodePart.replace(postcodeMatch[0], '').trim();
      } else {
        city = details.city ?? cityPostcodePart;
      }

      if (locationParts.length > 2) {
        state = details.state ?? locationParts[1];
      }
    } else {
      const cityPostcodePart = locationParts[0];
      const postcodeMatch = cityPostcodePart.match(/^(\d+)/);
      if (postcodeMatch) {
        postcode = details.postcode ?? postcodeMatch[0];
        city = details.city ?? cityPostcodePart.replace(postcodeMatch[0], '').trim();
      } else {
        city = details.city ?? cityPostcodePart;
      }
    }
  }

  return {
    ...details,
    street: street || '',
    addressLine1: addressLine1 || '',
    postcode: postcode || '',
    city: city || '',
    state: state || '',
    country: country || 'Malaysia',
  };
}

export function formatCompanyAddress(data: Partial<CompanyDetails>): string {
  const streetAddress = data.addressLine1 || data.street || '';
  const segments = [streetAddress];

  const locationParts: string[] = [];
  if (data.postcode) {
    locationParts.push(data.postcode);
  }
  if (data.city) {
    locationParts.push(data.city);
  }
  if (data.state) {
    locationParts.push(data.state);
  }
  if (data.country) {
    locationParts.push(data.country);
  }

  if (locationParts.length) {
    segments.push(locationParts.join(', '));
  }

  return segments
    .join(', ')
    .replace(/,\s*,+/g, ',')
    .replace(/^,+|,+$/g, '')
    .trim();
}

export async function getCompanyDetails(userId: string): Promise<CompanyDetails | null> {
  const record = await prisma.company.findUnique({
    where: { userId },
  });

  return parseCompanyAddress(record);
}
