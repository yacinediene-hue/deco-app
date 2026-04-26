import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { AccessoryRecommendation } from "@/types/recommendation";

const COLORS = {
  bg: "#FAFAF9",
  white: "#FFFFFF",
  stone900: "#1C1917",
  stone600: "#57534E",
  stone400: "#A8A29E",
  stone100: "#F5F5F4",
  amber700: "#B45309",
  amber50: "#FFFBEB",
  border: "#E7E5E4",
};

const s = StyleSheet.create({
  page: { backgroundColor: COLORS.bg, padding: 40, fontFamily: "Helvetica" },
  header: { marginBottom: 24 },
  appName: { fontSize: 9, color: COLORS.amber700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: COLORS.stone900, marginBottom: 4 },
  meta: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },
  badge: { backgroundColor: COLORS.stone100, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 8, color: COLORS.stone600 },
  badgeAmber: { backgroundColor: COLORS.amber50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeAmberText: { fontSize: 8, color: COLORS.amber700 },
  total: { marginTop: 8, fontSize: 11, color: COLORS.stone600 },
  totalBold: { fontFamily: "Helvetica-Bold", color: COLORS.stone900 },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginVertical: 20 },
  section: { backgroundColor: COLORS.white, borderRadius: 8, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.stone900, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  chip: { backgroundColor: COLORS.amber50, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 12 },
  chipText: { fontSize: 7, color: COLORS.amber700 },
  product: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: COLORS.stone100 },
  productName: { fontSize: 9, color: COLORS.stone600, flex: 1 },
  productPrice: { fontSize: 9, fontFamily: "Helvetica-Bold", color: COLORS.stone900 },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 7, color: COLORS.stone400 },
});

const ACCESSORY_LABELS: Record<string, string> = {
  tapis: "Tapis", rideaux: "Rideaux", coussins: "Coussins", luminaire: "Luminaire",
  table_basse: "Table basse", papier_peint: "Papier peint", objet_mural: "Objet mural",
  console: "Console", accessoires: "Accessoires",
};

const BUDGET_LABEL: Record<string, string> = {
  bas: "Économique", moyen: "Intermédiaire", eleve: "Premium",
};

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

interface Props {
  title: string;
  decoStyle: string;
  budgetLevel: string;
  totalFcfa: number;
  accessories: AccessoryRecommendation[];
  date?: string;
}

export default function SimulationPDF({ title, decoStyle, budgetLevel, totalFcfa, accessories, date }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* En-tête */}
        <View style={s.header}>
          <Text style={s.appName}>DecoApp — Simulation déco</Text>
          <Text style={s.title}>{title}</Text>
          <View style={s.meta}>
            <View style={s.badge}><Text style={s.badgeText}>{decoStyle}</Text></View>
            <View style={s.badgeAmber}><Text style={s.badgeAmberText}>{BUDGET_LABEL[budgetLevel] ?? budgetLevel}</Text></View>
          </View>
          <Text style={s.total}>
            Estimation totale : <Text style={s.totalBold}>{formatFcfa(totalFcfa)}</Text>
          </Text>
          {date && <Text style={[s.total, { fontSize: 8, marginTop: 4 }]}>{date}</Text>}
        </View>

        <View style={s.divider} />

        {/* Accessoires */}
        {accessories.map((acc) => (
          <View key={acc.type} style={s.section}>
            <Text style={s.sectionTitle}>{ACCESSORY_LABELS[acc.type] ?? acc.type}</Text>

            {acc.colorSuggestions.length > 0 && (
              <View style={s.chips}>
                {acc.colorSuggestions.map((c) => (
                  <View key={c} style={s.chip}><Text style={s.chipText}>{c}</Text></View>
                ))}
              </View>
            )}

            {acc.catalogItems?.map((item) => (
              <View key={item.id} style={s.product}>
                <Text style={s.productName}>{item.name}{item.description ? `  —  ${item.description}` : ""}</Text>
                <Text style={s.productPrice}>{formatFcfa(item.priceFcfa)}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Généré par DecoApp</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
