import { Button, Input } from "@heroui/react";
import { SelectGameFolder } from "../../wailsjs/go/main/App";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
      <p className="m-[6px]">{t("LABEL_GAME_FOLDER")}</p>
      <div className="flex-1">
        <Input
          className="text-ellipsis"
          radius="sm"
          value={value}
          placeholder="e.g. /steamapps/common/KingdomComeDeliverance2"
          isReadOnly
          onClick={handleButtonPressed}
          isInvalid={isError}
          errorMessage={t("ERROR_MSG_SELECT_KCD2_FOLDER")}
        />
      </div>

      <Button onPress={handleButtonPressed} size="sm" className="m-[5px]">
        {t("BUTTON_CHOOSE_GAME_FOLDER")}
      </Button>
    </div>
  );
}

export default KingdomComeFolderPicker;
