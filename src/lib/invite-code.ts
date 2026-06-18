import { createHash, randomBytes } from "crypto";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function hashInviteCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateInviteCode(): string {
  const segments = [4, 4, 4].map((length) => {
    const bytes = randomBytes(length);
    let segment = "";
    for (let i = 0; i < length; i++) {
      segment += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    }
    return segment;
  });
  return `DOJO-${segments.join("-")}`;
}

export function memberAuthEmail(memberId: string): string {
  return `${memberId}@dojo.internal`;
}
