// Allow overriding the backend url via environment for dev/staging:
// set REACT_APP_API_BASE_URL to point to your backend (e.g. http://localhost:8000)
const API_BASE_URL = (process.env as any).REACT_APP_API_BASE_URL || "http://localhost:8000";

export interface GeneratedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  id?: string;
  _id?: string;
  user_id?: string;
  is_ai_generated?: boolean;
  created_at?: string;
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

  async generateRecipe(ingredients: string[]): Promise<GeneratedRecipe> {
    console.log("🌐 API: Génération de recette");
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
