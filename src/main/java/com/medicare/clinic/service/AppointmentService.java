package com.medicare.clinic.service;

import com.medicare.clinic.model.Appointment;
import com.medicare.clinic.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatientId(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public boolean deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            return false;
        }
        appointmentRepository.deleteById(id);
        return true;
    }

    public Optional<Appointment> updateAppointmentStatus(Long id, String newStatus) {
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus(newStatus);
            return appointmentRepository.save(appointment);
        });
    }
}
