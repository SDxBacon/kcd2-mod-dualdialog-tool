import { useCallback } from "react";
import { addToast } from "@heroui/react";
import { Language } from "../constants/languages";
import { CreateModZip } from "../../wailsjs/go/main/App";

function useExport() {
  return useCallback((main: Language, sub: Language) => {
    CreateModZip(main, sub)
      .then(() => {
        addToast({
          title: "Create Mod ZIP Done",
          color: "success",
        });
      })
      .catch((err) => {
        addToast({
          title: "Create Mod ZIP Failed",
          color: "danger",
        });
      });
  }, []);
}

export default useExport;
