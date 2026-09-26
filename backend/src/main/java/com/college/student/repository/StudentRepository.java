package com.college.student.repository;

import com.college.student.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudentRepository extends MongoRepository<Student, String> {
    List<Student> findByDepartmentIgnoreCase(String department);
    boolean existsByStudentId(String studentId);
}