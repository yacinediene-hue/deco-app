import type { PrismaClient } from "@prisma/client";
import type {
  AccessoryRecommendation,
  AccessoryType,
  BudgetLevel,
  CatalogItem,
  RecommendationInput,
  RecommendationResult,
} from "@/types/recommendation";

export class RecommendationEngine {
  constructor(private readonly db: PrismaClient) {}

  async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    const { dominantColor, style, budgetFcfa } = input;

    const budgetTier = await this.db.budgetTier.findFirst({
      where: {
        OR: [
          {
            minAmountFcfa: null,
            maxAmountFcfa: { gte: budgetFcfa },
          },
          {
            minAmountFcfa: { lte: budgetFcfa },
            maxAmountFcfa: { gte: budgetFcfa },
          },
          {
            minAmountFcfa: { lte: budgetFcfa },
            maxAmountFcfa: null,
          },
        ],
      },
      orderBy: { minAmountFcfa: "asc" },
    });

    const budgetLevel = (budgetTier?.level ?? "bas") as BudgetLevel;
    const accessoryTypes = (budgetTier?.accessoryTypes ?? ["tapis", "coussins"]) as AccessoryType[];

    const [colorRules, styleRule, catalogItems] = await Promise.all([
      this.db.colorRule.findMany({
        where: { dominantColor, accessoryType: { in: accessoryTypes } },
      }),
      this.db.styleRule.findFirst({
        where: { style, accessoryType: "general" },
      }),
      this.db.accessoryCatalog.findMany({
        where: {
          budgetLevel,
          available: true,
          type: { in: accessoryTypes },
        },
      }),
    ]);

    const colorRuleMap = new Map(
      colorRules.map((r) => [r.accessoryType, r.suggestions])
    );

    const catalogByType = new Map<string, CatalogItem[]>();
    for (const item of catalogItems) {
      const list = catalogByType.get(item.type) ?? [];
      list.push(item as CatalogItem);
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
      const cheapest = acc.catalogItems[0]?.priceFcfa ?? 0;
      return sum + cheapest;
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
