import { apiRequest } from "./queryClient";
import type { MediaItem, InsertMediaItem, TMDBSearchResult, JikanSearchResult } from "@shared/schema";

export interface MediaStats {
  total: number;
  watching: number;
  completed: number;
  planned: number;
  movies: number;
  tvShows: number;
  anime: number;
  avgRating: number;
}

export const mediaApi = {
  // Get all media items with optional filters
  getMediaItems: async (params?: { 
    status?: string; 
    type?: string; 
    search?: string; 
  }): Promise<MediaItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    
    const url = `/api/media${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiRequest('GET', url);
    return response.json();
  },

  // Get single media item
  getMediaItem: async (id: number): Promise<MediaItem> => {
    const response = await apiRequest('GET', `/api/media/${id}`);
    return response.json();
  },

  // Create new media item
  createMediaItem: async (data: InsertMediaItem): Promise<MediaItem> => {
    const response = await apiRequest('POST', '/api/media', data);
    return response.json();
  },

  // Update media item
  updateMediaItem: async (id: number, data: Partial<InsertMediaItem>): Promise<MediaItem> => {
    const response = await apiRequest('PATCH', `/api/media/${id}`, data);
    return response.json();
  },

  // Delete media item
  deleteMediaItem: async (id: number): Promise<void> => {
    await apiRequest('DELETE', `/api/media/${id}`);
  },

  // Get statistics
  getStats: async (): Promise<MediaStats> => {
    const response = await apiRequest('GET', '/api/stats');
    return response.json();
  },

  // Search TMDB for movies/TV
  searchTMDB: async (query: string, type: 'movie' | 'tv' = 'movie'): Promise<TMDBSearchResult[]> => {
    const response = await apiRequest('GET', `/api/search/tmdb?query=${encodeURIComponent(query)}&type=${type}`);
    return response.json();
  },

  // Search Jikan for anime
  searchJikan: async (query: string): Promise<JikanSearchResult[]> => {
    const response = await apiRequest('GET', `/api/search/jikan?query=${encodeURIComponent(query)}`);
    return response.json();
  },
};
