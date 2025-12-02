const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/streak", dashboardController.getStreak);
router.post("/streak/update", dashboardController.updateStreak);

router.get("/milestones", dashboardController.getMilestones);
router.post("/milestones", dashboardController.createMilestone);
router.put("/milestones/:id", dashboardController.updateMilestone);
router.delete("/milestones/:id", dashboardController.deleteMilestone);

router.get("/overview", dashboardController.getOverview);
router.post("/overview", dashboardController.createOverview);
router.put("/overview/:id", dashboardController.updateOverview);
router.delete("/overview/:id", dashboardController.deleteOverview);

router.get("/schedules", dashboardController.getSchedules);
router.post("/schedules", dashboardController.createSchedule);
router.put("/schedules/:id", dashboardController.updateSchedule);
router.delete("/schedules/:id", dashboardController.deleteSchedule);

router.get("/tasks", dashboardController.getTasks);
router.get("/tasks/pending-today", dashboardController.getPendingTasksToday);
router.get("/tasks/week", dashboardController.getTasksByWeek);
router.post("/tasks", dashboardController.createTask);
router.put("/tasks/:id", dashboardController.updateTask);
router.delete("/tasks/:id", dashboardController.deleteTask);

router.get("/deepwork", dashboardController.getDeepWorkStats);
router.post("/deepwork", dashboardController.updateDeepWorkSettings);
router.post("/deepwork/session", dashboardController.logDeepWorkSession);

module.exports = router;

