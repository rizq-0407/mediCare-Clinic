# MediCare Clinic Management System

MediCare is a comprehensive, full-stack clinic management system designed to streamline healthcare operations through specialized dashboards, role-based access control, and AI-driven patient interactions.

## 🚀 Features

### 👤 Specialized Dashboards
*   **Patient Portal**: Book appointments, view prescriptions, access medical records (EMR), manage billing, and provide feedback.
*   **Doctor Dashboard**: Manage clinical schedules, create patient prescriptions, and review medical histories.
*   **Pharmacy Module**: Real-time inventory management (medicines) and prescription dispensing workflow.
*   **Staff Portal**: Appointment approval, EMR registration, and patient directory management.
*   **Admin Dashboard**: System-wide oversight, personnel registration, support ticket management, and analytics.

### 🤖 AI Integration
*   **AI Medical Assistant**: Powered by Google Gemini, the integrated agent helps patients book appointments via natural language and provides preliminary medical consultations.
*   **Automated Scheduling**: The AI agent identifies available slots and creates pending appointments for staff approval.

### 💳 Secure Billing
*   **Stripe Integration**: Secure payment gateway for patient billing and receipt management.

---

## 🛠 Tech Stack

### Backend
*   **Framework**: Spring Boot 3.x (Java 17)
*   **Security**: Spring Security with JWT (JSON Web Tokens)
*   **Database**: MySQL / H2 (via Spring Data JPA)
*   **Build Tool**: Maven

### Frontend
*   **Framework**: React 19 + Vite
*   **Styling**: Vanilla CSS (Modern Design System)
*   **Routing**: React Router 7
*   **API Client**: Axios

---

## ⚙️ Getting Started

### Prerequisites
*   Java 17 or higher
*   Node.js & npm
*   Maven

### 1. Backend Setup
1.  Navigate to the root directory.
2.  Configure database settings in `src/main/resources/application.properties`.
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
    *The server will start on `http://localhost:8080`.*

### 2. Frontend Setup
1.  Navigate to `medicare-clinic-frontend/`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    *The application will be available at `http://localhost:5173`.*

---

## 🔐 Default Credentials

The system comes with a `DatabaseSeeder` that automatically populates initial accounts for testing. All default accounts use the password: `password123`.

| Role | Username | User ID |
| :--- | :--- | :--- |
| **Admin** | `admin` | `ADM001` |
| **Doctor** | `drjames` | `DOC001` |
| **Pharmacy** | `pharma_one` | `PHM001` |
| **Staff** | `staff_one` | `STF001` |
| **Patient** | `johndoe` | `PAT001` |

---

## 📜 Project Structure

```text
clinic/
├── src/main/java/com/medicare/clinic/
│   ├── config/          # Security, JWT, and Seeder configurations
│   ├── controller/      # REST Endpoints
│   ├── model/           # JPA Entities
│   ├── repository/      # Database Access Layers
│   └── service/         # Business Logic
├── medicare-clinic-frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard and Landing pages
│   │   ├── services/    # API and Agent integration
│   │   └── App.jsx      # Root routing
└── pom.xml              # Maven configuration
```

---

## 📄 License
This project is developed for educational purposes as part of the AI-ML Project (Y2 S2).
