import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  ChefHat,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Upload,
  Link,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Recipe } from "../data/recipes";
import { apiService } from "../services/api";
import { useToast } from "../hooks/use-toast";

interface RecipeDetailProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchPercentage?: number;
  canEdit?: boolean;
  onImageUpdate?: (recipeId: string, newImageUrl: string) => void;
}

export function RecipeDetail({
  recipe,
  open,
  onOpenChange,
  matchPercentage,
  canEdit = false,
  onImageUpdate,
}: RecipeDetailProps) {
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleSaveImage = async () => {
    if (!recipe) return;

    setIsSaving(true);
    try {
      let finalImageUrl: string;

      if (imageMode === "upload" && selectedFile) {
        // Upload file
        const result = await apiService.uploadRecipeImage(recipe.id, selectedFile);
        finalImageUrl = result.image_url;
      } else if (imageMode === "url" && newImageUrl.trim()) {
        // Use URL
        await apiService.updateRecipeImage(recipe.id, newImageUrl.trim());
        finalImageUrl = newImageUrl.trim();
      } else {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image ou entrer une URL",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      toast({
        title: "Image mise à jour",
        description: "L'image de la recette a été modifiée avec succès.",
      });

      if (onImageUpdate) {
        onImageUpdate(recipe.id, finalImageUrl);
      }

      // Reset state
      setIsEditingImage(false);
      setNewImageUrl("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'image",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Utilisez une image JPG, PNG, GIF ou WebP",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale est de 5 Mo",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingImage(false);
    setNewImageUrl("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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

          {/* Edit Image Button */}
          {canEdit && (
            <Button
              onClick={() => setIsEditingImage(!isEditingImage)}
              className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
              size="sm"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Modifier l'image
            </Button>
          )}
        </div>

        {/* Edit Image Form */}
        {isEditingImage && canEdit && (
          <div className="bg-background border border-primary/20 rounded-xl p-4 space-y-4">
            <h4 className="font-medium text-sm">Modifier l'image de la recette</h4>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => setImageMode("upload")}
                variant={imageMode === "upload" ? "default" : "outline"}
                size="sm"
                className={imageMode === "upload" ? "bg-primary text-black" : ""}
              >
                <Upload className="w-4 h-4 mr-1" />
                Importer
              </Button>
              <Button
                onClick={() => setImageMode("url")}
                variant={imageMode === "url" ? "default" : "outline"}
                size="sm"
                className={imageMode === "url" ? "bg-primary text-black" : ""}
              >
                <Link className="w-4 h-4 mr-1" />
                URL
              </Button>
            </div>

            {/* Upload Mode */}
            {imageMode === "upload" && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-20 border-dashed border-2 hover:border-primary/50"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "Cliquez pour sélectionner une image"}
                    </span>
                  </div>
                </Button>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Formats acceptés : JPG, PNG, GIF, WebP (max 5 Mo)
                </p>
              </div>
            )}

            {/* URL Mode */}
            {imageMode === "url" && (
              <div className="space-y-3">
                <Input
                  placeholder="URL de l'image (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Astuce : Utilisez une URL d'image depuis Unsplash, Pexels ou autre source
                  d'images.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveImage}
                disabled={
                  isSaving ||
                  (imageMode === "url" && !newImageUrl.trim()) ||
                  (imageMode === "upload" && !selectedFile)
                }
                size="sm"
                className="bg-primary text-black hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
              <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                Annuler
              </Button>
            </div>
          </div>
        )}

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
            {(recipe.instructions || recipe.steps || []).map((instruction, index) => (
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
