package com.college.student.service;

import com.college.student.model.Student;
import com.college.student.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public List<Student> getAll() {
        return repository.findAll();
    }

    public List<Student> getByDepartment(String department) {
        return repository.findByDepartmentIgnoreCase(department);
    }

    public Student getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student create(Student student) {
        if (repository.existsByStudentId(student.getStudentId())) {
            throw new IllegalArgumentException("Student ID already exists");
        }
        return repository.save(student);
    }

    public Student update(String id, Student updated) {
        Student existing = getById(id);

        existing.setStudentId(updated.getStudentId());
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setYear(updated.getYear());
        existing.setSemester(updated.getSemester());
        existing.setAttendance(updated.getAttendance());
        existing.setMarks(updated.getMarks());
        existing.setAchievements(updated.getAchievements());

        return repository.save(existing);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }
        repository.deleteById(id);
    }
}