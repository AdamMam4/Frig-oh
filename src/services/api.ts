export const API_BASE_URL = "http://localhost:8000";

// Helper to resolve image URLs (handles both absolute URLs and relative paths)
export function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // If it's a relative path (starts with /), prefix with API base URL
  if (imageUrl.startsWith("/")) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  return imageUrl;
}

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  difficulty?: "Facile" | "Moyen" | "Difficile";
  image_url?: string | null;
  id?: string;
  _id?: string;
  user_id?: string;
  is_ai_generated?: boolean;
  created_at?: string;
}

export interface RecipePreview {
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  difficulty: "Facile" | "Moyen" | "Difficile";
  image_url?: string | null;
}

export interface UserStats {
  email: string;
  username: string;
  total_recipes: number;
  ai_generated_recipes: number;
  favorites_count: number;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem("access_token");
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async analyzeIngredientsFromImage(imageFile: File): Promise<string[]> {
    console.log("🌐 API: Analyse d'ingrédients depuis une image");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/analyze-ingredients`);
    console.log("🌐 Fichier:", imageFile.name);

    const formData = new FormData();
    formData.append("file", imageFile);

    const token = this.getAuthToken();

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/analyze-ingredients`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      console.log("🌐 Status de la réponse:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("🌐 Erreur 401: Non authentifié");
          throw new Error("Vous devez être connecté pour analyser des images");
        }

        let errorMessage = "Erreur lors de l'analyse de l'image";
        try {
          const error = await response.json();
          console.log("🌐 Erreur API:", error);
          errorMessage = error.detail || errorMessage;
        } catch (e) {
          console.log("🌐 Impossible de parser l'erreur JSON");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("🌐 Ingrédients détectés:", data.ingredients);
      return data.ingredients;
    } catch (error: any) {
      console.error("🌐 Exception lors de l'appel API:", error);
      // Re-throw with a proper message
      if (error.message) {
        throw error;
      }
      throw new Error("Impossible de se connecter au serveur");
    }
  }

  async generateRecipe(ingredients: string[]): Promise<RecipePreview> {
    console.log("🌐 API: Génération de recette (preview)");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/generate`);
    console.log("🌐 Ingrédients envoyés:", ingredients);

    const response = await fetch(`${API_BASE_URL}/recipes/generate`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(ingredients),
    });

    console.log("🌐 Status de la réponse:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🌐 Erreur 401: Non authentifié");
        throw new Error("Vous devez être connecté pour générer une recette avec l'IA");
      }
      const error = await response.json();
      console.log("🌐 Erreur API:", error);
      throw new Error(error.detail || "Erreur lors de la génération de la recette");
    }

    const data = await response.json();
    console.log("🌐 Recette générée reçue:", data);
    return data;
  }

  async saveRecipe(recipe: {
    title: string;
    ingredients: string[];
    instructions: string[];
    cooking_time: number;
    servings: number;
    difficulty: string;
    image_url?: string | null;
  }): Promise<GeneratedRecipe> {
    console.log("🌐 API: Sauvegarde de recette");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/save`);

    const response = await fetch(`${API_BASE_URL}/recipes/save`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(recipe),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Vous devez être connecté pour sauvegarder une recette");
      }
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la sauvegarde de la recette");
    }

    const data = await response.json();
    console.log("🌐 Recette sauvegardée:", data);
    return data;
  }

  async updateRecipeImage(recipeId: string, imageUrl: string): Promise<GeneratedRecipe> {
    console.log("🌐 API: Mise à jour image recette");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/${recipeId}`);

    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Vous devez être connecté");
      }
      if (response.status === 403) {
        throw new Error("Vous n'êtes pas autorisé à modifier cette recette");
      }
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la mise à jour de l'image");
    }

    return response.json();
  }

  async uploadRecipeImage(
    recipeId: string,
    file: File,
  ): Promise<{ message: string; image_url: string }> {
    console.log("🌐 API: Upload image recette");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/${recipeId}/upload-image`);

    const formData = new FormData();
    formData.append("file", file);

    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Vous devez être connecté");
      }
      if (response.status === 403) {
        throw new Error("Vous n'êtes pas autorisé à modifier cette recette");
      }
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de l'upload de l'image");
    }

    return response.json();
  }

  async getUserRecipes(): Promise<GeneratedRecipe[]> {
    console.log("🌐 API: Récupération des recettes utilisateur");
    console.log("🌐 URL:", `${API_BASE_URL}/recipes/`);

    const response = await fetch(`${API_BASE_URL}/recipes/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    console.log("🌐 Status de la réponse:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.log("🌐 Erreur 401: Non authentifié");
        throw new Error("Vous devez être connecté pour voir vos recettes");
      }
      const error = await response.json();
      console.log("🌐 Erreur API:", error);
      throw new Error(error.detail || "Erreur lors du chargement des recettes");
    }

    const data = await response.json();
    console.log("🌐 Recettes reçues:", data);
    console.log("🌐 Nombre de recettes:", data.length);
    return data;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; token_type: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur de connexion");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data;
  }

  async register(email: string, username: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de l'inscription");
    }

    return response.json();
  }

  async forgotPassword(
    email: string,
  ): Promise<{ message: string; email_sent: boolean; reset_code?: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la demande de réinitialisation");
    }

    return response.json();
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la réinitialisation du mot de passe");
    }

    return response.json();
  }

  async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Vous devez être connecté");
      }
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors du chargement des statistiques");
    }

    return response.json();
  }

  // Favorites API
  async addFavorite(recipeId: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/favorites/${recipeId}`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de l'ajout aux favoris");
    }

    return response.json();
  }

  async removeFavorite(recipeId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/favorites/${recipeId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la suppression des favoris");
    }

    return response.json();
  }

  async getFavorites(): Promise<GeneratedRecipe[]> {
    const response = await fetch(`${API_BASE_URL}/favorites/`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Vous devez être connecté pour voir vos favoris");
      }
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors du chargement des favoris");
    }

    return response.json();
  }

  async getFavoriteIds(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/favorites/ids`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.favorite_ids;
  }

  async checkFavorite(recipeId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/favorites/check/${recipeId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.is_favorite;
  }

  // Profile update methods
  async updateUsername(newUsername: string): Promise<{ message: string; username: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/update-username`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ new_username: newUsername }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la mise à jour du nom d'utilisateur");
    }

    return response.json();
  }

  async requestPasswordChange(): Promise<{
    message: string;
    email_sent: boolean;
    reset_code?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/auth/request-password-change`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors de la demande de changement de mot de passe");
    }

    return response.json();
  }

  async verifyPasswordChange(code: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-password-change`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ code, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Erreur lors du changement de mot de passe");
    }

    return response.json();
  }

  logout(): void {
    localStorage.removeItem("access_token");
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
