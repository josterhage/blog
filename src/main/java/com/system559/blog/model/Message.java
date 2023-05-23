package com.system559.blog.model;

import lombok.Data;

@Data
public class Message {
    private String from;
    private String subject;
    private String body;

    public Message() {}
}
