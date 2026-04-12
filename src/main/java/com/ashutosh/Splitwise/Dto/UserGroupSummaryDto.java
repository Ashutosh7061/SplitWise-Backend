package com.ashutosh.Splitwise.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserGroupSummaryDto {

    private Long groupId;
    private String groupName;

    private String userName;

    private double totalPaid;
    private double totalOwes;
    private double netBalance;
}
