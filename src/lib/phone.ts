export function isValidMalaysiaPhoneNumber(phone: string): boolean {
  if (!phone.startsWith('+60')) {
    return false;
  }

  const numberWithoutCode = phone.substring(3);

  return /^1[0-9]{8,9}$/.test(numberWithoutCode);
}
