# SplitWise 💸

SplitWise is a simple expense sharing backend application built using Spring Boot.  
It helps users manage group expenses, calculate individual balances, and generate optimized settlement instructions that clearly show who owes whom and how much, while minimizing the number of transactions.

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

## 📌 Conclusion

ExpenseEase is a production-style backend project that demonstrates:
- Real-world business logic
- Clean Spring Boot architecture
- Strong problem-solving skills

This project is well-suited for fresher backend interviews and showcases practical experience with Spring Boot.


