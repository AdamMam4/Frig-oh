import { RecipeCard } from "./RecipeCard";
import { RecipeDetail } from "./RecipeDetail";
import { Input } from "./ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { recipes as staticRecipes, Recipe } from "../data/recipes";
import { apiService, resolveImageUrl } from "../services/api";
import { useToast } from "../hooks/use-toast";

export function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiRecipes, setApiRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    console.log(" RecipesPage: Chargement initial");
    loadRecipes();
    loadFavorites();
  }, []);

  const loadRecipes = async () => {
    console.log(" Chargement des recettes...");

    if (!apiService.isAuthenticated()) {
      console.log(" Utilisateur non authentifié - skip du chargement");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(" Appel API getUserRecipes...");
      const recipes = await apiService.getUserRecipes();
      console.log(" Recettes reçues:", recipes);
      console.log(" Nombre de recettes:", recipes.length);
      setApiRecipes(recipes);
    } catch (error: any) {
      console.error(" Erreur lors du chargement des recettes:", error);
      console.error("Impossible de charger vos recettes:", error.message);
    } finally {
      setLoading(false);
      console.log(" Fin du chargement des recettes");
    }
  };

  const loadFavorites = async () => {
    if (!apiService.isAuthenticated()) return;
    try {
      const ids = await apiService.getFavoriteIds();
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Erreur chargement favoris:", error);
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!apiService.isAuthenticated()) {
      console.error("Vous devez être connecté pour ajouter des favoris");
      return;
    }

    try {
      if (favoriteIds.includes(recipeId)) {
        await apiService.removeFavorite(recipeId);
        setFavoriteIds(favoriteIds.filter((id) => id !== recipeId));
        console.log(" Recette retirée des favoris");
      } else {
        await apiService.addFavorite(recipeId);
        setFavoriteIds([...favoriteIds, recipeId]);
        console.log(" Recette ajoutée aux favoris");
      }
    } catch (error: any) {
      console.error(" Impossible de modifier les favoris:", error.message);
    }
  };

  const convertedApiRecipes: Recipe[] = apiRecipes.map((recipe) => {
    console.log("🔄 Conversion recette:", recipe.title, "- IA:", recipe.is_ai_generated);

    // Use custom image if set, otherwise default based on type
    let imageUrl = resolveImageUrl(recipe.image_url);
    if (!imageUrl) {
      imageUrl = recipe.is_ai_generated
        ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
        : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400";
    }

    return {
      id: recipe.id || recipe._id,
      name: recipe.title,
      image: imageUrl,
      difficulty: recipe.difficulty || "Moyen",
      time: `${recipe.cooking_time} min`,
      servings: recipe.servings,
      ingredients: recipe.ingredients.map((ing: string) => ({ name: ing, quantity: "" })),
      instructions: recipe.instructions,
      isAiGenerated: recipe.is_ai_generated || false,
    };
  });

  console.log(" Recettes converties de l API:", convertedApiRecipes.length);
  console.log(" Recettes statiques:", staticRecipes.length);

  const allRecipes = [...convertedApiRecipes, ...staticRecipes];

  console.log(" Total recettes combinées:", allRecipes.length);

  const filteredRecipes = allRecipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficulties = ["Facile", "Moyen", "Difficile"];

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Collection de Recettes</h1>
          <p className="text-muted-foreground text-lg">Parcourez notre sélection gastronomique</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && (
          <>
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une recette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-full bg-card border-border text-lg"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-5 h-5" />
                <span>Niveau de difficulté</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant={selectedDifficulty === null ? "default" : "outline"}
                  size="lg"
                  onClick={() => setSelectedDifficulty(null)}
                  className={
                    selectedDifficulty === null
                      ? "rounded-full bg-primary hover:bg-primary/90 text-black"
                      : "rounded-full border-primary/30 hover:bg-primary/10"
                  }
                >
                  Toutes
                </Button>
                {difficulties.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "outline"}
                    size="lg"
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={
                      selectedDifficulty === difficulty
                        ? "rounded-full bg-primary hover:bg-primary/90 text-black"
                        : "rounded-full border-primary/30 hover:bg-primary/10"
                    }
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-2xl display-font">
                {filteredRecipes.length} recettes disponibles
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  name={recipe.name}
                  image={recipe.image}
                  difficulty={recipe.difficulty}
                  time={recipe.time}
                  isFavorite={favoriteIds.includes(recipe.id)}
                  onFavoriteClick={() => toggleFavorite(recipe.id)}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-16 space-y-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl mb-2 display-font">Aucune recette trouvée</h3>
                  <p className="text-muted-foreground text-lg">
                    Essayez de modifier vos critères de recherche
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetail
        recipe={selectedRecipe}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        canEdit={
          selectedRecipe ? apiRecipes.some((r) => (r.id || r._id) === selectedRecipe.id) : false
        }
        onImageUpdate={(recipeId, newImageUrl) => {
          const resolvedUrl = resolveImageUrl(newImageUrl) || newImageUrl;
          // Update local state
          setApiRecipes((prev) =>
            prev.map((r) => ((r.id || r._id) === recipeId ? { ...r, image_url: newImageUrl } : r)),
          );
          // Update selected recipe
          if (selectedRecipe && selectedRecipe.id === recipeId) {
            setSelectedRecipe({ ...selectedRecipe, image: resolvedUrl });
          }
        }}
      />
    </div>
  );
}
