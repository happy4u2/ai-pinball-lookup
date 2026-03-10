export function buildMachineId(opdbId) {
  return `opdb:${String(opdbId).toLowerCase()}`;
}
