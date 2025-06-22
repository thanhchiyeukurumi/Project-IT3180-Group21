# Apartment Fee Collection Manager

## English

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation and Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd Project-IT3180-Group21
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend server will run on http://localhost:3000

2. Start the frontend development server:
```bash
cd frontend
npm start
```
The frontend application will run on http://localhost:3001

### Environment Variables

#### Backend
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

#### Frontend
Create a `.env` file in the frontend directory with the following variables:
```
REACT_APP_API_URL=http://localhost:3000
```

## Tiếng Việt

### Yêu cầu hệ thống
- Node.js (phiên bản 14 trở lên)
- MongoDB
- npm hoặc yarn

### Cài đặt và Thiết lập

1. Clone repository:
```bash
git clone [repository-url]
cd Project-IT3180-Group21
```

2. Cài đặt dependencies cho backend:
```bash
cd backend
npm install
```

3. Cài đặt dependencies cho frontend:
```bash
cd ../frontend
npm install
```

### Chạy ứng dụng

1. Khởi động server backend:
```bash
cd backend
npm start
```
Server backend sẽ chạy tại http://localhost:3000

2. Khởi động server frontend:
```bash
cd frontend
npm start
```
Ứng dụng frontend sẽ chạy tại http://localhost:3001

### Biến môi trường

#### Backend
Tạo file `.env` trong thư mục backend với các biến sau:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

#### Frontend
Tạo file `.env` trong thư mục frontend với các biến sau:
```
REACT_APP_API_URL=http://localhost:3000
```
