package com.system559.blog.controller.blog;

public class CommentNotFoundException extends RuntimeException {
    public CommentNotFoundException(Long id) {
        super("Could not find category with id: " + id);
    }

    public CommentNotFoundException(String attribute,String value) {
        super("Could not find category with \"" + attribute + "\":\""+value+"\".");
    }
}
