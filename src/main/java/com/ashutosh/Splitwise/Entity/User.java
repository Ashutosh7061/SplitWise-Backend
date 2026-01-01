package com.ashutosh.Splitwise.Entity;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Enumerated(EnumType.STRING)
    private PaymentMethod preferredPaymentMethod;

    private String email;

//    @ManyToOne
//    @JoinColumn(name = "group_id")
//    private Group group;


}
