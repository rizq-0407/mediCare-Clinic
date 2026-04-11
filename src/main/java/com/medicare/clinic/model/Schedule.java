package com.medicare.clinic.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Schedules")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "specialization")
    private String specialization;

    @Column(name = "schedule_date")
    private String date;

    @Column(name = "schedule_time")
    private String time;

    @Column(name = "available_slots")
    private int availableSlots;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "update_request")
    private String updateRequest;

    @Column(name = "requested_date")
    private String requestedDate;

    @Column(name = "requested_time")
    private String requestedTime;

    @Column(name = "requested_room")
    private String requestedRoom;

    @Column(name = "admin_response")
    private String adminResponse;

    // ✅ getters & setters
    public Long getId() { return id; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getUpdateRequest() { return updateRequest; }
    public void setUpdateRequest(String updateRequest) { this.updateRequest = updateRequest; }

    public String getRequestedDate() { return requestedDate; }
    public void setRequestedDate(String requestedDate) { this.requestedDate = requestedDate; }

    public String getRequestedTime() { return requestedTime; }
    public void setRequestedTime(String requestedTime) { this.requestedTime = requestedTime; }

    public String getRequestedRoom() { return requestedRoom; }
    public void setRequestedRoom(String requestedRoom) { this.requestedRoom = requestedRoom; }

    public String getAdminResponse() { return adminResponse; }
    public void setAdminResponse(String adminResponse) { this.adminResponse = adminResponse; }
}
