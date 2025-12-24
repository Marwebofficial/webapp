import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const siteConfig = {
  name: "My Next.js App",
  description: "A Next.js app with Firebase and Tailwind CSS.",
  url: "http://localhost:3001",
  WHATSAPP_NUMBER: "2348060128795",
};

export function getFundingInfo(amount: number) {
  if (isNaN(amount) || amount <= 0) {
    return { amountToReceive: 0, charge: 0 };
  }
  const charge = 50; // ₦50 flat fee
  const amountToReceive = amount - charge;
  return { amountToReceive: amountToReceive > 0 ? amountToReceive : 0, charge };
}