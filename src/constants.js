import path from "path";

// localization folder path
export const localizationSourcePath = (
  process.env.KCD2_LOCALIZATION_SOURCE ?? "PATH_TO_KCDM2_LOCALIZATION_FOLDER"
).replace(/^"|"$/g, "");

/**
 * languages to extract from the localization pak files
 */
export const languagePackageFiles = [
  "English_xml.pak",
  "Chineset_xml.pak",
  "Chineses_xml.pak",
  "Japanese_xml.pak",
  "Korean_xml.pak",
  "Spanish_xml.pak",
  "French_xml.pak",
  "German_xml.pak",
  "Italian_xml.pak",
  "Polish_xml.pak",
  "Russian_xml.pak",
  "Czech_xml.pak",
  "Turkish_xml.pak",
  "Ukrainian_xml.pak",
  "Portuguese_xml.pak",
];

/**
 * output directory
 */
export const outputBuildPath = path.join("./", "build");

/**
 * temporary directory
 */
export const tempStoragePath = path.join("./", "tmp");

/***
 * Localization `text_ui_dialog` file name
 */
export const uiDialogFilename = "text_ui_dialog.xml";

/**
 * regular expressions to match each row in `text_ui_dialog.xml`
 */
export const regexp =
  /<Row><Cell>(.*?)<\/Cell><Cell>(.*?)<\/Cell><Cell>(.*?)<\/Cell><\/Row>/g;
