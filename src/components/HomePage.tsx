import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, X, Sparkles, ChefHat, AlertCircle } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { recipes, Recipe, calculateMatchPercentage } from '../data/recipes';
import { isValidIngredient, findSimilarIngredients } from '../data/ingredients';

interface HomePageProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
}

export function HomePage({ ingredients, setIngredients }: HomePageProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState<(Recipe & { matchPercentage?: number })[]>([]);
  const [showAiRecipes, setShowAiRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<(Recipe & { matchPercentage?: number }) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addIngredient = (ingredientToAdd?: string) => {
    const ingredient = ingredientToAdd || inputValue;
    const trimmedIngredient = ingredient.trim().toLowerCase();
    
    // Vérifier si l'ingrédient n'est pas vide et n'est pas déjà dans la liste
    if (!trimmedIngredient || ingredients.includes(trimmedIngredient)) {
      return;
    }

    // Vérifier si l'ingrédient est valide
    if (isValidIngredient(trimmedIngredient)) {
      setIngredients([...ingredients, trimmedIngredient]);
      setInputValue('');
      setShowSuggestions(false);
      setIngredientSuggestions([]);
    } else {
      // Trouver des suggestions similaires
      const suggestions = findSimilarIngredients(trimmedIngredient);
      if (suggestions.length > 0) {
        setIngredientSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setIngredientSuggestions([]);
        setShowSuggestions(true);
      }
    }
  };

  const addSuggestedIngredient = (ingredient: string) => {
    addIngredient(ingredient);
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const findRecipes = () => {
    const recipesWithMatch = recipes.map(recipe => {
      const matchPercentage = calculateMatchPercentage(recipe, ingredients);
      return { ...recipe, matchPercentage };
    });

    const filtered = recipesWithMatch
      .filter(recipe => recipe.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setSuggestedRecipes(filtered);
    setShowAiRecipes(false);
  };

  const generateAiRecipes = () => {
    const aiRecipes: Recipe[] = [
      {
        id: 'ai-1',
        name: `Plat Créatif avec ${ingredients.slice(0, 2).join(' et ')}`,
        image: recipes[0].image,
        difficulty: 'Moyen',
        time: '30 min',
        servings: 2,
        ingredients: ingredients.map(ing => ({ name: ing, quantity: 'selon goût' })),
        instructions: [
          'Préparer tous les ingrédients.',
          'Suivre votre intuition culinaire pour créer un plat unique.',
          'Assaisonner selon votre goût.',
          'Servir chaud.'
        ],
        isAiGenerated: true
      },
      {
        id: 'ai-2',
        name: `Recette Fusion ${ingredients[0] || 'surprise'}`,
        image: recipes[1].image,
        difficulty: 'Facile',
        time: '20 min',
        servings: 2,
        ingredients: ingredients.map(ing => ({ name: ing, quantity: 'selon goût' })),
        instructions: [
          'Combiner les ingrédients de manière créative.',
          'Cuisiner avec amour et passion.',
          'Ajuster les assaisonnements.',
          'Déguster votre création unique.'
        ],
        isAiGenerated: true
      }
    ];
    setSuggestedRecipes(aiRecipes);
    setShowAiRecipes(true);
  };

  const handleRecipeClick = (recipe: Recipe & { matchPercentage?: number }) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 pt-2 sm:pt-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl flex items-center justify-center gap-2 sm:gap-3 text-primary display-font">
            <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            Frig'Oh
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Découvrez des recettes raffinées basées sur vos ingrédients
          </p>
        </div>

          {/* Search Bar */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Ajouter un ingrédient (ex: tomates, poulet...)"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(false);
                }}
                onKeyPress={handleKeyPress}
                className="pl-9 sm:pl-12 h-11 sm:h-12 lg:h-14 rounded-full bg-card border-border text-sm sm:text-base"
              />
            </div>
            <Button 
              onClick={() => addIngredient()}
              className="h-11 sm:h-12 lg:h-14 px-5 sm:px-6 lg:px-8 rounded-full bg-primary hover:bg-primary/90 text-black text-sm sm:text-base"
            >
              Ajouter
            </Button>
          </div>

          {/* Ingredient Suggestions */}
          {showSuggestions && (
            <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-lg">
              {ingredientSuggestions.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Ingrédient non reconnu. Vouliez-vous dire :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredientSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        onClick={() => addSuggestedIngredient(suggestion)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-primary/50 hover:bg-primary/10 hover:border-primary text-xs sm:text-sm"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowSuggestions(false)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground text-xs"
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Cet ingrédient n'est pas reconnu dans notre base de données.</span>
                  </div>
                  <Button
                    onClick={() => {
                      setShowSuggestions(false);
                      setInputValue('');
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground text-xs"
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {ingredients.map((ingredient, index) => (
                <Badge 
                  key={index} 
                  className="px-4 py-2 text-sm bg-card border border-primary/30 text-foreground hover:bg-primary/10"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-2 hover:text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4 max-w-2xl mx-auto">
          <Button 
            onClick={findRecipes}
            disabled={ingredients.length === 0}
            className="flex-1 h-11 sm:h-12 lg:h-14 rounded-full bg-primary hover:bg-primary/90 text-black text-sm sm:text-base"
            size="lg"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Trouver une recette
          </Button>
          <Button 
            onClick={generateAiRecipes}
            disabled={ingredients.length === 0}
            variant="outline"
            className="flex-1 h-11 sm:h-12 lg:h-14 rounded-full border-primary/30 hover:bg-primary/10 text-sm sm:text-base"
            size="lg"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Générer avec IA
          </Button>
        </div>

        {/* Results */}
        {suggestedRecipes.length > 0 && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-2xl lg:text-3xl display-font">
                {showAiRecipes ? 'Recettes générées par IA' : 'Recettes suggérées'}
              </h2>
              <Badge className="px-3 py-1 sm:px-4 sm:py-2 bg-primary/20 text-primary border-primary/30 text-xs sm:text-sm">
                {suggestedRecipes.length} résultats
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {suggestedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  name={recipe.name}
                  image={recipe.image}
                  difficulty={recipe.difficulty}
                  time={recipe.time}
                  isAiGenerated={recipe.isAiGenerated}
                  matchPercentage={recipe.matchPercentage}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {suggestedRecipes.length === 0 && ingredients.length > 0 && (
          <div className="text-center py-8 sm:py-12 lg:py-16 space-y-4 sm:space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl mb-1.5 sm:mb-2 display-font">Recherchez des recettes</h3>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Cliquez sur "Trouver une recette" ou "Générer avec IA"
              </p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {ingredients.length === 0 && (
          <div className="text-center py-8 sm:py-12 lg:py-16 space-y-4 sm:space-y-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl mb-1.5 sm:mb-2 display-font">Commencez votre aventure culinaire</h3>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Saisissez les ingrédients que vous avez chez vous
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetail
        recipe={selectedRecipe}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        matchPercentage={selectedRecipe?.matchPercentage}
      />
    </div>
  );
}
