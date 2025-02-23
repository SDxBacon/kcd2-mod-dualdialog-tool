import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { SelectFolder } from "../../wailsjs/go/main/App";

interface KingdomComeFolderPickerProps {
  value?: string;
  isError?: boolean;
  onSelect?: (folder: string) => void;
  onSelectError?: () => void;
}

function KingdomComeFolderPicker({
  value = "",
  isError = false,
}: KingdomComeFolderPickerProps) {
  const [folder, setFolder] = useState("");

  const handleButtonPressed = () => {
    SelectFolder().then((folder: string) => {
      setFolder(folder);
    });
  };

  return (
    <div className="flex flex-row gap-3 h-[64px]">
      <p className="m-[6px]">Game Folder</p>
      <div className="w-[450px]">
        <Input
          className="text-ellipsis"
          radius="sm"
          value={value}
          placeholder="e.g. C:/Steam/steamapps/common/KingdomComeDeliverance2"
          isReadOnly
          onClick={handleButtonPressed}
          isInvalid={isError}
          errorMessage="31232"
        />
      </div>

      <Button onPress={handleButtonPressed} size="sm" className="m-[5px]">
        選擇資料夾
      </Button>
    </div>
  );
}

export default KingdomComeFolderPicker;
