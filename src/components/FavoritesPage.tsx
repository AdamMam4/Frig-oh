import { RecipeCard } from "./RecipeCard";
import { RecipeDetail } from "./RecipeDetail";
import { Search, Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Recipe, recipes as staticRecipes } from "../data/recipes";
import { apiService } from "../services/api";

interface FavoritesPageProps {
  onBack?: () => void;
}

export function FavoritesPage({ onBack }: FavoritesPageProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiFavorites, setApiFavorites] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!apiService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Charger les IDs des favoris et les recettes API en parallèle
      const [ids, favs] = await Promise.all([
        apiService.getFavoriteIds(),
        apiService.getFavorites(),
      ]);
      setFavoriteIds(ids);
      setApiFavorites(favs);
    } catch (error: any) {
      console.error("Erreur lors du chargement des favoris:", error);
      console.error("Impossible de charger vos favoris:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId: string) => {
    try {
      await apiService.removeFavorite(recipeId);
      setFavoriteIds(favoriteIds.filter((id) => id !== recipeId));
      setApiFavorites(apiFavorites.filter((f) => (f.id || f._id) !== recipeId));
      console.log("✅ Recette retirée des favoris");
    } catch (error: any) {
      console.error("❌ Impossible de retirer des favoris:", error.message);
    }
  };

  // Convertir les favoris API au format Recipe pour l'affichage
  const convertedApiFavorites: Recipe[] = apiFavorites.map((recipe) => ({
    id: recipe.id || recipe._id,
    name: recipe.title,
    image: recipe.is_ai_generated
      ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
      : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    difficulty: "Moyen" as const,
    time: `${recipe.cooking_time} min`,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((ing: string) => ({ name: ing, quantity: "" })),
    instructions: recipe.instructions,
    isAiGenerated: recipe.is_ai_generated || false,
  }));

  // Filtrer les recettes statiques qui sont en favoris
  const staticFavorites = staticRecipes.filter((recipe) => favoriteIds.includes(recipe.id));

  // Combiner les deux listes
  const allFavorites = [...convertedApiFavorites, ...staticFavorites];

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Mes Favoris</h1>
          <p className="text-muted-foreground text-lg">Retrouvez vos recettes préférées</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl display-font">{allFavorites.length} recettes favorites</h3>
            </div>

            {/* Recipes Grid */}
            {allFavorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allFavorites.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    name={recipe.name}
                    image={recipe.image}
                    difficulty={recipe.difficulty}
                    time={recipe.time}
                    isFavorite={true}
                    onFavoriteClick={() => removeFavorite(recipe.id)}
                    onClick={() => handleRecipeClick(recipe)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2 display-font">Aucun favori</h3>
                  <p className="text-muted-foreground text-lg">
                    Ajoutez des recettes à vos favoris en cliquant sur le cœur
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetail recipe={selectedRecipe} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
