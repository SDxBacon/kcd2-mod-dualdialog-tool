import { useEffect, useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { useTranslation } from "react-i18next";
import GitHubButton from "./GitHubButton";
import NexusModsButton from "./NexusModsButton";

const i18nLanguages = [
  { key: "en", label: "English" },
  { key: "zh_tw", label: "繁體中文" },
  { key: "zh_cn", label: "简体中文" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
];

function Navbar() {
  const { t, i18n } = useTranslation();

  const [usedLanguage, setUsedLanguage] = useState(i18nLanguages[0].key);

  if (i18n.language !== usedLanguage) i18n.changeLanguage(usedLanguage);

  return (
    <div className="w-full flex items-center justify-end gap-2">
      {/* Language */}
      <Select
        className="max-w-xs"
        label={t("LABEL_I18N_LANGUAGE")}
        size="sm"
        value={usedLanguage}
        variant="bordered"
        labelPlacement="outside-left"
        onChange={(e) => setUsedLanguage(e.target.value)}
      >
        {i18nLanguages.map((option) => (
          <SelectItem key={option.key}>{option.label}</SelectItem>
        ))}
      </Select>
      {/* Nexus Mod Home Page */}
      <NexusModsButton
        size="medium"
        onClick={() => console.log("GitHub clicked")}
      />

      <GitHubButton
        size="medium"
        onClick={() => console.log("GitHub clicked")}
      />
      {/* GitHub Home Page */}
    </div>
  );
}

export default Navbar;
