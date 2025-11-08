package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"raffle_web_server/config"
	"raffle_web_server/middlewares"
	"raffle_web_server/mock"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

func SetCORSHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		allowedOrigins := config.GetConfig().CORSConfig.AllowedOrigins

		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func SecurityHeaders() gin.HandlerFunc {

	return func(c *gin.Context) {
		c.Header("X-Frame-Options", "SAMEORIGIN")

		//c.Header("Content-Security-Policy", "frame-ancestors 'none'; default-src 'self'")

		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-XSS-Protection", "1; mode=block")

		c.Next()
	}
}

func main() {
	decimal.MarshalJSONWithoutQuotes = true

	execPath, err := os.Executable()
	if err != nil {
		panic(err)
	}

	execPath = filepath.Dir(execPath)

	var done chan os.Signal = make(chan os.Signal, 1)

	signal.Notify(done, syscall.SIGINT, syscall.SIGTERM)

	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	router.Use(SecurityHeaders())

	router.Use(SetCORSHeaders())

	imagesDir := filepath.Join(execPath, "public", "images")

	router.StaticFS("/images", http.Dir(imagesDir))

	webAssetsDir := filepath.Join(execPath, "web")

	fmt.Println("Web Assets Dir:", webAssetsDir)

	router.Use(middlewares.ServeStaticAssets(middlewares.
		NewStaticAssetsConfig(webAssetsDir, "/", "index.html", []string{}, []string{}, nil)))

	if config.GetConfig().MockConfig.Enabled {
		mock.ActivateRoutesForMock(router)
	}

	fmt.Println("Starting REST API server on port", config.GetConfig().ServiceInfo.HttpPort)

	if config.GetConfig().SslConfig.EnabledSslHttp {

		if err := router.RunTLS(fmt.Sprintf("0.0.0.0:%d",
			config.GetConfig().ServiceInfo.HttpPort),
			config.GetConfig().SslConfig.Path,
			config.GetConfig().SslConfig.PathToKey); err != nil {

			fmt.Println("Failed to start REST API server", err)
		}

		return
	}

	go func(r *gin.Engine) {
		err := r.Run(fmt.Sprintf("0.0.0.0:%d",
			config.GetConfig().ServiceInfo.HttpPort))

		if err != nil {
			fmt.Println(err)
		}

	}(router)

	<-done
}
