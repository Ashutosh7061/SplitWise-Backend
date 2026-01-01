package com.ashutosh.Splitwise.Dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class UserExpenseSummaryDto {

    private String userName;
    private double totalPaid;
    private double netBalance;

}
