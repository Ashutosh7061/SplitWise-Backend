package com.ashutosh.Splitwise.Entity;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SettlementData {
    private String from;
    private String to;
    private double amount;


}
