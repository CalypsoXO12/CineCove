import { db } from "./db";
import { mediaItems } from "@shared/schema";

export async function seedDatabase() {
  // Check if data already exists
  const existingItems = await db.select().from(mediaItems).limit(1);
  if (existingItems.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
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
  console.log("Database seeded with sample data");
}