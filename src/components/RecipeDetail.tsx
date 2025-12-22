import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ChefHat, Clock, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Recipe } from "../data/recipes";

interface RecipeDetailProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchPercentage?: number;
}

export function RecipeDetail({ recipe, open, onOpenChange, matchPercentage }: RecipeDetailProps) {
  if (!recipe) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Facile":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Moyen":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Difficile":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border-primary/20 p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl lg:text-3xl display-font text-primary pr-8">
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        {/* Image - hauteur contrainte sur tous les écrans (évite qu'elle cache le contenu) */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 max-h-[35vh] overflow-hidden rounded-lg sm:rounded-2xl">
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {recipe.isAiGenerated && (
            <div className="absolute top-1 right-1 sm:top-4 sm:right-4">
              <Badge className="bg-purple-500/90 text-white backdrop-blur-sm border-0 shadow-lg text-[10px] sm:text-sm px-1.5 py-0.5 sm:px-2.5 sm:py-0.5">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                Générée par IA
              </Badge>
            </div>
          )}
          {matchPercentage && matchPercentage > 0 && (
            <div className="absolute top-1 left-1 sm:top-4 sm:left-4">
              <Badge className="bg-primary/90 text-black backdrop-blur-sm border-0 shadow-lg font-semibold text-[10px] sm:text-sm px-1.5 py-0.5 sm:px-2.5 sm:py-0.5">
                {matchPercentage}% disponibles
              </Badge>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          <div className="flex flex-col items-center gap-0.5 sm:gap-2 p-1.5 sm:p-4 bg-background rounded-md sm:rounded-xl border border-primary/20">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            <div className="text-center">
              <p className="text-[8px] sm:text-xs text-muted-foreground leading-none">Temps</p>
              <p className="text-[10px] sm:text-base font-semibold leading-tight">{recipe.time}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:gap-2 p-1.5 sm:p-4 bg-background rounded-md sm:rounded-xl border border-primary/20">
            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            <div className="text-center">
              <p className="text-[8px] sm:text-xs text-muted-foreground leading-none">Portions</p>
              <p className="text-[10px] sm:text-base font-semibold leading-tight">
                {recipe.servings} pers.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 sm:gap-2 p-1.5 sm:p-4 bg-background rounded-md sm:rounded-xl border border-primary/20">
            <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
            <div className="text-center">
              <p className="text-[8px] sm:text-xs text-muted-foreground leading-none">Difficulté</p>
              <p className="text-[10px] sm:text-base font-semibold leading-tight">
                {recipe.difficulty}
              </p>
            </div>
          </div>
        </div>

        {/* Ingredients - compact sur mobile */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-base sm:text-2xl display-font text-primary">Ingrédients</h3>
          <div className="space-y-1 sm:space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 sm:p-4 bg-background rounded-md sm:rounded-xl border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="flex-1 text-xs sm:text-base font-medium">{ingredient.name}</span>
                <span className="text-xs sm:text-base text-muted-foreground font-medium">
                  {ingredient.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-primary/20" />

        {/* Instructions - compact sur mobile */}
        <div className="space-y-2 sm:space-y-4">
          <h3 className="text-base sm:text-2xl display-font text-primary">Préparation</h3>
          <ol className="space-y-2 sm:space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-2 sm:gap-4">
                <span className="flex items-center justify-center w-5 h-5 sm:w-10 sm:h-10 rounded-full bg-primary text-black text-xs sm:text-base font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 text-xs sm:text-base leading-relaxed">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
