import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Sparkles, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RecipeCardProps {
  name: string;
  image: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  time: string;
  isAiGenerated?: boolean;
  matchPercentage?: number;
  isFavorite?: boolean;
  onFavoriteClick?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export function RecipeCard({
  name,
  image,
  difficulty,
  time,
  isAiGenerated = false,
  matchPercentage,
  isFavorite = false,
  onFavoriteClick,
  onClick,
}: RecipeCardProps) {
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
    <Card
      className="relative overflow-hidden cursor-pointer group border-0 bg-transparent"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
        {/* Image with overlay */}
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onFavoriteClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick(e);
              }}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                isFavorite
                  ? "bg-red-500/90 text-white"
                  : "bg-black/30 text-white hover:bg-red-500/70"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
          {isAiGenerated && (
            <Badge className="bg-purple-500/90 text-white backdrop-blur-sm border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              IA
            </Badge>
          )}
          {matchPercentage && matchPercentage > 0 && (
            <Badge className="bg-primary/90 text-black backdrop-blur-sm border-0 shadow-lg font-semibold">
              {matchPercentage}%
            </Badge>
          )}
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl mb-3 text-white group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{time}</span>
            </div>

            <Badge
              variant="outline"
              className={`${getDifficultyColor(difficulty)} backdrop-blur-sm border`}
            >
              {difficulty}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
