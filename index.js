const fs = require("fs");
const path = require("path");

const AdmZip = require("adm-zip");

// target languages: Chinese (Traditional), Chinese (Simplified), Japanese, Korean
const targetLanguagePaks = [
  "Chineset_xml.pak",
  "Chineses_xml.pak",
  "Japanese_xml.pak",
  "Korean_xml.pak",
];

// ui dialog file name
const uiDialogFilename = "text_ui_dialog.xml";

// Create the output directory if it does not exist
const outputDir = path.join("./", "build", "DualDialog");
const outputLocalizationDir = path.join(outputDir, "Localization");
if (!fs.existsSync(outputLocalizationDir)) {
  fs.mkdirSync(outputLocalizationDir, { recursive: true });
}

// localization folder path
const localizationPath = (
  process.env.KCD2_LOCALIZATION_SOURCE ?? "PATH_TO_KCDM2_LOCALIZATION_FOLDER"
).replace(/^"|"$/g, "");

// assert localization path exists
function assertLanguagePaksExist() {
  targetLanguagePaks.forEach((languagePak) => {
    const languagePakPath = path.resolve(localizationPath, languagePak);
    if (!fs.existsSync(languagePakPath)) {
      console.error(`Error: Localization not found -> ${languagePakPath}`);
      process.exit(1); // Exit the script with an error code
    }
  });
}

function run(pakName) {
  const pakFilepath = path.join(localizationPath, pakName);
  const tmpWorkingDir = path.join("./tmp/", pakName);

  // Extract the pak file to temporary working directory
  new AdmZip(pakFilepath).extractAllTo(tmpWorkingDir, true);

  // Read the `text_ui_dialog.xml` file
  const xmlFilePath = path.join(tmpWorkingDir, uiDialogFilename);
  const xmlData = fs.readFileSync(xmlFilePath, "utf8");

  // Regular expression: Ensures the first <Cell> does not contain "seq"
  const regex =
    /<Row><Cell>((?!.*seq).*?)<\/Cell><Cell>(.*?)<\/Cell><Cell>(.*?)<\/Cell><\/Row>/g;

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

  // Perform the replacement with a callback function for row-based validation
  const updatedXml = xmlData.replace(regex, (match, $1, $2, $3) => {
    // Condition 1: If $2 is fully contained in $3 or is "almost contained", do not replace
    if ($3.includes($2) || isNearlyContained($2, $3)) {
      return match; // Keep it unchanged
    }
    // Condition 2: If $2 is exactly equal to $3, do not replace
    if ($2 === $3) {
      return match; // Keep it unchanged
    }
    // Apply replacement: Append "\n" between $3 and $2
    return `<Row><Cell>${$1}</Cell><Cell>${$2}</Cell><Cell>${$3}\\n${$2}</Cell></Row>`;
  });

  // Overwrite the updated XML back to `text_ui_dialog.xml`
  fs.writeFileSync(xmlFilePath, updatedXml, "utf8");

  console.log(`Updated XML has been saved to: ${xmlFilePath}`);

  // Create a new pak file from the temporary working directory
  const newPakFilepath = path.join(outputLocalizationDir, pakName);
  const outputZip = new AdmZip();
  outputZip.addLocalFolder(tmpWorkingDir);
  outputZip.writeZip(newPakFilepath);
}

function copyModManifest() {
  const modManifestPath = "./mod.manifest";
  const outputManifestPath = path.join(outputDir, "mod.manifest");
  fs.copyFileSync(modManifestPath, outputManifestPath);
}

// IIFE to run the script
(function main() {
  // First, assert that the language paks exist
  assertLanguagePaksExist();

  // Run the script for each language pak
  targetLanguagePaks.forEach((languagePak) => {
    run(languagePak);
  });

  // Copy mod.manifest to the output directory
  copyModManifest();
  console.log("Copy mod.manifest to the output directory, DONE");
})();
