import { Language, Languages } from "@/constants/languages";

export function isLatin(language: Language) {
  switch (language) {
    case Languages.English:
    case Languages.Spanish:
    case Languages.French:
    case Languages.German:
    case Languages.Italian:
    case Languages.Polish:
    case Languages.Portuguese:
    case Languages.Turkish:
    case Languages.Ukrainian:
    case Languages.Russian:
    case Languages.Czech:
      return true;
    default:
      return false;
  }
}

export function getAsianLanguages() {
  return [
    Languages.ChineseSimplified,
    Languages.ChineseTraditional,
    Languages.Japanese,
    Languages.Korean,
  ];
}
