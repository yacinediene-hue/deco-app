const ASSUMED_ROOM_WIDTH_CM = 400; // 4 m par défaut

export interface PlacementFromDimensions {
  widthPercent: number;
  xPercent: number;
  yPercent: number;
}

export function placementFromFurnitureWidth(
  widthCm: number | null | undefined
): PlacementFromDimensions {
  if (!widthCm || widthCm <= 0) {
    return { widthPercent: 40, xPercent: 15, yPercent: 40 };
  }

  const widthPercent = Math.min(
    80,
    Math.max(10, Math.round((widthCm / ASSUMED_ROOM_WIDTH_CM) * 100))
  );

  // Centrer horizontalement en laissant des marges
  const xPercent = Math.round((100 - widthPercent) / 2);

  return { widthPercent, xPercent, yPercent: 40 };
}
