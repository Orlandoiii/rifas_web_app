# Análisis Completo del Repositorio - Rifas Web App

## 📋 Resumen Ejecutivo

Aplicación web full-stack para gestión de rifas/sorteos con sistema de compra de tickets, integración de pagos mediante SyPago, y verificación de resultados. Consta de un frontend React/TypeScript y un backend Go que actúa como API REST y servidor de archivos estáticos.

---

## 🏗️ Arquitectura General

### Stack Tecnológico

#### Frontend
- **Framework**: React 19.1.1 con TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **Estado**: 
  - React Query 5.90.6 (server state)
  - Zustand 5.0.7 (client state)
  - localStorage (persistencia)
- **UI**: TailwindCSS 4.1.12, Framer Motion 12.23.12
- **Formularios**: React Hook Form 7.62.0
- **Utilidades**: html2canvas, jspdf, qrcode, canvas-confetti

#### Backend
- **Lenguaje**: Go 1.25.1
- **Framework**: Gin (gin-gonic/gin v1.11.0)
- **Configuración**: JSON con hot-reload (fsnotify)
- **Mock**: Sistema de mock integrado para desarrollo

### Estructura del Proyecto

```
rifas_web_app/
├── src/                    # Frontend React/TypeScript
│   ├── pages/             # Páginas principales
│   ├── components/        # Componentes React
│   │   ├── lib/          # Componentes reutilizables
│   │   └── site/         # Componentes específicos
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios de API
│   ├── types/            # Definiciones TypeScript
│   ├── utils/            # Utilidades
│   └── config/           # Configuración
├── server/                # Backend Go
│   ├── config/           # Configuración del servidor
│   ├── mock/             # Sistema de mock
│   ├── middlewares/      # Middlewares
│   └── bin/              # Build output
│       └── web/          # Frontend compilado
├── public/               # Assets estáticos
└── config.json           # Configuración del servidor
```

---

## 🎯 Funcionalidades Principales

### 1. Visualización de Rifas
- **Landing Page**: Muestra rifas disponibles con carrusel
- **Rifa Principal**: Destaca la rifa marcada como `isMain`
- **Modal de Detalle**: Información completa, galería, términos y condiciones

### 2. Compra de Tickets (Flujo de 4 Pasos)

#### Paso 1: Selección de Tickets
- Grid paginado (50 tickets por página)
- Estados: `available`, `sold`, `reserved`
- Selección manual o aleatoria (x1, x5)
- Búsqueda por número específico
- Vista de tickets seleccionados

#### Paso 2: Datos del Usuario
- **Cédula**: Solo números, 6-10 dígitos
- **Nombre**: Solo letras, máximo 1 espacio
- **Teléfono**: Regex para operadoras venezolanas (Movistar, Movilnet, Digitel)
- **Email**: Validación de formato
- Persistencia en localStorage
- **Reserva de tickets** al avanzar (obtiene `bookingId`)

#### Paso 3: Información de Pago
- Selección de banco (desde API SyPago)
- Tipo de documento (V/E/J/P)
- Número de documento y teléfono
- **Solicitud automática de OTP** al avanzar

#### Paso 4: Verificación OTP
- Input de OTP (6 dígitos)
- Countdown de 26 segundos para reenvío
- **Procesamiento de débito** con polling de estado
- Estados: `PROC`, `PEND`, `AC00`, `ACCP` (aceptado), `RJCT` (rechazado)
- Timeout máximo: 20 segundos

### 3. Gestión de Compras
- Historial local en localStorage
- Expiración automática (7 días)
- Vista de detalle con información completa
- Generación de comprobante PDF con QR
- Estadísticas de compras

### 4. Verificación de Números
- Búsqueda por cédula
- Estados de resultado:
  1. Sin tickets comprados
  2. Tickets sin premios (rifa activa)
  3. Tickets sin premios (rifa finalizada) - muestra números ganadores
  4. Tickets con premios (principal o bless)
- Visualización de premios con modales
- Sistema de números "bless" (premios adicionales)

---

## 🔌 Integración con API

### Endpoints Principales

#### Rifas
- `GET /api/v1/raffles` - Lista de rifas
- `GET /api/v1/raffles/:id/tickets/sold` - Tickets vendidos
- `POST /api/v1/raffles/participant` - Reservar tickets
- `POST /api/v1/raffles/verify` - Verificar tickets por cédula
- `GET /api/v1/raffles/:id/winners/main` - Números ganadores principales
- `GET /api/v1/raffles/:id/winners/bless` - Números ganadores bless
- `GET /api/v1/raffles/:id/prizes/:ticketId` - Premio por ticket

#### Pagos (SyPago)
- `GET /api/v1/sypago/banks` - Lista de bancos
- `POST /api/v1/sypago/debit/request-otp` - Solicitar OTP
- `POST /api/v1/sypago/debit/transaction-otp` - Procesar débito
- `GET /api/v1/sypago/debit/transaction/status` - Estado de transacción

### Configuración de API
- Base URL: `VITE_API_BASE_URL` o `https://tusorteoganador.com/api/v1` por defecto
- Configurado en `src/config/api.ts`

---

## 💾 Gestión de Estado

### React Query
- **Stale Time**: 5 minutos (rifas), 2 minutos (tickets vendidos)
- **GC Time**: 10 minutos
- **Retry**: 2 intentos
- **Refetch on Focus**: Deshabilitado
- **Query Keys**: Estructura jerárquica para invalidación selectiva

### LocalStorage
- **`raffle_purchases`**: Compras del usuario (con timestamps, expiración 7 días)
- **`raffle_participant`**: Datos del participante (gestión interna)
- **`ui-theme`**: Tema (siempre 'dark')
- **`ui-selected-color`**: Color seleccionado (default: 'mint')

### Eventos Personalizados
- **`purchases_updated`**: Disparado cuando se actualizan las compras (sincronización entre componentes)

---

## 🎨 Sistema de Diseño

### Tema
- **Forzado a oscuro**: No se permite cambio de tema
- **Colores principales**:
  - **Coral**: `#FF7F50` (main), `#FF9470` (light), `#E5633A` (dark)
  - **Mint**: `#21C6A4` (main) - **Default**
  - **Electric**: `#007BFF` (main)
  - **Binance**: `#F0B90B` (main)

### Fondos
- `bg-primary`: `#181A20` (default) / `#0B0E11` (dark)
- `bg-secondary`: `#1E2026` (default) / `#12161C` (dark)
- `bg-tertiary`: `#252831` (default) / `#1E2329` (dark)

### Sistema de Color Dinámico
- Variables CSS `--color-selected` que cambian según `data-selected`
- Clases utilitarias: `bg-selected`, `text-selected`, `border-selected`
- Persistencia en localStorage

### Tipografía
- Fuente: **Montserrat** (Google Fonts)

---

## 🔐 Validaciones

### Formularios
- **Cédula**: `^\d+$`, 6-10 dígitos
- **Nombre**: `^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$`, máximo 1 espacio
- **Teléfono**: `^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$`
- **Email**: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Documento Bancario**: Según tipo (V/E: 6-10, J: 8-12)

### Validación en Tiempo Real
- Validación al `onChange` y `onBlur`
- Estados `touched` para mostrar errores solo cuando corresponde
- Mensajes de error descriptivos

---

## 🔄 Flujos de Datos

### Compra de Tickets
1. Usuario selecciona tickets → Estado local
2. Usuario completa datos → `useParticipant` (localStorage)
3. Sistema reserva tickets → Obtiene `bookingId`
4. Usuario completa pago → Solicita OTP
5. Usuario verifica OTP → Procesa débito
6. Polling de estado → Si `ACCP`, guarda compra y muestra éxito
7. Genera PDF con comprobante

### Verificación de Tickets
1. Usuario ingresa cédula → `verifyRaffle()`
2. Backend retorna tickets comprados
3. Si hay premios → Obtiene detalles de premios
4. Si rifa finalizada sin premios → Obtiene números ganadores
5. Muestra resultado según estado

### Polling de Transacciones
- **Primer intento**: 750ms después del inicio
- **Incremento**: +350ms por intento
- **Timeout total**: 20 segundos
- **Estados finales**: `ACCP` (aceptado), `RJCT` (rechazado), `TIMEOUT`

---

## 🖥️ Backend (Go)

### Configuración
- **Puerto**: 8080 (configurable en `config.json`)
- **CORS**: Configurado con orígenes permitidos
- **SSL**: Opcional (configurable)
- **Mock**: Sistema de mock habilitado para desarrollo

### Estructura del Backend
- **`config/`**: Gestión de configuración con hot-reload
- **`mock/`**: Sistema de mock completo para todas las rutas
- **`middlewares/`**: Middlewares (CORS, seguridad, static files)
- **`bin/web/`**: Frontend compilado servido estáticamente

### Sistema de Mock
- Simula todas las rutas de la API
- Genera datos aleatorios para testing
- Simula errores aleatorios (configurable)
- Integración con SyPago API real para bancos
- Manejo de tokens JWT para SyPago

---

## 📦 Componentes Clave

### Componentes Reutilizables (`lib/components/`)
- **Button**: Variantes (default, destructive, outline, secondary, ghost, link), tamaños
- **Input**: Con máscaras, validación, tooltips, labels flotantes
- **Select**: Con búsqueda integrada
- **Modal**: Con backdrop, tamaños configurables, bloqueo de scroll
- **Stepper**: Wizard de pasos con validación
- **Loader**: Indicadores de carga
- **DataGrid**: Tablas con TanStack Table

### Componentes del Sitio (`site/`)
- **RaffleDetailModal**: Modal principal de compra (Stepper de 4 pasos)
- **TicketSelectionForm**: Selección de tickets con paginación
- **UserDataForm**: Formulario de datos del usuario
- **SypagoDebit**: Formulario de información de pago
- **OTPVerification**: Verificación de OTP
- **PurchaseSuccessView**: Vista de éxito con comprobante
- **VerifyRaffleForm**: Formulario de verificación
- **VerifyResultWithPrizes**: Visualización de resultados con premios

---

## 🚀 Scripts y Build

### Frontend
```bash
npm run dev      # Desarrollo (puerto 5173)
npm run build    # Build de producción (output: ./server/bin/web)
npm run preview  # Preview del build
npm run lint     # Linter
```

### Backend
- Compilación: `go build` en `server/`
- Ejecución: El binario lee `config.json` desde su directorio
- Hot-reload: Configuración con `fsnotify`

---

## 📱 Responsive Design

- **Mobile First**: Diseño adaptativo
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grids Adaptativos**: Columnas según tamaño de pantalla
- **Navegación**: Adaptada para móviles

---

## 🎭 Animaciones

- **Framer Motion**: Transiciones suaves en modales, stepper, carrusel
- **CSS Transitions**: Transiciones de tema (300ms), hover effects
- **Canvas Confetti**: Efectos de confeti en eventos especiales

---

## 🔍 Hooks Personalizados

### `useRaffles`
- `useRaffles()`: Obtiene todas las rifas
- `useSoldTickets(raffleId)`: Tickets vendidos
- `useRaffleDetail(raffle)`: Detalle completo con tickets
- `useCreateParticipant()`: Reservar tickets (mutation)

### `usePurchases`
- Gestión de compras en localStorage
- Expiración automática (7 días)
- Sincronización entre componentes

### `useParticipant`
- Gestión de datos del participante
- Persistencia en localStorage

### `usePayments`
- `useBanks()`: Lista de bancos
- Integración con servicios de pago

### `useVerifyRaffle`
- Lógica de verificación de tickets
- Estados: `idle`, `no-tickets`, `tickets-no-prizes-active`, `tickets-no-prizes-finished`, `tickets-with-prizes`

---

## 🛠️ Utilidades

### `generateRaffleTickets()`
- Genera array de tickets desde `initialTicket` hasta `ticketsTotal`
- Marca como `sold` los números en `soldNumbers`

### `buildRaffleDetail()`
- Combina `RaffleSummary` con tickets generados
- Crea `RaffleDetail` completo

### `isRaffleFinished()`
- Compara `endsAt` con fecha actual
- Retorna `boolean`

### `cn()` (Tailwind Merge)
- Combina clases de Tailwind sin conflictos
- Usa `clsx` y `tailwind-merge`

---

## 📊 Tipos TypeScript Principales

### Rifas
```typescript
interface RaffleSummary {
  id: string;
  title: string;
  price: number;
  currency: 'VES' | 'USD';
  initialTicket: number;
  ticketsTotal: number;
  totalSold: number;
  endsAt: string;
  isMain?: boolean;
}

interface RaffleTicket {
  raffleId: string;
  number: number;
  status: 'available' | 'sold' | 'reserved';
  isMainPrize?: boolean;
  isBlessNumber?: boolean;
}
```

### Pagos
```typescript
interface ProcessDebitPayload {
  booking_id: string;
  participant_id: string;
  raffle_id: string;
  tickets: number[];
  receiver_name: string;
  receiver_otp: string;
  // ... más campos
}

type TransactionStatus = 'ACCP' | 'RJCT' | 'TIMEOUT';
```

---

## 🔐 Seguridad

### Frontend
- Validación de formularios en tiempo real
- Sanitización de inputs
- Manejo seguro de localStorage
- CORS configurado en backend

### Backend
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- CORS configurable
- Validación de requests
- Manejo de errores estructurado

---

## 🐛 Manejo de Errores

### Frontend
- Todos los servicios manejan errores del backend
- Intentan parsear `message` o `error` del JSON de error
- Mensajes descriptivos para el usuario
- Estados de error en componentes
- Modales de error con animaciones

### Backend
- Respuestas estructuradas con `error`, `message`, `details`
- Códigos HTTP apropiados
- Logging de errores

---

## 📝 Notas Importantes

1. **Tema Forzado**: El tema siempre es oscuro, no se puede cambiar
2. **Color Dinámico**: El color seleccionado se puede cambiar y persiste
3. **Expiración de Compras**: Las compras expiran después de 7 días
4. **Polling de Pagos**: Máximo 20 segundos, incremento de 350ms
5. **Validación Estricta**: Validaciones muy específicas para formularios
6. **Persistencia**: Datos del usuario y compras se guardan en localStorage
7. **React Compiler**: Habilitado en Vite config
8. **Mock Habilitado**: Sistema de mock activo para desarrollo
9. **Build Output**: Frontend se compila en `./server/bin/web` para servir desde backend
10. **Hot-reload Config**: Backend recarga configuración automáticamente

---

## 🔄 Flujo de Compra Completo

1. Usuario selecciona rifa → Abre modal de detalle
2. Selecciona números → Validación de disponibilidad
3. Ingresa datos personales → Validación y guardado en localStorage
4. Sistema reserva tickets → Obtiene `bookingId` del backend
5. Usuario ingresa datos bancarios → Validación
6. Sistema solicita OTP → Countdown de 26s
7. Usuario ingresa OTP → Procesa débito
8. Sistema hace polling → Consulta estado cada X ms (incremento de 350ms)
9. Si aceptado (`ACCP`) → Guarda compra, muestra éxito, genera PDF
10. Si rechazado (`RJCT`) → Muestra error con razón, mantiene reserva

---

## 🎯 Puntos de Extensión

### Agregar Nueva Funcionalidad
1. **Nuevo Hook**: Crear en `src/hooks/`
2. **Nuevo Servicio**: Crear en `src/services/`
3. **Nuevo Componente**: Crear en `src/components/site/` o `lib/`
4. **Nuevo Tipo**: Agregar en `src/types/`

### Modificar Tema
- Editar `src/index.css` para colores
- Modificar `ThemeProvider` para comportamiento

### Agregar Nueva Página
1. Crear componente en `src/pages/`
2. Agregar ruta en `src/App.tsx`

### Agregar Nueva Ruta Backend
1. Crear handler en `server/mock/mock.go` (si mock)
2. Agregar ruta en `ActivateRoutesForMock` o en el router principal

---

## 📈 Performance

- **React Query**: Cache y stale time para optimizar requests
- **Code Splitting**: Vite lo maneja automáticamente
- **Lazy Loading**: Posible con React.lazy (no implementado actualmente)
- **Memoization**: useMemo y useCallback donde es necesario
- **React Compiler**: Optimización automática de componentes

---

## 🔗 Integraciones Externas

### SyPago
- API de pagos bancarios
- Autenticación con JWT
- Endpoints: bancos, OTP, débito, estado de transacción
- Manejo de códigos de rechazo

### Google Fonts
- Montserrat para tipografía

---

## 📚 Documentación Adicional

- `ANALISIS_FRONTEND.md`: Análisis detallado del frontend
- `resumen.md`: Resumen del proyecto frontend
- `README.md`: Documentación básica del template

---

Este documento contiene toda la información relevante del repositorio para futuras referencias y desarrollo.
