import React, { useMemo } from "react";
import { Select, SelectItem, SelectProps } from "@heroui/react";

import { Language, Languages } from "@/constants/languages";
import { isLatin } from "@/utils";

const options = [
  { key: Languages.English, label: "English" },
  { key: Languages.ChineseSimplified, label: "中文（简体）" },
  { key: Languages.ChineseTraditional, label: "中文（繁體）" },
  { key: Languages.Japanese, label: "日本語" },
  { key: Languages.Korean, label: "한국어" },
  { key: Languages.Spanish, label: "Español" },
  { key: Languages.French, label: "Français" },
  { key: Languages.German, label: "Deutsch" },
  { key: Languages.Italian, label: "Italiano" },
  { key: Languages.Polish, label: "Polski" },
  { key: Languages.Czech, label: "Čeština" },
  { key: Languages.Portuguese, label: "Português" },
  { key: Languages.Turkish, label: "Türkçe" },
  { key: Languages.Ukrainian, label: "Українська" },
  { key: Languages.Russian, label: "Русский" },
];

interface LanguageSelectProps {
  label?: string;
  value?: Language;
  disabledKeys?: SelectProps["disabledKeys"];
  onSelect?: (language: Language) => void;
  hideAsianLanguages?: boolean;
}

function LanguageSelect({
  label = "",
  value,
  disabledKeys,
  onSelect,
  hideAsianLanguages,
}: LanguageSelectProps) {
  const usedOptions = useMemo(() => {
    if (hideAsianLanguages) {
      return options.filter((language) => isLatin(language.key));
    }
    return options;
  }, [hideAsianLanguages]);

  const handleChanged: React.ChangeEventHandler<HTMLSelectElement> = (evt) => {
    const key = evt.target.value as Language;
    if (onSelect && usedOptions.find((language) => language.key === key)) {
      onSelect(key);
    }
  };

  return (
    <Select
      // className="max-w-xs"
      label={label}
      selectedKeys={value ? [value] : []}
      disabledKeys={disabledKeys}
      onChange={handleChanged}
    >
      {usedOptions.map((language) => (
        <SelectItem key={language.key}>{language.label}</SelectItem>
      ))}
    </Select>
  );
}

export default LanguageSelect;
