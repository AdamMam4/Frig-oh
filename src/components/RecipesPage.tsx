import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { Input } from './ui/input';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { recipes, Recipe } from '../data/recipes';

export function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const difficulties = ['Facile', 'Moyen', 'Difficile'];

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Collection de Recettes</h1>
          <p className="text-muted-foreground text-lg">
            Parcourez notre sélection gastronomique
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher une recette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-full bg-card border-border text-lg"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-5 h-5" />
            <span>Niveau de difficulté</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectedDifficulty === null ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedDifficulty(null)}
              className={selectedDifficulty === null 
                ? 'rounded-full bg-primary hover:bg-primary/90 text-black' 
                : 'rounded-full border-primary/30 hover:bg-primary/10'
              }
            >
              Toutes
            </Button>
            {difficulties.map(difficulty => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={selectedDifficulty === difficulty
                  ? 'rounded-full bg-primary hover:bg-primary/90 text-black'
                  : 'rounded-full border-primary/30 hover:bg-primary/10'
                }
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl display-font">{filteredRecipes.length} recettes disponibles</h3>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              name={recipe.name}
              image={recipe.image}
              difficulty={recipe.difficulty}
              time={recipe.time}
              onClick={() => handleRecipeClick(recipe)}
            />
          ))}
        </div>

        {/* Empty State */}
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
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetail
        recipe={selectedRecipe}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
