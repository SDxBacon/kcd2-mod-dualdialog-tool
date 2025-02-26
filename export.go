package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var languagePackageFiles = []string{
	"English_xml.pak",
	"Chinese_xml.pak",
	"Japanese_xml.pak",
	// Add other language paks as needed
}

type PakInfo struct {
	Name               string
	UnpackedFolderPath string
	XMLFilePath        string
}

// extract `text_ui_dialog.xml` from the zip file
func extractFileFromZip(zipFilePath string) ([]byte, error) {
	// open zip file
	reader, err := zip.OpenReader(zipFilePath)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	// find the target file
	for _, file := range reader.File {
		if file.Name == "text_ui_dialog.xml" {
			// 開啟 ZIP 內的檔案
			rc, err := file.Open()
			if err != nil {
				return nil, err
			}
			defer rc.Close()

			// 讀取檔案內容到記憶體
			var buf bytes.Buffer
			_, err = io.Copy(&buf, rc)
			if err != nil {
				return nil, err
			}

			return buf.Bytes(), nil
		}
	}

	return nil, fmt.Errorf("text_ui_dialog.xml not found in: %s", zipFilePath)
}

func getSuffixByPakName(pakFileName string) string {
	return strings.Split(pakFileName, "_")[0]
}

func isNearlyContained(str1, str2 string) bool {
	// Simple implementation - can be refined based on specific requirements
	return strings.Contains(str1, str2) || strings.Contains(str2, str1)
}

func createSubLangMap(data []byte) (map[string]string, error) {
	langMap := make(map[string]string)
	regexPattern := regexp.MustCompile(`<Row><Cell>(.*?)</Cell><Cell>.*?</Cell><Cell>(.*?)</Cell></Row>`)
	matches := regexPattern.FindAllSubmatch(data, -1)

	for _, match := range matches {
		if len(match) >= 3 {
			key := string(match[1])
			value := string(match[2])
			langMap[key] = value
		}
	}

	return langMap, nil
}

// func zipPakDataToBuffer(xmlData string) ([]byte, error) {
// 	var buf bytes.Buffer
// 	zipWriter := zip.NewWriter(&buf)

// 	// Add XML file to zip
// 	writer, err := zipWriter.Create("text_ui_dialog.xml")
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create zip entry: %w", err)
// 	}

// 	_, err = writer.Write([]byte(xmlData))
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to write to zip: %w", err)
// 	}

// 	// Close the zip writer
// 	if err := zipWriter.Close(); err != nil {
// 		return nil, fmt.Errorf("failed to close zip writer: %w", err)
// 	}

// 	return buf.Bytes(), nil
// }

func createZipBufferByLanguage(mainData []byte, subData []byte) ([]byte, error) {
	// Read the text_ui_dialog.xml file
	mapSubLang, err := createSubLangMap(subData)
	if err != nil {
		return nil, fmt.Errorf("failed to create sublang map: %w", err)
	}

	// Main regex to process the English XML
	regexPattern := regexp.MustCompile(`<Row><Cell>(.*?)</Cell><Cell>(.*?)</Cell><Cell>(.*?)</Cell></Row>`)
	newMainData := "<Table>\n"

	// Process each match
	matches := regexPattern.FindAllStringSubmatch(string(mainData), -1)
	for _, match := range matches {
		fullMatch := match[0]
		col1 := match[1]
		col2 := match[2]
		col3 := match[3]

		textInSubData, exists := mapSubLang[col1]

		// Apply conditions
		if !exists || isNearlyContained(col2, textInSubData) || col2 == textInSubData {
			newMainData += fullMatch + "\n"
			continue
		}

		newMainData += fmt.Sprintf("<Row><Cell>%s</Cell><Cell>%s</Cell><Cell>%s\\n%s</Cell></Row>\n",
			col1, col2, col3, textInSubData)
	}

	// Add closing tag
	newMainData += "</Table>"

	// Create pak buffer
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	writer, err := zipWriter.Create("dual_dialog.xml")
	if err != nil {
		return nil, err
	}

	_, err = writer.Write([]byte(newMainData))
	if err != nil {
		return nil, err
	}

	err = zipWriter.Close()
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func ProcessAndExportModZip(outputFolder string) error {
	// Create output zip
	outputZipPath := filepath.Join(outputFolder, "Dual Dialog.zip") // FXIME:
	outputZipFile, err := os.Create(outputZipPath)
	if err != nil {
		return fmt.Errorf("failed to create output zip: %w", err)
	}
	defer outputZipFile.Close()

	outputZipWriter := zip.NewWriter(outputZipFile)
	defer outputZipWriter.Close()

	// Read data from main language pak
	mainLanguageData, err := extractFileFromZip("English_xml.pak")
	// Read data from sub language pak
	subLanguageData, err := extractFileFromZip("Chineset_xml.pak")

	newMainLanguageData, err := createZipBufferByLanguage(mainLanguageData, subLanguageData)

	// Add Dual Dialog.pak
	writer, err := outputZipWriter.Create("Localization/Dual Dialog.pak")
	_, err = writer.Write(newMainLanguageData)
	if err != nil {
		return nil
	}

	// Add mod.manifest to the output zip
	manifestFile, err := os.Open("./mod.manifest")
	if err != nil {
		return fmt.Errorf("failed to open manifest file: %w", err)
	}
	defer manifestFile.Close()

	writer, err = outputZipWriter.Create("mod.manifest")
	if err != nil {
		return fmt.Errorf("failed to create manifest entry in zip: %w", err)
	}

	_, err = io.Copy(writer, manifestFile)
	if err != nil {
		return fmt.Errorf("failed to write manifest to zip: %w", err)
	}

	return nil
}
