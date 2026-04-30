package com.ashutosh.Splitwise.Dto;

import lombok.Getter;

@Getter
public class ResetPasswordRequestDto {

    private String email;
    private String otp;
    private String newPassword;
}
