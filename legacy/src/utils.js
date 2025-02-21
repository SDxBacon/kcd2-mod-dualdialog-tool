import fs from "fs";
import path from "path";
import assert from "assert";
import {
  outputBuildPath,
  tempStoragePath,
  localizationSourcePath,
  languagePackageFiles,
  uiDialogFilename,
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

/**
 * Function to check if $2 is almost contained in $3 (except for one extra character)
 */
export function isNearlyContained(smaller, larger) {
  if (larger.startsWith(smaller) && larger.length === smaller.length + 1) {
    return true; // $3 starts with $2 but has one extra character
  }
  if (larger.endsWith(smaller) && larger.length === smaller.length + 1) {
    return true; // $3 ends with $2 but has one extra character
  }
  return false;
}

/**
 *  Create a pak info object by the pak file name
 * @param {string} pakFileName
 * @returns
 */
export function createPakInfoByFileName(pakFileName) {
  return {
    name: pakFileName,
    unpackedFolderPath: path.join(tempStoragePath, pakFileName),
    xmlFilePath: path.join(tempStoragePath, pakFileName, uiDialogFilename),
  };
}
