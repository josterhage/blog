package com.system559.blog.controller;

import com.system559.blog.model.*;
import com.system559.blog.services.EmailSenderService;
import org.dom4j.rule.Mode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Optional;

@Controller
@RequestMapping("/messenger")
public class MessengerController {
    private final MessageTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailSenderService emailService;
    @Value("${system559.ajax.host}")
    private String ajaxHost;

    public MessengerController(MessageTokenRepository tokenRepository, UserRepository userRepository, EmailSenderService emailService){
        this.tokenRepository=tokenRepository;
        this.userRepository=userRepository;
        this.emailService=emailService;
    }

    @GetMapping("/newEmail/{id}")
    public @ResponseBody
    ModelAndView newEmail(@PathVariable Long id){
        ModelAndView mav = new ModelAndView("/messenger/newEmail");
        mav.addObject("userId",id);
        return mav;
    }

    @GetMapping("/newEmail/confirm/{token}")
    public @ResponseBody
    ModelAndView confirmEmail(@PathVariable String token){
        ModelAndView mav = new ModelAndView("/messenger/newEmailSent");
        Optional<MessageToken> optionalToken = tokenRepository.findByToken(token);
        if(optionalToken.isEmpty()){
            mav.addObject("actionStatus",new ActionStatus("tokenInvalid",false));
            return mav;
        }

        MessageToken messageToken = optionalToken.get();

        System.out.println(messageToken.getRecipient().getEmail());

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(messageToken.getRecipient().getEmail());
        mailMessage.setCc(messageToken.getSender());
        mailMessage.setSubject(messageToken.getSubject());
        mailMessage.setText(messageToken.getBody());

        emailService.sendEmail(mailMessage);

        tokenRepository.delete(messageToken);

        mav.addObject("actionStatus",new ActionStatus("emailSent",true));

        return mav;
    }

    @PostMapping("/newEmail/{id}")
    public @ResponseBody
    ModelAndView postEmail(@PathVariable Long id, Message message) {
        ModelAndView mav = new ModelAndView("/messenger/confirmationSent");

        message.setSubject(message.getSubject().replaceAll("\\<.*?\\>",""));
        message.setBody(message.getBody().replaceAll("\\<.*?\\>",""));

        User recipient = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        MessageToken token =
                new MessageToken(recipient, message.getFrom(), message.getSubject(), message.getBody());
        tokenRepository.save(token);

        SimpleMailMessage confirmationEmail = new SimpleMailMessage();
        confirmationEmail.setTo(message.getFrom());
        confirmationEmail.setSubject("System559 Messenger Confirmation Email");
        confirmationEmail.setFrom("do-not-reply@system559.com");
        confirmationEmail.setText("To confirm your email address, please click here: " + ajaxHost + "/messenger/newEmail/confirm/" + token.getToken());

        emailService.sendEmail(confirmationEmail);

        mav.addObject("email",message.getFrom());

        return mav;
    }
}
