import { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { Language } from "@/constants/languages";
import ExportButton from "@/components/ExportButton";
import LanguageSelect from "@/components/LanguageSelect";
import KingdomComeFolderPicker from "@/components/KingdomComeFolderPicker";
import "./App.css";

function App() {
  const [folder, setFolder] = useState("");
  const [isFolderError, setIsFolderError] = useState(false);
  const [gameLanguage, setGameLanguage] = useState<Language | null>(null);
  const [doubledLangauge, setDoubledLanguage] = useState<Language | null>(null);

  return (
    <div id="App" className="bg-gray-800 h-screen px-[100px] py-11">
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
          label="遊戲字幕語言"
          disabledKeys={gameLanguage ? [gameLanguage] : undefined}
        />
        <LanguageSelect label="搭配的語言" />
      </div>

      <div className="w-full flex justify-center items-center mt-6">
        <Card>
          <CardBody>
            <p>Make beautiful websites regardless of your design experience.</p>
          </CardBody>
        </Card>
      </div>

      <ExportButton>輸出</ExportButton>
    </div>
  );
}

export default App;
