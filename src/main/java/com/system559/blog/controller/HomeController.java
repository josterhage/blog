package com.system559.blog.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping
public class HomeController {

    @Value("${system559.ajax.host}")
    private String ajaxHost;

    public HomeController() { }

    @GetMapping("/")
    public ModelAndView index() {
        ModelAndView mav = new ModelAndView("/index");
        mav.addObject("ajaxHost",ajaxHost);
        return mav;
    }
}
