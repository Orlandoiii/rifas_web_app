package middlewares

import (
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

var ALLOWED_EXTENSIONS = []string{
	"png",
	"jpg",
	"jpeg",
	"gif",
	"svg",
	"ico",
	"webp",
	"js",
	"css",
	"html",
	"json",
	"xml",
	"txt",
	"md",
	"pdf",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
}

func shouldExclude(path string, excludePrefixes []string) bool {
	if len(excludePrefixes) == 0 {
		return false
	}

	for _, prefix := range excludePrefixes {
		if prefix != "" && strings.HasPrefix(path, prefix) {

			log.Info().Str("path", path).Str("prefix", prefix).Msg("Gin Rest API/Static Handler/ Excluyendo path")

			return true
		}
	}

	return false
}
func fileExistsAndReadable(filePath string) (os.FileInfo, error) {

	fileInfo, err := os.Stat(filePath)

	if err != nil {

		return nil, err
	}

	file, err := os.Open(filePath)

	if err != nil {

		return nil, err
	}
	file.Close()

	return fileInfo, nil
}

func setCacheHeaders(c *gin.Context, filePath string, maxAge int) {

	if strings.HasSuffix(filePath, ".html") {

		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")

		c.Header("Pragma", "no-cache")

		c.Header("Expires", "0")
	} else {

		c.Header("Cache-Control", "public, max-age="+strconv.Itoa(maxAge))

		c.Header("Expires", time.Now().Add(time.Duration(maxAge)*time.Second).Format(time.RFC1123))
	}
}

func setContentTypeHeaders(c *gin.Context, filePath string) {
	ext := path.Ext(filePath)
	switch ext {
	case ".js":
		c.Header("Content-Type", "application/javascript")
	case ".css":
		c.Header("Content-Type", "text/css")
	case ".svg":
		c.Header("Content-Type", "image/svg+xml")
	case ".json":
		c.Header("Content-Type", "application/json")
	case ".jpg", ".jpeg":
		c.Header("Content-Type", "image/jpeg")
	case ".png":
		c.Header("Content-Type", "image/png")
	case ".gif":
		c.Header("Content-Type", "image/gif")
	case ".webp":
		c.Header("Content-Type", "image/webp")
	}
}

func isExtensionAllowed(filePath string, allowedExts []string) bool {

	if len(allowedExts) == 0 {

		return true
	}

	ext := strings.ToLower(path.Ext(filePath))

	if ext == "" {

		return true
	}

	ext = strings.TrimPrefix(ext, ".")

	for _, allowedExt := range allowedExts {

		if ext == allowedExt {

			return true
		}
	}

	return false
}

type StaticAssetsConfig struct {
	StaticPath       string
	CacheMaxAge      int
	ExcludePrefixes  []string
	AllowedExts      []string
	DefaultIndexFile string
	StaticPathPrefix string
}

func NewStaticAssetsConfig(
	staticPath string,
	staticPathPrefix string,
	defaultIndexFile string,
	excludePrefixes []string,
	allowedExts []string,
	cacheMaxAge *int,

) StaticAssetsConfig {

	if staticPathPrefix == "" {
		staticPathPrefix = "/"
	}

	if defaultIndexFile == "" {
		defaultIndexFile = "index.html"
	}
	if cacheMaxAge == nil {
		cacheMaxAge = &[]int{3600}[0]
	}
	if excludePrefixes == nil {
		excludePrefixes = []string{}
	}
	if allowedExts == nil {
		allowedExts = ALLOWED_EXTENSIONS
	}
	return StaticAssetsConfig{
		StaticPath:       staticPath,
		CacheMaxAge:      *cacheMaxAge,
		ExcludePrefixes:  excludePrefixes,
		AllowedExts:      allowedExts,
		DefaultIndexFile: defaultIndexFile,
		StaticPathPrefix: staticPathPrefix,
	}
}

func ServeStaticAssets(config StaticAssetsConfig) gin.HandlerFunc {

	return func(c *gin.Context) {

		if shouldExclude(c.Request.URL.Path, config.ExcludePrefixes) {
			c.Next()
			return
		}

		requestPath := c.Request.URL.Path

		if strings.Contains(requestPath, "..") {
			c.Status(403)
			c.Abort()
			return
		}
		if config.StaticPathPrefix != "/" {
			requestPath = strings.TrimPrefix(requestPath, config.StaticPathPrefix)
		}
		filePath := filepath.Join(config.StaticPath, requestPath)

		if !isExtensionAllowed(filePath, config.AllowedExts) {
			c.Status(403)
			c.Abort()
			return
		}
		fileInfo, err := fileExistsAndReadable(filePath)

		if err == nil {
			if fileInfo.IsDir() {
				filePath = filepath.Join(filePath, "index.html")
				_, err = fileExistsAndReadable(filePath)
				if err != nil {
					c.Next()
					return
				}
			} else if fileInfo.IsDir() {
				c.Status(403)
				c.Abort()
				return
			}
			log.Info().Str("filePath", filePath).Msg("Gin Rest API/Static Handler/ Serviendo archivo")
			setCacheHeaders(c, filePath, config.CacheMaxAge)
			setContentTypeHeaders(c, filePath)

			c.File(filePath)
			c.Abort()
			return
		}

		c.Next()
	}
}
