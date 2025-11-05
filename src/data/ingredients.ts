// Liste complète des ingrédients disponibles
export const validIngredients = [
  // Légumes
  'tomates', 'tomate', 'salade romaine', 'salade', 'oignon', 'oignons', 'ail',
  'carottes', 'carotte', 'poivrons', 'poivron', 'courgettes', 'courgette',
  'aubergines', 'aubergine', 'brocoli', 'chou-fleur', 'épinards', 'champignons',
  'pommes de terre', 'pomme de terre', 'patates douces', 'patate douce',
  
  // Viandes et poissons
  'poulet', 'bœuf', 'porc', 'agneau', 'bacon', 'saumon', 'thon', 'crevettes',
  
  // Produits laitiers
  'lait', 'crème', 'beurre', 'fromage', 'parmesan', 'mozzarella', 'gruyère',
  'yaourt', 'œufs', 'œuf',
  
  // Féculents et céréales
  'pâtes', 'riz', 'quinoa', 'pain', 'farine',
  
  // Condiments et épices
  'sel', 'poivre', 'huile', "huile d'olive", 'vinaigre', 'moutarde',
  'mayonnaise', 'ketchup', 'sauce soja', 'paprika', 'cumin', 'curry',
  
  // Fruits
  'citron', 'citrons', 'citron vert', 'pommes', 'pomme', 'bananes', 'banane',
  
  // Herbes
  'basilic', 'persil', 'coriandre', 'thym', 'romarin', 'menthe',
  
  // Autres
  'sucre', 'miel', 'vin blanc', 'bouillon'
];

// Fonction pour calculer la distance de Levenshtein (similarité entre deux mots)
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

// Fonction pour trouver des suggestions d'ingrédients similaires
export function findSimilarIngredients(input: string, maxDistance: number = 2): string[] {
  const inputLower = input.toLowerCase().trim();
  
  // Vérifier si l'ingrédient existe exactement
  if (validIngredients.includes(inputLower)) {
    return [];
  }

  // Trouver les ingrédients similaires
  const suggestions = validIngredients
    .map(ingredient => ({
      ingredient,
      distance: levenshteinDistance(inputLower, ingredient)
    }))
    .filter(({ distance }) => distance <= maxDistance && distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .map(({ ingredient }) => ingredient)
    .slice(0, 3); // Maximum 3 suggestions

  return suggestions;
}

// Fonction pour vérifier si un ingrédient est valide
export function isValidIngredient(ingredient: string): boolean {
  return validIngredients.includes(ingredient.toLowerCase().trim());
}
