package mock

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

// SypagoTokenResponse representa la respuesta del endpoint de autenticación
type SypagoTokenResponse struct {
	AccessToken      string      `json:"access_token"`
	ExpiresIn        int         `json:"expires_in"`
	RefreshExpiresIn int         `json:"refresh_expires_in"`
	RefreshToken     interface{} `json:"refresh_token"`
	TokenType        string      `json:"token_type"`
	NotBeforePolicy  int         `json:"not_before_policy"`
	SessionState     interface{} `json:"session_state"`
	Scope            string      `json:"scope"`
}

// TokenCache almacena el token y su información de expiración
type TokenCache struct {
	Token     string
	ExpiresAt time.Time
	mutex     sync.RWMutex
}

// Instancia global del cache de token
var tokenCache = &TokenCache{}

// isTokenValid verifica si el token actual es válido (no expirado)
func (tc *TokenCache) isTokenValid() bool {
	tc.mutex.RLock()
	defer tc.mutex.RUnlock()

	// Verificar si tenemos un token y si no ha expirado
	// Agregamos un buffer de 5 minutos antes de la expiración real
	return tc.Token != "" && time.Now().Before(tc.ExpiresAt.Add(-5*time.Minute))
}

// setToken actualiza el token en el cache
func (tc *TokenCache) setToken(token string, expiresIn int) {
	tc.mutex.Lock()
	defer tc.mutex.Unlock()

	tc.Token = token
	tc.ExpiresAt = time.Now().Add(time.Duration(expiresIn) * time.Second)
}

// getToken obtiene el token del cache
func (tc *TokenCache) getToken() string {
	tc.mutex.RLock()
	defer tc.mutex.RUnlock()

	return tc.Token
}

// authenticateWithSypago realiza la autenticación con SyPago API
func authenticateWithSypago() (*SypagoTokenResponse, error) {
	url := sypagoApiBaseUrl + "/api/v1/auth/token"

	// Preparar el payload
	payload := SypagoJwtRequest{
		ClientId: clientId,
		ApiKey:   apiKey,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request payload: %v", err)
	}

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	// Crear la petición POST
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	// Configurar headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Ejecutar la petición
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to SyPago auth API: %v", err)
	}
	defer resp.Body.Close()

	// Verificar status code
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("SyPago auth API returned status code %d: %s", resp.StatusCode, string(body))
	}

	// Leer el body de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Parsear JSON
	var tokenResponse SypagoTokenResponse
	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		return nil, fmt.Errorf("error parsing JSON response: %v", err)
	}

	return &tokenResponse, nil
}

// GetSypagoToken obtiene un token válido de SyPago (desde cache o nuevo)
func GetSypagoToken() (string, error) {
	// Verificar si tenemos un token válido en cache
	if tokenCache.isTokenValid() {
		return tokenCache.getToken(), nil
	}

	// El token no es válido o no existe, obtener uno nuevo
	fmt.Println("Obtaining new SyPago token...")

	tokenResponse, err := authenticateWithSypago()
	if err != nil {
		return "", fmt.Errorf("failed to authenticate with SyPago: %v", err)
	}

	// Guardar el token en cache
	tokenCache.setToken(tokenResponse.AccessToken, tokenResponse.ExpiresIn)

	fmt.Printf("New SyPago token obtained, expires in %d seconds\n", tokenResponse.ExpiresIn)

	return tokenResponse.AccessToken, nil
}

// GetSypagoAuthHeader devuelve el header de autorización completo
func GetSypagoAuthHeader() (string, error) {
	token, err := GetSypagoToken()
	if err != nil {
		return "", err
	}

	return "Bearer " + token, nil
}

// InvalidateToken invalida el token actual (útil para testing o errores 401)
func InvalidateToken() {
	tokenCache.mutex.Lock()
	defer tokenCache.mutex.Unlock()

	tokenCache.Token = ""
	tokenCache.ExpiresAt = time.Time{}

	fmt.Println("SyPago token invalidated")
}
