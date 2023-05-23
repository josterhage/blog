package com.system559.blog.model;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Collection<User> findAll();
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("select u from User u where u.userId = :userIds")
    Iterable<User> getUsersByUserId(@Param(value="userIds") List<Long> userIds);

    @Query("select u.userId from User u order by u.userId")
    Iterable<Long> getUserIds();

    @Modifying
    @Query("update User u set u.firstName = :value where u.userId = :userId")
    @Transactional
    void updateFirstName(@Param(value="userId") Long userId, @Param(value="value") String value);

    @Modifying
    @Query("update User u set u.lastName = :value where u.userId = :userId")
    @Transactional
    void updateLastName(@Param(value="userId") Long userId, @Param(value="value") String value);

    @Modifying
    @Query("update User u set u.email = :value where u.userId= :userId")
    @Transactional
    void updateEmail(@Param(value="userId") Long userId, @Param(value="value") String value);
}
