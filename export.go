package main

import (
	"archive/zip"
	"bytes"
	"compress/flate"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"
)

// Languages represents the supported game languages
type Languages int

// Language enum values
const (
	English Languages = iota
	ChineseSimplified
	ChineseTraditional
	Japanese
	Korean
	Spanish
	French
	German
	Italian
	Polish
	Czech
	Portuguese
	Turkish
	Ukrainian
	Russian
)

// String returns the string representation of the language
func (l Languages) String() string {
	return [...]string{
		"English",
		"Chinese - Simplified",
		"Chinese - Traditional",
		"Japanese",
		"Korean",
		"Spanish",
		"French",
		"German",
		"Italian",
		"Polish",
		"Czech",
		"Portuguese",
		"Turkish",
		"Ukrainian",
		"Russian",
	}[l]
}

// GetLanguagePakName returns the PAK file name for the language
func (l Languages) GetLanguagePakName() string {
	switch l {
	case English:
		return "English_xml.pak"
	case ChineseSimplified:
		return "Chineses_xml.pak"
	case ChineseTraditional:
		return "Chineset_xml.pak"
	case Japanese:
		return "Japanese_xml.pak"
	case Korean:
		return "Korean_xml.pak"
	case Spanish:
		return "Spanish_xml.pak"
	case French:
		return "French_xml.pak"
	case German:
		return "German_xml.pak"
	case Italian:
		return "Italian_xml.pak"
	case Polish:
		return "Polish_xml.pak"
	case Czech:
		return "Czech_xml.pak"
	case Portuguese:
		return "Portuguese_xml.pak"
	case Turkish:
		return "Turkish_xml.pak"
	case Ukrainian:
		return "Ukrainian_xml.pak"
	case Russian:
		return "Russian_xml.pak"
	default:
		return "English_xml.pak"
	}
}

// LanguageFromString returns the Languages enum from a string representation
func LanguageFromString(s string) (Languages, bool) {
	for i, name := range [...]string{
		"English",
		"Chinese - Simplified",
		"Chinese - Traditional",
		"Japanese",
		"Korean",
		"Spanish",
		"French",
		"German",
		"Italian",
		"Polish",
		"Czech",
		"Portuguese",
		"Turkish",
		"Ukrainian",
		"Russian",
	} {
		if name == s {
			return Languages(i), true
		}
	}
	return English, false
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

func isNearlyContained(str1, str2 string) bool {
	// Simple implementation - can be refined based on specific requirements
	return strings.Contains(str1, str2) || strings.Contains(str2, str1)
}

func createSubLangMap(data []byte) (map[string]string, error) {
	langMap := make(map[string]string)

	// 確定使用的 CPU 核心數，但限制最大數量避免過度並行
	numWorkers := runtime.NumCPU()
	if numWorkers > 8 {
		numWorkers = 8 // 限制最大核心數，避免過度競爭
	}

	// 分割數據為多行
	lines := bytes.Split(data, []byte("\n"))

	// 創建互斥鎖保護 map 寫入
	var mutex sync.Mutex

	// 創建 WaitGroup 來同步 goroutines
	var wg sync.WaitGroup

	// 計算每個 worker 處理的行數
	batchSize := (len(lines) + numWorkers - 1) / numWorkers

	// 編譯正則表達式 - 每個 goroutine 共用同一個編譯好的正則表達式
	regexPattern := regexp.MustCompile(`<Row><Cell>(.*?)</Cell><Cell>.*?</Cell><Cell>(.*?)</Cell></Row>`)

	// 啟動多個 worker
	for w := 0; w < numWorkers; w++ {
		wg.Add(1)

		start := w * batchSize
		end := start + batchSize
		if end > len(lines) {
			end = len(lines)
		}

		go func(start, end int) {
			defer wg.Done()

			// 本地 map 用於收集該 goroutine 的結果
			localMap := make(map[string]string)

			for i := start; i < end; i++ {
				line := lines[i]

				// 快速檢查以跳過不相關的行
				if !bytes.Contains(line, []byte("<Row>")) {
					continue
				}

				// 應用正則表達式
				matches := regexPattern.FindSubmatch(line)
				if len(matches) >= 3 {
					localMap[string(matches[1])] = string(matches[2])
				}
			}

			// 批量更新全局 map，減少鎖競爭
			mutex.Lock()
			for k, v := range localMap {
				langMap[k] = v
			}
			mutex.Unlock()
		}(start, end)
	}

	// 等待所有 worker 完成
	wg.Wait()

	return langMap, nil
}

func createZipBufferByLanguage(mainData []byte, subData []byte) ([]byte, error) {
	// 讀取 text_ui_dialog.xml 檔案並創建對照表
	mapSubLang, err := createSubLangMap(subData)
	if err != nil {
		return nil, fmt.Errorf("failed to create sublang map: %w", err)
	}

	// 主正則表達式
	regexPattern := regexp.MustCompile(`<Row><Cell>(.*?)</Cell><Cell>(.*?)</Cell><Cell>(.*?)</Cell></Row>`)

	// 分割資料為多行
	lines := bytes.Split(mainData, []byte("\n"))

	// 計算要使用的 CPU 核心數
	numWorkers := runtime.NumCPU()

	// 創建通道用於收集結果
	type Result struct {
		index int
		line  string
	}
	resultChan := make(chan Result, len(lines))

	// 創建一個 WaitGroup 來等待所有 goroutines 完成
	var wg sync.WaitGroup

	// 將行分批處理
	batchSize := (len(lines) + numWorkers - 1) / numWorkers

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)

		// 計算這個 worker 的起始和結束位置
		start := w * batchSize
		end := start + batchSize
		if end > len(lines) {
			end = len(lines)
		}

		// 啟動 worker goroutine
		go func(start, end int) {
			defer wg.Done()

			for i := start; i < end; i++ {
				line := string(lines[i])

				// 忽略不含 <Row> 的行
				if !strings.Contains(line, "<Row>") {
					continue
				}

				// 對每行應用正則表達式
				matches := regexPattern.FindStringSubmatch(line)
				if len(matches) >= 4 {
					fullMatch := matches[0]
					col1 := matches[1]
					col2 := matches[2]
					col3 := matches[3]

					textInSubData, exists := mapSubLang[col1]

					var processedLine string

					// 應用條件
					if !exists || isNearlyContained(col3, textInSubData) || col3 == textInSubData {
						processedLine = fullMatch + "\n"
					} else {
						processedLine = fmt.Sprintf("<Row><Cell>%s</Cell><Cell>%s</Cell><Cell>%s\\n%s</Cell></Row>\n",
							col1, col2, col3, textInSubData)
					}

					// 發送結果到通道
					resultChan <- Result{i, processedLine}
				}
			}
		}(start, end)
	}

	// 開始一個 goroutine 來等待所有工作完成後關閉結果通道
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// 收集結果
	results := make([]string, len(lines)) // 預分配足夠空間
	var counter int

	for result := range resultChan {
		results[result.index] = result.line
		counter++

		if counter%1000 == 0 {
			fmt.Println("已處理", counter, "項")
		}
	}

	// 組合結果
	var newMainData strings.Builder
	newMainData.Grow(len(mainData) * 2) // 預分配足夠空間
	newMainData.WriteString("<Table>\n")

	for _, line := range results {
		if line != "" {
			newMainData.WriteString(line)
		}
	}

	newMainData.WriteString("</Table>")

	// 創建 zip 緩衝區
	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	// 設置使用 DOS 時間格式 (低精度)
	zipWriter.RegisterCompressor(zip.Deflate, func(out io.Writer) (io.WriteCloser, error) {
		return flate.NewWriter(out, flate.DefaultCompression)
	})

	// 使用 zip.FileInfoHeader 和手動設置 Modified 時間
	fileInfo := zip.FileHeader{
		Name:   "text_dualdialog.xml",
		Method: zip.Deflate,
	}
	// 設置為 DOS 時間格式 (只有日期和秒級精度)
	fileInfo.Modified = time.Now().Truncate(time.Second)
	writer, err := zipWriter.CreateHeader(&fileInfo)
	if err != nil {
		return nil, err
	}

	_, err = io.WriteString(writer, newMainData.String())
	if err != nil {
		return nil, err
	}

	err = zipWriter.Close()
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

func ProcessAndExportModZip(mainLanguage string, subLanguage string, outputFolder string) error {
	// Create output zip
	outputZipPath := filepath.Join(outputFolder, "Dual Dialog.zip") // FXIME:
	outputZipFile, err := os.Create(outputZipPath)
	if err != nil {
		return fmt.Errorf("failed to create output zip: %w", err)
	}
	defer outputZipFile.Close()

	outputZipWriter := zip.NewWriter(outputZipFile)
	defer outputZipWriter.Close()

	// Read data from main and sub language pak
	mainLang, _ := LanguageFromString(mainLanguage)
	mainLanguagePakFileName := mainLang.GetLanguagePakName()

	mainLanguageFilePath := filepath.Join(GameFolderPath, fmt.Sprintf("Localization/%s", mainLanguagePakFileName))
	mainLanguageData, err := extractFileFromZip(mainLanguageFilePath)
	fmt.Println("Main Language:", mainLanguageFilePath)
	if err != nil {
		return err
	}

	// Read data from sub language pak
	subLang, _ := LanguageFromString(subLanguage)
	subLanguagePakFileName := subLang.GetLanguagePakName()
	subLanguageFilePath := filepath.Join(GameFolderPath, fmt.Sprintf("Localization/%s", subLanguagePakFileName))
	subLanguageData, err := extractFileFromZip(subLanguageFilePath)

	fmt.Println("sUB Language:", subLanguageFilePath)
	if err != nil {
		return err
	}

	newMainLanguageData, err := createZipBufferByLanguage(mainLanguageData, subLanguageData)
	if err != nil {
		return err
	}

	// Add {MAIN LANGUAGE}_xml.pak to the output zip
	writer, err := outputZipWriter.Create(fmt.Sprintf("Localization/%s", mainLanguagePakFileName))
	if err != nil {
		return err
	}

	_, err = writer.Write(newMainLanguageData)
	if err != nil {
		return err
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
