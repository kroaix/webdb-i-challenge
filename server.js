const express = require("express");

const db = require("./data/dbConfig.js");

const server = express();

server.use(express.json());

server.get("/", async (req, res) => {
  try {
    const accounts = await db("accounts");
    res.status(200).json({ success: true, accounts });
  } catch {
    res.status(500).json({ success: false, error: "Problem with request." });
  }
});

server.post("/", validateBody, async (req, res) => {
  try {
    const accounts = await db("accounts").insert(req.body);
    res.status(201).json({ success: true, accounts });
  } catch {
    res.status(500).json({ success: false, error: "Problem with request." });
  }
});

server.put("/:id", validateID, validateBody, async (req, res) => {
  const { id } = req.params;
  try {
    const account = await db("accounts")
      .where({ id })
      .update(req.body);
    res.status(200).json({ success: true, account });
  } catch {
    res.status(500).json({ success: false, error: "Problem with request." });
  }
});

server.delete("/:id", validateID, async (req, res) => {
  const { id } = req.params;
  try {
    await db("accounts")
      .where({ id })
      .del();
    res
      .status(200)
      .json({
        success: true,
        message: `Account ${id} was successfully deleted`
      });
  } catch {
    res.status(500).json({ success: false, error: "Problem with request." });
  }
});

async function validateID(req, res, next) {
  const { id } = req.params;
  try {
    const account = await db("accounts")
      .where({ id })
      .update(req.body);
    if (account > 0) {
      req.account = account;
      next();
    } else {
      res.status(404).json({
        success: false,
        error: `The account with id of ${id} does not exist.`
      });
    }
  } catch {
    res.status(500).json({
      success: false,
      error: "Problem with request."
    });
  }
}

async function validateBody(req, res, next) {
  const { name, budget } = req.body;
  try {
    if (Object.entries(req.body).length === 0) {
      res.status(400).json({ success: false, error: "Body data not found." });
    } else if (!name || !budget) {
      res.status(400).json({
        success: false,
        error: "Name and Budget are both required."
      });
    } else {
      next();
    }
  } catch {
    res.status(500).json({
      success: false,
      error: "Problem with request."
    });
  }
}

module.exports = server;
