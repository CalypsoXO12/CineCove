import { db } from "./db";
import { mediaItems, users, upcomingReleases } from "@shared/schema";

export async function seedDatabase() {
  // Check if data already exists
  const existingItems = await db.select().from(mediaItems).limit(1);
  const existingUsers = await db.select().from(users).limit(1);
  
  if (existingItems.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create admin user
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      username: "Calypso",
      password: "lordofdarkness12",
      isAdmin: true
    });
    console.log("Admin user 'Calypso' created");
  }

  const sampleData = [
    {
      title: "Dune",
      type: "movie",
      status: "watching",
      rating: 9,
      notes: "Epic sci-fi masterpiece with stunning visuals",
      posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      tmdbId: 438631,
      jikanId: null,
      genre: "Science Fiction",
      year: 2021,
    },
    {
      title: "The Batman",
      type: "movie",
      status: "completed",
      rating: 8,
      notes: "Dark and gritty take on the Dark Knight",
      posterUrl: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
      tmdbId: 414906,
      jikanId: null,
      genre: "Action",
      year: 2022,
    },
    {
      title: "Breaking Bad",
      type: "tv",
      status: "completed",
      rating: 10,
      notes: "Greatest TV series of all time",
      posterUrl: "https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
      tmdbId: 1396,
      jikanId: null,
      genre: "Crime",
      year: 2008,
    },
    {
      title: "The Last of Us",
      type: "tv",
      status: "watching",
      rating: 9,
      notes: "Outstanding adaptation of the beloved game",
      posterUrl: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
      tmdbId: 100088,
      jikanId: null,
      genre: "Drama",
      year: 2023,
    },
    {
      title: "Attack on Titan",
      type: "anime",
      status: "completed",
      rating: 10,
      notes: "Mind-blowing finale, incredible storytelling",
      posterUrl: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      tmdbId: null,
      jikanId: 16498,
      genre: "Action",
      year: 2013,
    },
    {
      title: "Your Name",
      type: "anime",
      status: "planned",
      rating: null,
      notes: "Heard amazing things about this one",
      posterUrl: "https://cdn.myanimelist.net/images/anime/5/87048.jpg",
      tmdbId: null,
      jikanId: 32281,
      genre: "Romance",
      year: 2016,
    }
  ];

  await db.insert(mediaItems).values(sampleData);

  // Seed upcoming releases
  const upcomingData = [
    {
      title: "Dune: Part Three",
      type: "movie",
      releaseDate: "2026-07-17",
      posterUrl: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
      tmdbId: 708022,
      description: "The epic conclusion to Denis Villeneuve's Dune saga continues Paul Atreides' journey.",
      isHighlighted: true,
      userId: 1
    },
    {
      title: "Avatar 3",
      type: "movie", 
      releaseDate: "2025-12-19",
      posterUrl: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      tmdbId: 83533,
      description: "Jake Sully and his family continue their fight for survival on Pandora.",
      isHighlighted: true,
      userId: 1
    },
    {
      title: "The Winds of Winter",
      type: "tv",
      releaseDate: "2025-04-01",
      posterUrl: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      tmdbId: 1399,
      description: "House of the Dragon Season 3 brings more dragons and political intrigue.",
      isHighlighted: false,
      userId: 1
    },
    {
      title: "One Piece: Final Saga",
      type: "anime",
      releaseDate: "2025-01-07",
      posterUrl: "https://cdn.myanimelist.net/images/anime/1244/138851.jpg",
      jikanId: 21,
      description: "Luffy and the Straw Hats approach the final leg of their journey to find One Piece.",
      isHighlighted: true,
      userId: 1
    }
  ];

  await db.insert(upcomingReleases).values(upcomingData);

  console.log("Database seeded with sample data");
}