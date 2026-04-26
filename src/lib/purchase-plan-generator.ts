import type { AccessoryRecommendation, CatalogItem } from "@/types/recommendation";

// Ordre de priorité : essentiels → confort → finitions
const PRIORITY: Record<string, number> = {
  tapis:        1,
  luminaire:    1,
  coussins:     2,
  rideaux:      2,
  table_basse:  3,
  papier_peint: 3,
  objet_mural:  3,
  console:      4,
  accessoires:  4,
};

const PRIORITY_LABEL: Record<number, string> = {
  1: "Essentiels",
  2: "Confort",
  3: "Finitions",
  4: "Touche finale",
};

export interface PlannedItem {
  accessoryType: string;
  item: CatalogItem;
  priority: number;
  priorityLabel: string;
}

export interface PurchaseMonth {
  month: number;      // 1-based index du plan (mois 1, 2, 3…)
  label: string;      // "Janvier 2026"
  items: PlannedItem[];
  totalFcfa: number;
  budgetRemaining: number;
}

export interface PurchasePlan {
  months: PurchaseMonth[];
  totalFcfa: number;
  durationMonths: number;
  monthlyBudgetFcfa: number;
  startMonth: number;
  startYear: number;
}

export class PurchasePlanGenerator {
  generate(
    accessories: AccessoryRecommendation[],
    monthlyBudgetFcfa: number,
    startDate = new Date()
  ): PurchasePlan {
    // Collecter tous les produits avec leur priorité
    const allItems: PlannedItem[] = [];

    for (const acc of accessories) {
      const priority = PRIORITY[acc.type] ?? 5;
      // Prendre le produit le moins cher de chaque type
      const cheapest = [...acc.catalogItems].sort((a, b) => a.priceFcfa - b.priceFcfa)[0];
      if (cheapest) {
        allItems.push({
          accessoryType: acc.type,
          item: cheapest,
          priority,
          priorityLabel: PRIORITY_LABEL[priority] ?? "Autre",
        });
      }
    }

    // Trier par priorité
    allItems.sort((a, b) => a.priority - b.priority || a.item.priceFcfa - b.item.priceFcfa);

    // Répartir par mois
    const months: PurchaseMonth[] = [];
    let currentItems: PlannedItem[] = [];
    let currentTotal = 0;
    let monthIndex = 0;

    for (const item of allItems) {
      const price = item.item.priceFcfa;

      if (currentTotal + price > monthlyBudgetFcfa && currentItems.length > 0) {
        // Finaliser le mois courant
        months.push(buildMonth(monthIndex, currentItems, currentTotal, monthlyBudgetFcfa, startDate));
        monthIndex++;
        currentItems = [];
        currentTotal = 0;
      }

      // Si un seul item dépasse le budget mensuel, il prend un mois entier
      currentItems.push(item);
      currentTotal += price;
    }

    // Dernier mois
    if (currentItems.length > 0) {
      months.push(buildMonth(monthIndex, currentItems, currentTotal, monthlyBudgetFcfa, startDate));
    }

    const totalFcfa = months.reduce((s, m) => s + m.totalFcfa, 0);

    return {
      months,
      totalFcfa,
      durationMonths: months.length,
      monthlyBudgetFcfa,
      startMonth: startDate.getMonth() + 1,
      startYear: startDate.getFullYear(),
    };
  }
}

function buildMonth(
  index: number,
  items: PlannedItem[],
  total: number,
  monthlyBudget: number,
  startDate: Date
): PurchaseMonth {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + index);

  const label = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return {
    month: index + 1,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    items,
    totalFcfa: total,
    budgetRemaining: Math.max(0, monthlyBudget - total),
  };
}
