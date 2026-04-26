import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Règles par couleur ───────────────────────────────────────────────────

  const colorRules = [
    { dominantColor: "beige", accessoryType: "tapis",    suggestions: ["écru", "terracotta", "brun clair"] },
    { dominantColor: "beige", accessoryType: "rideaux",  suggestions: ["lin naturel"] },
    { dominantColor: "beige", accessoryType: "coussins", suggestions: ["verts", "dorés", "marron"] },
    { dominantColor: "beige", accessoryType: "luminaire",suggestions: ["noir mat", "bois", "laiton"] },

    { dominantColor: "bleu_nuit", accessoryType: "tapis",    suggestions: ["crème", "gris clair"] },
    { dominantColor: "bleu_nuit", accessoryType: "rideaux",  suggestions: ["beige clair"] },
    { dominantColor: "bleu_nuit", accessoryType: "coussins", suggestions: ["dorés", "blancs", "bleu clair"] },
    { dominantColor: "bleu_nuit", accessoryType: "luminaire",suggestions: ["laiton", "noir"] },

    { dominantColor: "vert_olive", accessoryType: "tapis",    suggestions: ["jute", "beige", "ethnique sobre"] },
    { dominantColor: "vert_olive", accessoryType: "rideaux",  suggestions: ["lin naturel"] },
    { dominantColor: "vert_olive", accessoryType: "coussins", suggestions: ["crème", "terracotta", "moutarde"] },
    { dominantColor: "vert_olive", accessoryType: "luminaire",suggestions: ["bois foncé", "laiton"] },

    { dominantColor: "gris", accessoryType: "tapis",    suggestions: ["beige", "blanc", "noir"] },
    { dominantColor: "gris", accessoryType: "rideaux",  suggestions: ["blanc", "gris clair"] },
    { dominantColor: "gris", accessoryType: "coussins", suggestions: ["jaune moutarde", "bleu", "blanc"] },
    { dominantColor: "gris", accessoryType: "luminaire",suggestions: ["métal noir", "bois clair"] },

    { dominantColor: "marron", accessoryType: "tapis",    suggestions: ["beige", "ivoire", "motif berbère"] },
    { dominantColor: "marron", accessoryType: "rideaux",  suggestions: ["lin écru"] },
    { dominantColor: "marron", accessoryType: "coussins", suggestions: ["crème", "vert sapin", "ocre"] },
    { dominantColor: "marron", accessoryType: "luminaire",suggestions: ["laiton", "bois"] },

    { dominantColor: "blanc", accessoryType: "tapis",    suggestions: ["naturel", "motifs colorés"] },
    { dominantColor: "blanc", accessoryType: "rideaux",  suggestions: ["toutes couleurs"] },
    { dominantColor: "blanc", accessoryType: "coussins", suggestions: ["colorés", "pastels"] },
    { dominantColor: "blanc", accessoryType: "luminaire",suggestions: ["très libre"] },
  ];

  for (const rule of colorRules) {
    await prisma.colorRule.upsert({
      where: { dominantColor_accessoryType: { dominantColor: rule.dominantColor, accessoryType: rule.accessoryType } },
      update: { suggestions: rule.suggestions },
      create: rule,
    });
  }
  console.log(`✓ ${colorRules.length} color rules seeded`);

  // ─── Règles par style ─────────────────────────────────────────────────────

  const styleRules = [
    {
      style: "moderne", accessoryType: "general",
      suggestions: ["métal noir", "verre", "béton", "cuir synthétique"],
      materials: ["métal", "verre", "béton"],
      colorPalette: ["noir", "blanc", "gris", "anthracite"],
    },
    {
      style: "chic", accessoryType: "general",
      suggestions: ["velours", "marbre", "laiton doré", "cristal"],
      materials: ["velours", "marbre", "laiton"],
      colorPalette: ["bordeaux", "bleu nuit", "émeraude", "crème", "or"],
    },
    {
      style: "minimaliste", accessoryType: "general",
      suggestions: ["bois clair", "lin", "coton blanc", "céramique"],
      materials: ["bois clair", "lin", "coton"],
      colorPalette: ["beige", "blanc cassé", "gris clair", "naturel"],
    },
    {
      style: "africain", accessoryType: "general",
      suggestions: ["fibres naturelles", "raphia", "bois sculpté", "terre cuite"],
      materials: ["bois", "fibres naturelles", "terre cuite", "raphia"],
      colorPalette: ["terracotta", "ocre", "brun", "sable", "vert forêt"],
    },
    {
      style: "boheme", accessoryType: "general",
      suggestions: ["rotin", "jute", "macramé", "plantes suspendues", "coussins ethniques"],
      materials: ["rotin", "jute", "coton naturel", "lin"],
      colorPalette: ["terracotta", "moutarde", "vert sauge", "crème", "brun"],
    },
    {
      style: "luxe", accessoryType: "general",
      suggestions: ["soie", "cachemire", "marbre blanc", "laiton brossé", "velours épais"],
      materials: ["soie", "cachemire", "marbre", "laiton brossé"],
      colorPalette: ["crème", "champagne", "doré doux", "ivoire", "taupe"],
    },
  ];

  for (const rule of styleRules) {
    await prisma.styleRule.upsert({
      where: { style_accessoryType: { style: rule.style, accessoryType: rule.accessoryType } },
      update: { suggestions: rule.suggestions, materials: rule.materials, colorPalette: rule.colorPalette },
      create: rule,
    });
  }
  console.log(`✓ ${styleRules.length} style rules seeded`);

  // ─── Niveaux de budget ────────────────────────────────────────────────────

  const budgetTiers = [
    {
      level: "bas",
      minAmountFcfa: null,
      maxAmountFcfa: 500000,
      accessoryTypes: ["tapis", "coussins", "luminaire", "rideaux"],
      description: "1 tapis, 2 coussins, 1 lampadaire, rideaux simples",
    },
    {
      level: "moyen",
      minAmountFcfa: 500000,
      maxAmountFcfa: 1500000,
      accessoryTypes: ["tapis", "coussins", "table_basse", "luminaire", "rideaux", "objet_mural"],
      description: "Tapis, coussins, table basse, luminaire, rideaux, 1 objet mural",
    },
    {
      level: "eleve",
      minAmountFcfa: 1500000,
      maxAmountFcfa: null,
      accessoryTypes: ["tapis", "luminaire", "papier_peint", "rideaux", "table_basse", "console", "accessoires"],
      description: "Tapis premium, luminaires multiples, papier peint, rideaux sur mesure, table basse, console, accessoires coordonnés",
    },
  ];

  for (const tier of budgetTiers) {
    await prisma.budgetTier.upsert({
      where: { level: tier.level },
      update: tier,
      create: tier,
    });
  }
  console.log(`✓ ${budgetTiers.length} budget tiers seeded`);

  // ─── Catalogue produits (exemples) ───────────────────────────────────────

  const catalog = [
    { name: "Tapis berbère ivoire", type: "tapis", styles: ["boheme", "africain", "minimaliste"], colors: ["ivoire", "beige"], priceFcfa: 85000, budgetLevel: "bas", description: "Tapis en laine naturelle motif berbère" },
    { name: "Tapis jute naturel", type: "tapis", styles: ["boheme", "africain"], colors: ["naturel", "brun clair"], priceFcfa: 65000, budgetLevel: "bas", description: "Tapis en jute tressé" },
    { name: "Tapis velours gris", type: "tapis", styles: ["moderne", "minimaliste"], colors: ["gris"], priceFcfa: 180000, budgetLevel: "moyen", description: "Tapis velours ras, gris anthracite" },
    { name: "Tapis soie premium", type: "tapis", styles: ["luxe", "chic"], colors: ["crème", "or"], priceFcfa: 650000, budgetLevel: "eleve", description: "Tapis en soie naturelle, motifs orientaux" },

    { name: "Rideaux lin écru", type: "rideaux", styles: ["minimaliste", "boheme"], colors: ["écru", "naturel"], priceFcfa: 45000, budgetLevel: "bas", description: "Rideaux en lin lavé, tombé naturel" },
    { name: "Rideaux velours bordeaux", type: "rideaux", styles: ["chic", "luxe"], colors: ["bordeaux"], priceFcfa: 280000, budgetLevel: "moyen", description: "Rideaux en velours épais, doublés" },
    { name: "Voilages blancs", type: "rideaux", styles: ["moderne", "minimaliste"], colors: ["blanc"], priceFcfa: 35000, budgetLevel: "bas", description: "Voilages légers en polyester" },

    { name: "Coussins velours moutarde (x2)", type: "coussins", styles: ["boheme", "moderne"], colors: ["moutarde"], priceFcfa: 28000, budgetLevel: "bas", description: "Lot de 2 coussins velours 45x45cm" },
    { name: "Coussins brodés africains (x2)", type: "coussins", styles: ["africain", "boheme"], colors: ["terracotta", "ocre"], priceFcfa: 42000, budgetLevel: "bas", description: "Coussins à motifs brodés à la main" },
    { name: "Coussins cachemire crème (x2)", type: "coussins", styles: ["luxe", "minimaliste"], colors: ["crème"], priceFcfa: 125000, budgetLevel: "moyen", description: "Coussins en cachemire pure" },

    { name: "Lampadaire arc métal noir", type: "luminaire", styles: ["moderne", "minimaliste"], colors: ["noir"], priceFcfa: 95000, budgetLevel: "bas", description: "Lampadaire arc en métal noir mat" },
    { name: "Suspension laiton doré", type: "luminaire", styles: ["chic", "luxe"], colors: ["laiton", "or"], priceFcfa: 220000, budgetLevel: "moyen", description: "Suspension en laiton brossé, abat-jour en lin" },
    { name: "Lampe de table rotin", type: "luminaire", styles: ["boheme", "africain"], colors: ["naturel", "brun"], priceFcfa: 55000, budgetLevel: "bas", description: "Lampe de table en rotin tressé" },

    { name: "Table basse bois massif", type: "table_basse", styles: ["africain", "boheme", "minimaliste"], colors: ["brun", "naturel"], priceFcfa: 185000, budgetLevel: "moyen", description: "Table basse en bois d'acacia massif" },
    { name: "Table basse marbre blanc", type: "table_basse", styles: ["chic", "luxe", "moderne"], colors: ["blanc", "noir"], priceFcfa: 450000, budgetLevel: "eleve", description: "Table basse plateau en marbre de Carrare" },

    { name: "Papier peint tropical", type: "papier_peint", styles: ["boheme", "africain"], colors: ["vert", "naturel"], priceFcfa: 95000, budgetLevel: "moyen", description: "Papier peint motifs feuilles tropicales, rouleau 10m" },
    { name: "Papier peint géométrique", type: "papier_peint", styles: ["moderne", "chic"], colors: ["gris", "or"], priceFcfa: 120000, budgetLevel: "moyen", description: "Papier peint motifs géométriques dorés" },
  ];

  for (const item of catalog) {
    await prisma.accessoryCatalog.upsert({
      where: { id: item.name },
      update: item,
      create: { ...item, id: item.name },
    });
  }
  console.log(`✓ ${catalog.length} catalog items seeded`);

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
