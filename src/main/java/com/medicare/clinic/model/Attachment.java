package com.medicare.clinic.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attachmentId", unique = true, nullable = false)
    private String attachmentId;

    @Column(name = "ticketId")
    private String ticketId;

    @Column(name = "fileName", nullable = false)
    private String fileName;

    @Column(name = "fileType")
    private String fileType;  // MIME type

    @Column(name = "filePath", nullable = false)
    private String filePath;

    @Column(name = "fileSize", nullable = false)
    private Long fileSize;  // In bytes

    @Column(name = "uploadedAt")
    private LocalDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
