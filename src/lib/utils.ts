import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const siteConfig = {
  name: "My Next.js App",
  description: "A Next.js app with Firebase and Tailwind CSS.",
  url: "http://localhost:3001",
};
