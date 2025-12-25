package com.ashutosh.Splitwise.Dto;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
//@NoArgsConstructor
public class PaySettlementRequest {

    private PaymentMethod paymentMethod;

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }



}
