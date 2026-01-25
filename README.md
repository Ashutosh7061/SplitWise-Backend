# SplitWise 💸

Welcome to **SplitWise-Backend**, a Java-based application designed to manage and split expenses among groups of individuals with ease and efficiency.

---

## 📖 Project Overview

**SplitWise-Backend** is the server-side implementation for an expense-sharing platform. The application allows users to:
- Manage expenses within groups.
- Track outstanding balances between individuals.
- Simplify the process of settling debts.

This backend service handles the core functionality of the system, including data persistence, business logic, and exposing APIs for client-side interaction.

---

## 🚀 Features

- Create and manage users and groups
- Add shared expenses within a group
- Support for multiple split types:
  - Equal Split
  - Exact Amount Split
  - Percentage Split
- Accurate net balance calculation per user
- Optimized settlement logic to minimize transactions
- Settlement payment tracking with status and payment method
- Group-wise and user-wise expense summaries
- Email notifications for settlements and reminders
- RESTful APIs built using Spring Boot
- MySQL database for persistent storage

---

## 🛠 Tech Stack

- Language: Java
- Framework: Spring Boot
- ORM: Spring Data JPA (Hibernate)
- Database: MySQL
- Build Tool: Maven
- Tools: Git, GitHub, Postman
- Email: JavaMailSender (SMTP)

---


## ⚙️ Installation Instructions

Before setting up the project locally, ensure that you have the following installed on your system:
- Java 8 or higher
- Apache Maven / Gradle
- Database server (Optional: MySQL/PostgreSQL)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ashutosh7061/SplitWise-Backend.git
   cd SplitWise-Backend
   ```

2. **Configure Database**:
  - Update the `application.properties` or `application.yml` file under `/src/main/resources` with your database credentials.

3. **Build Project**:
  - Using Maven:
    ```bash
    mvn clean package
    ```
  - Using Gradle:
    ```bash
    ./gradlew build
    ```

4. **Run the Application**:
   ```bash
   java -jar target/<application-jar>.jar
   ```

5. **Access APIs**:
  - The backend APIs will be accessible at `http://localhost:8080` by default.

---




## 📂 Project Structure
```text
src/main/java/com/ashutosh/Splitwise
│
├── Controller
│   ├── ExpenseController.java
│   ├── GroupController.java
│   ├── GroupSummaryController.java
│   ├── SettlementController.java
│   ├── NotificationController.java
│   └── UserController.java
│
├── Service
│   ├── ExpenseService.java
│   ├── SettlementService.java
│   ├── GroupSummaryService.java
│   ├── NotificationService.java
│   └── EmailService.java
│
├── Repository
│   ├── ExpenseRepository.java
│   ├── GroupRepository.java
│   ├── SettlementRepository.java
│   └── UserRepository.java
│
├── Entity
│   ├── Expense.java
│   ├── Group.java
│   ├── Settlement.java
│   ├── SettlementData.java
│   └── User.java
│
├── Dto
│   ├── GroupSummaryDto.java
│   ├── UserExpenseSummaryDto.java
│   ├── SettlementDto.java
│   ├── SettlementDataDto.java
│   ├── SettlementSummaryDto.java
│   └── PaySettlementRequest.java
│
├── Enum
│   └── PaymentMethod.java
│
└── SplitwiseApplication.java

```


---

---

## ⚙️ How the Application Works

- Users and groups are created.
- Expenses are added with details such as amount, payer, group ID, and split type.
- Based on the split type (Equal, Exact, or Percentage), individual shares are calculated.
- All expenses are processed together to compute a net balance for each user.

Users with:
- Negative balance → Debtors
- Positive balance → Creditors

- The system generates simplified settlements by matching debtors with creditors to minimize transactions.
- Settlement records are stored with payment method, status, and timestamps.
- Users receive email notifications when settlements are created or updated.

---

## 🔄 Supported Split Types

### 🔹 Equal Split
The total expense amount is divided equally among all users involved.

### 🔹 Exact Split
Each user pays a fixed amount specified at the time of expense creation.

### 🔹 Percentage Split
Each user pays a defined percentage of the total expense amount.

---

## 🧮 Settlement Logic

- Net balances are calculated for all users
- Debtors are matched with creditors
- Transactions are minimized
- Settlement status and payment method are tracked

This fulfills the “Settle Dues” requirement of a real-world expense sharing system.

---

## 📬 Email Notifications

Email notifications are sent when:
- A settlement is generated
- A user needs to pay another user

Implemented using:
- JavaMailSender
- Spring `@Service`
- Constructor-based dependency injection

---

## 🎯 Key Design Highlights

- Layered architecture (Controller → Service → Repository)
- DTOs used to separate API models from entities
- Enums used for controlled values (PaymentMethod)
- Constructor injection for clean and testable code
- Timestamp-based tracking for settlements
- Interview-ready, real-world backend design

---

## 👥 Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit and push changes.
4. Open a Pull Request.

## 📞 Contact

- **Author**: [Ashutosh7061](https://github.com/Ashutosh7061)

If you have any questions, feel free to reach out!

---

## 📌 Conclusion

ExpenseEase is a production-style backend project that demonstrates:
- Real-world business logic
- Clean Spring Boot architecture
- Strong problem-solving skills

This project is well-suited for fresher backend interviews and showcases practical experience with Spring Boot.




