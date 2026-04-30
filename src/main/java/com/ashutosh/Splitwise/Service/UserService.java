package com.ashutosh.Splitwise.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ashutosh.Splitwise.Dto.ForgotPasswordRequestDto;
import com.ashutosh.Splitwise.Dto.ResetPasswordRequestDto;
import com.ashutosh.Splitwise.Dto.UpdatePasswordRequestDto;
import com.ashutosh.Splitwise.Dto.UpdateUpiIdRequestDto;
import com.ashutosh.Splitwise.Entity.PasswordResetToken;
import com.ashutosh.Splitwise.Entity.User;
import com.ashutosh.Splitwise.Exception.DataNotFoundException;
import com.ashutosh.Splitwise.Exception.DuplicateDataException;
import com.ashutosh.Splitwise.Repository.PasswordResetTokenRepository;
import com.ashutosh.Splitwise.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public User createUser(User user) {

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new DuplicateDataException("User already exists with this email");
        }
        return userRepository.save(user);
    }


    public String updatePassword(UpdatePasswordRequestDto request){
        User user = userRepository.findByEmail(request.getUserEmailId())
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        if(!user.getPassword().equals(request.getOldPassword())){
            return "Old Password is incorrect";
        }

        if(request.getNewPassword().length() < 6){
            return "Password must be at least 6 characters";
        }

        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return "Password updated successfully";
    }


    public String updateUpi(UpdateUpiIdRequestDto request){
        User user =userRepository.findByEmail(request.getUserEmailId())
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        if(!user.getUpiId().equals(request.getOldUpiId())){
            return "Old Upi is incorrect";
        }
        if(request.getNewUpiId() == null || !request.getNewUpiId().contains("@")){
            return "Invalid UPI ID";
        }

        user.setUpiId(request.getNewUpiId());
        userRepository.save(user);

        return "UPI ID updated successfully";
    }

    public String sendOtp(ForgotPasswordRequestDto request){
        userRepository.findByEmail(request.getEmail())
            .orElseThrow(()-> new DataNotFoundException("User not found"));

        String otp = generateOtp();

        PasswordResetToken token = passwordResetTokenRepository.findByEmail(request.getEmail())
                .orElse(new PasswordResetToken());

        token.setEmail(request.getEmail());
        token.setOtp(otp);
        token.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        passwordResetTokenRepository.save(token);

        emailService.sendMail(
                request.getEmail(),
                "Password Reset OTP",
                "Your OTP is "+ otp + " (valid for 5 minutes)"
        );

        return "OTP sent to registered email";

    }

    @Transactional
    public String resetPassword(ResetPasswordRequestDto request){
        PasswordResetToken token = passwordResetTokenRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new DataNotFoundException("Invalid OTP"));

        if(token.getExpiryTime().isBefore(LocalDateTime.now())){
            return "OTP expired";
        }

        if(!token.getOtp().equals(request.getOtp())){
            return "Invalid OTP";
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new DataNotFoundException("User not found"));

        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        passwordResetTokenRepository.deleteByEmail(request.getEmail());

        return "Password reset successfully";
    }

    private String generateOtp(){
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder otp = new StringBuilder();

        Random random = new Random();

        for(int i = 0 ; i < 6 ;i++){
            otp.append(chars.charAt(random.nextInt(chars.length())));
        }

        return otp.toString();
    }
}
