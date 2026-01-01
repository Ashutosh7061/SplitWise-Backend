package com.ashutosh.Splitwise.Dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class SettlementSummaryDto {

    private int totalSettlements;
    private int paidSettlements;
    private int unpaidSettlements;


}
