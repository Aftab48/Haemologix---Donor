// Utility functions ported from haemologix-main

export type BloodTypeFormat =
  | "O+"
  | "O-"
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-";

const ALL_BLOOD_TYPES: BloodTypeFormat[] = [
  "O-",
  "O+",
  "A-",
  "A+",
  "B-",
  "B+",
  "AB-",
  "AB+",
];

/**
 * Format date to human-readable string
 */
export function formatLastActivity(
  date: string | Date | null | undefined,
  includeTime = true
): string {
  if (!date) return "N/A";

  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return "N/A"; // invalid date check

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("en-US", { month: "long" });
  const year = parsedDate.getFullYear();

  // Add ordinal suffix
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  if (includeTime) {
    const time = parsedDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${day}${suffix} ${month} ${year} at ${time}`;
  }

  return `${day}${suffix} ${month} ${year}`;
}

/**
 * Calculate next eligible donation date (90 days after last donation)
 */
export const calculateNextEligible = (
  lastDonation: string | undefined | null
): string => {
  if (!lastDonation) {
    return "Eligible Now";
  }

  const donationDate = new Date(lastDonation);
  if (isNaN(donationDate.getTime())) return "Eligible Now";

  const nextEligible = new Date(donationDate);
  nextEligible.setDate(donationDate.getDate() + 90);

  return formatLastActivity(nextEligible, false);
};

/**
 * Get eligibility progress percentage (0-100)
 */
export const getEligibilityProgress = (lastDonation?: string | null): number => {
  if (!lastDonation || lastDonation === "N/A") return 100;

  const donationDate = new Date(lastDonation);
  if (isNaN(donationDate.getTime())) return 100;

  const now = new Date();
  const nextEligible = new Date(donationDate);
  nextEligible.setDate(donationDate.getDate() + 90);

  const total = 90 * 24 * 60 * 60 * 1000; // 90 days in ms
  const elapsed = now.getTime() - donationDate.getTime();

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Check if a donor blood type is compatible with a recipient blood type.
 */
export function isCompatible(donor: string, recipient: string): boolean {
  // Handle non-blood cases early
  if (!donor || !recipient) return false;

  // Plasma and Platelets: universally compatible
  if (
    recipient.toLowerCase() === "plasma" ||
    donor.toLowerCase() === "plasma" ||
    recipient.toLowerCase() === "platelets" ||
    donor.toLowerCase() === "platelets"
  ) {
    return true;
  }

  // Helper to safely parse ABO + Rh
  const parseType = (blood: string) => {
    // Ensure string looks like valid ABO group
    const validGroups = ["O", "A", "B", "AB"];
    const abo = validGroups.find((g) => blood.startsWith(g));
    if (!abo) return undefined;

    const rh = blood.includes("+")
      ? "+"
      : blood.includes("-")
      ? "-"
      : undefined;
    if (!rh) return undefined;

    return { abo, rh };
  };

  const donorParsed = parseType(donor);
  const recipientParsed = parseType(recipient);

  if (!donorParsed || !recipientParsed) {
    console.warn("Invalid blood type passed:", { donor, recipient });
    return false;
  }

  const { abo: donorABO, rh: donorRh } = donorParsed;
  const { abo: recipientABO, rh: recipientRh } = recipientParsed;

  // ABO compatibility
  let aboCompatible = false;
  switch (donorABO) {
    case "O":
      aboCompatible = true; // O donates to anyone
      break;
    case "A":
      aboCompatible = recipientABO === "A" || recipientABO === "AB";
      break;
    case "B":
      aboCompatible = recipientABO === "B" || recipientABO === "AB";
      break;
    case "AB":
      aboCompatible = recipientABO === "AB";
      break;
  }

  // Rh compatibility: "-" can donate to both, "+" only to "+"
  const rhCompatible = donorRh === "-" || recipientRh === "+";

  return aboCompatible && rhCompatible;
}

/**
 * Get all blood types a given donor can donate to.
 */
export function getCompatibleRecipients(
  donor: BloodTypeFormat
): BloodTypeFormat[] {
  return ALL_BLOOD_TYPES.filter((recipient) => isCompatible(donor, recipient));
}

/**
 * Get all blood types that can donate to a given recipient.
 */
export function getCompatibleDonors(
  recipient: BloodTypeFormat
): BloodTypeFormat[] {
  return ALL_BLOOD_TYPES.filter((donor) => isCompatible(donor, recipient));
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Format urgency for display
 */
export function formatUrgency(urgency: string): "Critical" | "Urgent" | "Normal" {
  const upper = urgency.toUpperCase();
  if (upper === "CRITICAL" || upper === "HIGH") {
    return "Critical";
  }
  if (upper === "MEDIUM") {
    return "Urgent";
  }
  return "Normal";
}

