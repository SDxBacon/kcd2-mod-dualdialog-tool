import { useState, useCallback } from "react";
import { Card, CardBody } from "@heroui/react";
import { Language, Languages } from "@/constants/languages";
import Navbar from "@/components/Navbar";
import ExportButton from "@/components/ExportButton";
import LanguageSelect from "@/components/LanguageSelect";
import KingdomComeFolderPicker from "@/components/KingdomComeFolderPicker";
// improt hooks & utilities
import isNil from "lodash/isNil";
import useExport from "@/hooks/useExport";
import { useTranslation } from "react-i18next";
import { getAsianLanguages } from "@/utils";
// import css
import "./App.css";
import "./i18n";

function App() {
  const { t } = useTranslation();

  const [folder, setFolder] = useState("");
  const [isFolderError, setIsFolderError] = useState(false);
  const [mainLanguage, setMainLanguage] = useState<Language | null>(null);
  const [subLanguage, setSubLanguage] = useState<Language | null>(null);

  // disabled main language keys
  const disabledSubLanguageKeys = isNil(mainLanguage)
    ? []
    : [mainLanguage, ...getAsianLanguages()];

  const startExport = useExport();

  const handleExportButtonPress = useCallback(() => {
    console.log("🚀 ~ handleExportButtonPress ~ mainLanguage:", mainLanguage);
    console.log("🚀 ~ handleExportButtonPress ~ subLanguage:", subLanguage);
    if (!mainLanguage || !subLanguage) {
      // fixme:
      startExport(Languages.ChineseTraditional, Languages.ChineseSimplified);
      return;
    }

    startExport(mainLanguage, subLanguage);
  }, [startExport]);

  const handleMainLanguageSelect = useCallback((language: Language) => {
    setMainLanguage(language);
    setSubLanguage(null); // reset sub language
  }, []);

  const handleSubLanguageSelect = useCallback((language: Language) => {
    setSubLanguage(language);
  }, []);

  return (
    <div id="App" className="bg-gray-800 h-screen px-[100px] py-11">
      {/* Navbar */}
      <Navbar />
      <KingdomComeFolderPicker
        value={folder}
        isError={isFolderError}
        onSelect={(path) => {
          setFolder(path);
          setIsFolderError(false);
        }}
        onSelectError={() => setIsFolderError(true)}
      />

      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 items-center">
        <LanguageSelect
          label={t("LABEL_GAME_LANGUAGE")}
          disabledKeys={mainLanguage ? [mainLanguage] : undefined}
          onSelect={handleMainLanguageSelect}
        />
        <LanguageSelect
          label={t("LABEL_DOUBLED_LANGUAGE")}
          onSelect={handleSubLanguageSelect}
          disabledKeys={disabledSubLanguageKeys}
        />
      </div>

      <div className="w-full flex justify-center items-center mt-6">
        <Card>
          <CardBody>
            <p>{t("NOTE")}</p>
          </CardBody>
        </Card>
      </div>

      <ExportButton onPress={handleExportButtonPress}>輸出</ExportButton>
    </div>
  );
}

export default App;
