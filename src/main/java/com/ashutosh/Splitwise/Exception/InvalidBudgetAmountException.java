package com.ashutosh.Splitwise.Exception;

public class InvalidBudgetAmountException extends RuntimeException{
    public InvalidBudgetAmountException(String message){
        super(message);
    }
}
