package com.ashutosh.Splitwise.Dto;

import lombok.Getter;

@Getter
public class UpdatePasswordRequestDto {

    private String userEmailId;
    private String oldPassword;
    private String newPassword;

}
