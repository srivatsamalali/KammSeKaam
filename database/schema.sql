-- Create users table
CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'RECRUITER', 'CANDIDATE') DEFAULT 'CANDIDATE',
  isEmailVerified BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS Candidates (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  mobileNumber VARCHAR(20) NOT NULL,
  address LONGTEXT NOT NULL,
  dob DATE,
  experience INT,
  technicalSkills JSON,
  highestQualification VARCHAR(255),
  currentCompany VARCHAR(255),
  currentCTC DECIMAL(10, 2),
  expectedCTC DECIMAL(10, 2),
  currentLocation VARCHAR(255),
  preferredLocation VARCHAR(255),
  noticePeriod VARCHAR(50),
  resumePath VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  FULLTEXT INDEX ft_search (name, currentLocation)
);

-- Create recruiters table
CREATE TABLE IF NOT EXISTS Recruiters (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  mobileNumber VARCHAR(20) NOT NULL,
  address LONGTEXT NOT NULL,
  specialization JSON,
  assignedCandidates INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS Applications (
  id VARCHAR(36) PRIMARY KEY,
  candidateId VARCHAR(36) NOT NULL,
  recruiterId VARCHAR(36),
  status ENUM('APPLICATION_RECEIVED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'REJECTED') DEFAULT 'APPLICATION_RECEIVED',
  interviewDate DATETIME,
  googleMeetLink VARCHAR(255),
  feedback LONGTEXT,
  rejectionReason LONGTEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidateId) REFERENCES Candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (recruiterId) REFERENCES Recruiters(id) ON DELETE SET NULL,
  INDEX idx_candidateId (candidateId),
  INDEX idx_recruiterId (recruiterId),
  INDEX idx_status (status)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  message LONGTEXT NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
);

-- Create admin user (change password in production)
INSERT INTO Users (id, email, password, role, isEmailVerified) 
VALUES (
  UUID(),
  'Contact@astonrecruitment.in',
  '$2a$10$...', -- Will be hashed by backend
  'ADMIN',
  TRUE
);
