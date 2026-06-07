package com.ashutosh.Splitwise.Dto;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import com.ashutosh.Splitwise.Enum.SettlementStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@AllArgsConstructor
@Getter
@Setter
public class SettlementDto {

    private Long settlementId;
    private String from;
    private String to;
    private double amount;
    private SettlementStatus status;
    private PaymentMethod receiverPreferredMethod;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

}
