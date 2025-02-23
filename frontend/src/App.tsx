import { useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import OutputButton from "@/components/OutputButton";
import LanguageSelect from "@/components/LanguageSelect";
import KingdomComeFolderPicker from "@/components/KingdomComeFolderPicker";
import "./App.css";

function App() {
  const [folder, setFolder] = useState("");
  const [isFolderError, setIsFolderError] = useState(false);

  return (
    <div id="App" className="bg-gray-800 h-screen px-[100px] py-11">
      <KingdomComeFolderPicker
        isError
        onSelect={(path) => {
          setFolder(path);
          setIsFolderError(false);
        }}
        onSelectError={() => setIsFolderError(true)}
      />

      <div className="flex w-full flex-wrap md:flex-nowrap gap-4 items-center">
        <LanguageSelect label="您的遊戲字幕語言" />
        <LanguageSelect label="您的遊戲字幕語言" />
      </div>

      <div className="w-full flex justify-center items-center mt-6">
        <Card>
          <CardBody>
            <p>Make beautiful websites regardless of your design experience.</p>
          </CardBody>
        </Card>
      </div>

      <OutputButton>輸出</OutputButton>
    </div>
  );
}

export default App;
