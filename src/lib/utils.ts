// bring in tools for combining styles
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// helper that combines multiple style names
export function cn(...inputs: ClassValue[]) {
  // merge all styles into one string
  return twMerge(clsx(inputs));
}
