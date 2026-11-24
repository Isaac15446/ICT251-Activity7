const express = require("express");
const pool = require("../db");

const router = express.Router();

const ALLOWED_STATUSES = ["Pending", "In progress", "Completed"];

function validateRecord(body) {
    const errors = [];

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const description = typeof body.description === "string"
        ? body.description.trim()
        : "";
    const status = body.status === undefined ? "Pending" : body.status;

    if (!title) errors.push("title is required");
    if (title.length > 150) errors.push("title must not exceed 150 characters");

    if (!category) errors.push("category is required");
    if (category.length > 100) errors.push("category must not exceed 100 characters");

    if (!description) errors.push("description is required");

    if (!ALLOWED_STATUSES.includes(status)) {
        errors.push("status must be Pending, In progress, or Completed");
    }

    return {
        errors,
        values: { title, category, description, status }
    };
}

function parseId(id) {
    if (!/^[1-9]\d*$/.test(id)) return null;
    const number = Number(id);
    return Number.isSafeInteger(number) ? number : null;
}

// GET /api/records - retrieve all records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, title, category, description, status FROM records ORDER BY id ASC"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET /api/records/:id - retrieve one record
router.get("/:id", async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: "id must be a positive integer" });

        const result = await pool.query(
            "SELECT id, title, category, description, status FROM records WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST /api/records - create a record
router.post("/", async (req, res, next) => {
    try {
        const { errors, values } = validateRecord(req.body || {});
        if (errors.length) {
            return res.status(400).json({ error: "Validation failed", details: errors });
        }

        const result = await pool.query(
            `INSERT INTO records (title, category, description, status)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, category, description, status`,
            [values.title, values.category, values.description, values.status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT /api/records/:id - replace/update a record
router.put("/:id", async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: "id must be a positive integer" });

        const { errors, values } = validateRecord(req.body || {});
        if (errors.length) {
            return res.status(400).json({ error: "Validation failed", details: errors });
        }

        const result = await pool.query(
            `UPDATE records
             SET title = $1, category = $2, description = $3, status = $4
             WHERE id = $5
             RETURNING id, title, category, description, status`,
            [values.title, values.category, values.description, values.status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/records/:id - delete a record
router.delete("/:id", async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: "id must be a positive integer" });

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({
            message: "Record deleted successfully",
            id: result.rows[0].id
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
