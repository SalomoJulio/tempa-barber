export const statusLabels: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", completed: "Selesai",
  cancelled: "Dibatalkan", no_show: "Tidak hadir",
};

export function allowedActions(status: string) {
  if (status === "pending") return ["confirmed", "cancelled"];
  if (status === "confirmed") return ["completed", "no_show", "cancelled"];
  return [];
}

export function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(value);
}

export function visitDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

export function visitTime(value: string) {
  return new Date(value).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
}
