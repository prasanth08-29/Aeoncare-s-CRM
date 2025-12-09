# MERN Login Register Project

This is a MERN (MongoDB, Express, React, Node.js) stack application.

## Prerequisites

- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

## Setup

1.  **Install Backend Dependencies:**
    Open a terminal in the root directory and run:
    ```bash
    npm install
    ```

2.  **Install Frontend Dependencies:**
    Open a terminal in the `frontend` directory and run:
    ```bash
    cd frontend
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

## Running the Application

1.  **Start the Backend:**
    In the root directory, run:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the Frontend:**
    In the `frontend` directory, run:
    ```bash
    npm run dev
    ```
    The frontend will start (usually on `http://localhost:5173`).

3.  **Run Both Concurrently:**
    In the root directory, run:
    ```bash
    npm run dev:local
    ```
    This will start both backend and frontend servers at the same time.

## Project Structure

-   **backend/**: Contains the Express server, models, and routes.
-   **frontend/**: Contains the React application (Vite).
