import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { zipPakDataToBuffer } from "./zip.js";

import { regexp, languagePackageFiles } from "./constants.js";

import {
  isNearlyContained,
  getSuffixByPakName,
  createPakInfoByFileName,
} from "./utils.js";

const [englishPakFileName, ...othersPakFileName] = languagePackageFiles;

// {
//   name: "English_xml.pak",
//   unpackedFolderPath: "./tmp/English_xml",
//   xmlFilePath: "./tmp/English_xml/text_ui_dialog.xml",
// }
const EnglishPakInfo = createPakInfoByFileName(englishPakFileName);

let xmlDataEnglish;

function createSubLangMap(xmlFilePath) {
  const map = new Map();
  const xmlData = fs.readFileSync(xmlFilePath, "utf8");

  // 方法 1：使用正則表達式的 matchAll
  const regex =
    /<Row><Cell>(.*?)<\/Cell><Cell>.*?<\/Cell><Cell>(.*?)<\/Cell><\/Row>/g;
  for (const match of xmlData.matchAll(regex)) {
    const [_, $1, $2] = match;
    map.set($1, $2);
  }

  return map;
}

function createZipBufferByLanguage(pakFileName) {
  // Read the `text_ui_dialog.xml` file
  const subLanguagePakInfo = createPakInfoByFileName(pakFileName);
  const mapSubLang = createSubLangMap(subLanguagePakInfo.xmlFilePath);

  let match;
  let updatedXmlWithSeq = "<Table>\n";

  while ((match = regexp.exec(xmlDataEnglish)) !== null) {
    const [fullMatch, $1, $2, $3] = match;

    const subtitleOfSubLang = mapSubLang.get($1);

    const unchangedRow = `${fullMatch}\n`;
    const updatedRow = `<Row><Cell>${$1}</Cell><Cell>${$2}</Cell><Cell>${$3}\\n${subtitleOfSubLang}</Cell></Row>\n`;

    if (
      // Condition 0: If $1 is not in the map, keep it unchanged
      mapSubLang.has($1) === false ||
      // Condition 1: If subtitleOfSubLang is "almost contained", do not replace
      isNearlyContained($2, subtitleOfSubLang) ||
      // Condition 2: If $2 is exactly equal to subtitleOfSubLang, do not replace
      $2 === subtitleOfSubLang
    ) {
      // Keep it unchanged
      updatedXmlWithSeq += unchangedRow;
      continue;
    }

    updatedXmlWithSeq += updatedRow;
  }

  // Add the closing tag
  updatedXmlWithSeq += "</Table>";

  // 1. packing the `English_xml.pak` with updated XML of pak file in memory
  const pakFileWithSeqBuffer = zipPakDataToBuffer(updatedXmlWithSeq);

  // 2. generate zip of the language
  const pakFilepath = path.join("Localization", EnglishPakInfo.name);

  let tempZip = new AdmZip();
  // add the pak file to the zip and set the path to "/Localization/English_xml.pak"
  tempZip.addFile(
    path.join("Localization", EnglishPakInfo.name),
    pakFileWithSeqBuffer
  );
  tempZip.addLocalFile("./mod.manifest");
  // output the zip buffer
  return [
    tempZip.toBuffer(),
    `Dual Dialog with Dialog Sequence - English + ${getSuffixByPakName(
      pakFileName
    )}.zip`,
  ];
}

export function processEnglish() {
  const output = new AdmZip();

  // read English text_ui_dialog
  xmlDataEnglish = fs.readFileSync(EnglishPakInfo.xmlFilePath, "utf8");

  // process each language
  for (const pak of othersPakFileName) {
    const [zipBuffer, zipFilename] = createZipBufferByLanguage(pak);
    output.addFile(zipFilename, zipBuffer);
    console.log(`Create zip for ${zipFilename}, DONE`);
  }

  output.writeZip(
    path.join(
      "build",
      "Dual Dialog with Dialog Sequence - English + Others.zip"
    )
  );
}
