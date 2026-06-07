package com.ashutosh.Splitwise.Dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserExpenseSummaryDto {

    private String userName;
    private double totalPaid;
    private double netBalance;
    private double totalOwes;

}
