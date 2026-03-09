export function normalizeMachine(opdbMachine) {
  if (!opdbMachine) {
    throw new Error("Missing opdbMachine");
  }

  const primaryImage =
    opdbMachine.images?.find((img) => img.primary)?.urls?.large ||
    opdbMachine.images?.[0]?.urls?.large ||
    null;

  return {
    opdb_id: opdbMachine.opdb_id ?? null,
    name: opdbMachine.name ?? null,
    common_name: opdbMachine.common_name ?? null,
    shortname: opdbMachine.shortname ?? null,
    manufacturer: opdbMachine.manufacturer?.name ?? null,
    manufacturer_full_name: opdbMachine.manufacturer?.full_name ?? null,
    manufacture_date: opdbMachine.manufacture_date ?? null,
    type: opdbMachine.type ?? null,
    display: opdbMachine.display ?? null,
    player_count: opdbMachine.player_count ?? null,
    features: opdbMachine.features ?? [],
    keywords: opdbMachine.keywords ?? [],
    ipdb_id: opdbMachine.ipdb_id ?? null,
    description: opdbMachine.description ?? "",
    primary_image: primaryImage
  };
}