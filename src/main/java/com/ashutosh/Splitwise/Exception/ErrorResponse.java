package com.ashutosh.Splitwise.Exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ErrorResponse {
    private String message;
    private int statusCode;
    private LocalDateTime currTimeStamp;

}
