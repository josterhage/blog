package com.system559.blog.config;

import com.system559.blog.services.CustomAuthenticationProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    private final CustomAuthenticationProvider customAuthenticationProvider;

    @Autowired
    public WebSecurityConfig(CustomAuthenticationProvider customAuthenticationProvider) {
        this.customAuthenticationProvider = customAuthenticationProvider;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) {
        auth.authenticationProvider(customAuthenticationProvider);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/account/resetPassword/**").permitAll()
                .antMatchers("/account/**").authenticated()
                .antMatchers("/blog/createPost").hasAnyRole("CONTRIBUTOR","OWNER")
                .antMatchers("/blog/category/new").hasRole("OWNER")
                .antMatchers("/blog/comment/delete","/blog/comment/edit","/blog/comment/new").authenticated()
                .antMatchers("/blog/post/delete","/blog/post/edit","/blog/post/new").hasAnyRole("CONTRIBUTOR","OWNER")
                .antMatchers("/blog/tag/new","/blog/tag/update").hasAnyRole("CONTRIBUTOR","OWNER")
                .antMatchers("/blog/**").permitAll()
                .antMatchers("/management/**").hasRole("OWNER")
                .antMatchers("/","/register/**","/images/**","/css/**","/js/**","/site-data/**").permitAll()
                .antMatchers("/user/check","/user/exists").permitAll()
                .antMatchers("/user/update","/user/delete","/user/allIds").hasRole("OWNER")
                .antMatchers("/user/**").authenticated()
                .antMatchers("/messenger/**").permitAll()
                .anyRequest().authenticated()
                .and()
            .formLogin()
                .loginPage("/")
                .loginProcessingUrl("/login")
                .and()
            .logout()
                .permitAll();
    }
}
