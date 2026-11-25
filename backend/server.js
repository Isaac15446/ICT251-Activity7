require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const recordsRouter = require("./routes/records");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    ...(process.env.CLIENT_ORIGINS || "").split(",").map(origin => origin.trim()).filter(Boolean)
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "IT Support Desk API is running",
        version: "1.0.0",
        endpoints: {
            health: "GET /health",
            getAllRecords: "GET /api/records",
            getOneRecord: "GET /api/records/:id",
            createRecord: "POST /api/records",
            updateRecord: "PUT /api/records/:id",
            deleteRecord: "DELETE /api/records/:id"
        }
    });
});

// Health route - also checks database connectivity
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({
            status: "OK",
            database: "connected"
        });
    } catch (error) {
        res.status(503).json({
            status: "ERROR",
            database: "unavailable"
        });
    }
});

// Records API
app.use("/api/records", recordsRouter);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Handle invalid JSON and unexpected errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ error: "Invalid JSON in request body" });
    }

    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
    try {
        // Create the table automatically if it does not already exist.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS records (
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'In progress', 'Completed')),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        app.listen(PORT, () => {
            console.log(`IT Support Desk API running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Could not start the server:", error.message);
        process.exit(1);
    }
}

startServer();
