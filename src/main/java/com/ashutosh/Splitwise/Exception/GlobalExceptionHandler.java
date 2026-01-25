package com.ashutosh.Splitwise.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidPaymentMethodException.class)
    public ResponseEntity<String> handlerInvalidPaymentMethod(InvalidPaymentMethodException ex){
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex){
        ErrorResponse error =  new ErrorResponse();
        error.setMessage(ex.getMessage());
        error.setStatusCode(HttpStatus.NOT_FOUND.value());
        error.setCurrTimeStamp(LocalDateTime.now());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
