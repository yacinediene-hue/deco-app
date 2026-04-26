import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecommendationEngine } from "../recommendation-engine";
import type { DominantColor, Style, BudgetLevel } from "@/types/recommendation";

// ─── Mock Prisma ─────────────────────────────────────────────────────────────

const BUDGET_TIERS = {
  bas:   { level: "bas",   minAmountFcfa: null,    maxAmountFcfa: 500000,   accessoryTypes: ["tapis", "coussins", "luminaire", "rideaux"], description: "Budget bas" },
  moyen: { level: "moyen", minAmountFcfa: 500000,  maxAmountFcfa: 1500000,  accessoryTypes: ["tapis", "coussins", "table_basse", "luminaire", "rideaux", "objet_mural"], description: "Budget moyen" },
  eleve: { level: "eleve", minAmountFcfa: 1500000, maxAmountFcfa: null,     accessoryTypes: ["tapis", "luminaire", "papier_peint", "rideaux", "table_basse", "console", "accessoires"], description: "Budget élevé" },
};

const COLOR_RULES: Record<string, Record<string, string[]>> = {
  beige:     { tapis: ["écru", "terracotta"], rideaux: ["lin naturel"], coussins: ["verts", "dorés"], luminaire: ["noir mat", "laiton"] },
  bleu_nuit: { tapis: ["crème", "gris clair"], rideaux: ["beige clair"], coussins: ["dorés", "blancs"], luminaire: ["laiton", "noir"] },
  vert_olive:{ tapis: ["jute", "beige"], rideaux: ["lin naturel"], coussins: ["crème", "moutarde"], luminaire: ["bois foncé", "laiton"] },
  gris:      { tapis: ["beige", "blanc"], rideaux: ["blanc"], coussins: ["moutarde", "bleu"], luminaire: ["métal noir"] },
  marron:    { tapis: ["beige", "ivoire"], rideaux: ["lin écru"], coussins: ["crème", "ocre"], luminaire: ["laiton", "bois"] },
  blanc:     { tapis: ["naturel", "motifs colorés"], rideaux: ["toutes couleurs"], coussins: ["colorés"], luminaire: ["très libre"] },
};

const STYLE_RULES: Record<Style, { suggestions: string[]; materials: string[]; colorPalette: string[] }> = {
  moderne:    { suggestions: ["métal noir", "verre"], materials: ["métal", "verre"], colorPalette: ["noir", "blanc", "gris"] },
  chic:       { suggestions: ["velours", "laiton"], materials: ["velours", "marbre"], colorPalette: ["bordeaux", "or"] },
  minimaliste:{ suggestions: ["bois clair", "lin"], materials: ["bois clair", "lin"], colorPalette: ["beige", "blanc"] },
  africain:   { suggestions: ["fibres naturelles", "terre cuite"], materials: ["bois", "raphia"], colorPalette: ["terracotta", "ocre"] },
  boheme:     { suggestions: ["rotin", "jute"], materials: ["rotin", "jute"], colorPalette: ["terracotta", "moutarde"] },
  luxe:       { suggestions: ["soie", "cachemire"], materials: ["soie", "marbre"], colorPalette: ["crème", "or"] },
};

function buildMockPrisma(budgetLevel: BudgetLevel, color: DominantColor, style: Style) {
  const tier = BUDGET_TIERS[budgetLevel];
  const colorRules = Object.entries(COLOR_RULES[color] ?? {})
    .filter(([type]) => tier.accessoryTypes.includes(type))
    .map(([accessoryType, suggestions]) => ({ dominantColor: color, accessoryType, suggestions }));

  const styleRule = { style, accessoryType: "general", ...STYLE_RULES[style] };

  const catalogItems = tier.accessoryTypes.map((type, i) => ({
    id: `item-${i}`,
    name: `Produit ${type}`,
    type,
    priceFcfa: 50000 * (i + 1),
    budgetLevel,
    description: null,
    imageUrl: null,
    available: true,
    styles: [style],
    colors: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return {
    budgetTier: {
      findFirst: vi.fn().mockResolvedValue(tier),
    },
    colorRule: {
      findMany: vi.fn().mockResolvedValue(colorRules),
    },
    styleRule: {
      findFirst: vi.fn().mockResolvedValue(styleRule),
    },
    accessoryCatalog: {
      findMany: vi.fn().mockResolvedValue(catalogItems),
    },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const COLORS: DominantColor[] = ["beige", "bleu_nuit", "vert_olive", "gris", "marron", "blanc"];
const STYLES: Style[] = ["moderne", "chic", "minimaliste", "africain", "boheme", "luxe"];
const BUDGETS: { level: BudgetLevel; amount: number }[] = [
  { level: "bas",   amount: 250_000 },
  { level: "moyen", amount: 900_000 },
  { level: "eleve", amount: 2_000_000 },
];

describe("RecommendationEngine", () => {
  describe("resolveBudgetLevel (statique)", () => {
    it("retourne bas pour < 500 000 FCFA", () => {
      expect(RecommendationEngine.resolveBudgetLevel(250_000)).toBe("bas");
      expect(RecommendationEngine.resolveBudgetLevel(499_999)).toBe("bas");
    });
    it("retourne moyen pour 500 000 – 1 500 000 FCFA", () => {
      expect(RecommendationEngine.resolveBudgetLevel(500_000)).toBe("moyen");
      expect(RecommendationEngine.resolveBudgetLevel(1_000_000)).toBe("moyen");
      expect(RecommendationEngine.resolveBudgetLevel(1_500_000)).toBe("moyen");
    });
    it("retourne eleve pour > 1 500 000 FCFA", () => {
      expect(RecommendationEngine.resolveBudgetLevel(1_500_001)).toBe("eleve");
      expect(RecommendationEngine.resolveBudgetLevel(5_000_000)).toBe("eleve");
    });
  });

  describe("recommend — structure de retour", () => {
    it("retourne toujours budgetLevel, accessories et totalEstimateFcfa", async () => {
      const mockDb = buildMockPrisma("moyen", "beige", "moderne");
      const engine = new RecommendationEngine(mockDb as any);
      const result = await engine.recommend({
        furnitureType: "canape",
        dominantColor: "beige",
        room: "salon",
        style: "moderne",
        budgetFcfa: 900_000,
      });

      expect(result).toHaveProperty("budgetLevel");
      expect(result).toHaveProperty("accessories");
      expect(result).toHaveProperty("totalEstimateFcfa");
      expect(Array.isArray(result.accessories)).toBe(true);
      expect(result.accessories.length).toBeGreaterThan(0);
    });

    it("chaque accessoire a colorSuggestions, styleSuggestions et catalogItems", async () => {
      const mockDb = buildMockPrisma("moyen", "beige", "moderne");
      const engine = new RecommendationEngine(mockDb as any);
      const result = await engine.recommend({
        furnitureType: "canape",
        dominantColor: "beige",
        room: "salon",
        style: "moderne",
        budgetFcfa: 900_000,
      });

      for (const acc of result.accessories) {
        expect(acc).toHaveProperty("type");
        expect(acc).toHaveProperty("colorSuggestions");
        expect(acc).toHaveProperty("styleSuggestions");
        expect(acc).toHaveProperty("catalogItems");
        expect(Array.isArray(acc.colorSuggestions)).toBe(true);
        expect(Array.isArray(acc.catalogItems)).toBe(true);
      }
    });
  });

  describe("recommend — matrice 6 styles × 3 budgets × 6 couleurs", () => {
    for (const style of STYLES) {
      for (const { level, amount } of BUDGETS) {
        for (const color of COLORS) {
          it(`style=${style} | budget=${level} | couleur=${color}`, async () => {
            const mockDb = buildMockPrisma(level, color, style);
            const engine = new RecommendationEngine(mockDb as any);

            const result = await engine.recommend({
              furnitureType: "canape",
              dominantColor: color,
              room: "salon",
              style,
              budgetFcfa: amount,
            });

            expect(result.budgetLevel).toBe(level);
            expect(result.input.dominantColor).toBe(color);
            expect(result.input.style).toBe(style);
            expect(result.accessories.length).toBeGreaterThan(0);
            expect(result.totalEstimateFcfa).toBeGreaterThanOrEqual(0);

            // Les suggestions couleur doivent venir des règles
            const tapisAcc = result.accessories.find((a) => a.type === "tapis");
            if (tapisAcc) {
              expect(tapisAcc.colorSuggestions.length).toBeGreaterThan(0);
            }

            // Les matériaux de style doivent être présents
            const firstAcc = result.accessories[0];
            expect(firstAcc.styleMaterials).toEqual(STYLE_RULES[style].materials);
          });
        }
      }
    }
  });
});
