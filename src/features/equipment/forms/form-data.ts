import { createEquipmentSchema } from "../schemas";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formDataToCreateEquipmentInput(formData: FormData) {
  return createEquipmentSchema.parse({
    category: textValue(formData, "category"),
    brand: textValue(formData, "brand"),
    model: textValue(formData, "model"),
    nickname: textValue(formData, "nickname"),
    year: numberValue(formData, "year"),
    description: textValue(formData, "description"),
    slug: textValue(formData, "slug"),
    mainImageUrl: textValue(formData, "mainImageUrl"),
    usageMetricType: textValue(formData, "usageMetricType"),
    usageMetricValue: numberValue(formData, "usageMetricValue"),
    visibility: textValue(formData, "visibility"),
  });
}

export type CreateEquipmentFormInput = ReturnType<typeof formDataToCreateEquipmentInput>;
