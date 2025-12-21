import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ChefHat, Clock, Users, Sparkles, CheckCircle2, Heart, Share2 } from "lucide-react";
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-3xl display-font text-primary pr-8">
            {recipe.name}
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <ImageWithFallback
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {recipe.isAiGenerated && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-purple-500/90 text-white backdrop-blur-sm border-0 shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                Générée par IA
              </Badge>
            </div>
          )}
          {matchPercentage && matchPercentage > 0 && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/90 text-black backdrop-blur-sm border-0 shadow-lg font-semibold">
                {matchPercentage}% d'ingrédients disponibles
              </Badge>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temps</p>
              <p className="font-semibold">{recipe.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Portions</p>
              <p className="font-semibold">{recipe.servings} pers.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Difficulté</p>
              <p className="font-semibold">{recipe.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <h3 className="text-2xl display-font text-primary">Ingrédients</h3>
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-background rounded-xl border border-primary/10 hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{ingredient.name}</span>
                </div>
                <span className="text-muted-foreground font-medium">{ingredient.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-primary/20" />

        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-2xl display-font text-primary">Préparation</h3>
          <ol className="space-y-4">
            {(recipe.instructions || recipe.steps || []).map((instruction, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-black font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 pt-2 leading-relaxed">{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-black text-base"
            size="lg"
          >
            Commencer la recette
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 aspect-square rounded-full border-primary/30 hover:bg-primary/10 p-0"
          >
            <Heart className="w-5 h-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 aspect-square rounded-full border-primary/30 hover:bg-primary/10 p-0"
          >
            <Share2 className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
