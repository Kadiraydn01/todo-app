const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  const task = new Task({ title });
  await task.save();
  res.status(201).json(task);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: "Görev güncellenemedi." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: "Görev silinemedi." });
  }
});

module.exports = router;
