package com.ashutosh.Splitwise.Config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({"/", "/auth", "/app", "/app/**"})
    public String forwardSpa() {
        return "forward:/index.html";
    }
}