package com.system559.blog.controller.blog;

public class PostNotFoundException extends RuntimeException {
    public PostNotFoundException(Long id) {
        super("Could not find Post with id: " + id);
    }
}
