package main

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// SelectFolder 讓使用者選擇資料夾並返回路徑
func (a *App) SelectFolder() (string, error) {
	options := runtime.OpenDialogOptions{
		Title:                "請選擇一個資料夾",
		CanCreateDirectories: false,
	}
	folderPath, err := runtime.OpenDirectoryDialog(a.ctx, options)
	if err != nil {
		return "", err
	}
	return folderPath, nil
}
