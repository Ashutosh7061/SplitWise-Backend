package com.ashutosh.Splitwise.Entity;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import jakarta.persistence.*;
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

    private String status;

    private Long groupId;


}
