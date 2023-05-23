package com.system559.blog.model;

import lombok.Data;

@Data
public class ActionStatus {
    private String message;
    private boolean actionSuccessful;

    public ActionStatus(String message, boolean actionSuccessful) {
        this.message = message;
        this.actionSuccessful = actionSuccessful;
    }

    public static ActionStatus userNotFound() {
        return new ActionStatus("userNotFound", false);
    }

    public static ActionStatus invalidToken() {
        return new ActionStatus("invalidToken", false);
    }

    public static ActionStatus passwordInsecure() {return new ActionStatus("passwordInsecure",false);}

    public static ActionStatus userExists() {return new ActionStatus("userExists",true);}
}
