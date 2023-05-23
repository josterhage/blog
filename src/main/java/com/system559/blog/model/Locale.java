package com.system559.blog.model;

import lombok.Data;


@Data
public class Locale {
    private int isoIndex;
    private String englishName;
    private String frenchName;
    private String alpha2;
    private String alpha3;

    public Locale() {}
}
