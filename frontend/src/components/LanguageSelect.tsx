import { Select, SelectItem, SelectProps } from "@heroui/react";

import { Language } from "@/constants/languages";

const options = [
  { key: Language.English, label: "English" },
  { key: Language.ChineseSimplified, label: "中文（简体）" },
  { key: Language.ChineseTraditional, label: "中文（繁體）" },
  { key: Language.Japanese, label: "日本語" },
  { key: Language.Korean, label: "한국어" },
  { key: Language.Spanish, label: "Español" },
  { key: Language.French, label: "Français" },
  { key: Language.German, label: "Deutsch" },
  { key: Language.Italian, label: "Italiano" },
  { key: Language.Polish, label: "Polski" },
  { key: Language.Czech, label: "Čeština" },
  { key: Language.Portuguese, label: "Português" },
  { key: Language.Turkish, label: "Türkçe" },
  { key: Language.Ukrainian, label: "Українська" },
  { key: Language.Russian, label: "Русский" },
];

interface LanguageSelectProps {
  label?: string;
  value?: Language;
  disabledKeys?: SelectProps["disabledKeys"];
}

function LanguageSelect({ label = "" }: LanguageSelectProps) {
  return (
    <Select
      className="max-w-xs"
      label={label}
      disabledKeys={[Language.English]}
    >
      {options.map((language) => (
        <SelectItem key={language.key}>{language.label}</SelectItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
