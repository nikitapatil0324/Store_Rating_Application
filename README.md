<<<<<<< HEAD
### Store Rating Application
### Project Overview

Store Rating Application is a full-stack web application developed to allow customers to rate and review stores. The system provides different functionalities based on user roles such as Admin, Store Owner, and Customer.

The application enables users to browse stores, submit ratings, update ratings, and manage their profiles. Store owners can view ratings and performance of their stores, while administrators can manage users and stores across the platform.

The project follows a clean three-layer backend architecture consisting of Controllers, Services, and Repositories, making the application scalable and easy to maintain.

### Technologies Used
Frontend : React.js,Vite,React Router,Context API,JavaScript

Backend : Node.js,Express.js,JWT Authentication,BCrypt Password Encryption

Database : MySQL

---

### MySQL Database Setup

```sql
CREATE DATABASE store_rating_db;

-- Accounts table 
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL,
    role ENUM('admin', 'user', 'store_owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Store profiles table 
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL,
    owner_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store (user_id, store_id)
);
```


### Run the Application

### Running the Backend
1. Open a terminal inside `/backend`.
2. Install dependencies 
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000`.*

### Running the Frontend
1. Open a terminal inside `/frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite dev server:
   ```bash
   npm run dev
   ```
   *Usually runs on `http://localhost:5173`. Open this URL in your browser.*

---


=======
# Store-Rating-Hub
>>>>>>> fa769d2cea39aeaccb6dc9413020ed3ee49b5e5e
