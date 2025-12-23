// Complete list of available ingredients
export const validIngredients = [
  // Vegetables
  'tomates', 'tomate', 'salade romaine', 'salade', 'oignon', 'oignons', 'ail',
  'carottes', 'carotte', 'poivrons', 'poivron', 'courgettes', 'courgette',
  'aubergines', 'aubergine', 'brocoli', 'chou-fleur', 'épinards', 'champignons',
  'pommes de terre', 'pomme de terre', 'patates douces', 'patate douce',
  
  // Meats and fish
  'poulet', 'bœuf', 'porc', 'agneau', 'bacon', 'saumon', 'thon', 'crevettes',
  
  // Dairy products
  'lait', 'crème', 'beurre', 'fromage', 'parmesan', 'mozzarella', 'gruyère',
  'yaourt', 'œufs', 'œuf',
  
  // Starches and grains
  'pâtes', 'riz', 'quinoa', 'pain', 'farine',
  
  // Condiments and spices
  'sel', 'poivre', 'huile', "huile d'olive", 'vinaigre', 'moutarde',
  'mayonnaise', 'ketchup', 'sauce soja', 'paprika', 'cumin', 'curry',
  
  // Fruits
  'citron', 'citrons', 'citron vert', 'pommes', 'pomme', 'bananes', 'banane',
  
  // Herbs
  'basilic', 'persil', 'coriandre', 'thym', 'romarin', 'menthe',
  
  // Others
  'sucre', 'miel', 'vin blanc', 'bouillon'
];

// Function to compute Levenshtein distance (similarity between two words)
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

// Function to find suggestions of similar ingredients
export function findSimilarIngredients(input: string, maxDistance: number = 2): string[] {
  const inputLower = input.toLowerCase().trim();
  
  // Check if the ingredient exists exactly
  if (validIngredients.includes(inputLower)) {
    return [];
  }

  // Find similar ingredients
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

// Function to check if an ingredient is valid
export function isValidIngredient(ingredient: string): boolean {
  return validIngredients.includes(ingredient.toLowerCase().trim());
}
