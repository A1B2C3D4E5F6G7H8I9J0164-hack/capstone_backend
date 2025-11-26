const User = require("../models/User");
const Milestone = require("../models/Milestone");
const Overview = require("../models/Overview");
const Schedule = require("../models/Schedule");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

// Helper function to get user from token
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

// Update streak when user opens/edits something
exports.updateStreak = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newCurrentStreak = user.currentStreak || 0;
    let newMaxStreak = user.maxStreak || 0;

    // If no previous activity or last activity was yesterday, increment streak
    if (!user.lastActivityDate || user.lastActivityDate === yesterdayStr) {
      newCurrentStreak = (user.currentStreak || 0) + 1;
      newMaxStreak = newCurrentStreak > (user.maxStreak || 0) ? newCurrentStreak : (user.maxStreak || 0);
    } else if (user.lastActivityDate !== today) {
      // If last activity was not today or yesterday, reset streak to 1
      newCurrentStreak = 1;
      newMaxStreak = newCurrentStreak > (user.maxStreak || 0) ? newCurrentStreak : (user.maxStreak || 0);
    }
    // If last activity was today, don't increment (already counted)

    user.currentStreak = newCurrentStreak;
    user.maxStreak = newMaxStreak;
    user.lastActivityDate = today;
    await user.save();

    res.json({
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastActivityDate: user.lastActivityDate,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get streak data
exports.getStreak = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("currentStreak maxStreak lastActivityDate");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      currentStreak: user.currentStreak || 0,
      maxStreak: user.maxStreak || 0,
      lastActivityDate: user.lastActivityDate || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Milestones CRUD
exports.getMilestones = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const milestones = await Milestone.find({ userId }).sort({ createdAt: -1 });
    res.json(milestones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMilestone = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, detail, state } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const milestone = new Milestone({
      userId,
      title,
      detail: detail || "Details coming soon",
      state: state || "Planned",
    });

    await milestone.save();
    res.status(201).json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, detail, state } = req.body;

    const milestone = await Milestone.findOne({ _id: id, userId });
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    if (title) milestone.title = title;
    if (detail !== undefined) milestone.detail = detail;
    if (state) milestone.state = state;

    await milestone.save();
    res.json(milestone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMilestone = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const milestone = await Milestone.findOneAndDelete({ _id: id, userId });
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    res.json({ message: "Milestone deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Overview CRUD
exports.getOverview = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const overviews = await Overview.find({ userId }).sort({ createdAt: -1 });
    res.json(overviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createOverview = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { label, value } = req.body;
    if (!label || !value) {
      return res.status(400).json({ message: "Label and value are required" });
    }

    const overview = new Overview({
      userId,
      label,
      value,
    });

    await overview.save();
    res.status(201).json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOverview = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { label, value } = req.body;

    const overview = await Overview.findOne({ _id: id, userId });
    if (!overview) {
      return res.status(404).json({ message: "Overview item not found" });
    }

    if (label) overview.label = label;
    if (value) overview.value = value;

    await overview.save();
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOverview = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const overview = await Overview.findOneAndDelete({ _id: id, userId });
    if (!overview) {
      return res.status(404).json({ message: "Overview item not found" });
    }

    res.json({ message: "Overview item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Schedules CRUD
exports.getSchedules = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { date } = req.query;
    let query = { userId };
    
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(query).sort({ date: 1, createdAt: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, time, detail, date } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const schedule = new Schedule({
      userId,
      title,
      time: time || "Custom",
      detail: detail || "Tap to edit details",
      date: date ? new Date(date) : new Date(),
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, time, detail, date } = req.body;

    const schedule = await Schedule.findOne({ _id: id, userId });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (title) schedule.title = title;
    if (time) schedule.time = time;
    if (detail !== undefined) schedule.detail = detail;
    if (date) schedule.date = new Date(date);

    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const schedule = await Schedule.findOneAndDelete({ _id: id, userId });
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tasks CRUD
exports.getTasks = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, dueDate } = req.query;
    let query = { userId };
    
    if (status) {
      query.status = status;
    }
    
    if (dueDate) {
      const targetDate = new Date(dueDate);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingTasksToday = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const pendingTasks = await Task.find({
      userId,
      status: { $in: ["pending", "in-progress"] },
      dueDate: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ dueDate: 1 });

    res.json({
      count: pendingTasks.length,
      tasks: pendingTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, dueDate, status, priority } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const task = new Task({
      userId,
      title,
      description: description || "",
      dueDate: new Date(dueDate),
      status: status || "pending",
      priority: priority || "medium",
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, description, dueDate, status, priority } = req.body;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (status) task.status = status;
    if (priority) task.priority = priority;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

