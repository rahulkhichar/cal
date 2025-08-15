# Calendar Booking System API

A comprehensive calendar booking system similar to cal.com, built with NestJS, TypeScript, and TypeORM. This system allows Calendar Owners to set up their availability and enables Invitees to book appointments through RESTful APIs.

## 🚀 Features

- **Calendar Owner Management**: Create and manage calendar owner accounts
- **Availability Rules**: Set up flexible availability schedules with day-of-week rules
- **Time Slot Search**: Find available time slots for any given date
- **Appointment Booking**: Book appointments with conflict prevention
- **Appointment Management**: View, cancel, and manage appointments
- **Comprehensive Testing**: Full test coverage with unit and integration tests

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: TypeORM with MySQL
- **Testing**: Jest with comprehensive test coverage
- **Validation**: class-validator for DTO validation
- **Documentation**: OpenAPI/Swagger ready

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cal
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=calendar_booking
DATABASE_SYNCHRONIZE=true
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:3000`

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
For this implementation, authentication is assumed to be handled externally. All endpoints work with the assumption that the Calendar Owner is already authenticated.

### 1. Calendar Owners

#### Create Calendar Owner
```http
POST /calendar-owners
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "timezone": "UTC"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "timezone": "UTC",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### Get All Calendar Owners
```http
GET /calendar-owners
```

#### Get Calendar Owner by ID
```http
GET /calendar-owners/{id}
```

#### Get Upcoming Appointments
```http
GET /calendar-owners/{id}/upcoming-appointments
```

### 2. Availability Rules

#### Create Availability Rule
```http
POST /calendar-owners/{calendarOwnerId}/availability-rules
Content-Type: application/json

{
  "dayOfWeek": 1,
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "isActive": true
}
```

**Day of Week Values:**
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday
- 7 = Sunday

#### Get All Availability Rules
```http
GET /calendar-owners/{calendarOwnerId}/availability-rules
```

#### Get Specific Availability Rule
```http
GET /calendar-owners/{calendarOwnerId}/availability-rules/{ruleId}
```

#### Update Availability Rule
```http
PATCH /calendar-owners/{calendarOwnerId}/availability-rules/{ruleId}
Content-Type: application/json

{
  "startTime": "10:00:00",
  "endTime": "18:00:00"
}
```

#### Delete Availability Rule
```http
DELETE /calendar-owners/{calendarOwnerId}/availability-rules/{ruleId}
```

### 3. Appointments

#### Search Available Time Slots
```http
POST /appointments/search-available-slots
Content-Type: application/json

{
  "date": "2024-01-15",
  "calendarOwnerId": "uuid"
}
```

**Response:**
```json
[
  {
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "available": true
  },
  {
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "available": false
  }
]
```

#### Book Appointment
```http
POST /appointments/{calendarOwnerId}/book
Content-Type: application/json

{
  "inviteeName": "Jane Smith",
  "inviteeEmail": "jane@example.com",
  "startTime": "2024-01-15T10:00:00Z",
  "notes": "Meeting to discuss project requirements"
}
```

**Response:**
```json
{
  "id": "uuid",
  "calendarOwnerId": "uuid",
  "inviteeName": "Jane Smith",
  "inviteeEmail": "jane@example.com",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "notes": "Meeting to discuss project requirements",
  "status": "confirmed",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T09:00:00Z"
}
```

#### Get Appointment
```http
GET /appointments/{id}
```

#### Cancel Appointment
```http
PATCH /appointments/{id}/cancel
```

## 🏗️ Architecture

### Project Structure
```
src/
├── appointments/
│   ├── controller/
│   │   ├── appointments.controller.ts
│   │   └── appointments.controller.spec.ts
│   ├── dto/
│   │   ├── create-appointment.dto.ts
│   │   └── search-available-slots.dto.ts
│   ├── entities/
│   │   └── appointment.entity.ts
│   ├── service/
│   │   └── appointments.service.ts
│   ├── appointments.service.spec.ts
│   └── appointments.module.ts
├── availability-rules/
│   ├── controller/
│   │   ├── availability-rules.controller.ts
│   │   └── availability-rules.controller.spec.ts
│   ├── dto/
│   │   ├── create-availability-rule.dto.ts
│   │   └── update-availability-rule.dto.ts
│   ├── entities/
│   │   └── availability-rule.entity.ts
│   ├── service/
│   │   └── availability-rules.service.ts
│   ├── availability-rules.service.spec.ts
│   └── availability-rules.module.ts
├── calendar-owners/
│   ├── controller/
│   │   └── calendar-owners.controller.ts
│   ├── dto/
│   │   └── create-calendar-owner.dto.ts
│   ├── entities/
│   │   └── calendar-owner.entity.ts
│   ├── service/
│   │   └── calendar-owners.service.ts
│   ├── calendar-owners.service.spec.ts
│   └── calendar-owners.module.ts
└── config/
    └── database.config.ts
```

### Design Patterns

1. **Repository Pattern**: Used with TypeORM for data access
2. **Service Layer Pattern**: Business logic separation
3. **DTO Pattern**: Data transfer objects for API contracts
4. **Entity Pattern**: Domain models with TypeORM decorators
5. **Module Pattern**: NestJS module organization

## 🧪 Testing

### Test Coverage
- **Unit Tests**: 79 tests covering all service methods
- **Controller Tests**: API endpoint testing
- **Entity Tests**: Data validation testing
- **DTO Tests**: Input validation testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --testPathPattern="appointments"

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Service Tests**: Mock repository dependencies and test business logic
- **Controller Tests**: Mock service dependencies and test HTTP responses
- **Entity Tests**: Test data validation and constraints
- **Integration Tests**: Test complete workflows

## 🔧 Configuration

### Database Configuration
The system uses TypeORM with configurable database settings:

```typescript
// src/config/database.config.ts
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
};
```

### Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=calendar_booking
DATABASE_SYNCHRONIZE=true
PORT=3000
NODE_ENV=development
```

## 📝 Assumptions and Design Decisions

### Assumptions
1. **Authentication**: Calendar Owner authentication is handled externally
2. **Time Zones**: All times are stored in UTC, timezone conversion handled by client
3. **Appointment Duration**: Fixed 60-minute duration for all appointments
4. **Time Slots**: 60-minute intervals starting at the hour
5. **Conflict Prevention**: System prevents double-booking automatically

### Design Decisions
1. **RESTful API**: Standard REST conventions for all endpoints
2. **Validation**: Input validation using class-validator decorators
3. **Error Handling**: Consistent error responses with appropriate HTTP status codes
5. **Testing**: Comprehensive test coverage with Jest




