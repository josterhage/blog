package com.system559.blog.controller;

import com.system559.blog.model.*;
import com.system559.blog.services.CustomAuthenticationProvider;
import com.system559.blog.services.EmailSenderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Optional;

@Controller
@RequestMapping("/account")
public class AccountController {
    private final UserRepository userRepository;
    private final EmailSenderService emailSenderService;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomAuthenticationProvider authenticationProvider;
    @Value("${system559.ajax.host}")
    private String ajaxHost;

    final Logger logger = LoggerFactory.getLogger(AccountController.class);

    public AccountController(UserRepository userRepository,
                             EmailSenderService emailSenderService,
                             ConfirmationTokenRepository confirmationTokenRepository,
                             PasswordEncoder passwordEncoder,
                             CustomAuthenticationProvider authenticationProvider) {
        this.userRepository = userRepository;
        this.emailSenderService = emailSenderService;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationProvider = authenticationProvider;
    }

    @GetMapping
    public ModelAndView account() {

        return new ModelAndView("account");
    }

    @PostMapping("/resetPassword")
    public @ResponseBody
    ActionStatus resetPasswordSubmit(@RequestParam("resetUsername") String username) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty()) {
            return ActionStatus.userNotFound();
        }

        User user = optionalUser.get();

        ConfirmationToken resetToken = new ConfirmationToken(user);

        confirmationTokenRepository.save(resetToken);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("System 559 Blog Password Reset");
        mailMessage.setFrom("josterhage@gmail.com");
        mailMessage.setText("To reset your password please follow this link: " + ajaxHost +
                "/account/resetPassword/confirm?token=" +
                resetToken.getConfirmationToken());

        emailSenderService.sendEmail(mailMessage);

        return new ActionStatus("passwordResetSent", true);
    }

    @GetMapping("/resetPassword/confirm")
    public ModelAndView resetPasswordConfirm(ModelAndView modelAndView, @RequestParam("token") String confirmationToken) {
        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

        if (token != null) {
            modelAndView.addObject("token", confirmationToken);
            modelAndView.addObject("ajaxHost",ajaxHost);
            modelAndView.setViewName("resetConfirm");
            return modelAndView;
        }

        modelAndView.addObject("actionStatus", ActionStatus.invalidToken());
        modelAndView.setViewName("index");

        return modelAndView;
    }

    @PostMapping("/resetPassword/reset")
    public ModelAndView resetPasswordReset(ModelAndView modelAndView, @RequestParam("token") String confirmationToken, @RequestParam("password") String password) {
        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

        logger.info("Reached resetPasswordReset");

        if (token != null) {
            confirmationTokenRepository.delete(token);
            User user = token.getUser();
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);

            SecurityContextHolder.getContext().setAuthentication(authenticationProvider.authenticate(user));

            modelAndView.setViewName("index");
            modelAndView.addObject("actionStatus", new ActionStatus("passwordResetComplete", true));

            return modelAndView;
        }

        modelAndView.addObject("actionStatus", ActionStatus.invalidToken());
        modelAndView.setViewName("index");

        return modelAndView;
    }
}
