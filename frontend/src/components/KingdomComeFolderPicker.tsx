import { useState } from "react";
import { Button, Input } from "@heroui/react";
import { SelectGameFolder } from "../../wailsjs/go/main/App";

interface KingdomComeFolderPickerProps {
  value?: string;
  isError?: boolean;
  onSelect?: (folder: string) => void;
  onSelectError?: (e: any) => void;
}

function KingdomComeFolderPicker({
  value = "",
  isError = false,
  onSelect,
  onSelectError,
}: KingdomComeFolderPickerProps) {
  const handleButtonPressed = async () => {
    try {
      const folder = await SelectGameFolder();
      onSelect?.(folder);
    } catch (e) {
      onSelectError?.(e);
    }
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
          errorMessage="請正確選擇 Kingdom Come: Deliverance II 遊戲資料夾"
        />
      </div>

      <Button onPress={handleButtonPressed} size="sm" className="m-[5px]">
        選擇資料夾
      </Button>
    </div>
  );
}

export default KingdomComeFolderPicker;
