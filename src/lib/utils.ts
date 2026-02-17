import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAnalysis(text: string): string {

  if (!text) return ""

  return text

    .replace(/FRAMING/g, "\n\n## Framing\n")

    .replace(/LANGUAGE INTENSITY/g, "\n\n## Language Intensity\n")

    .replace(/SENSATIONALISM/g, "\n\n## Sensationalism\n")

    .replace(/OVERALL INTERPRETATION/g, "\n\n## Overall Interpretation\n")

    .replace(/ATTENTION AND SALIENCE/g, "\n\n## Attention & Salience\n")

    .replace(/EMOTIONAL TRIGGERS/g, "\n\n## Emotional Triggers\n")

    .replace(/SOCIAL AND IDENTITY CUES/g, "\n\n## Social & Identity Cues\n")

    .replace(/MOTIVATION AND ACTION SIGNALS/g, "\n\n## Motivation & Action Signals\n")

}
