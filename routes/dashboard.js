const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Streak routes
router.get("/streak", dashboardController.getStreak);
router.post("/streak/update", dashboardController.updateStreak);

// Milestone routes
router.get("/milestones", dashboardController.getMilestones);
router.post("/milestones", dashboardController.createMilestone);
router.put("/milestones/:id", dashboardController.updateMilestone);
router.delete("/milestones/:id", dashboardController.deleteMilestone);

// Overview routes
router.get("/overview", dashboardController.getOverview);
router.post("/overview", dashboardController.createOverview);
router.put("/overview/:id", dashboardController.updateOverview);
router.delete("/overview/:id", dashboardController.deleteOverview);

// Schedule routes
router.get("/schedules", dashboardController.getSchedules);
router.post("/schedules", dashboardController.createSchedule);
router.put("/schedules/:id", dashboardController.updateSchedule);
router.delete("/schedules/:id", dashboardController.deleteSchedule);

// Task routes
router.get("/tasks", dashboardController.getTasks);
router.get("/tasks/pending-today", dashboardController.getPendingTasksToday);
router.get("/tasks/week", dashboardController.getTasksByWeek);
router.post("/tasks", dashboardController.createTask);
router.put("/tasks/:id", dashboardController.updateTask);
router.delete("/tasks/:id", dashboardController.deleteTask);

module.exports = router;

