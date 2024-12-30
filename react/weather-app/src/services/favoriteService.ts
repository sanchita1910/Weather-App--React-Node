const API_BASE_URL = "https://weatherappbackend-441501.uw.r.appspot.com";
// const API_BASE_URL = "http://localhost:5001";


export const favoriteService = {
  // Get all favorites
  getFavorites: async () => {
    const response = await fetch(`${API_BASE_URL}/favorites`);
    if (!response.ok) throw new Error("Failed to fetch favorites");
    return response.json();
  },

  // Add favorite
  addFavorite: async (favoriteData) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(favoriteData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    return response.json();
  },

  // Remove favorite
  removeFavorite: async (id) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to remove favorite");
    return response.json();
  },
};
