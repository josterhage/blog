package com.system559.blog.controller.blog;

public class TagNotFoundException extends RuntimeException{
    public TagNotFoundException(Long id) {
        super("Could not find a Tag with id: " + id);
    }
    public TagNotFoundException(String name) {
        super("Could not find a Tag with name: " + name);
    }
}
