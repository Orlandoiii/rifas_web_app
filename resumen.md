# Resumen del Proyecto Frontend - Rifas Web App

## 📋 Descripción General

Aplicación web frontend para gestión y participación en rifas/sorteos. Permite a los usuarios visualizar rifas disponibles, comprar tickets, realizar pagos mediante débito bancario (integración con SyPago), verificar números ganadores y gestionar sus compras.

## 🛠️ Stack Tecnológico

### Framework y Librerías Principales
- **React 19.1.1** - Framework principal
- **TypeScript 5.9.3** - Tipado estático
- **Vite 7.1.7** - Build tool y dev server
- **React Router DOM 7.9.5** - Enrutamiento
- **TanStack Query (React Query) 5.90.6** - Gestión de estado del servidor y caché
- **Zustand 5.0.7** - Gestión de estado local
- **React Hook Form 7.62.0** - Manejo de formularios
- **Framer Motion 12.23.12** - Animaciones
- **Tailwind CSS 4.1.12** - Estilos y diseño

### Librerías Adicionales
- **html2canvas 1.4.1** - Captura de pantalla para comprobantes
- **jspdf 3.0.3** - Generación de PDFs
- **qrcode 1.5.4** - Generación de códigos QR
- **canvas-confetti 1.9.4** - Efectos de confeti
- **socket.io-client 4.8.1** - Comunicación en tiempo real (preparado)
- **lucide-react 0.553.0** - Iconos
- **class-variance-authority** - Variantes de componentes
- **clsx & tailwind-merge** - Utilidades CSS

### React Compiler
- **babel-plugin-react-compiler** - Optimización automática de componentes React

## 📁 Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── lib/            # Librería de componentes base
│   │   └── components/
│   │       ├── button/         # Botones
│   │       ├── data_grid/      # Tablas de datos
│   │       ├── input/          # Inputs con máscaras y validación
│   │       ├── loader/         # Indicadores de carga
│   │       ├── modal/          # Modales y backdrop
│   │       ├── select/         # Selectores y búsqueda
│   │       ├── stepper/        # Componente de pasos (wizard)
│   │       └── theme/          # Proveedor de temas
│   └── site/          # Componentes específicos del sitio
│       ├── payments/           # Componentes de pago
│       │   ├── SypagoDebit.tsx
│       │   └── OTPVerification.tsx
│       ├── NavBar.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx
│       ├── RafflesCarousel.tsx
│       ├── RaffleDetailModal.tsx
│       ├── TicketSelectionForm.tsx
│       ├── UserDataForm.tsx
│       ├── PurchaseCard.tsx
│       ├── PurchaseSuccessView.tsx
│       ├── VerifyRaffleForm.tsx
│       ├── VerifyRaffleDetails.tsx
│       ├── VerifyResultWithPrizes.tsx
│       ├── VerifyResultModals.tsx
│       └── PrizeWinnerModal.tsx
├── pages/              # Páginas principales
│   ├── Landing.tsx     # Página principal con rifas
│   ├── MyPurchases.tsx # Historial de compras
│   └── VerifyRaffle.tsx # Verificación de números
├── services/           # Servicios de API
│   ├── raffles.ts     # Servicio de rifas
│   ├── payments.ts    # Servicio de pagos (SyPago)
│   └── prizes.ts      # Servicio de premios
├── hooks/              # Custom hooks
│   ├── useRaffles.ts
│   ├── usePurchases.ts
│   ├── usePayments.ts
│   ├── useParticipant.ts
│   └── useVerifyRaffle.ts
├── types/              # Definiciones TypeScript
│   ├── raffles.ts
│   ├── payments.ts
│   └── prizes.ts
├── utils/              # Utilidades
│   ├── raffles.ts
│   └── raffleTickets.ts
├── config/             # Configuración
│   └── api.ts         # Endpoints de API
├── lib/                # Configuración de librerías
│   └── queryClient.ts  # Configuración de React Query
├── assets/             # Recursos estáticos
├── mocks/              # Datos mock (si aplica)
├── App.tsx             # Componente raíz con rutas
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🎯 Funcionalidades Principales

### 1. Visualización de Rifas
- **Landing Page**: Muestra rifas disponibles con carrusel
- **Rifa Principal**: Destaca la rifa marcada como `isMain`
- **Detalles de Rifa**: Modal con información completa, galería y términos

### 2. Compra de Tickets
Flujo completo de compra en 4 pasos (Stepper):

#### Paso 1: Selección de Números
- Visualización de tickets disponibles/vendidos/reservados
- Selección múltiple de tickets
- Paginación (50 tickets por página)
- Búsqueda por número específico
- Selección aleatoria (x1 o x5)
- Indicadores visuales:
  - Disponible: fondo gris, clickeable
  - Vendido: fondo gris claro, deshabilitado
  - Reservado: fondo terciario, deshabilitado
  - Seleccionado: fondo destacado con anillo

#### Paso 2: Datos del Usuario
- Formulario con validaciones estrictas:
  - **Cédula**: Solo números, 6-10 dígitos
  - **Nombre**: Solo letras, máximo un espacio
  - **Teléfono**: Regex específico para operadoras venezolanas (Movistar, Movilnet, Digitel)
  - **Email**: Formato válido
- Persistencia en localStorage
- Opción de limpiar datos guardados

#### Paso 3: Información de Pago
- Selección de banco (desde API)
- Tipo de documento (V/E/J/P)
- Número de documento
- Número de teléfono (cuenta bancaria)
- Validaciones en tiempo real

#### Paso 4: Verificación OTP
- Solicitud automática de OTP al avanzar al paso 3
- Countdown de 26 segundos para reenvío
- Verificación y procesamiento de débito
- Polling del estado de transacción:
  - Primer intento: 750ms
  - Incremento: +350ms por intento
  - Timeout: 20 segundos
  - Estados: PROC, PEND, AC00, ACCP (aceptado), RJCT (rechazado)

### 3. Gestión de Compras
- **Historial Local**: Almacenamiento en localStorage
- **Expiración**: Las compras expiran después de 7 días
- **Vista de Detalle**: Modal con información completa de compra
- **Estadísticas**: Total de compras, tickets y monto
- **Comprobante**: Generación de PDF con QR

### 4. Verificación de Números
- **Búsqueda por Cédula**: Verifica tickets comprados
- **Estados de Resultado**:
  1. **Sin tickets**: No tiene tickets comprados
  2. **Tickets sin premios (activa)**: Tiene tickets pero la rifa aún no termina
  3. **Tickets sin premios (finalizada)**: Tiene tickets pero no ganó, muestra números ganadores
  4. **Tickets con premios**: Muestra tickets ganadores (principal o bless)
- **Visualización de Premios**: Modal con detalles del premio ganado
- **Números Bless**: Premios adicionales por número específico

### 5. Integración de Pagos (SyPago)
- **Reserva de Tickets**: Reserva automática antes del pago
- **Booking ID**: Identificador único de reserva
- **Request OTP**: Solicitud de código OTP
- **Process Debit**: Procesamiento del débito
- **Transaction Status**: Consulta del estado con polling
- **Manejo de Errores**: Mensajes descriptivos según el estado

## 🔄 Flujo de Datos

### Estado Global
- **React Query**: Cache de datos del servidor (rifas, tickets vendidos, bancos)
- **Zustand**: Estado local (modal de carga, tema)
- **localStorage**: Compras del usuario, datos del participante

### Comunicación con API
- Base URL configurable: `VITE_API_BASE_URL` o `/api/v1`
- Endpoints principales:
  - `GET /raffles` - Lista de rifas
  - `GET /raffles/:id/tickets/sold` - Tickets vendidos
  - `POST /raffles/participant` - Crear participante (reservar tickets)
  - `POST /raffles/verify` - Verificar tickets por cédula
  - `GET /raffles/:id/winners/main` - Números ganadores principales
  - `GET /raffles/:id/winners/bless` - Números ganadores bless
  - `GET /raffles/:id/prizes/:ticketId` - Premio por ticket
  - `GET /sypago/banks` - Lista de bancos
  - `POST /sypago/debit/request-otp` - Solicitar OTP
  - `POST /sypago/debit/transaction-otp` - Procesar débito
  - `GET /sypago/debit/transaction/status` - Estado de transacción

## 🎨 Sistema de Diseño

### Tema
- **Tema Oscuro por Defecto**: Configurado en `ThemeProvider`
- **Colores Principales**:
  - `binance-main` / `binance-dark`: Color principal (amarillo/dorado)
  - `mint-main` / `mint-dark`: Color secundario (verde menta)
  - `selected`: Color de selección
  - `bg-primary`, `bg-secondary`, `bg-tertiary`: Fondos
  - `text-primary`, `text-secondary`, `text-muted`: Textos
  - `border-light`: Bordes

### Componentes Reutilizables
- **Button**: Variantes (default, secondary, outline, ghost), tamaños
- **Input**: Con máscaras, validación, tooltips, labels
- **Select**: Con búsqueda integrada
- **Modal**: Con backdrop, tamaños configurables, bloqueo de scroll
- **Stepper**: Wizard de pasos con validación
- **Loader**: Indicadores de carga con tamaños
- **DataGrid**: Tablas con TanStack Table

## 🔐 Validaciones

### Formularios
- **Cédula**: Regex numérico, 6-10 dígitos
- **Nombre**: Solo letras y espacios, máximo un espacio
- **Teléfono**: Regex específico para operadoras venezolanas
- **Email**: Formato estándar de email
- **Documento Bancario**: Según tipo (V/E: 6-10, J: 8-12)
- **Teléfono Bancario**: Mismo formato que teléfono personal

### Validación en Tiempo Real
- Validación al tocar campos (`touched`)
- Mensajes de error contextuales
- Deshabilitación de botones hasta validación completa

## 📱 Responsive Design

- **Mobile First**: Diseño adaptativo
- **Breakpoints**: sm, md, lg
- **Grids Adaptativos**: Columnas según tamaño de pantalla
- **Navegación**: Adaptada para móviles

## 🚀 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo (puerto 5173)
npm run build    # Build de producción (output: ./server/bin/web)
npm run preview  # Preview del build
npm run lint     # Linter
```

## 🔧 Configuración

### Vite
- **Output**: `./server/bin/web` (integración con backend Go)
- **Host**: `0.0.0.0` (accesible desde red local)
- **Port**: 5173
- **React Compiler**: Habilitado

### React Query
- **Stale Time**: 5 minutos por defecto
- **GC Time**: 10 minutos
- **Retry**: 2 intentos
- **Refetch on Focus**: Deshabilitado

### TypeScript
- Configuración estricta
- Proyectos separados: `tsconfig.app.json`, `tsconfig.node.json`

## 📦 Almacenamiento Local

### localStorage Keys
- `raffle_purchases`: Compras del usuario (con timestamps para expiración)
- Datos del participante (gestión interna)

### Eventos Personalizados
- `purchases_updated`: Disparado cuando se actualizan las compras

## 🎭 Características Especiales

1. **Reserva de Tickets**: Los tickets se reservan antes del pago para evitar conflictos
2. **Polling Inteligente**: Consulta del estado de pago con delays incrementales
3. **Persistencia de Datos**: Los datos del usuario se guardan para futuras compras
4. **Expiración Automática**: Limpieza de compras antiguas (7 días)
5. **Generación de Comprobantes**: PDF con QR para descargar
6. **Verificación Completa**: Múltiples escenarios de verificación según estado de la rifa
7. **Premios Bless**: Sistema de premios adicionales por número específico

## 🔄 Flujo de Compra Completo

1. Usuario selecciona rifa → Abre modal de detalle
2. Selecciona números → Validación de disponibilidad
3. Ingresa datos personales → Validación y guardado
4. Sistema reserva tickets → Obtiene `bookingId`
5. Usuario ingresa datos bancarios → Validación
6. Sistema solicita OTP → Countdown de 26s
7. Usuario ingresa OTP → Procesa débito
8. Sistema hace polling → Consulta estado cada X ms
9. Si aceptado → Guarda compra, muestra éxito, genera PDF
10. Si rechazado → Muestra error, mantiene reserva

## 🐛 Manejo de Errores

- **Errores de API**: Mensajes descriptivos desde el backend
- **Validación de Formularios**: Mensajes contextuales por campo
- **Timeouts**: Manejo especial para transacciones que exceden tiempo
- **Estados de Carga**: Indicadores visuales durante operaciones asíncronas
- **Fallbacks**: Estados vacíos y mensajes informativos

## 📊 Estado de la Aplicación

### Hooks Principales
- `useRaffles`: Gestión de rifas y cache
- `useRaffleDetail`: Detalle completo con tickets
- `usePurchases`: Gestión de compras locales
- `useParticipant`: Datos del usuario
- `useBanks`: Lista de bancos
- `useVerifyRaffle`: Lógica de verificación

### Servicios
- `rafflesService`: Operaciones CRUD de rifas
- `paymentsService`: Integración con SyPago
- `prizesService`: Consulta de premios

## 🎯 Puntos Clave de la Arquitectura

1. **Separación de Responsabilidades**: Servicios, hooks, componentes claramente separados
2. **Type Safety**: TypeScript estricto en toda la aplicación
3. **Cache Inteligente**: React Query para optimización de requests
4. **Componentes Reutilizables**: Librería interna de componentes base
5. **Validación Robusta**: Múltiples capas de validación
6. **UX Optimizada**: Feedback visual constante, estados de carga, animaciones
7. **Persistencia Local**: Datos del usuario y compras en localStorage
8. **Integración Backend**: Preparado para servidor Go en `/server`

## 📝 Notas Adicionales

- El proyecto está configurado para integrarse con un backend Go
- El build se genera en `./server/bin/web` para servir desde el backend
- Configuración CORS en `config.json` para desarrollo local
- Mock config habilitado para testing sin backend real
- Preparado para WebSockets (socket.io-client instalado)

