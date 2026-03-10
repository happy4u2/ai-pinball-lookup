export function buildWhatsAppLink(phone) {
  if (!phone) return null;

  const cleaned = phone.replace(/[^\d]/g, "");

  return `https://wa.me/${cleaned}`;
}
