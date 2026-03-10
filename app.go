package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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
		Title:                "Please select the Kingdom Come: Deliverance II folder",
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

func (a *App) CreateModZip(mainLanguage string, subLanguage string) (string, error) {
	// Ask user to select output folder
	options := runtime.OpenDialogOptions{
		Title:                "Please select the output folder",
		CanCreateDirectories: false,
	}
	outputFolder, err := runtime.OpenDirectoryDialog(a.ctx, options)
	if err != nil || outputFolder == "" {
		return "", err
	}

	// Process and export the mod zip
	ProcessAndExportModZip(mainLanguage, subLanguage, outputFolder)

	// return zip file location and nil as error
	return filepath.Join(outputFolder, "Dual Dialog.zip"), nil
}

// IsValidKCM2Folder checks if the given path is a valid KCM2 folder.
// It only requires a "Localization" subfolder to be present, so users
// can test with just the language pak files without a full game install.
func validateKCM2Folder(path string) error {
	localizationPath := filepath.Join(path, "Localization")
	info, err := os.Stat(localizationPath)
	if err != nil || !info.IsDir() {
		return fmt.Errorf("Localization folder not found in the selected directory")
	}
	return nil
}


