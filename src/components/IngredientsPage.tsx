import { useState, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Search,
  X,
  Plus,
  Apple,
  Carrot,
  Fish,
  Beef,
  Cookie,
  Sparkles,
  Loader2,
  Camera,
} from "lucide-react";
import { apiService } from "../services/api";

interface IngredientsPageProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  onNavigate?: (page: string) => void;
}

const categoryIcons: Record<string, any> = {
  Fruits: Apple,
  Légumes: Carrot,
  Viandes: Beef,
  Poissons: Fish,
  Desserts: Cookie,
};

const commonIngredients = [
  { name: "tomates", category: "Légumes" },
  { name: "oignons", category: "Légumes" },
  { name: "ail", category: "Légumes" },
  { name: "carottes", category: "Légumes" },
  { name: "pommes de terre", category: "Légumes" },
  { name: "courgette", category: "Légumes" },
  { name: "poireau", category: "Légumes" },
  { name: "concombre", category: "Légumes" },
  { name: "avocat", category: "Légumes" },
  { name: "champignons", category: "Légumes" },
  { name: "salade romaine", category: "Légumes" },
  { name: "basilic", category: "Herbes" },
  { name: "coriandre", category: "Herbes" },
  { name: "thym", category: "Herbes" },
  { name: "romarin", category: "Herbes" },
  { name: "poulet", category: "Viandes" },
  { name: "bœuf", category: "Viandes" },
  { name: "bœuf haché", category: "Viandes" },
  { name: "porc", category: "Viandes" },
  { name: "bacon", category: "Viandes" },
  { name: "jambon", category: "Viandes" },
  { name: "saumon", category: "Poissons" },
  { name: "thon", category: "Poissons" },
  { name: "anchois", category: "Poissons" },
  { name: "pommes", category: "Fruits" },
  { name: "bananes", category: "Fruits" },
  { name: "citron", category: "Fruits" },
  { name: "citron vert", category: "Fruits" },
  { name: "œufs", category: "Protéines" },
  { name: "lait", category: "Produits laitiers" },
  { name: "fromage", category: "Produits laitiers" },
  { name: "parmesan", category: "Produits laitiers" },
  { name: "mozzarella", category: "Produits laitiers" },
  { name: "cheddar", category: "Produits laitiers" },
  { name: "beurre", category: "Produits laitiers" },
  { name: "crème fraîche", category: "Produits laitiers" },
  { name: "lait de coco", category: "Produits laitiers" },
  { name: "pâtes", category: "Féculents" },
  { name: "riz", category: "Féculents" },
  { name: "riz basmati", category: "Féculents" },
  { name: "riz arborio", category: "Féculents" },
  { name: "pain", category: "Féculents" },
  { name: "farine", category: "Féculents" },
  { name: "tortillas", category: "Féculents" },
  { name: "chocolat noir", category: "Desserts" },
  { name: "sucre", category: "Desserts" },
  { name: "pâte feuilletée", category: "Pâtisserie" },
];

export function IngredientsPage({ ingredients, setIngredients, onNavigate }: IngredientsPageProps) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [showIngredientsDialog, setShowIngredientsDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addIngredient = (ingredient: string) => {
    const normalizedIngredient = ingredient.trim().toLowerCase();
    if (normalizedIngredient && !ingredients.includes(normalizedIngredient)) {
      setIngredients([...ingredients, normalizedIngredient]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleGenerateRecipe = async () => {
    console.log("🚀 Début de la génération de recette");
    console.log("📦 Ingrédients sélectionnés:", ingredients);

    if (ingredients.length === 0) {
      console.log("⚠️ Aucun ingrédient sélectionné");
      alert("Veuillez ajouter au moins un ingrédient pour générer une recette");
      return;
    }

    if (!apiService.isAuthenticated()) {
      console.log("⚠️ Utilisateur non authentifié");
      alert("Vous devez être connecté pour générer une recette avec l'IA");
      return;
    }

    try {
      setGenerating(true);
      console.log("🔄 Appel de l'API generateRecipe...");

      const recipe = await apiService.generateRecipe(ingredients);

      console.log("✅ Recette générée avec succès:", recipe);
      console.log("📝 Titre:", recipe.title);
      console.log("⏱️ Temps de cuisson:", recipe.cooking_time);
      console.log("📊 Difficulté:", recipe.difficulty);

      // Sauvegarder la recette automatiquement
      const savedRecipe = await apiService.saveRecipe({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cooking_time: recipe.cooking_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        image_url: recipe.image_url,
      });

      console.log("💾 Recette sauvegardée:", savedRecipe);

      alert(`✨ Recette générée ! "${recipe.title}" a été créée et ajoutée à votre collection`);

      console.log("⏳ Redirection vers la page recettes dans 1.5s...");
      setTimeout(() => {
        if (onNavigate) {
          console.log("➡️ Navigation vers la page recettes");
          onNavigate("recipes");
        }
      }, 1500);
    } catch (error: any) {
      console.error("❌ Erreur lors de la génération:", error);
      console.error("📄 Détails de l'erreur:", error.message);
      alert(error.message || "Impossible de générer la recette");
    } finally {
      setGenerating(false);
      console.log("🏁 Fin du processus de génération");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient(inputValue);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 10 MB");
      return;
    }

    if (!apiService.isAuthenticated()) {
      alert("Vous devez être connecté pour analyser des images");
      return;
    }

    try {
      setAnalyzingImage(true);
      console.log("📸 Analyse de l'image:", file.name);

      const detectedIngs = await apiService.analyzeIngredientsFromImage(file);

      console.log("✅ Ingrédients détectés:", detectedIngs);

      if (detectedIngs.length === 0) {
        alert("Aucun ingrédient détecté. Essayez avec une autre image plus claire");
      } else {
        setDetectedIngredients(detectedIngs);
        setShowIngredientsDialog(true);
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de l'analyse:", error);
      alert(error.message || "Impossible d'analyser l'image");
    } finally {
      setAnalyzingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmIngredients = () => {
    // Add detected ingredients to the current list
    const newIngredients = [...ingredients];
    detectedIngredients.forEach((ing) => {
      const normalized = ing.trim().toLowerCase();
      if (normalized && !newIngredients.includes(normalized)) {
        newIngredients.push(normalized);
      }
    });
    setIngredients(newIngredients);
    setShowIngredientsDialog(false);
    console.log(`✅ ${detectedIngredients.length} ingrédient(s) ajouté(s) à votre sélection`);
  };

  const handleCancelIngredients = () => {
    setShowIngredientsDialog(false);
    setDetectedIngredients([]);
  };

  const filteredCommonIngredients = commonIngredients.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedIngredients = filteredCommonIngredients.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof commonIngredients>,
  );

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-5xl mb-2 display-font text-primary">Mes Ingrédients</h1>
          <p className="text-muted-foreground text-lg">Gérez votre garde-manger</p>
        </div>

        {/* Add Ingredient */}
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Ajouter un ingrédient personnalisé..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-14 rounded-full bg-card border-border text-lg"
            />
          </div>
          <Button
            onClick={() => addIngredient(inputValue)}
            className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-black"
          >
            Ajouter
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzingImage}
            className="h-14 px-6 rounded-full bg-primary hover:bg-primary/90 text-black"
            title="Analyser une photo"
          >
            {analyzingImage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* My Ingredients */}
        {ingredients.length > 0 && (
          <Card className="p-6 space-y-4 bg-card border-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl display-font">Votre sélection ({ingredients.length})</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIngredients([])}
                  className="rounded-full border-primary/30 hover:bg-primary/10"
                >
                  Tout effacer
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateRecipe}
                  disabled={generating}
                  className="rounded-full bg-primary hover:bg-primary/90 text-black"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Générer une recette avec l'IA
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} className="px-4 py-2 bg-primary text-black border-0">
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-2 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Search Common Ingredients */}
        <div className="space-y-4">
          <h3 className="text-2xl display-font">Ingrédients courants</h3>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full bg-card border-border text-lg"
            />
          </div>
        </div>

        {/* Common Ingredients by Category */}
        <div className="space-y-6">
          {Object.entries(groupedIngredients).map(([category, items]) => {
            const Icon = categoryIcons[category] || Apple;
            return (
              <div key={category} className="space-y-3">
                <h4 className="flex items-center gap-2 text-xl text-primary">
                  <Icon className="w-5 h-5" />
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => {
                    const isAdded = ingredients.includes(item.name);
                    return (
                      <Badge
                        key={index}
                        className={`px-4 py-2 cursor-pointer transition-all ${
                          isAdded
                            ? "bg-primary text-black border-0"
                            : "bg-card border border-primary/30 text-foreground hover:bg-primary/10"
                        }`}
                        onClick={() => {
                          if (isAdded) {
                            removeIngredient(item.name);
                          } else {
                            addIngredient(item.name);
                          }
                        }}
                      >
                        {item.name}
                        {isAdded && <X className="w-3 h-3 ml-1.5" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ingredients Detection Dialog */}
      <AlertDialog open={showIngredientsDialog} onOpenChange={setShowIngredientsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 Ingrédients détectés !</AlertDialogTitle>
            <AlertDialogDescription>
              L'IA a identifié les ingrédients suivants dans votre image :
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-wrap gap-2 my-4">
            {detectedIngredients.map((ingredient, index) => (
              <Badge key={index} className="px-4 py-2 bg-primary text-black border-0">
                {ingredient}
              </Badge>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelIngredients}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmIngredients}>
              Ajouter à ma sélection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
