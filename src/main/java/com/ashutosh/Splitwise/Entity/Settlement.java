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
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fromUserId;
    private Long toUserId;
    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private SettlementStatus status;

    private Long groupId;
    
    private String transactionId;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

}
