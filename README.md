# VotApp — Documentación Completa

## Stack Tecnológico

| Capa       | Tecnología               |
|------------|--------------------------|
| Frontend   | Angular 17+ (standalone) |
| Backend    | Spring Boot 3.2 + Java 17|
| Base datos | PostgreSQL 15+           |
| Auth       | JWT (jjwt 0.11)          |
| Seguridad  | Spring Security 6        |

---

## Arquitectura del Anonimato

El sistema usa **dos tablas separadas** para garantizar anonimato:

```
poll_options  (vote_count++)   ← Solo incrementa contador. SIN referencia al usuario.
vote_records  (user_id + poll_id) ← Solo registra QUE votó. SIN referencia a la opción.
```

**Lo que el admin PUEDE ver:**
- Quién ha participado en una votación (`vote_records`)
- Resultados totales por opción (`poll_options.vote_count`)

**Lo que el admin NO PUEDE ver (imposible por diseño):**
- Qué opción eligió cada usuario

---

## Modelo de Base de Datos

```sql
-- Usuarios
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url  VARCHAR(255),
    enabled     BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Grupos
CREATE TABLE groups (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    invite_code VARCHAR(20) UNIQUE,
    is_public   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Miembros del grupo con roles
CREATE TABLE group_members (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT REFERENCES users(id),
    group_id  BIGINT REFERENCES groups(id),
    role      VARCHAR(20) DEFAULT 'MEMBER', -- ADMIN | MEMBER
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- Votaciones
CREATE TABLE polls (
    id          BIGSERIAL PRIMARY KEY,
    question    VARCHAR(500) NOT NULL,
    description VARCHAR(1000),
    poll_type   VARCHAR(20) NOT NULL, -- SINGLE_CHOICE | MULTIPLE_CHOICE | YES_NO
    status      VARCHAR(20) DEFAULT 'OPEN', -- OPEN | CLOSED
    group_id    BIGINT REFERENCES groups(id),
    created_by  BIGINT REFERENCES users(id),
    ends_at     TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Opciones de la votación (con contador anónimo)
CREATE TABLE poll_options (
    id            BIGSERIAL PRIMARY KEY,
    poll_id       BIGINT REFERENCES polls(id),
    text          VARCHAR(300) NOT NULL,
    vote_count    INT DEFAULT 0,  -- ← Contador anónimo, sin usuario
    display_order INT
);

-- Registro de participación (SIN saber qué votó cada uno)
CREATE TABLE vote_records (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT REFERENCES users(id),
    poll_id  BIGINT REFERENCES polls(id),
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, poll_id)  -- Evita votar dos veces
);
```

---

## API REST — Endpoints

### Auth
```
POST /api/auth/register   { username, email, password, displayName }
POST /api/auth/login      { username, password }
GET  /api/auth/me         → UserDto
```

### Grupos
```
POST   /api/groups                            → Crear grupo (auth)
GET    /api/groups/my                         → Mis grupos
GET    /api/groups/public                     → Grupos públicos
GET    /api/groups/{id}                       → Detalle
POST   /api/groups/join/{inviteCode}          → Unirse con código
POST   /api/groups/{id}/join                  → Unirse a grupo público
DELETE /api/groups/{id}/leave                 → Salir
GET    /api/groups/{id}/members               → Miembros
PATCH  /api/groups/{id}/members/{uid}/role    → Cambiar rol (solo admin)
```

### Votaciones
```
POST  /api/groups/{groupId}/polls    → Crear votación (solo admin)
GET   /api/groups/{groupId}/polls    → Listar votaciones del grupo
GET   /api/polls/{pollId}            → Detalle de votación
POST  /api/polls/{pollId}/vote       → Votar { optionIds: [1] }
PATCH /api/polls/{pollId}/close      → Cerrar votación (solo admin)
GET   /api/polls/{pollId}/voters     → Ver quién votó (solo admin)
```

---

## Configuración y Arranque

### 1. PostgreSQL

```sql
CREATE DATABASE votapp;
CREATE USER votapp_user WITH PASSWORD 'votapp_pass';
GRANT ALL PRIVILEGES ON DATABASE votapp TO votapp_user;
```

### 2. Backend (Spring Boot)

```bash
cd backend
# Opcionalmente, configura variables de entorno:
export DB_USERNAME=votapp_user
export DB_PASSWORD=votapp_pass
export JWT_SECRET=tu_clave_secreta_muy_larga

mvn spring-boot:run
# El servidor arranca en http://localhost:8080
# Hibernate crea las tablas automáticamente (ddl-auto: update)
```

### 3. Frontend (Angular)

```bash
# Instalar Angular CLI si no lo tienes
npm install -g @angular/cli

cd frontend
npm install
ng serve
# La app arranca en http://localhost:4200
```

---

## Estructura del Proyecto

```
votapp/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/votapp/
│       ├── VotAppApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── GroupController.java
│       │   └── PollController.java
│       ├── dto/
│       │   └── AppDtos.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Group.java
│       │   ├── GroupMember.java
│       │   ├── Poll.java
│       │   ├── PollOption.java
│       │   └── VoteRecord.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── GroupRepository.java
│       │   ├── GroupMemberRepository.java
│       │   ├── PollRepository.java
│       │   ├── PollOptionRepository.java
│       │   └── VoteRecordRepository.java
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtAuthFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── service/
│           ├── AuthService.java
│           ├── GroupService.java
│           └── PollService.java
│
└── frontend/
    └── src/app/
        ├── app.component.ts       (Navbar)
        ├── app.routes.ts
        ├── app.config.ts
        ├── core/
        │   ├── models/models.ts
        │   ├── services/
        │   │   ├── auth.service.ts
        │   │   ├── group.service.ts
        │   │   └── poll.service.ts
        │   ├── interceptors/auth.interceptor.ts
        │   └── guards/auth.guard.ts
        └── features/
            ├── auth/
            │   ├── login/login.component.ts
            │   └── register/register.component.ts
            ├── dashboard/dashboard.component.ts
            ├── groups/
            │   ├── group-list/group-list.component.ts
            │   └── group-detail/group-detail.component.ts
            └── polls/
                └── poll-detail/poll-detail.component.ts
```

---

## Flujo de usuario típico

```
1. Usuario se registra/loguea → recibe JWT
2. Crea un grupo → obtiene código de invitación (8 chars)
3. Comparte el código → otros usuarios se unen
4. Admin crea votación (SINGLE, MULTIPLE o YES/NO)
5. Miembros votan → su voto incrementa el contador de la opción
   → Se registra solo que participaron (sin revelar qué votaron)
6. Admin puede ver resultados y lista de participantes
7. Admin puede cerrar la votación manualmente
```

---

## Variables de entorno (producción)

```env
DB_USERNAME=votapp_user
DB_PASSWORD=contraseña_segura
JWT_SECRET=clave_aleatoria_minimo_32_caracteres
```

---

## Próximas mejoras sugeridas

- **WebSockets** para resultados en tiempo real
- **Fecha de cierre automático** (tarea programada con `@Scheduled`)
- **Notificaciones por email** al crear votaciones
- **Paginación** en listas de votaciones
- **Docker Compose** para despliegue
- **Tests** con JUnit + Mockito (backend) y Jasmine (frontend)
