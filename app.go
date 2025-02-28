package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"unsafe"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sys/windows"
)

// App struct
type App struct {
	ctx context.Context
}

var GameFolderPath string

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// OpenGitHub opens the GitHub repo page in the default browser
func (a *App) OpenGitHub() {
	runtime.BrowserOpenURL(a.ctx, "https://github.com/SDxBacon/kcd2-mod-dualdialog-tool")
}

// OpenGitHub opens the GitHub repo page in the default browser
func (a *App) OpenNexusMod() {
	runtime.BrowserOpenURL(a.ctx, "https://www.nexusmods.com/kingdomcomedeliverance2/mods/656")
}

// SelectFolder selects KCM2 folder and returns the path
func (a *App) SelectGameFolder() (string, error) {
	options := runtime.OpenDialogOptions{
		Title:                "請選擇遊戲資料夾",
		CanCreateDirectories: false,
	}
	folderPath, err := runtime.OpenDirectoryDialog(a.ctx, options)
	if err != nil {
		GameFolderPath = ""
		return "", err
	}

	// check if the folder is a valid KCM2 folder
	err = validateKCM2Folder(folderPath)
	if err != nil {
		GameFolderPath = ""
		return "", err
	}

	// Save the folder path
	GameFolderPath = folderPath
	// Return the folder path
	return folderPath, nil
}

func (a *App) CreateModZip(mainLanguage string, subLanguage string) {
	// Ask user to select output folder
	options := runtime.OpenDialogOptions{
		Title:                "請選擇輸出資料夾",
		CanCreateDirectories: false,
	}
	outputFolder, err := runtime.OpenDirectoryDialog(a.ctx, options)
	if err != nil {
		return
	}

	// Process and export the mod zip
	ProcessAndExportModZip(mainLanguage, subLanguage, outputFolder)
}

// IsValidKCM2Folder checks if the given path is a valid KCM2 folder
func validateKCM2Folder(path string) error {
	// Normalize the path separator
	exePath := filepath.Join(path, "Bin", "Win64MasterMasterSteamPGO", "KingdomCome.exe")

	// Check if the file exists
	_, err := os.Stat(exePath)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("KingdomCome.exe not found")
		}
		return fmt.Errorf("error checking KingdomCome.exe: %w", err)
	}

	// Get file description
	description, err := getFileDescription(exePath)
	if err != nil {
		return fmt.Errorf("error getting file description: %w", err)
	}

	// Check if the description matches
	if description != "Kingdom Come: Deliverance II" {
		return fmt.Errorf("invalid file description: %s", description)
	}

	return nil
}

// getFileDescription retrieves the description of the given executable file
func getFileDescription(filePath string) (string, error) {
	// Get file version info size
	var handle windows.Handle
	size, err := windows.GetFileVersionInfoSize(filePath, &handle)
	if err != nil {
		return "", fmt.Errorf("unable to get version info size: %w", err)
	}

	// Allocate buffer to store version info
	info := make([]byte, size)
	err = windows.GetFileVersionInfo(filePath, 0, size, unsafe.Pointer(&info[0]))
	if err != nil {
		return "", fmt.Errorf("unable to get version info: %w", err)
	}

	// First, get the language and code page
	var langPtr unsafe.Pointer
	var langLen uint32
	err = windows.VerQueryValue(
		unsafe.Pointer(&info[0]),
		`\VarFileInfo\Translation`,
		unsafe.Pointer(&langPtr),
		&langLen,
	)
	if err != nil {
		return "", fmt.Errorf("unable to query translation info: %w", err)
	}

	if langPtr == nil || langLen == 0 {
		return "", fmt.Errorf("no translation info found")
	}

	// Extract language and code page
	type LangCodePage struct {
		Language uint16
		CodePage uint16
	}

	langs := (*[100]LangCodePage)(langPtr)[:langLen/4]

	// Try each available language and code page
	for _, lang := range langs {
		// Format the query string with the actual language and code page
		subBlock := fmt.Sprintf("\\StringFileInfo\\%04x%04x\\FileDescription",
			lang.Language, lang.CodePage)

		var valuePtr unsafe.Pointer
		var valueLen uint32

		err = windows.VerQueryValue(
			unsafe.Pointer(&info[0]),
			subBlock,
			unsafe.Pointer(&valuePtr),
			&valueLen,
		)

		if err == nil && valuePtr != nil && valueLen > 0 {
			// Convert UTF-16 pointer to Go string
			fileDesc := (*[1024]uint16)(valuePtr)[:valueLen:valueLen]
			return windows.UTF16ToString(fileDesc), nil
		}
	}

	return "", fmt.Errorf("file description not found")
}
