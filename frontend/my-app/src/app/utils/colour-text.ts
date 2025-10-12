// somewhere near the component (or in a util)
export const COLOUR_TEXT: Record<string, string> = {
  red: "text-red-600",
  blue: "text-blue-600",
  yellow: "text-yellow-600",
  green: "text-green-600",
  pink: "text-pink-600",
  purple: "text-purple-600",
  black: "text-gray-800",
  white: "text-gray-500",
};

export const getColourTextClass = (c?: string) =>
  c ? (COLOUR_TEXT[c.toLowerCase()] ?? "text-gray-500") : "text-gray-500";
