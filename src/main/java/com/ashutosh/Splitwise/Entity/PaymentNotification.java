package com.ashutosh.Splitwise.Entity;

import java.time.LocalDateTime;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Enum.SettlementStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long settlementId;
    private Long receiverId;
    private Long payerId;

    private String payerName;
    private double amount;
    private String transactionId;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private SettlementStatus status;

    @jakarta.persistence.Column(name = "is_read")
    private boolean isRead = false;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
