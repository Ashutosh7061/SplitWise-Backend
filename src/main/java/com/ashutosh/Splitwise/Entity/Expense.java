package com.ashutosh.Splitwise.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String description;
    private double amount;
    private long paidByUserId;
    private long groupId;

    private String splitType;

    @Column(length = 1000)
    private String splitDetails;
}
