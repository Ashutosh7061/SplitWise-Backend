package com.ashutosh.Splitwise.Entity;

import com.ashutosh.Splitwise.Enum.PaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    private PaymentMethod preferredPaymentMethod;

    @Column(unique = true)
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(
            regexp = "^[a-zA-Z0-9._-]+@[a-zA-Z]+$",
            message = "Invalid UPI ID format"
    )
    private String upiId;


}
