package com.system559.blog.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class MessageToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long tokenId;

    @Column(unique = true)
    private String token;

    private LocalDateTime createdDate;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User recipient;

    private String sender;

    private String subject;

    private String body;

    public MessageToken() {
    }

    public MessageToken(User recipient, String sender, String subject, String body) {
        this.recipient = recipient;
        this.sender = sender;
        this.subject = subject;
        this.body = body;
        this.createdDate = LocalDateTime.now();
        this.token = UUID.randomUUID().toString();
    }
}
