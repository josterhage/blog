package com.system559.blog.controller.blog;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(Long id) {
        super("Could not find category with id: " + id);
    }

    public CategoryNotFoundException(String name) {
        super("Could not find category named \"" + name + "\"");
    }
}
