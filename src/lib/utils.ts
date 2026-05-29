import jalaaliMoment from "jalali-moment";

/**
 * Convert a Date to Jalali (Shamsi) formatted string
 */
export function toJalali(date: Date | string, format = "jYYYY/jMM/jDD"): string {
  return jalaaliMoment(date).locale("fa").format(format);
}

/**
 * Convert a Date to Jalali with time
 */
export function toJalaliDateTime(date: Date | string): string {
  return jalaaliMoment(date).locale("fa").format("jYYYY/jMM/jDD - HH:mm");
}

/**
 * Relative time in Farsi
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "همین الان";
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days < 7) return `${days} روز پیش`;
  return toJalali(date);
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date | string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Determine result status based on value and range
 */
export function getResultStatus(
  value: string | null,
  min: string | null,
  max: string | null
): "normal" | "high" | "low" | "pending" {
  if (!value || value.trim() === "") return "pending";

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "normal"; // non-numeric values (like positive/negative)

  const numMin = min ? parseFloat(min) : null;
  const numMax = max ? parseFloat(max) : null;

  if (numMin !== null && !isNaN(numMin) && numValue < numMin) return "low";
  if (numMax !== null && !isNaN(numMax) && numValue > numMax) return "high";
  return "normal";
}

/**
 * Get status label in Farsi
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "در انتظار",
    in_progress: "در حال انجام",
    completed: "آماده",
    delivered: "تحویل شده",
    normal: "نرمال",
    high: "بالا",
    low: "پایین",
    critical: "بحرانی",
  };
  return labels[status] || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "badge-neutral",
    in_progress: "badge-primary",
    completed: "badge-success",
    delivered: "badge-success",
    normal: "badge-success",
    high: "badge-danger",
    low: "badge-warning",
    critical: "badge-danger",
  };
  return colors[status] || "badge-neutral";
}

/**
 * Get result value CSS class
 */
export function getResultClass(status: string): string {
  const classes: Record<string, string> = {
    normal: "result-normal",
    high: "result-high",
    low: "result-low",
    critical: "result-critical",
    pending: "text-muted",
  };
  return classes[status] || "";
}

/**
 * Format gender label
 */
export function getGenderLabel(gender: string | null): string {
  if (gender === "male") return "مرد";
  if (gender === "female") return "زن";
  return "—";
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  // Format: 0912 345 6789
  if (phone.length === 11 && phone.startsWith("09")) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  return phone;
}

/**
 * Validate Iranian national ID (code melli)
 */
export function validateNationalId(id: string): boolean {
  if (!/^\d{10}$/.test(id)) return false;
  const check = parseInt(id[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(id[i]) * (10 - i);
  }
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}
