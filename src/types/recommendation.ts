export type FurnitureType = "canape" | "lit" | "fauteuil" | "table" | "bureau";
export type DominantColor = "beige" | "bleu_nuit" | "vert_olive" | "gris" | "marron" | "blanc";
export type Style =
  | "moderne" | "chic" | "minimaliste" | "africain" | "boheme" | "luxe"
  | "sahel_chic" | "wax_moderne" | "bantou_minimaliste" | "bogolan_urbain";
export type BudgetLevel = "bas" | "moyen" | "eleve";
export type RoomType = "salon" | "chambre" | "bureau" | "salle_a_manger";
export type AccessoryType =
  | "tapis" | "rideaux" | "coussins" | "luminaire" | "table_basse"
  | "papier_peint" | "objet_mural" | "console" | "accessoires";

export interface RecommendationInput {
  furnitureType: FurnitureType;
  dominantColor: DominantColor;
  room: RoomType;
  style: Style;
  budgetFcfa: number;
  // Localisation (optionnel — filtre géographique)
  city?: string;
  country?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: string;
  priceFcfa: number;
  budgetLevel: string;
  description: string | null;
  imageUrl: string | null;
  // Vendeur local
  vendorName?: string | null;
  vendorContactWhatsapp?: string | null;
  vendorType?: string | null;
  city?: string | null;
  country?: string | null;
  isHandmade?: boolean;
  tropicalFriendly?: boolean;
}

export interface AccessoryRecommendation {
  type: AccessoryType;
  colorSuggestions: string[];
  styleSuggestions: string[];
  styleMaterials: string[];
  styleColorPalette: string[];
  catalogItems: CatalogItem[];
}

export interface RecommendationResult {
  input: RecommendationInput;
  budgetLevel: BudgetLevel;
  budgetDescription: string;
  accessories: AccessoryRecommendation[];
  totalEstimateFcfa: number;
}
