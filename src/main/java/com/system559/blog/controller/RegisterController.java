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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import java.util.Optional;
import java.util.regex.Pattern;

@Controller
public class RegisterController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomAuthenticationProvider authenticationProvider;
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final EmailSenderService emailSenderService;
    private final Logger logger = LoggerFactory.getLogger(RegisterController.class);
    @Value("${system559.ajax.host}")
    private String ajaxHost;

    public RegisterController(UserRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              CustomAuthenticationProvider authenticationProvider,
                              ConfirmationTokenRepository confirmationTokenRepository,
                              EmailSenderService emailSenderService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationProvider = authenticationProvider;
        this.confirmationTokenRepository = confirmationTokenRepository;
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/register")
    public ModelAndView registerSubmit(ModelAndView modelAndView, User user) {
        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(user.getEmail());

        if (optionalUser.isPresent()) {
            logger.info("errorEmailExists");
            modelAndView.addObject("actionStatus", new ActionStatus("emailExists",false));
            modelAndView.setViewName("index");
            return modelAndView;
        }

        optionalUser = userRepository.findByUsername(user.getUsername());

        if(optionalUser.isPresent()){
            logger.info("errorUsernameExists");
            modelAndView.addObject("actionStatus",new ActionStatus("usernameExists",false));
            modelAndView.setViewName("index");
            return modelAndView;
        }

        if(!CustomAuthenticationProvider.checkPasswordComplexity(user.getPassword())){
            logger.info("errorPasswordInsecure");
            modelAndView.addObject("actionStatus",ActionStatus.passwordInsecure());
            modelAndView.setViewName("index");
            return modelAndView;
        }

        String ctPassword = passwordEncoder.encode(user.getPassword());

        user.setPassword(ctPassword);

        user.setUserRole(Role.READER);

        user.setConfirmed(false);

        userRepository.save(user);

        ConfirmationToken confirmationToken = new ConfirmationToken(user);

        confirmationTokenRepository.save(confirmationToken);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(user.getEmail());
        mailMessage.setSubject("System 559 Blog Registration.");
        mailMessage.setFrom("account-confirmation-do-not-reply@system559.com");
        mailMessage.setText("To confirm your account, please click here: " + ajaxHost + "/register/confirm?token=" + confirmationToken.getConfirmationToken());

        emailSenderService.sendEmail(mailMessage);

        modelAndView.addObject("actionStatus",new ActionStatus("accountRegistered",true));
        modelAndView.addObject("email", user.getEmail());
        modelAndView.setViewName("index");

        return modelAndView;
    }

    @GetMapping("/register/confirm")
    public ModelAndView registerConfirm(ModelAndView modelAndView, @RequestParam("token") String confirmationToken) {
        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

        if (token != null) {
            confirmationTokenRepository.delete(token);

            User user = token.getUser();

            user.setConfirmed(true);
            user.setEnabled(true);

            userRepository.save(user);

            SecurityContextHolder.getContext().setAuthentication(authenticationProvider.authenticate(user));

            modelAndView.setViewName("index");
            modelAndView.addObject("actionStatus", new ActionStatus("accountConfirmed",true));

            return modelAndView;
        }

        modelAndView.addObject("actionStatus", ActionStatus.invalidToken());
        modelAndView.setViewName("index");

        return modelAndView;
    }
}
