# ExpenseEase

ExpenseEase is a Splitwise-like expense sharing backend built using Spring Boot.  
It helps users manage shared expenses, calculate balances, and generate simplified settlement instructions showing who owes whom and how much.

---

## 🚀 Features

- Add shared expenses in a group
- Support for multiple split types:
  - Equal split
  - Exact amount split
  - Percentage split
- Accurate net balance calculation per user
- Simplified settlement logic (minimum number of transactions)
- RESTful APIs built using Spring Boot
- MySQL database for persistent storage

---

## 🛠 Tech Stack

- Java
- Spring Boot
- Spring Data JPA
- MySQL
- Maven

---

## 📂 Project Structure
```text
com.ashutosh.Splitwise
│
├── Controller
│   └── ExpenseController.java
│
├── Service
│   └── ExpenseService.java
│
├── Repository
│   └── ExpenseRepository.java
│
├── Entity
│   ├── Expense.java
│   └── SettlementData.java
│
└── SplitwiseApplication.java
```


---

## ⚙️ How the Application Works

1. Expenses are added with details such as amount, payer, and split type.
2. All expenses are processed together to calculate a net balance for each user.
3. Net balances are simplified to generate settlement instructions.
4. The final output clearly shows who should pay whom and how much.

---

## 🔄 Supported Split Types

### Equal Split
The total expense amount is divided equally among all users involved.

### Exact Split
Each user pays a fixed amount specified in the expense.

### Percentage Split
Each user pays a percentage of the total expense amount.

---

## 🧮 Settlement Logic

- Users with negative balance owe money (debtors)
- Users with positive balance receive money (creditors)
- The system matches debtors with creditors to minimize the number of transactions

This logical settlement fulfills the requirement of **“settle dues”** as per the assignment.

---




