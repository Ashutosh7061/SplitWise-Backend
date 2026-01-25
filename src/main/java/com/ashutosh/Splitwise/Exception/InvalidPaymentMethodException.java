package com.ashutosh.Splitwise.Exception;

public class InvalidPaymentMethodException extends RuntimeException{

    public InvalidPaymentMethodException(String msg){
        super(msg);
    }
}
