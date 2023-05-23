package com.system559.blog.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
public class LoginFailure {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @OneToOne(targetEntity = User.class, fetch=FetchType.EAGER)
    @JoinColumn(nullable = false, name="user_id")
    private User user;
    private int failureCount;
    //dateTime stored as milliseconds in a Long
    private Long lastFailure;

    public LoginFailure() {}

    public LoginFailure(User user) {
        this.user = user;
    }
}
