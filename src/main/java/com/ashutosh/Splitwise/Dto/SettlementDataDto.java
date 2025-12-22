package com.ashutosh.Splitwise.Dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor

public class SettlementDataDto {
    private String from;
    private String to;
    private double amount;

}
