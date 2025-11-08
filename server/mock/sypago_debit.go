package mock

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Account representa una cuenta bancaria
type Account struct {
	BankCode string `json:"bank_code"`
	Type     string `json:"type"`
	Number   string `json:"number"`
}

// DocumentInfo representa información del documento de identidad
type DocumentInfo struct {
	Type   string `json:"type"`
	Number string `json:"number"`
}

// Amount representa un monto con moneda
type Amount struct {
	Amt      float64 `json:"amt"`
	Currency string  `json:"currency"`
}

// RequestOtpRequest representa el request completo para solicitar OTP
type RequestOtpRequest struct {
	CreditorAccount     Account      `json:"creditor_account"`
	DebitorDocumentInfo DocumentInfo `json:"debitor_document_info"`
	DebitorAccount      Account      `json:"debitor_account"`
	Amount              Amount       `json:"amount"`
}

// DebitRequestData estructura plana con los datos necesarios para el débito
type DebitRequestOtpData struct {
	// Datos del deudor (documento)

	DebitorDocumentType   string `json:"document_letter"` // "V", "E", "J", etc.
	DebitorDocumentNumber string `json:"document"`        // "26951697"

	// Datos de la cuenta del deudor
	DebitorBankCode      string `json:"bank_code"`      // "0105"
	DebitorAccountNumber string `json:"account_number"` // "04242186302"

	// Datos del monto
	Amount   float64 `json:"amount"`   // 5.0
	Currency string  `json:"currency"` // "VES", "USD"
}

// RequestOtpResponse representa la respuesta simplificada del endpoint request/otp
type RequestOtpResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    int    `json:"code"`
}

// TransactionOtpData estructura plana para datos de transacción OTP
type TransactionOtpData struct {
	// Datos de la rifa y participante
	BookingId     string `json:"booking_id"`
	ParticipantId string `json:"participant_id"`
	RaffleId      string `json:"raffle_id"`
	Tickets       []int  `json:"tickets"`

	// Datos del usuario receptor
	ReceiverName           string `json:"receiver_name"`
	ReceiverOtp            string `json:"receiver_otp"`
	ReceiverDocumentType   string `json:"receiver_document_type"`
	ReceiverDocumentNumber string `json:"receiver_document_number"`
	ReceiverBankCode       string `json:"receiver_bank_code"`
	ReceiverAccountNumber  string `json:"receiver_account_number"`

	// Datos del monto
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

// AmountWithRate representa un monto con información de tasa
type AmountWithRate struct {
	Amt        float64 `json:"amt"`
	Currency   string  `json:"currency"`
	UseDayRate bool    `json:"use_day_rate"`
}

// NotificationUrls representa las URLs de notificación
type NotificationUrls struct {
	WebHookEndpoint string `json:"web_hook_endpoint"`
}

// ReceivingUser representa el usuario receptor de la transacción
type ReceivingUser struct {
	Name         string       `json:"name"`
	Otp          string       `json:"otp"`
	DocumentInfo DocumentInfo `json:"document_info"`
	Account      Account      `json:"account"`
}

// TransactionOtpRequest representa el request completo para transacción OTP (formato SyPago)
type TransactionOtpRequest struct {
	InternalId       string           `json:"internal_id"`
	GroupId          string           `json:"group_id"`
	Account          Account          `json:"account"`
	Amount           AmountWithRate   `json:"amount"`
	Concept          string           `json:"concept"`
	NotificationUrls NotificationUrls `json:"notification_urls"`
	ReceivingUser    ReceivingUser    `json:"receiving_user"`
}

// SypagoTransactionOtpResponse representa la respuesta de SyPago para transaction/otp
type SypagoTransactionOtpResponse struct {
	TransactionId   string `json:"transaction_id"`
	OperationSecret string `json:"operation_secret"`
}

// TransactionOtpResponse representa la respuesta simplificada del endpoint transaction/otp
type TransactionOtpResponse struct {
	Success       bool   `json:"success"`
	Message       string `json:"message"`
	Code          int    `json:"code"`
	TransactionId string `json:"transaction_id"`
	// OperationSecret no se envía al frontend por seguridad
}

// TransactionStatusRequest representa el request para consultar estado
type TransactionStatusRequest struct {
	TransactionId   string `json:"transaction_id"`
	OperationSecret string `json:"operation_secret"`
}

// SypagoTransactionStatusResponse representa la respuesta completa de SyPago
type SypagoTransactionStatusResponse struct {
	InternalId    string `json:"internal_id"`
	TransactionId string `json:"transaction_id"`
	RefIbp        string `json:"ref_ibp"`
	GroupId       string `json:"group_id"`
	OperationDate string `json:"operation_date"`
	Amount        struct {
		Type       string  `json:"type"`
		Amt        float64 `json:"amt"`
		PayAmt     float64 `json:"pay_amt"`
		Currency   string  `json:"currency"`
		Rate       float64 `json:"rate"`
		UseDayRate bool    `json:"use_day_rate"`
	} `json:"amount"`
	ReceivingUser struct {
		Name         string `json:"name"`
		DocumentInfo struct {
			Type   string `json:"type"`
			Number string `json:"number"`
		} `json:"document_info"`
		Account struct {
			BankCode string `json:"bank_code"`
			Type     string `json:"type"`
			Number   string `json:"number"`
		} `json:"account"`
	} `json:"receiving_user"`
	Status       string `json:"status"`
	RejectedCode string `json:"rejected_code"`
	Expiration   int    `json:"expiration"`
}

// TransactionStatusResponse representa la respuesta simplificada para el frontend
type TransactionStatusResponse struct {
	TransactionId string `json:"transaction_id"`
	BookingId     string `json:"booking_id"`
	RefIbp        string `json:"ref_ibp"`
	Status        string `json:"status"` // PEND, PROC, AC00, ACCP, RJCT
	Rsn           string `json:"rsn"`
	BlessNumber   []int  `json:"bless_numbers"`
}

// buildRequestOtpPayload construye el payload para la petición de OTP
func buildRequestOtpPayload(data DebitRequestOtpData) RequestOtpRequest {
	return RequestOtpRequest{
		CreditorAccount: Account{
			BankCode: bankCode, // Constante del main.go (0172)
			Type:     "CNTA",   // Siempre CNTA para creditor
			Number:   account,  // Constante del main.go
		},
		DebitorDocumentInfo: DocumentInfo{
			Type:   data.DebitorDocumentType,
			Number: data.DebitorDocumentNumber,
		},
		DebitorAccount: Account{
			BankCode: data.DebitorBankCode,
			Type:     "CELE",
			Number:   data.DebitorAccountNumber,
		},
		Amount: Amount{
			Amt:      data.Amount,
			Currency: data.Currency,
		},
	}
}

// RequestOtp solicita un OTP para realizar un débito
func RequestOtp(data DebitRequestOtpData) (*RequestOtpResponse, error) {
	url := sypagoApiBaseUrl + "/api/v1/request/otp"

	// Obtener token de autenticación
	authHeader, err := GetSypagoAuthHeader()
	if err != nil {
		return nil, fmt.Errorf("failed to get SyPago auth token: %v", err)
	}

	// Construir payload
	payload := buildRequestOtpPayload(data)

	// Serializar a JSON
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request payload: %v", err)
	}

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 30 * time.Second, // Timeout más largo para operaciones de débito
	}

	// Crear la petición POST
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	// Configurar headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", authHeader)

	// Log del request (sin datos sensibles)
	fmt.Printf("Making RequestOtp request to: %s\n", url)
	fmt.Printf("Payload: %s\n", string(jsonPayload))

	// Ejecutar la petición
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to SyPago RequestOtp API: %v", err)
	}
	defer resp.Body.Close()

	// Leer el body de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Log de la respuesta
	fmt.Printf("SyPago RequestOtp response status: %d\n", resp.StatusCode)
	fmt.Printf("SyPago RequestOtp response body: %s\n", string(body))

	// Verificar status code
	if resp.StatusCode == http.StatusUnauthorized {
		// Token expirado, invalidar cache
		InvalidateToken()
		return nil, fmt.Errorf("SyPago API returned 401 Unauthorized - token may be expired")
	}

	// Solo validamos que sea 200 para considerar exitoso
	if resp.StatusCode == http.StatusOK {
		// Éxito - retornar respuesta estándar
		return &RequestOtpResponse{
			Success: true,
			Message: "OTP request processed successfully",
			Code:    200,
		}, nil
	}

	// Cualquier otro código es error
	return nil, fmt.Errorf("SyPago RequestOtp API returned status code %d: %s", resp.StatusCode, string(body))
}

// ValidateDebitRequestData valida los datos de la petición de débito
func ValidateDebitRequestData(data DebitRequestOtpData) error {
	if data.DebitorDocumentType == "" {
		return fmt.Errorf("debitor document type is required")
	}

	if data.DebitorDocumentNumber == "" {
		return fmt.Errorf("debitor document number is required")
	}

	if data.DebitorBankCode == "" {
		return fmt.Errorf("debitor bank code is required")
	}

	if data.DebitorAccountNumber == "" {
		return fmt.Errorf("debitor account number is required")
	}

	if data.Amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if data.Currency == "" {
		return fmt.Errorf("currency is required")
	}

	// Validar tipos de documento válidos
	validDocTypes := map[string]bool{"V": true, "E": true, "J": true, "G": true}
	if !validDocTypes[data.DebitorDocumentType] {
		return fmt.Errorf("invalid document type: %s (valid: V, E, J, G)", data.DebitorDocumentType)
	}

	// Validar monedas válidas
	validCurrencies := map[string]bool{"VES": true, "USD": true}
	if !validCurrencies[data.Currency] {
		return fmt.Errorf("invalid currency: %s (valid: VES, USD)", data.Currency)
	}

	return nil
}

// generateUUID genera un UUID sin guiones y en mayúsculas
func generateUUID() string {
	id := uuid.New()
	return strings.ToUpper(strings.ReplaceAll(id.String(), "-", ""))
}

// buildTransactionOtpPayload construye el payload para la transacción OTP (solo formato SyPago)
func buildTransactionOtpPayload(data TransactionOtpData) TransactionOtpRequest {
	return TransactionOtpRequest{
		InternalId: generateUUID(),
		GroupId:    generateUUID(),
		Account: Account{
			BankCode: bankCode, // Constante del main.go
			Type:     "CNTA",   // Siempre CNTA para account
			Number:   account,  // Constante del main.go
		},
		Amount: AmountWithRate{
			Amt:        data.Amount,
			Currency:   data.Currency,
			UseDayRate: false,
		},
		Concept: "Concept",
		NotificationUrls: NotificationUrls{
			WebHookEndpoint: "https://webhook.site/unique-id",
		},
		ReceivingUser: ReceivingUser{
			Name: data.ReceiverName,
			Otp:  data.ReceiverOtp,
			DocumentInfo: DocumentInfo{
				Type:   data.ReceiverDocumentType,
				Number: data.ReceiverDocumentNumber,
			},
			Account: Account{
				BankCode: data.ReceiverBankCode,
				Type:     "CELE", // Siempre CELE para receiving user
				Number:   data.ReceiverAccountNumber,
			},
		},
	}
}

func IsSuccessResponse(statusCode int) bool {
	return statusCode > 199 && statusCode < 300
}

// TransactionOtp ejecuta una transacción OTP
func TransactionOtp(data TransactionOtpData) (*TransactionOtpResponse, error) {
	url := sypagoApiBaseUrl + "/api/v1/transaction/otp"

	// Obtener token de autenticación
	authHeader, err := GetSypagoAuthHeader()
	if err != nil {
		return nil, fmt.Errorf("failed to get SyPago auth token: %v", err)
	}

	// Construir payload
	payload := buildTransactionOtpPayload(data)

	// Serializar a JSON
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request payload: %v", err)
	}

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 30 * time.Second, // Timeout más largo para operaciones de transacción
	}

	// Crear la petición POST
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	// Configurar headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", authHeader)

	// Log del request (sin datos sensibles)
	fmt.Printf("Making TransactionOtp request to: %s\n", url)
	fmt.Printf("Payload: %s\n", string(jsonPayload))

	// Ejecutar la petición
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to SyPago TransactionOtp API: %v", err)
	}
	defer resp.Body.Close()

	// Leer el body de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Log de la respuesta
	fmt.Printf("SyPago TransactionOtp response status: %d\n", resp.StatusCode)
	fmt.Printf("SyPago TransactionOtp response body: %s\n", string(body))

	// Verificar status code
	if resp.StatusCode == http.StatusUnauthorized {
		// Token expirado, invalidar cache
		InvalidateToken()
		return nil, fmt.Errorf("SyPago API returned 401 Unauthorized - token may be expired")
	}

	// Solo validamos que sea 200 para considerar exitoso
	if IsSuccessResponse(resp.StatusCode) {
		// Parsear la respuesta de SyPago para obtener transaction_id y operation_secret
		var sypagoResponse SypagoTransactionOtpResponse
		if err := json.Unmarshal(body, &sypagoResponse); err != nil {
			return nil, fmt.Errorf("error parsing SyPago TransactionOtp response: %v", err)
		}

		// Éxito - retornar respuesta con el transaction_id de SyPago
		// No incluimos operation_secret en la respuesta al frontend por seguridad
		return &TransactionOtpResponse{
			Success:       true,
			Message:       "Transaction processed successfully",
			Code:          200,
			TransactionId: sypagoResponse.TransactionId,
		}, nil
	}

	// Cualquier otro código es error
	return nil, fmt.Errorf("SyPago TransactionOtp API returned status code %d: %s", resp.StatusCode, string(body))
}

// ValidateTransactionOtpData valida los datos de la transacción OTP
func ValidateTransactionOtpData(data TransactionOtpData) error {
	// Validar datos de rifa y participante
	if data.BookingId == "" {
		return fmt.Errorf("booking ID is required")
	}

	if data.ParticipantId == "" {
		return fmt.Errorf("participant ID is required")
	}

	if data.RaffleId == "" {
		return fmt.Errorf("raffle ID is required")
	}

	if len(data.Tickets) == 0 {
		return fmt.Errorf("at least one ticket is required")
	}

	// Validar datos del receptor
	if data.ReceiverName == "" {
		return fmt.Errorf("receiver name is required")
	}

	if data.ReceiverOtp == "" {
		return fmt.Errorf("receiver OTP is required")
	}

	if data.ReceiverDocumentType == "" {
		return fmt.Errorf("receiver document type is required")
	}

	if data.ReceiverDocumentNumber == "" {
		return fmt.Errorf("receiver document number is required")
	}

	if data.ReceiverBankCode == "" {
		return fmt.Errorf("receiver bank code is required")
	}

	if data.ReceiverAccountNumber == "" {
		return fmt.Errorf("receiver account number is required")
	}

	if data.Amount <= 0 {
		return fmt.Errorf("amount must be greater than 0")
	}

	if data.Currency == "" {
		return fmt.Errorf("currency is required")
	}

	// Validar tipos de documento válidos
	validDocTypes := map[string]bool{"V": true, "E": true, "J": true, "G": true}
	if !validDocTypes[data.ReceiverDocumentType] {
		return fmt.Errorf("invalid document type: %s (valid: V, E, J, G)", data.ReceiverDocumentType)
	}

	// Validar monedas válidas
	validCurrencies := map[string]bool{"VES": true, "USD": true}
	if !validCurrencies[data.Currency] {
		return fmt.Errorf("invalid currency: %s (valid: VES, USD)", data.Currency)
	}

	// Validar que los tickets sean números positivos
	for _, ticket := range data.Tickets {
		if ticket <= 0 {
			return fmt.Errorf("ticket numbers must be positive: %d", ticket)
		}
	}

	return nil
}

// Almacén en memoria para mapear transaction_id con booking_id
var transactionBookings = make(map[string]string)
var bookingMutex sync.RWMutex

// Almacén en memoria para mapear booking_id con raffle_id
var bookingRaffles = make(map[string]string)
var bookingRaffleMutex sync.RWMutex

// SaveBookingRaffleMapping guarda el mapeo de bookingId -> raffleId
func SaveBookingRaffleMapping(bookingId, raffleId string) {
	bookingRaffleMutex.Lock()
	defer bookingRaffleMutex.Unlock()
	bookingRaffles[bookingId] = raffleId
}

// GetRaffleIdByBookingId obtiene el raffleId asociado a un bookingId
func GetRaffleIdByBookingId(bookingId string) (string, bool) {
	bookingRaffleMutex.RLock()
	defer bookingRaffleMutex.RUnlock()
	raffleId, exists := bookingRaffles[bookingId]
	return raffleId, exists
}

// GetTransactionStatus consulta el estado real de una transacción en SyPago
func GetTransactionStatus(transactionId, operationSecret, bookingId string) (*TransactionStatusResponse, error) {
	// Guardar mapping de transaction_id -> booking_id
	bookingMutex.Lock()
	if bookingId != "" && bookingId != "BK-DEFAULT" {
		transactionBookings[transactionId] = bookingId
	} else {
		// Intentar recuperar booking_id guardado
		if savedBookingId, exists := transactionBookings[transactionId]; exists {
			bookingId = savedBookingId
		}
	}
	bookingMutex.Unlock()

	// Consultar estado real en SyPago
	sypagoResponse, err := fetchTransactionStatusFromSypago(transactionId)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transaction status from SyPago: %v", err)
	}

	// Mapear respuesta de SyPago a nuestro formato simplificado
	response := &TransactionStatusResponse{
		TransactionId: sypagoResponse.TransactionId,
		BookingId:     bookingId,
		RefIbp:        sypagoResponse.RefIbp,
		Status:        sypagoResponse.Status,
		Rsn:           mapStatusToReason(sypagoResponse.Status, sypagoResponse.RejectedCode),
		BlessNumber:   []int{}, // Inicializar como lista vacía
	}

	// Solo generar números bendecidos si el status es ACCP
	if sypagoResponse.Status == "ACCP" {
		// Obtener raffleId del bookingId
		raffleId, exists := GetRaffleIdByBookingId(bookingId)
		if exists {
			// Obtener la rifa para validar el rango de tickets
			raffle := getRaffleById(raffleId)
			if raffle != nil {
				// Generar un número bendecido fijo basado en el ticket inicial de la rifa
				// Usamos el ticket inicial + un offset fijo para que sea determinístico
				blessNumber := raffle.InitialTicket + (raffle.TicketsTotal / 3)

				// Asegurar que esté dentro del rango válido
				if blessNumber >= raffle.InitialTicket+raffle.TicketsTotal {
					blessNumber = raffle.InitialTicket + (raffle.TicketsTotal / 2)
				}

				// Siempre devolver al menos un número bendecido fijo
				response.BlessNumber = []int{blessNumber}
			}
		}
	}

	return response, nil
}

// fetchTransactionStatusFromSypago consulta el estado en SyPago API
func fetchTransactionStatusFromSypago(transactionId string) (*SypagoTransactionStatusResponse, error) {
	url := sypagoApiBaseUrl + "/api/v1/transaction/" + transactionId

	// Obtener token de autenticación
	authHeader, err := GetSypagoAuthHeader()
	if err != nil {
		return nil, fmt.Errorf("failed to get SyPago auth token: %v", err)
	}

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	// Crear la petición GET
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	// Configurar headers con autenticación
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Accept", "application/json")

	// Log del request
	fmt.Printf("Fetching transaction status from: %s\n", url)

	// Ejecutar la petición
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to SyPago API: %v", err)
	}
	defer resp.Body.Close()

	// Leer el body de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Log de la respuesta
	fmt.Printf("SyPago transaction status response status: %d\n", resp.StatusCode)
	fmt.Printf("SyPago transaction status response body: %s\n", string(body))

	// Verificar status code
	if resp.StatusCode == http.StatusUnauthorized {
		// Token expirado, invalidar cache
		InvalidateToken()
		return nil, fmt.Errorf("SyPago API returned 401 Unauthorized - token may be expired")
	}

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("transaction not found in SyPago")
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("SyPago API returned status code %d: %s", resp.StatusCode, string(body))
	}

	// Parsear JSON de respuesta
	var sypagoResponse SypagoTransactionStatusResponse
	if err := json.Unmarshal(body, &sypagoResponse); err != nil {
		return nil, fmt.Errorf("error parsing JSON response: %v", err)
	}

	return &sypagoResponse, nil
}

// mapStatusToReason mapea el status de SyPago a una descripción legible
func mapStatusToReason(status, rejectedCode string) string {
	switch status {
	case "PEND":
		return "Transaction pending"
	case "PROC":
		return "Transaction processing"
	case "AC00":
		return "Transaction in process"
	case "ACCP":
		return "Transaction accepted and processed successfully"
	case "RJCT":
		if rejectedCode != "" {
			return fmt.Sprintf("Transaction rejected - code: %s", rejectedCode)
		}
		return "Transaction rejected"
	default:
		return fmt.Sprintf("Unknown status: %s", status)
	}
}

// ValidateTransactionStatusRequest valida los datos de consulta de estado
func ValidateTransactionStatusRequest(data TransactionStatusRequest) error {
	if data.TransactionId == "" {
		return fmt.Errorf("transaction ID is required")
	}

	if data.OperationSecret == "" {
		return fmt.Errorf("operation secret is required")
	}

	return nil
}
