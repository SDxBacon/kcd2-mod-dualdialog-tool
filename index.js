import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { unzipPak, zipPakDataToBuffer } from "./src/zip.js";

import {
  regexp,
  languagePackageFiles,
  tempStoragePath,
  uiDialogFilename,
} from "./src/constants.js";

import {
  getSuffixByPakName,
  prepareWorkingDirectory,
  checkLocalizationAssets,
} from "./src/utils.js";

import { processEnglish } from "./src/processEnglish.js";

const allLangsZip = new AdmZip();
const allLangsWithSeqZip = new AdmZip();

function processPakByLanguage(pakFilename) {
  // Read the `text_ui_dialog.xml` file
  const pakFolderInTemp = path.join(tempStoragePath, pakFilename);
  const textUIDialogXmlPath = path.join(pakFolderInTemp, uiDialogFilename);
  const xmlData = fs.readFileSync(textUIDialogXmlPath, "utf8");

  // Function to check if $2 is almost contained in $3 (except for one extra character)
  function isNearlyContained(smaller, larger) {
    if (larger.startsWith(smaller) && larger.length === smaller.length + 1) {
      return true; // $3 starts with $2 but has one extra character
    }
    if (larger.endsWith(smaller) && larger.length === smaller.length + 1) {
      return true; // $3 ends with $2 but has one extra character
    }
    return false;
  }

  let match;
  let updatedXml = "<Table>\n";
  let updatedXmlWithSeq = "<Table>\n";

  while ((match = regexp.exec(xmlData)) !== null) {
    const [fullMatch, $1, $2, $3] = match;

    const unchangedRow = `${fullMatch}\n`;
    const updatedRow = `<Row><Cell>${$1}</Cell><Cell>${$2}</Cell><Cell>${$3}\\n${$2}</Cell></Row>\n`;

    if (
      // Condition 1: If $2 is fully contained in $3 or is "almost contained", do not replace
      $3.includes($2) ||
      isNearlyContained($2, $3) ||
      // Condition 2: If $2 is exactly equal to $3, do not replace
      $2 === $3
    ) {
      // Keep it unchanged
      updatedXml += unchangedRow;
      updatedXmlWithSeq += unchangedRow;
      continue;
    }

    updatedXml += $1.includes("seq") ? unchangedRow : updatedRow;
    updatedXmlWithSeq += updatedRow;
  }

  // Add the closing tag
  updatedXml += "</Table>";
  updatedXmlWithSeq += "</Table>";

  // 1. packing the data with updated XML of pak file in memory
  const pakFileBuffer = zipPakDataToBuffer(updatedXml);
  const pakFileWithSeqBuffer = zipPakDataToBuffer(updatedXmlWithSeq);

  // 2. generate zip of the language
  const pakFilepath = path.join("Localization", pakFilename);
  const zipFilename = `Dual Dialog - ${getSuffixByPakName(pakFilename)}.zip`;

  let tempZip = new AdmZip();
  // add mod.manifest to the zip and set the path to "Dual Dialog/mod.manifest"
  tempZip.addLocalFile("./mod.manifest", path.join("Dual Dialog"));
  // add mod.manifest to the zip and set the path to "Dual Dialog with Dialog Sequence/mod.manifest"
  tempZip.addLocalFile(
    "./mod.manifest",
    path.join("Dual Dialog with Dialog Sequence")
  );

  // add the pak file to the zip and set the path to "Dual Dialog/Localization/<pakFilename>"
  tempZip.addFile(path.join("Dual Dialog", pakFilepath), pakFileBuffer);
  // add the pak file to the zip and set the path to "Dual Dialog with Dialog Sequence/Localization/<pakFilename>"
  tempZip.addFile(
    path.join("Dual Dialog with Dialog Sequence", pakFilepath),
    pakFileWithSeqBuffer
  );
  // output the zip to the build directory
  tempZip.writeZip(path.join("./build", zipFilename));

  // 3. add the zip to the allLangsZip and allLangsWithSeqZip
  allLangsZip.addFile(path.join("Localization", pakFilename), pakFileBuffer);
  allLangsWithSeqZip.addFile(
    path.join("Localization", pakFilename),
    pakFileWithSeqBuffer
  );
}

function createAllLangsZip() {
  allLangsZip.addLocalFile("./mod.manifest");
  allLangsZip.writeZip(path.join("./build", "Dual Dialog.zip"));
  allLangsWithSeqZip.addLocalFile("./mod.manifest");
  allLangsWithSeqZip.writeZip(
    path.join("./build", "Dual Dialog with Dialog Sequence.zip")
  );
}

// IIFE to run the script
(function main() {
  // First, assert localization paks exist
  checkLocalizationAssets();

  // Then, prepare the working directories
  prepareWorkingDirectory();

  // unzip all the language pak files
  for (const pak of languagePackageFiles) {
    unzipPak(pak);
    console.log(`Unzip language pak: ${pak}, DONE`);
  }

  // Process each language pak except the first one (English)
  const langs = languagePackageFiles.slice(1);
  for (const pak of langs) {
    // Run the script for each language pak
    processPakByLanguage(pak);
    //
    console.log(`Create zip by language for ${pak}, DONE`);
  }

  // Create the bundle zip
  createAllLangsZip();
  console.log("Create bundle zip, DONE");

  processEnglish();
  console.log("Create English bundle zip, DONE");
})();
