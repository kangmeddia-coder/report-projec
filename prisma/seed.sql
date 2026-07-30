INSERT INTO School (id, name, address, district, affiliation, ministry, principalName, planHeadName, updatedAt) 
VALUES ('school-001', 'โรงเรียนบ้านบึงโน', '123 ถ.สุขุมวิท ต.บึงโน อ.เมือง', 'สำนักงานเขตพื้นที่การศึกษาประถมศึกษา', 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', 'กระทรวงศึกษาธิการ', 'นายสมชาย ใจดี', 'นางสาววิภา รักษ์สุขภาพ', datetime('now'));

INSERT INTO User (id, email, name, password, role, position, academicStanding, schoolId, updatedAt) 
VALUES ('user-admin', 'admin@school.ac.th', 'ผู้ดูแลระบบ', '$2a$10$wB5M.fR3oQe6tqO9.DkH3eq3h5yKjYhQp0sB6iH7C7fW3H1zE.jO.', 'ADMIN', 'ผู้ดูแลระบบ', '', 'school-001', datetime('now'));

INSERT INTO User (id, email, name, password, role, position, academicStanding, schoolId, updatedAt) 
VALUES ('user-teacher', 'teacher@school.ac.th', 'นายครูทดสอบ สอนดี', '$2a$10$wB5M.fR3oQe6tqO9.DkH3eq3h5yKjYhQp0sB6iH7C7fW3H1zE.jO.', 'TEACHER', 'ครู', 'ชำนาญการ', 'school-001', datetime('now'));
