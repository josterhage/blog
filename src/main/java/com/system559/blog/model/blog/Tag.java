package com.system559.blog.model.blog;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.util.Collection;

@Entity
@Data
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long tagId;
    private String name;

    public Tag() {}

    public Tag(String name) {
        this.name=name;
    }

    @JsonIgnore
    @ManyToMany(mappedBy = "tags")
    private Collection<Post> posts;
}
