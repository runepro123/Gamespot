import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function formatRating(rating: number | null): string {
  if (rating === null) return "0.0";
  return rating.toFixed(1);
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getGenreIcon(genre: string): string {
  const genres: Record<string, string> = {
    action: 'Swords',
    adventure: 'Map',
    rpg: 'Skull',
    strategy: 'ChessKnight',
    simulation: 'Gamepad2',
    sports: 'Trophy',
    racing: 'Car',
    puzzle: 'PuzzlePiece',
    shooter: 'Target',
    fighting: 'Fist',
    platformer: 'Flag',
    survival: 'Tent',
    horror: 'Ghost',
    other: 'Gamepad'
  };

  return genres[genre.toLowerCase()] || 'Gamepad';
}
