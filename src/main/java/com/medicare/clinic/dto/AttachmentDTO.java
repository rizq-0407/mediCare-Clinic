package com.medicare.clinic.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttachmentDTO {
    private String attachmentId;
    private String ticketId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
