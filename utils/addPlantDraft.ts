import * as SecureStore from "expo-secure-store";

export interface AddPlantDraft {
  selectedPlantId?: string;
  seedQuantity?: number;
}

const draftKey = (rackId: string) => `add_plant_draft_${rackId}`;

const normalizeDraft = (
  draft: Partial<AddPlantDraft> | null | undefined,
): AddPlantDraft => {
  const normalized: AddPlantDraft = {};

  if (typeof draft?.selectedPlantId === "string" && draft.selectedPlantId) {
    normalized.selectedPlantId = draft.selectedPlantId;
  }

  if (
    typeof draft?.seedQuantity === "number" &&
    Number.isFinite(draft.seedQuantity)
  ) {
    normalized.seedQuantity = draft.seedQuantity;
  }

  return normalized;
};

export async function loadAddPlantDraft(
  rackId: string,
): Promise<AddPlantDraft | null> {
  const stored = await SecureStore.getItemAsync(draftKey(rackId));

  if (!stored) {
    return null;
  }

  try {
    return normalizeDraft(JSON.parse(stored));
  } catch {
    return null;
  }
}

export async function saveAddPlantDraft(
  rackId: string,
  updates: Partial<AddPlantDraft>,
): Promise<void> {
  const existing = await loadAddPlantDraft(rackId);
  const merged = normalizeDraft({ ...existing, ...updates });

  if (!merged.selectedPlantId && merged.seedQuantity === undefined) {
    await SecureStore.deleteItemAsync(draftKey(rackId));
    return;
  }

  await SecureStore.setItemAsync(draftKey(rackId), JSON.stringify(merged));
}

export async function clearAddPlantDraft(
  rackId: string | null | undefined,
): Promise<void> {
  if (!rackId) return;

  await SecureStore.deleteItemAsync(draftKey(rackId));
}
