# Análisis Profundo del Frontend - Rifas Web App

## 📋 Resumen General

Aplicación web de rifas construida con **React 19**, **TypeScript**, **Vite**, y **TailwindCSS v4**. Sistema completo de compra de tickets, verificación de resultados, y gestión de premios con integración de pagos mediante SyPago.

---

## 🏗️ Arquitectura y Estructura de Carpetas

### Estructura Principal

```
rifas_web_app/
├── src/
│   ├── main.tsx              # Punto de entrada de la aplicación
│   ├── App.tsx               # Router principal (React Router v7)
│   ├── index.css             # Estilos globales y tema
│   │
│   ├── pages/                # Páginas principales
│   │   ├── Landing.tsx       # Página principal con hero y carrusel
│   │   ├── MyPurchases.tsx  # Historial de compras del usuario
│   │   └── VerifyRaffle.tsx # Página de verificación de rifas
│   │
│   ├── components/
│   │   ├── lib/              # Librería de componentes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── button/   # Botón con variantes
│   │   │   │   ├── input/    # Input con validación y máscaras
│   │   │   │   ├── select/   # Select con búsqueda
│   │   │   │   ├── modal/    # Modal con backdrop y animaciones
│   │   │   │   ├── loader/   # Componente de carga
│   │   │   │   ├── stepper/  # Stepper multi-paso
│   │   │   │   ├── theme/    # Provider de tema
│   │   │   │   └── data_grid/# Tabla de datos
│   │   │   ├── context/      # Contextos React
│   │   │   ├── hooks/        # Hooks personalizados
│   │   │   └── utils/        # Utilidades (cn, etc.)
│   │   │
│   │   └── site/             # Componentes específicos del sitio
│   │       ├── NavBar.tsx
│   │       ├── Hero.tsx
│   │       ├── Footer.tsx
│   │       ├── RafflesCarousel.tsx
│   │       ├── RaffleCard.tsx
│   │       ├── RaffleDetailModal.tsx  # Modal principal de compra
│   │       ├── TicketSelectionForm.tsx
│   │       ├── UserDataForm.tsx
│   │       ├── payments/
│   │       │   ├── SypagoDebit.tsx
│   │       │   └── OTPVerification.tsx
│   │       ├── PurchaseSuccessView.tsx
│   │       ├── PurchaseCard.tsx
│   │       ├── VerifyRaffleForm.tsx
│   │       ├── VerifyRaffleDetails.tsx
│   │       ├── VerifyResultModals.tsx
│   │       ├── VerifyResultWithPrizes.tsx
│   │       └── PrizeWinnerModal.tsx
│   │
│   ├── hooks/                # Hooks de negocio
│   │   ├── useRaffles.ts     # Gestión de rifas
│   │   ├── useParticipant.ts # Datos del participante (localStorage)
│   │   ├── usePayments.ts    # Bancos y pagos
│   │   ├── usePurchases.ts   # Historial de compras (localStorage)
│   │   └── useVerifyRaffle.ts# Verificación de tickets
│   │
│   ├── services/             # Servicios de API
│   │   ├── raffles.ts        # API de rifas
│   │   ├── prizes.ts         # API de premios
│   │   └── payments.ts        # API de pagos SyPago
│   │
│   ├── types/                # Tipos TypeScript
│   │   ├── raffles.ts        # Tipos de rifas
│   │   ├── prizes.ts         # Tipos de premios
│   │   └── payments.ts       # Tipos de pagos
│   │
│   ├── utils/               # Utilidades
│   │   ├── raffles.ts        # Helpers de rifas
│   │   └── raffleTickets.ts  # Generación de tickets
│   │
│   ├── config/
│   │   └── api.ts            # Configuración de endpoints
│   │
│   └── lib/
│       └── queryClient.ts    # Configuración de React Query
│
├── public/                   # Assets estáticos
│   ├── hero.jpg
│   └── logo-trebol.ico
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## 🎨 Sistema de Diseño y Tema

### Tema Oscuro (Forzado)
- El tema está **forzado a oscuro** en `ThemeProvider`
- No se permite cambio de tema (siempre `dark`)
- Colores principales definidos en `index.css`:

#### Paleta de Colores
- **Coral**: `#FF7F50` (main), `#FF9470` (light), `#E5633A` (dark)
- **Mint**: `#21C6A4` (main), `#4FD3B7` (light), `#1BA088` (dark) - **Default**
- **Electric**: `#007BFF` (main), `#339EFF` (light), `#0056CC` (dark)
- **Binance**: `#F0B90B` (main), `#F5C431` (light), `#C69008` (dark)

#### Fondos
- `bg-primary`: `#181A20` (default) / `#0B0E11` (dark)
- `bg-secondary`: `#1E2026` (default) / `#12161C` (dark)
- `bg-tertiary`: `#252831` (default) / `#1E2329` (dark)

#### Sistema de Color Dinámico
- Variables CSS `--color-selected` que cambian según `data-selected`
- Clases utilitarias: `bg-selected`, `text-selected`, `border-selected`
- El color seleccionado se guarda en `localStorage` con clave `ui-selected-color`

### Tipografía
- Fuente: **Montserrat** (Google Fonts)
- Configurada en `index.html`

---

## 🔄 Flujo de Compra (Proceso Principal)

### 1. Selección de Rifa
- Usuario ve rifas en `Landing.tsx`
- Hero muestra rifa principal (`isMain: true`)
- Carrusel muestra todas las rifas disponibles
- Click en "Comprar ahora" abre `RaffleDetailModal`

### 2. Modal de Compra (`RaffleDetailModal.tsx`)
**Stepper de 4 pasos:**

#### Paso 1: Selección de Tickets (`TicketSelectionForm.tsx`)
- Muestra tickets disponibles en grid paginado (50 por página)
- Estados: `available`, `sold`, `reserved`
- Funcionalidades:
  - Selección manual de tickets
  - Botón "Aleatorio x1" y "Aleatorio x5"
  - Búsqueda por número específico
  - Vista de tickets seleccionados
  - Botón "Limpiar" para deseleccionar todo

#### Paso 2: Datos del Usuario (`UserDataForm.tsx`)
- Campos:
  - **Cédula**: Solo números, 6-10 dígitos
  - **Nombre**: Solo letras, máximo 1 espacio (nombre y apellido)
  - **Teléfono**: Regex específico (Movistar, Movilnet, Digitel)
  - **Email**: Validación de formato
- Validación en tiempo real
- Persistencia en `localStorage` mediante `useParticipant`
- Botón para limpiar datos guardados
- **Al avanzar**: Se reservan los tickets (`handleReserveTickets`)

#### Paso 3: Pago (`SypagoDebit.tsx`)
- Campos:
  - **Banco**: Select con lista de bancos (API)
  - **Teléfono**: Mismo formato que datos del usuario
  - **Tipo de Documento**: V, E, J, P
  - **Número de Documento**: Validación según tipo
- **Al avanzar**: Se solicita OTP (`handleGenerateOTP`)
- Countdown de 26 segundos para reenvío

#### Paso 4: Verificación OTP (`OTPVerification.tsx`)
- Input de OTP (6 dígitos)
- Botón "Reenviar OTP" (con countdown)
- **Al verificar**: 
  1. Procesa débito (`processDebit`)
  2. Inicia polling de estado (`pollTransactionStatus`)
  3. Si `ACCP`: Guarda compra y muestra `PurchaseSuccessView`
  4. Si `RJCT`: Muestra error con razón
  5. Si `TIMEOUT`: Muestra mensaje de timeout

### 3. Vista de Éxito (`PurchaseSuccessView.tsx`)
- Muestra detalles de la compra exitosa
- Información de tickets comprados
- Números "bless" si aplica
- Botón para descargar comprobante (PDF)
- Guarda compra en `localStorage` mediante `usePurchases`

---

## 🔍 Sistema de Verificación

### Flujo de Verificación (`VerifyRaffleForm.tsx`)

1. **Input de Cédula**: Usuario ingresa documento
2. **Verificación**: Llama a `rafflesService.verifyRaffle()`
3. **Estados posibles** (`useVerifyRaffle`):
   - `idle`: Sin verificar
   - `no-tickets`: No tiene tickets comprados
   - `tickets-no-prizes-active`: Tiene tickets pero rifa activa
   - `tickets-no-prizes-finished`: Tiene tickets, rifa finalizada, sin premios
   - `tickets-with-prizes`: Tiene tickets ganadores

### Componentes de Resultado
- `VerifyResultWithPrizes`: Muestra tickets con premios (clickeables)
- `NoTicketsModal`: Modal cuando no hay tickets
- `TicketsNoPrizesActiveModal`: Modal para rifa activa sin premios
- `TicketsNoPrizesFinishedModal`: Modal para rifa finalizada sin premios
- `PrizeWinnerModal`: Modal de premio individual

### Tipos de Premios
- **Premio Principal**: Se crea desde datos de la rifa
- **Premio Bless**: Se obtiene del API (`prizesService.getPrizeByRaffleIdAndTicketId`)

---

## 💾 Gestión de Estado

### React Query (`@tanstack/react-query`)
- **Query Client**: Configurado en `lib/queryClient.ts`
  - `staleTime`: 5 minutos
  - `gcTime`: 10 minutos
  - `retry`: 2 intentos
  - `refetchOnWindowFocus`: false

### Query Keys
```typescript
QUERY_KEYS = {
  raffles: {
    all: ['raffles'],
    list: () => ['raffles', 'list'],
    soldTickets: (id) => ['raffles', 'soldTickets', id],
  }
}
```

### LocalStorage
- **Participante**: `raffle_participant` (datos del usuario)
- **Compras**: `raffle_purchases` (historial de compras)
  - Expiración: 7 días
  - Evento personalizado: `purchases_updated` para sincronización
- **Tema**: `ui-theme` (siempre 'dark')
- **Color seleccionado**: `ui-selected-color` (default: 'mint')

### Hooks de Estado
- `useParticipant`: Gestión de datos del participante
- `usePurchases`: Gestión de historial de compras
- `useRaffles`: Queries de rifas
- `useVerifyRaffle`: Lógica de verificación

---

## 🔌 Integración con API

### Configuración
- Base URL: `VITE_API_BASE_URL` o `/api/v1` por defecto
- Endpoints definidos en `config/api.ts`

### Servicios

#### `rafflesService`
- `getRaffles()`: Lista de rifas
- `getSoldTickets(raffleId)`: Tickets vendidos
- `createParticipant(participant)`: Reservar tickets
- `verifyRaffle(request)`: Verificar tickets comprados
- `getMainWinnerTickets(raffleId)`: Tickets ganadores principales
- `getBlessNumberWinnerTickets(raffleId)`: Tickets ganadores bless

#### `prizesService`
- `getPrizeByRaffleIdAndTicketId(raffleId, ticketId, documentId)`: Obtener premio bless

#### `paymentsService`
- `getBanks()`: Lista de bancos
- `requestDebitOtp(payload)`: Solicitar OTP
- `processDebit(payload)`: Procesar débito
- `getTransactionStatus(transactionId, bookingId)`: Estado de transacción
- `pollTransactionStatus(...)`: Polling de estado (20s máximo)

### Manejo de Errores
- Todos los servicios manejan errores del backend
- Intentan parsear `message` o `error` del JSON de error
- Lanzan `Error` con mensaje descriptivo

---

## 🎯 Componentes Clave

### Button
- Variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Tamaños: `sm`, `default`, `lg`, `xl`, `icon`
- Usa `class-variance-authority` para variantes
- Colores dinámicos según `--color-selected`

### Input
- Variantes: `classic`, `floating`
- Validación en tiempo real
- Soporte para máscaras (contexto de máscaras)
- Tooltips de error
- Labels flotantes

### Modal
- Tamaños: `sm`, `md`, `lg`, `xl`
- Animaciones con Framer Motion
- Backdrop con blur
- Lock body scroll opcional
- Close on backdrop click opcional

### Stepper
- Sistema multi-paso con validación
- Animaciones de transición
- Soporte para `onNext` y `onPrev` asíncronos
- Validación por paso
- Estado de procesamiento

---

## 📱 Responsive Design

- **Mobile First**: Diseño adaptativo
- Breakpoints de Tailwind:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

### Ejemplos de Responsive
- NavBar: Logo + botones adaptativos
- Hero: Texto y botones escalables
- TicketSelectionForm: Grid de 6/8/10 columnas según tamaño
- Modales: Anchos adaptativos

---

## 🎭 Animaciones

### Framer Motion
- Transiciones suaves en modales
- Animaciones de entrada/salida
- Slider del stepper
- Carrusel de rifas con drag

### CSS Transitions
- Transiciones de tema (300ms)
- Hover effects en botones
- Transiciones de color

---

## 🔐 Validaciones

### Formularios
- **Cédula**: `^\d+$`, 6-10 dígitos
- **Nombre**: `^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$`, máximo 1 espacio
- **Teléfono**: `^(?:(?:0)?414|(?:0)?424|(?:0)?412|(?:0)?416|(?:0)?426|(?:0)?422)\d{7}$`
- **Email**: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Documento**: Según tipo (V/E: 6-10, J: 8-12)

### Validación en Tiempo Real
- Validación al `onChange` y `onBlur`
- Estados `touched` para mostrar errores solo cuando corresponde
- Mensajes de error descriptivos

---

## 🛠️ Utilidades

### `cn()` (Tailwind Merge)
- Combina clases de Tailwind sin conflictos
- Usa `clsx` y `tailwind-merge`

### `generateRaffleTickets()`
- Genera array de tickets desde `initialTicket` hasta `ticketsTotal`
- Marca como `sold` los números en `soldNumbers`

### `buildRaffleDetail()`
- Combina `RaffleSummary` con tickets generados
- Crea `RaffleDetail` completo

### `isRaffleFinished()`
- Compara `endsAt` con fecha actual
- Retorna `boolean`

---

## 📦 Dependencias Principales

### Core
- `react`: ^19.1.1
- `react-dom`: ^19.1.1
- `react-router-dom`: ^7.9.5
- `typescript`: ~5.9.3

### Estado y Datos
- `@tanstack/react-query`: ^5.90.6
- `zustand`: ^5.0.7

### UI
- `tailwindcss`: ^4.1.12
- `framer-motion`: ^12.23.12
- `lucide-react`: ^0.553.0
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^3.3.1

### Formularios
- `react-hook-form`: ^7.62.0

### Utilidades
- `html2canvas`: ^1.4.1
- `jspdf`: ^3.0.3
- `qrcode`: ^1.5.4
- `canvas-confetti`: ^1.9.4
- `socket.io-client`: ^4.8.1

### Build
- `vite`: ^7.1.7
- `@vitejs/plugin-react`: ^5.0.4
- `@tailwindcss/vite`: ^4.1.12

---

## 🚀 Scripts Disponibles

```json
{
  "dev": "vite",              // Desarrollo en puerto 5173
  "build": "tsc -b && vite build",  // Build de producción
  "lint": "eslint .",         // Linter
  "preview": "vite preview"    // Preview del build
}
```

### Build Output
- Directorio: `./server/bin/web`
- Configurado en `vite.config.ts`

---

## 🔄 Flujos de Datos

### Compra de Tickets
1. Usuario selecciona tickets → Estado local
2. Usuario completa datos → `useParticipant` (localStorage)
3. Usuario completa pago → Solicita OTP
4. Usuario verifica OTP → Procesa débito
5. Polling de estado → Si exitoso, guarda en `usePurchases`
6. Muestra vista de éxito

### Verificación de Tickets
1. Usuario ingresa cédula → `verifyRaffle()`
2. Backend retorna tickets comprados
3. Si hay premios → Obtiene detalles de premios
4. Si rifa finalizada sin premios → Obtiene números ganadores
5. Muestra resultado según estado

---

## 🎨 Patrones de Diseño

### Componentes
- **Composición**: Componentes pequeños y reutilizables
- **Props Drilling**: Evitado con hooks y contextos
- **Controlled Components**: Inputs controlados por estado

### Estado
- **Server State**: React Query
- **Client State**: useState, localStorage
- **Form State**: React Hook Form (en algunos formularios)

### Estilos
- **Utility First**: Tailwind CSS
- **CSS Variables**: Para temas y colores dinámicos
- **Responsive**: Mobile-first approach

---

## 📝 Notas Importantes

1. **Tema Forzado**: El tema siempre es oscuro, no se puede cambiar
2. **Color Dinámico**: El color seleccionado se puede cambiar y persiste
3. **Expiración de Compras**: Las compras expiran después de 7 días
4. **Polling de Pagos**: Máximo 20 segundos, incremento de 350ms
5. **Validación Estricta**: Validaciones muy específicas para formularios
6. **Persistencia**: Datos del usuario y compras se guardan en localStorage
7. **React Compiler**: Habilitado en Vite config

---

## 🔍 Puntos de Extensión

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

---

## 🐛 Manejo de Errores

- Todos los servicios manejan errores del backend
- Mensajes de error descriptivos
- Estados de error en componentes
- Validación de formularios con feedback visual
- Modales de error con animaciones

---

## 📊 Performance

- **React Query**: Cache y stale time para optimizar requests
- **Code Splitting**: Vite lo maneja automáticamente
- **Lazy Loading**: Posible con React.lazy (no implementado actualmente)
- **Memoization**: useMemo y useCallback donde es necesario

---

Este documento contiene toda la información relevante del frontend para futuras referencias y desarrollo.

