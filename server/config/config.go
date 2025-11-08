package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"runtime/pprof"
	"sync"
	"syscall"
	"time"

	"github.com/fsnotify/fsnotify"
)

var ruta = "./config/config.json"

var executableFolder string = ""
var appConfiguration *AppConfig

var threadProfile = pprof.Lookup("threadcreate")
var goRoutineProfile = pprof.Lookup("goroutine")

var done chan os.Signal = make(chan os.Signal, 1)

//var comm_changeChannle chan string = make(chan string, 1)

type AppConfig struct {
	C  ConfigFile
	mu sync.RWMutex
}

func loadExecutablePath() {

	executablePath, err := os.Executable()
	if err != nil {
		panic(err)
	}
	executableFolder, _ = filepath.Split(executablePath)
}

func readJsonConfigFile(file_name string) *ConfigFile {
	var err error
	log.Println(file_name)
	pathAppsettings := filepath.Join(executableFolder, file_name)
	log.Println(pathAppsettings)
	_, err = os.Stat(pathAppsettings)
	if err != nil {
		if os.IsNotExist(err) {
			panic(err)
		}
	}

	var file_appSettings []byte

	counter := 0

	for len(file_appSettings) == 0 {
		counter++
		time.Sleep(5 * time.Millisecond)
		if counter > 500 {
			panic(fmt.Errorf("se Ha Intentado Leer El Archivo De Configuracion mas de 100 Veces"))
		}
		file_appSettings, err = os.ReadFile(pathAppsettings)

		if err != nil {

			if counter < 1000 {
				continue
			}
			panic(err)
		}

	}
	var data ConfigFile
	err = json.Unmarshal(file_appSettings, &data)
	if err != nil {
		panic(err)
	}
	return &data
}

func (c *AppConfig) setConfig(data *ConfigFile) {
	c.mu.Lock()
	c.C = *data
	c.mu.Unlock()
}

func (c *AppConfig) getConfig() *ConfigFile {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return &c.C
}

func loadGlobalConfig() {
	configFile := readJsonConfigFile(ruta)
	appConfiguration.setConfig(configFile)
}

func appSettingsFileWatcher() {
	// stop := make(chan struct{})

	// defer close(stop)

	defer close(done)

	watcher, err := fsnotify.NewWatcher()

	if err != nil {
		panic(err)
	}

	//defer watcher.Close()

	go func() {
		for {
			select {

			case event, ok := <-watcher.Events:
				if !ok {

					log.Println("Evento del Watcher con Not OK")
					continue
				}
				if event.Has(fsnotify.Write) {

					log.Println("El App Settings Fue Modificado")

					loadGlobalConfig()
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					continue
				}
				if err != nil {
					panic(err)
				}
			case <-done:
				return

			}
		}
	}()
	err = watcher.Add(filepath.Join(executableFolder, ""))
	if err != nil {
		panic(err)
	}
	log.Println("Watcher Iniciado")
	<-done
}

func GetNumbersOfThreads() int {
	return threadProfile.Count()
}
func GetNumberOfGoRoutines() int {
	return goRoutineProfile.Count()
}
func GetFolderOfExecutable() string {
	return executableFolder
}

func GetConfig() *ConfigFile {
	return appConfiguration.getConfig()
}
func init() {

	signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)

	appConfiguration = new(AppConfig)
	loadExecutablePath()
	loadGlobalConfig()
	go appSettingsFileWatcher()
}
