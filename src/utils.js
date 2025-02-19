import fs from "fs";
import path from "path";
import assert from "assert";
import {
  outputBuildPath,
  tempStoragePath,
  localizationSourcePath,
  languagePackageFiles,
} from "./constants.js";

/**
 * Assert the `/build` and `/tmp` directories exist
 */
export function prepareWorkingDirectory() {
  if (!fs.existsSync(outputBuildPath)) {
    fs.mkdirSync(outputBuildPath, { recursive: true });
  }

  if (!fs.existsSync(tempStoragePath)) {
    fs.mkdirSync(tempStoragePath, { recursive: true });
  }
}

/**
 * Assert the official localization path exists
 */
export function checkLocalizationAssets() {
  languagePackageFiles.forEach((languagePak) => {
    const languagePakPath = path.resolve(localizationSourcePath, languagePak);
    if (!fs.existsSync(languagePakPath)) {
      console.error(`Error: Localization not found -> ${languagePakPath}`);
      process.exit(1); // Exit the script with an error code
    }
  });
}

export function getSuffixByPakName(pakName) {
  // assert pakName
  assert(languagePackageFiles.includes(pakName), `Invalid pakName: ${pakName}`);

  const result = {
    "Chineset_xml.pak": "Chinese (Traditional)",
    "Chineses_xml.pak": "Chinese (Simplified)",
    "Japanese_xml.pak": "Japanese",
    "Korean_xml.pak": "Korean",
    "Spanish_xml.pak": "Spanish",
    "French_xml.pak": "French",
    "German_xml.pak": "German",
    "Italian_xml.pak": "Italian",
    "Polish_xml.pak": "Polish",
    "Russian_xml.pak": "Russian",
    "Czech_xml.pak": "Czech",
    "Turkish_xml.pak": "Turkish",
    "Ukrainian_xml.pak": "Ukrainian",
    "Portuguese_xml.pak": "Portuguese",
  }[pakName];

  if (!result) throw new Error(`Invalid pakName: ${pakName}`);
  return result;
}
