package com.ashutosh.Splitwise.Exception;

public class DataNotFoundException extends RuntimeException{
    public DataNotFoundException(String message){
        super((message));
    }
}
