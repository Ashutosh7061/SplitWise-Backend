package com.ashutosh.Splitwise.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyBudgetResponseDto {

    private double limit;
    private double spent;
    private double remaining;

    private String status;
}
