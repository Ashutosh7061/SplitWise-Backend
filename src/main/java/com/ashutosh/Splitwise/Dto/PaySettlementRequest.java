package com.ashutosh.Splitwise.Dto;

import com.ashutosh.Splitwise.Enum.PaymentMethod;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class PaySettlementRequest {

    private PaymentMethod paymentMethod;
    private String transactionId;

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}
