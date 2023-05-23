package com.system559.blog.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.system559.blog.model.blog.Comment;
import com.system559.blog.model.blog.Post;
import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.*;
import java.util.Collection;
import java.util.Objects;

@Entity
@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Table(indexes = {
        @Index(name = "usernameIndex", columnList = "username"),
        @Index(name = "lastNameIndex", columnList = "lastName")
})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "userId", scope=User.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long userId;
    private String username;
    @JsonIgnore
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private Role userRole;
    private boolean confirmed;
    private boolean enabled;

    @JsonIgnore
    @OneToMany(mappedBy = "author")
    @ToString.Exclude
    private Collection<Post> posts;

    @JsonIgnore
    @OneToMany(mappedBy = "author")
    @ToString.Exclude
    private Collection<Comment> comments;

    public User() {
    }

    public User(Long id, String username, String password, String firstName, String lastName, String email, Role userRole, boolean confirmed, boolean enabled) {
        this.userId = id;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userRole = userRole;
        this.confirmed = confirmed;
        this.enabled = enabled;
    }

    public static User fromId(Long userId) {
        User user = new User();
        user.setUserId(userId);
        return user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        User user = (User) o;

        return Objects.equals(userId, user.userId);
    }

    @Override
    public int hashCode() {
        return 562048007;
    }
}
