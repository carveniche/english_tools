import { LOWERCASE } from "./lowerCase";
import { UPPERCASE } from "./upperCase";

export function getLetterPath(letter, isUpper) {
  const l = (letter || "a").toLowerCase();

  if (isUpper && UPPERCASE[l]) return UPPERCASE[l];
  if (!isUpper && LOWERCASE[l]) return LOWERCASE[l];

  return [[
    { x: 40, y: 40 },
    { x: 160, y: 40 },
    { x: 160, y: 180 },
    { x: 40, y: 180 }
  ]];
}