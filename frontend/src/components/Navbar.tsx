import { useState } from "react";
import { Select, SelectItem } from "@heroui/react";
import { useTranslation } from "react-i18next";
import GitHubButton from "./GitHubButton";
import NexusModsButton from "./NexusModsButton";

import { OpenGitHub, OpenNexusMod } from "../../wailsjs/go/main/App";
import { UILanguage } from "@/i18n";

const i18nLanguages = [
  { key: UILanguage.EN, label: "English" },
  { key: UILanguage.ZH_TW, label: "繁體中文" },
  { key: UILanguage.ZH_CN, label: "简体中文" },
  { key: UILanguage.JA, label: "日本語" },
  { key: UILanguage.KR, label: "한국어" },
];

function Navbar() {
  const { t, i18n } = useTranslation();

  const [usedLanguage, setUsedLanguage] = useState(i18nLanguages[0].key);

  if (i18n.language !== usedLanguage) i18n.changeLanguage(usedLanguage);

  return (
    <div className="w-full flex items-center justify-end gap-2 mb-8 translate-x-[77px]">
      <p className="text-xs">{t("LABEL_I18N_LANGUAGE")}</p>
      {/* Language */}
      <Select
        className="min-w-[120px] w-30"
        size="sm"
        selectedKeys={[usedLanguage]}
        variant="bordered"
        fullWidth={false}
        onChange={(e) => setUsedLanguage(e.target.value)}
      >
        {i18nLanguages.map((option) => (
          <SelectItem key={option.key}>{option.label}</SelectItem>
        ))}
      </Select>
      {/* Nexus Mod Home Page */}
      <NexusModsButton size="medium" onClick={OpenNexusMod} />

      {/* GitHub Home Page */}
      <GitHubButton size="medium" onClick={OpenGitHub} />
    </div>
  );
}

export default Navbar;
