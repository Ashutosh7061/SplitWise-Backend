package com.ashutosh.Splitwise.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
@Setter
public class PersonalExpenseResponseDto {

    private String description;
    private double amount;
    private String category;

    @JsonFormat(pattern = "dd-MM-yyyy HH-mm-ss")
    private LocalDateTime createdAt;

}
