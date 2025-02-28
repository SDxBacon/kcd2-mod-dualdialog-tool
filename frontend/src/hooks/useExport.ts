import { addToast } from "@heroui/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "../constants/languages";
import { CreateModZip } from "../../wailsjs/go/main/App";

function useExport() {
  const { t } = useTranslation();

  return useCallback((main: Language, sub: Language) => {
    return CreateModZip(main, sub)
      .then(() => {
        addToast({
          color: "success",
          title: t("TOAST_EXPORT_SUCCESS"),
        });
      })
      .catch((err) => {
        addToast({
          title: t("TOAST_EXPORT_FAILED"),
          color: "danger",
        });
      });
  }, []);
}

export default useExport;
