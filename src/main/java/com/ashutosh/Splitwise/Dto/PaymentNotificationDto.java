package com.ashutosh.Splitwise.Dto;

import java.time.LocalDateTime;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Enum.SettlementStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotificationDto {

    private Long id;
    private Long settlementId;
    private Long receiverId;
    private Long payerId;

    private String payerName;
    private double amount;
    private String transactionId;

    private PaymentMethod paymentMethod;
    private SettlementStatus status;

    private boolean isRead;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
}
