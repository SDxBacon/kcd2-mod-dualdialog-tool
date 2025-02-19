import path from "path";
import AdmZip from "adm-zip";

import {
  localizationSourcePath,
  tempStoragePath,
  uiDialogFilename,
} from "./constants.js";

export function unzipPak(filename) {
  const sourceFilePath = path.join(localizationSourcePath, filename);
  const outputFilepath = path.join(tempStoragePath, filename);

  // Extract the pak file to temporary working directory
  new AdmZip(sourceFilePath).extractAllTo(outputFilepath, true);
}

/**
 * zipPakDataToBuffer - Zips the extracted pak folder with the updated XML file to a buffer
 * @param {string} pakFolderInTemp
 * @param {string} updatedXml
 */
export function zipPakDataToBuffer(pakFolderInTemp, updatedXml) {
  const tempZip = new AdmZip();
  // Add the original extracted folder to the zip
  tempZip.addLocalFolder(pakFolderInTemp);
  // Update the `text_ui_dialog` XML file in the zip
  tempZip.updateFile(uiDialogFilename, Buffer.from(updatedXml, "utf8"));
  return tempZip.toBuffer();
}
