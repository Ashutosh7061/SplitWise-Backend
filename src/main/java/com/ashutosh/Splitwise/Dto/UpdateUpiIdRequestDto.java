package com.ashutosh.Splitwise.Dto;

import lombok.Getter;

@Getter
public class UpdateUpiIdRequestDto {

    private String userEmailId;
    private String oldUpiId;
    private String newUpiId;

}
