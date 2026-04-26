import type { PrismaClient } from "@prisma/client";
import type {
  AccessoryRecommendation,
  AccessoryType,
  BudgetLevel,
  CatalogItem,
  RecommendationInput,
  RecommendationResult,
} from "@/types/recommendation";

const TROPICAL_COUNTRIES = new Set(["CI", "SN", "CM", "BJ", "TG", "GA", "GN", "CG", "CD", "MG"]);

export class RecommendationEngine {
  constructor(private readonly db: PrismaClient) {}

  async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    const { dominantColor, style, budgetFcfa, city, country } = input;
    const isTropical = country ? TROPICAL_COUNTRIES.has(country.toUpperCase()) : false;

    const budgetTier = await this.db.budgetTier.findFirst({
      where: {
        OR: [
          { minAmountFcfa: null,              maxAmountFcfa: { gte: budgetFcfa } },
          { minAmountFcfa: { lte: budgetFcfa }, maxAmountFcfa: { gte: budgetFcfa } },
          { minAmountFcfa: { lte: budgetFcfa }, maxAmountFcfa: null },
        ],
      },
      orderBy: { minAmountFcfa: "asc" },
    });

    const budgetLevel = (budgetTier?.level ?? "bas") as BudgetLevel;
    const accessoryTypes = (budgetTier?.accessoryTypes ?? ["tapis", "coussins"]) as AccessoryType[];

    // Construire le filtre catalogue
    const catalogFilter: Record<string, unknown> = {
      budgetLevel,
      available: true,
      type: { in: accessoryTypes },
    };
    if (isTropical) catalogFilter.tropicalFriendly = true;

    const [colorRules, styleRule, allCatalogItems] = await Promise.all([
      this.db.colorRule.findMany({
        where: { dominantColor, accessoryType: { in: accessoryTypes } },
      }),
      this.db.styleRule.findFirst({
        where: { style, accessoryType: "general" },
      }),
      this.db.accessoryCatalog.findMany({ where: catalogFilter }),
    ]);

    // Prioriser les produits locaux si une ville est fournie
    const sortedItems = city
      ? [
          ...allCatalogItems.filter((i) => i.city?.toLowerCase() === city.toLowerCase()),
          ...allCatalogItems.filter((i) => i.city?.toLowerCase() !== city.toLowerCase()),
        ]
      : allCatalogItems;

    const colorRuleMap = new Map(colorRules.map((r) => [r.accessoryType, r.suggestions]));

    const catalogByType = new Map<string, CatalogItem[]>();
    for (const item of sortedItems) {
      const list = catalogByType.get(item.type) ?? [];
      list.push(item as unknown as CatalogItem);
      catalogByType.set(item.type, list);
    }

    const accessories: AccessoryRecommendation[] = accessoryTypes.map((type) => ({
      type,
      colorSuggestions: colorRuleMap.get(type) ?? [],
      styleSuggestions: styleRule?.suggestions ?? [],
      styleMaterials: styleRule?.materials ?? [],
      styleColorPalette: styleRule?.colorPalette ?? [],
      catalogItems: catalogByType.get(type) ?? [],
    }));

    const totalEstimateFcfa = accessories.reduce((sum, acc) => {
      return sum + (acc.catalogItems[0]?.priceFcfa ?? 0);
    }, 0);

    return {
      input,
      budgetLevel,
      budgetDescription: budgetTier?.description ?? "",
      accessories,
      totalEstimateFcfa,
    };
  }

  static resolveBudgetLevel(budgetFcfa: number): BudgetLevel {
    if (budgetFcfa < 500_000) return "bas";
    if (budgetFcfa <= 1_500_000) return "moyen";
    return "eleve";
  }
}
