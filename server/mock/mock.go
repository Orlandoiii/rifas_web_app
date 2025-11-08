package mock

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const clientId = "orlando"
const apiKey = "06TtzNsTXVSlVdqJ7cLMmcZ9FALIyKUX"

const sypagoApiBaseUrl = "https://pruebas.sypago.net:8086"

const account = "01052510145947929553"
const bankCode = "0105"

// RaffleId representa el ID de una rifa
type RaffleId string

type RaffleParticipant struct {
	ParticipantId RaffleId `json:"participantId"`
	RaffleId      RaffleId `json:"raffleId"`
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	Phone         string   `json:"phone"`
	TicketNumber  []int    `json:"ticketNumber"`
}

type RaffleParticipantResponse struct {
	ReserveTickets []int  `json:"reserveTickets"`
	BookingId      string `json:"bookingId"`
}

// RaffleVerifyRequest representa el request para verificar tickets de un participante
type RaffleVerifyRequest struct {
	RaffleId   RaffleId `json:"raffleId"`
	DocumentId string   `json:"documentId"`
}

// RaffleVerifyTicket representa un ticket verificado
type RaffleVerifyTicket struct {
	TicketNumber  int   `json:"ticketNumber"`
	IsMainPrize   *bool `json:"isMainPrize,omitempty"`
	IsBlessNumber *bool `json:"isBlessNumber,omitempty"`
}

// RaffleVerifyResult representa el resultado de la verificación
type RaffleVerifyResult struct {
	RaffleId      RaffleId             `json:"raffleId"`
	DocumentId    string               `json:"documentId"`
	BoughtTickets []RaffleVerifyTicket `json:"boughtTickets"`
}

// PrizeId representa el ID de un premio
type PrizeId string

// Prize representa un premio de una rifa
type Prize struct {
	ID               PrizeId  `json:"id"`
	RaffleId         RaffleId `json:"raffleId"`
	ImageUrl         string   `json:"imageUrl"`
	Title            string   `json:"title"`
	ShortDescription string   `json:"shortDescription"`
	WinningTicket    int      `json:"winningTicket"`
	IsMainPrize      *bool    `json:"isMainPrize,omitempty"`
}

type SypagoJwtRequest struct {
	ClientId string `json:"client_id"`
	ApiKey   string `json:"secret"`
}

// Bank representa la estructura completa del banco desde SyPago API
type Bank struct {
	Code                      string `json:"Code"`
	Name                      string `json:"Name"`
	Active                    bool   `json:"Active"`
	SypagoClient              bool   `json:"SypagoClient"`
	EnableTransitionAccount   bool   `json:"EnableTransitionAccount"`
	VerifyType                int    `json:"VerifyType"`
	IsSmsOtp                  bool   `json:"IsSmsOtp"`
	SmsOtpAddress             string `json:"SmsOtpAddress"`
	SmsOtpText                string `json:"SmsOtpText"`
	IsDebitOTP                bool   `json:"IsDebitOTP"`
	DisabledValidationAccount bool   `json:"DisabledValidationAccount"`
}

// BankResponse representa la respuesta simplificada para el frontend
type BankResponse struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// RaffleSummary representa el resumen de una rifa
type RaffleSummary struct {
	ID               RaffleId `json:"id"`
	Title            string   `json:"title"`
	ShortDescription string   `json:"shortDescription"`
	CoverImageUrl    string   `json:"coverImageUrl"`
	Price            float64  `json:"price"`
	Currency         string   `json:"currency"`
	InitialTicket    int      `json:"initialTicket"`
	TicketsTotal     int      `json:"ticketsTotal"`
	EndsAt           string   `json:"endsAt"`
	IsMain           *bool    `json:"isMain,omitempty"`
	TotalSold        int      `json:"totalSold"`
}

// getMockRaffles devuelve 4 rifas de ejemplo
func getMockRaffles() []RaffleSummary {
	isMain := true
	return []RaffleSummary{
		{
			ID:               "raffle-001",
			Title:            "iPhone 15 Pro Max",
			ShortDescription: "Último modelo de iPhone con 256GB de almacenamiento",
			CoverImageUrl:    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
			Price:            25.00,
			Currency:         "USD",
			InitialTicket:    1,
			TicketsTotal:     1000,
			EndsAt:           time.Now().AddDate(0, 0, 15).Format(time.RFC3339),
			IsMain:           &isMain,
			TotalSold:        100,
		},
		{
			ID:               "raffle-002",
			Title:            "PlayStation 5",
			ShortDescription: "Consola de videojuegos de última generación",
			CoverImageUrl:    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
			Price:            15.00,
			Currency:         "USD",
			InitialTicket:    1001,
			TicketsTotal:     800,
			EndsAt:           time.Now().AddDate(0, 0, 22).Format(time.RFC3339),
			TotalSold:        100,
		},
		{
			ID:               "raffle-003",
			Title:            "MacBook Air M2",
			ShortDescription: "Laptop ultradelgada con chip M2 y 512GB SSD",
			CoverImageUrl:    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
			Price:            30.00,
			Currency:         "USD",
			InitialTicket:    1801,
			TicketsTotal:     500,
			EndsAt:           time.Now().AddDate(0, 1, 5).Format(time.RFC3339),
			TotalSold:        50,
		},
		{
			ID:               "raffle-004",
			Title:            "Tesla Model 3",
			ShortDescription: "Vehículo eléctrico premium con autopilot",
			CoverImageUrl:    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
			Price:            100.00,
			Currency:         "USD",
			InitialTicket:    2301,
			TicketsTotal:     2000,
			EndsAt:           time.Now().AddDate(0, 2, 0).Format(time.RFC3339),
			TotalSold:        5,
		},
	}
}

// simulateRandomError simula errores aleatorios para testing
func simulateRandomError(c *gin.Context) bool {
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)
	randomNum := rng.Intn(3) + 1 // Genera número entre 1 y 3

	if randomNum == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Internal Server Error",
			"message": "Something went wrong on the server",
			"code":    500,
		})
		return true // Error generado
	}
	return false // Sin error, continuar normalmente
}

// getRaffles maneja el endpoint GET /raffles
func getRaffles(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	raffles := getMockRaffles()
	c.JSON(http.StatusOK, raffles)
}

// getRaffleById busca una rifa por ID
func getRaffleById(raffleId string) *RaffleSummary {
	raffles := getMockRaffles()
	for _, raffle := range raffles {
		if string(raffle.ID) == raffleId {
			return &raffle
		}
	}
	return nil
}

// generateSoldTickets genera números de tickets vendidos aleatorios dentro del rango de la rifa
func generateSoldTickets(raffle *RaffleSummary) []int {
	if raffle.TotalSold <= 0 {
		return []int{}
	}

	// Crear un slice con todos los números posibles en el rango
	maxTickets := raffle.TicketsTotal
	if raffle.TotalSold > maxTickets {
		raffle.TotalSold = maxTickets
	}

	// Generar números aleatorios únicos
	soldTickets := make([]int, 0, raffle.TotalSold)
	usedNumbers := make(map[int]bool)

	// Inicializar generador de números aleatorios
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	for len(soldTickets) < raffle.TotalSold {
		// Generar número aleatorio en el rango de la rifa
		ticketNumber := rng.Intn(raffle.TicketsTotal) + raffle.InitialTicket

		// Verificar que no esté repetido
		if !usedNumbers[ticketNumber] {
			usedNumbers[ticketNumber] = true
			soldTickets = append(soldTickets, ticketNumber)
		}
	}

	return soldTickets
}

// getSoldTickets maneja el endpoint GET /api/v1/raffles/:id/tickets/sold
func getSoldTickets(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	raffleId := c.Param("id")

	// Buscar la rifa por ID
	raffle := getRaffleById(raffleId)
	if raffle == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Raffle not found",
			"message": fmt.Sprintf("No raffle found with ID: %s", raffleId),
		})
		return
	}

	// Generar tickets vendidos
	soldTickets := generateSoldTickets(raffle)

	c.JSON(http.StatusOK, soldTickets)
}

// reserveTickets maneja el endpoint POST /api/v1/raffles/reserve
func reserveTickets(c *gin.Context) {
	// Simular error aleatorio

	// time.Sleep(10 * time.Second)

	// if simulateRandomError(c) {
	// 	return
	// }

	var participant RaffleParticipant

	// Parsear el JSON del request
	if err := c.ShouldBindJSON(&participant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your request data",
			"details": err.Error(),
		})
		return
	}

	// Validar que la rifa existe
	raffle := getRaffleById(string(participant.RaffleId))
	if raffle == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Raffle not found",
			"message": fmt.Sprintf("No raffle found with ID: %s", participant.RaffleId),
		})
		return
	}

	// Validar que los tickets están en el rango válido de la rifa
	for _, ticketNum := range participant.TicketNumber {
		if ticketNum < raffle.InitialTicket || ticketNum >= raffle.InitialTicket+raffle.TicketsTotal {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid ticket number",
				"message": fmt.Sprintf("Ticket number %d is not valid for raffle %s. Valid range: %d-%d",
					ticketNum, participant.RaffleId, raffle.InitialTicket, raffle.InitialTicket+raffle.TicketsTotal-1),
			})
			return
		}
	}

	// Validar campos requeridos
	if participant.Name == "" || participant.Email == "" || len(participant.TicketNumber) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required fields",
			"message": "Name, email, and at least one ticket number are required",
		})
		return
	}

	// Simular validación de tickets disponibles
	// En un escenario real, aquí verificarías contra una base de datos
	reservedTickets := validateAndReserveTickets(participant.TicketNumber)

	// Validar que todos los tickets solicitados fueron reservados
	if !areTicketListsEqual(participant.TicketNumber, reservedTickets) {
		c.JSON(http.StatusConflict, gin.H{
			"error":            "Tickets not available",
			"message":          "Some of the selected tickets are no longer available. Please select different numbers.",
			"requestedTickets": participant.TicketNumber,
			"availableTickets": reservedTickets,
			"conflictTickets":  findConflictTickets(participant.TicketNumber, reservedTickets),
		})
		return
	}

	// Generar booking ID único
	bookingId := generateBookingId()

	// Responder con los tickets reservados exitosamente
	response := RaffleParticipantResponse{
		ReserveTickets: reservedTickets,
		BookingId:      bookingId,
	}

	c.JSON(http.StatusOK, response)
}

// validateAndReserveTickets simula la validación y reserva de tickets
// En un escenario real, esto consultaría una base de datos
func validateAndReserveTickets(requestedTickets []int) []int {
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// Simular que algunos tickets pueden no estar disponibles (20% de probabilidad por ticket)
	var availableTickets []int

	for _, ticket := range requestedTickets {
		// 80% de probabilidad de que el ticket esté disponible
		if rng.Intn(100) < 80 {
			availableTickets = append(availableTickets, ticket)
		}
	}

	return availableTickets
}

// areTicketListsEqual compara si dos listas de tickets son iguales
func areTicketListsEqual(list1, list2 []int) bool {
	if len(list1) != len(list2) {
		return false
	}

	// Crear mapas para comparación
	map1 := make(map[int]bool)
	map2 := make(map[int]bool)

	for _, ticket := range list1 {
		map1[ticket] = true
	}

	for _, ticket := range list2 {
		map2[ticket] = true
	}

	// Comparar mapas
	for ticket := range map1 {
		if !map2[ticket] {
			return false
		}
	}

	return true
}

// findConflictTickets encuentra los tickets que no pudieron ser reservados
func findConflictTickets(requested, available []int) []int {
	availableMap := make(map[int]bool)
	for _, ticket := range available {
		availableMap[ticket] = true
	}

	var conflicts []int
	for _, ticket := range requested {
		if !availableMap[ticket] {
			conflicts = append(conflicts, ticket)
		}
	}

	return conflicts
}

// generateBookingId genera un booking ID único
func generateBookingId() string {
	id := uuid.New()
	return "BK-" + strings.ToUpper(strings.ReplaceAll(id.String(), "-", ""))
}

// verifyRaffleTickets simula la verificación de tickets comprados por un documento en una rifa
// Nota: La validación de que la rifa existe se hace en el endpoint antes de llamar esta función
func verifyRaffleTickets(request RaffleVerifyRequest) *RaffleVerifyResult {
	// Obtener la rifa (ya validada en el endpoint)
	raffle := getRaffleById(string(request.RaffleId))
	if raffle == nil {
		return nil
	}

	// Simular búsqueda de tickets comprados por este documento
	// En un escenario real, esto consultaría una base de datos
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// 20% de probabilidad de que no existan tickets para este documento
	if rng.Intn(100) < 20 {
		return nil // Retornar nil para indicar que no hay tickets
	}

	// Generar un número aleatorio de tickets comprados (entre 1 y 10)
	numTickets := rng.Intn(10) + 1
	boughtTickets := make([]RaffleVerifyTicket, 0, numTickets)

	// Generar tickets aleatorios dentro del rango de la rifa
	usedNumbers := make(map[int]bool)
	for i := 0; i < numTickets; i++ {
		var ticketNumber int
		for {
			ticketNumber = rng.Intn(raffle.TicketsTotal) + raffle.InitialTicket
			if !usedNumbers[ticketNumber] {
				usedNumbers[ticketNumber] = true
				break
			}
		}

		ticket := RaffleVerifyTicket{
			TicketNumber: ticketNumber,
		}

		// 5% probabilidad de ser número de la suerte
		if rng.Intn(100) < 5 {
			isBlessNumber := true
			ticket.IsBlessNumber = &isBlessNumber
		}

		boughtTickets = append(boughtTickets, ticket)
	}

	// Solo puede haber un premio principal - seleccionar aleatoriamente uno si hay tickets
	// Este ticket puede ser también número de la suerte (bless)
	if len(boughtTickets) > 0 {
		// 30% probabilidad de que uno de los tickets sea premio principal
		if rng.Intn(100) < 30 {
			// Seleccionar un ticket aleatorio para ser el premio principal
			// Este ticket puede tener también isBlessNumber si ya lo tiene
			mainPrizeIndex := rng.Intn(len(boughtTickets))
			isMainPrize := true
			boughtTickets[mainPrizeIndex].IsMainPrize = &isMainPrize
		}
	}

	return &RaffleVerifyResult{
		RaffleId:      request.RaffleId,
		DocumentId:    request.DocumentId,
		BoughtTickets: boughtTickets,
	}
}

// verifyRaffleEndpoint maneja el endpoint POST /api/v1/raffles/verify
func verifyRaffleEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		time.Sleep(5 * time.Second)
		return
	}

	var request RaffleVerifyRequest

	// Parsear el JSON del request
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your request data",
			"details": err.Error(),
		})
		return
	}

	// Validar campos requeridos
	if request.RaffleId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required field",
			"message": "raffleId is required",
		})
		return
	}

	if request.DocumentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required field",
			"message": "documentId is required",
		})
		return
	}

	// Verificar que la rifa existe primero
	raffle := getRaffleById(string(request.RaffleId))
	if raffle == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Raffle not found",
			"message": fmt.Sprintf("No raffle found with ID: %s", request.RaffleId),
		})
		return
	}

	// Verificar tickets
	result := verifyRaffleTickets(request)
	if result == nil {
		// La rifa existe pero no hay tickets para este documento
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "No tickets found",
			"message": fmt.Sprintf("No tickets found for document %s in raffle %s", request.DocumentId, request.RaffleId),
		})
		return
	}

	// Responder con el resultado de la verificación
	c.JSON(http.StatusOK, result)
}

// generateMainWinnerTickets genera números de tickets ganadores principales para una rifa
func generateMainWinnerTickets(raffle *RaffleSummary) []int {
	if raffle == nil {
		return []int{}
	}

	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// Generar entre 1 y 3 tickets ganadores principales
	numWinners := rng.Intn(3) + 1
	winners := make([]int, 0, numWinners)
	usedNumbers := make(map[int]bool)

	for len(winners) < numWinners {
		ticketNumber := rng.Intn(raffle.TicketsTotal) + raffle.InitialTicket
		if !usedNumbers[ticketNumber] {
			usedNumbers[ticketNumber] = true
			winners = append(winners, ticketNumber)
		}
	}

	return winners
}

// generateBlessNumberWinnerTickets genera números de tickets de la suerte para una rifa
func generateBlessNumberWinnerTickets(raffle *RaffleSummary) []int {
	if raffle == nil {
		return []int{}
	}

	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// Generar entre 5 y 10 tickets de números de la suerte
	numBlessNumbers := rng.Intn(6) + 5
	blessNumbers := make([]int, 0, numBlessNumbers)
	usedNumbers := make(map[int]bool)

	for len(blessNumbers) < numBlessNumbers {
		ticketNumber := rng.Intn(raffle.TicketsTotal) + raffle.InitialTicket
		if !usedNumbers[ticketNumber] {
			usedNumbers[ticketNumber] = true
			blessNumbers = append(blessNumbers, ticketNumber)
		}
	}

	return blessNumbers
}

// getPrizeByRaffleIdAndTicketId obtiene información de un premio específico
func getPrizeByRaffleIdAndTicketId(raffleId string, ticketId int) *Prize {
	raffle := getRaffleById(raffleId)
	if raffle == nil {
		return nil
	}

	// Validar que el ticket esté en el rango de la rifa
	if ticketId < raffle.InitialTicket || ticketId >= raffle.InitialTicket+raffle.TicketsTotal {
		return nil
	}

	// Generar premios mock basados en el ticket
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source)

	// 10% probabilidad de ser premio principal
	isMainPrize := rng.Intn(100) < 10

	// Lista de imágenes variadas para premios
	prizeImages := []string{
		"https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400",    // Trofeo
		"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400", // Medalla
		"https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400", // Regalo
		"https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400", // Caja regalo
		"https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400", // Estrella
		"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",    // Cohete
		"https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",    // Diamante
		"https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400", // Corona
	}

	// Seleccionar imagen basada en el ticketId para que sea determinístico pero variado
	imageIndex := ticketId % len(prizeImages)
	prizeImageUrl := prizeImages[imageIndex]

	prize := &Prize{
		ID:               PrizeId("prize-" + generateUUID()[:8]),
		RaffleId:         RaffleId(raffleId),
		ImageUrl:         prizeImageUrl,
		Title:            raffle.Title + " - Premio",
		ShortDescription: "Premio ganador de la rifa " + raffle.Title,
		WinningTicket:    ticketId,
	}

	if isMainPrize {
		isMain := true
		prize.IsMainPrize = &isMain
		prize.Title = raffle.Title + " - Premio Principal"
		prize.ShortDescription = "Premio principal ganador de la rifa " + raffle.Title
		// Para premios principales, usar imagen especial de trofeo/corona
		prize.ImageUrl = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400" // Corona para premio principal
	}

	return prize
}

// getMainWinnerTicketsEndpoint maneja el endpoint GET /api/v1/raffles/:id/winners/main
func getMainWinnerTicketsEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	raffleId := c.Param("id")

	// Buscar la rifa por ID
	raffle := getRaffleById(raffleId)
	if raffle == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Raffle not found",
			"message": fmt.Sprintf("No raffle found with ID: %s", raffleId),
		})
		return
	}

	// Generar tickets ganadores principales
	winnerTickets := generateMainWinnerTickets(raffle)

	c.JSON(http.StatusOK, winnerTickets)
}

// getBlessNumberWinnerTicketsEndpoint maneja el endpoint GET /api/v1/raffles/:id/winners/bless
func getBlessNumberWinnerTicketsEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	raffleId := c.Param("id")

	// Buscar la rifa por ID
	raffle := getRaffleById(raffleId)
	if raffle == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Raffle not found",
			"message": fmt.Sprintf("No raffle found with ID: %s", raffleId),
		})
		return
	}

	// Generar tickets de números de la suerte
	blessTickets := generateBlessNumberWinnerTickets(raffle)

	c.JSON(http.StatusOK, blessTickets)
}

// getPrizeByRaffleIdAndTicketIdEndpoint maneja el endpoint GET /api/v1/raffles/:id/prizes/:ticketId
func getPrizeByRaffleIdAndTicketIdEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	raffleId := c.Param("id")
	ticketIdStr := c.Param("ticketId")

	// Validar y obtener la cédula del usuario desde query parameter
	documentId := c.Query("documentId")
	if documentId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required parameter",
			"message": "documentId query parameter is required",
		})
		return
	}

	// Convertir ticketId a entero
	var ticketId int
	if _, err := fmt.Sscanf(ticketIdStr, "%d", &ticketId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid ticket ID",
			"message": "ticketId must be a valid number",
		})
		return
	}

	// Obtener premio
	prize := getPrizeByRaffleIdAndTicketId(raffleId, ticketId)
	if prize == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Prize not found",
			"message": fmt.Sprintf("No prize found for raffle %s and ticket %d", raffleId, ticketId),
		})
		return
	}

	c.JSON(http.StatusOK, prize)
}

// fetchBanksFromSypago consume la API de SyPago para obtener la lista de bancos
func fetchBanksFromSypago() ([]Bank, error) {
	url := sypagoApiBaseUrl + "/api/v1/banks"

	// Obtener token de autenticación
	authHeader, err := GetSypagoAuthHeader()
	if err != nil {
		return nil, fmt.Errorf("failed to get SyPago auth token: %v", err)
	}

	// Crear cliente HTTP con timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Crear la petición GET
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}

	// Configurar headers con autenticación
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Accept", "application/json")

	// Ejecutar la petición
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request to SyPago API: %v", err)
	}
	defer resp.Body.Close()

	// Verificar status code
	if resp.StatusCode == http.StatusUnauthorized {
		// Token expirado, invalidar cache y reintentar una vez
		InvalidateToken()
		return nil, fmt.Errorf("SyPago API returned 401 Unauthorized - token may be expired")
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("SyPago API returned status code %d: %s", resp.StatusCode, string(body))
	}

	// Leer el body de la respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	// Parsear JSON
	var banks []Bank
	if err := json.Unmarshal(body, &banks); err != nil {
		return nil, fmt.Errorf("error parsing JSON response: %v", err)
	}

	return banks, nil
}

// getSypagoBanks maneja el endpoint GET /sypago/banks
func getSypagoBanks(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	// Obtener bancos desde SyPago API
	banks, err := fetchBanksFromSypago()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch banks",
			"message": "Unable to retrieve banks from SyPago service",
			"details": err.Error(),
		})
		return
	}

	// Filtrar bancos con IsDebitOTP = true y mapear a BankResponse
	var filteredBanks []BankResponse
	for _, bank := range banks {
		if bank.IsDebitOTP {
			filteredBanks = append(filteredBanks, BankResponse{
				Code: bank.Code,
				Name: bank.Name,
			})
		}
	}

	c.JSON(http.StatusOK, filteredBanks)
}

// requestOtpEndpoint maneja el endpoint POST /api/v1/sypago/request-otp
func requestOtpEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	var data DebitRequestOtpData

	// Parsear el JSON del request
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your request data",
			"details": err.Error(),
		})
		return
	}

	// Validar los datos
	if err := ValidateDebitRequestData(data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// Llamar al servicio de SyPago
	otpResponse, err := RequestOtp(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to request OTP",
			"message": "Unable to process OTP request with SyPago",
			"details": err.Error(),
		})
		return
	}

	// Responder con la respuesta de SyPago
	c.JSON(http.StatusOK, otpResponse)
}

// transactionOtpEndpoint maneja el endpoint POST /api/v1/sypago/transaction-otp
func transactionOtpEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	var data TransactionOtpData

	// Parsear el JSON del request
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request format",
			"message": "Please check your request data",
			"details": err.Error(),
		})
		return
	}

	// Validar los datos
	if err := ValidateTransactionOtpData(data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// Guardar mapeo de bookingId -> raffleId para poder generar números bendecidos después
	SaveBookingRaffleMapping(data.BookingId, data.RaffleId)

	// Llamar al servicio de SyPago
	transactionResponse, err := TransactionOtp(data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process transaction",
			"message": "Unable to process transaction with SyPago",
			"details": err.Error(),
		})
		return
	}

	// Responder con la respuesta de SyPago
	c.JSON(http.StatusOK, transactionResponse)
}

// transactionStatusEndpoint maneja el endpoint GET /api/v1/sypago/debit/transaction/status
func transactionStatusEndpoint(c *gin.Context) {
	// Simular error aleatorio
	if simulateRandomError(c) {
		return
	}

	// Obtener parámetros de query
	transactionId := c.Query("transaction_id")
	bookingId := c.Query("booking_id")

	// Validar parámetros requeridos
	if transactionId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required parameter",
			"message": "transaction_id is required",
		})
		return
	}

	if bookingId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Missing required parameter",
			"message": "booking_id is required",
		})
		return
	}

	// Para compatibilidad con SyPago, usamos el transactionId como operation_secret
	// En un escenario real, esto vendría del frontend o se almacenaría
	operationSecret := transactionId // Simplificación para el mock

	// Llamar al servicio de consulta de estado
	statusResponse, err := GetTransactionStatus(transactionId, operationSecret, bookingId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get transaction status",
			"message": "Unable to retrieve transaction status",
			"details": err.Error(),
		})
		return
	}

	// Responder con el estado de la transacción
	c.JSON(http.StatusOK, statusResponse)
}

// setupCORS configura CORS para permitir conexiones desde múltiples orígenes

func ActivateRoutesForMock(r *gin.Engine) {

	r.GET("api/v1/raffles", getRaffles)

	r.GET("api/v1/raffles/:id/tickets/sold", getSoldTickets)
	r.POST("api/v1/raffles/participant", reserveTickets)

	r.POST("api/v1/raffles/verify", verifyRaffleEndpoint)
	r.GET("api/v1/raffles/:id/winners/main", getMainWinnerTicketsEndpoint)
	r.GET("api/v1/raffles/:id/winners/bless", getBlessNumberWinnerTicketsEndpoint)
	r.GET("api/v1/raffles/:id/prizes/:ticketId", getPrizeByRaffleIdAndTicketIdEndpoint)

	r.GET("api/v1/sypago/banks", getSypagoBanks)

	r.POST("api/v1/sypago/debit/request-otp", requestOtpEndpoint)
	r.POST("api/v1/sypago/debit/transaction-otp", transactionOtpEndpoint)
	r.GET("api/v1/sypago/debit/transaction/status", transactionStatusEndpoint)

}
