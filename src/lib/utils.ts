import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function converttoASCI(input: string){
  // removes non aschi characters
  const asciString = input.replace(/[^\x00-\x7F]+/g, "")
}