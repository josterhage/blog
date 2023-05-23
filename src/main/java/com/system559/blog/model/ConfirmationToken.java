package com.system559.blog.model;

import lombok.Data;

import javax.persistence.*;
import java.util.UUID;

@Entity
@Data
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private long tokenId;

    private String confirmationToken;

    private Long createdDate;

    @OneToOne(targetEntity = User.class, fetch=FetchType.EAGER)
    @JoinColumn(nullable = false, name="user_id")
    private User user;

    public ConfirmationToken() {}

    public ConfirmationToken(User user) {
        this.user = user;
        createdDate = System.currentTimeMillis();
        confirmationToken = UUID.randomUUID().toString();
    }
}
