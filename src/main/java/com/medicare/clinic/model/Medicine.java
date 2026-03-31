package com.medicare.clinic.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "Medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Medicine {

    @Id
    @Column(name = "MedicineID")
    @JsonProperty("id")
    private String medicineId;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Category")
    private String category;

    @Column(name = "Description")
    private String description;

    @Column(name = "UnitPrice")
    @JsonProperty("price")
    private Double unitPrice;

    @Column(name = "StockQuantity")
    @JsonProperty("stock")
    private Integer stockQuantity;

    @Column(name = "ReorderLevel")
    private Integer reorderLevel;

    @Column(name = "ExpiryDate")
    @JsonProperty("expiryDate")
    private LocalDate expiryDate;

    @Column(name = "SupplierName")
    @JsonProperty("manufacturer")
    private String supplierName;
}