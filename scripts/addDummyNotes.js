require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone';

const dummyNotes = [
  {
    title: "Introduction to Machine Learning",
    content: "Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. The main types include supervised learning, unsupervised learning, and reinforcement learning. Key algorithms include linear regression, decision trees, neural networks, and support vector machines.",
    subject: "Computer Science",
    tags: ["AI", "ML", "algorithms"]
  },
  {
    title: "React Hooks Best Practices",
    content: "React Hooks revolutionized functional components by allowing state and lifecycle features. Key hooks include useState for state management, useEffect for side effects, useContext for context API, and useCallback/useMemo for performance optimization. Always follow the rules of hooks: only call them at the top level and from React functions.",
    subject: "Web Development",
    tags: ["React", "JavaScript", "frontend"]
  },
  {
    title: "Data Structures Overview",
    content: "Essential data structures include arrays (fixed-size, indexed collections), linked lists (dynamic node-based structures), stacks (LIFO operations), queues (FIFO operations), trees (hierarchical data), graphs (network data), and hash tables (key-value pairs with O(1) average lookup time). Each has specific use cases and performance characteristics.",
    subject: "Computer Science",
    tags: ["algorithms", "programming", "data structures"]
  },
  {
    title: "JavaScript ES6+ Features",
    content: "Modern JavaScript features include arrow functions, template literals, destructuring, spread/rest operators, async/await, Promises, modules, classes, and enhanced object literals. These features make code more concise and readable. Async/await simplifies asynchronous code compared to callback chains.",
    subject: "Programming",
    tags: ["JavaScript", "ES6", "web development"]
  },
  {
    title: "Database Design Principles",
    content: "Good database design follows normalization principles to reduce redundancy and improve data integrity. Key concepts include primary keys, foreign keys, relationships (one-to-one, one-to-many, many-to-many), indexes for performance, and proper data types. NoSQL databases offer flexibility for unstructured data.",
    subject: "Database",
    tags: ["SQL", "database", "design"]
  },
  {
    title: "Web Security Fundamentals",
    content: "Essential security practices include HTTPS encryption, input validation, SQL injection prevention, XSS protection, CSRF tokens, secure authentication (JWT, OAuth), password hashing (bcrypt), and proper CORS configuration. Never trust client-side input and always sanitize data on the server.",
    subject: "Security",
    tags: ["security", "web", "authentication"]
  },
  {
    title: "Git Version Control",
    content: "Git is a distributed version control system. Essential commands: git init, git add, git commit, git push, git pull, git branch, git merge, git rebase. Best practices include meaningful commit messages, regular commits, branching strategies (GitFlow), and code reviews through pull requests.",
    subject: "Development Tools",
    tags: ["Git", "version control", "collaboration"]
  },
  {
    title: "API Design REST Principles",
    content: "RESTful APIs should use HTTP methods correctly (GET, POST, PUT, DELETE), follow proper URL structure, use appropriate status codes, implement authentication/authorization, include error handling, and provide documentation. Version your APIs and consider rate limiting for production use.",
    subject: "Web Development",
    tags: ["API", "REST", "backend"]
  },
  {
    title: "CSS Grid and Flexbox",
    content: "CSS Grid is perfect for two-dimensional layouts while Flexbox excels at one-dimensional layouts. Grid uses grid-template-columns, grid-template-rows, and grid-gap. Flexbox uses display: flex, justify-content, align-items, and flex-direction. They can be combined for complex layouts.",
    subject: "Web Design",
    tags: ["CSS", "layout", "frontend"]
  },
  {
    title: "Node.js Architecture",
    content: "Node.js uses event-driven, non-blocking I/O with V8 JavaScript engine. Key features include the event loop, callback patterns, streams, buffers, and the module system (CommonJS). Popular frameworks include Express.js for web servers and npm for package management.",
    subject: "Backend",
    tags: ["Node.js", "JavaScript", "server"]
  },
  {
    title: "Python Data Analysis",
    content: "Python data analysis ecosystem includes NumPy for numerical computing, Pandas for data manipulation, Matplotlib/Seaborn for visualization, and Scikit-learn for machine learning. Key operations include data cleaning, transformation, aggregation, and statistical analysis.",
    subject: "Data Science",
    tags: ["Python", "data analysis", "statistics"]
  },
  {
    title: "Cloud Computing Basics",
    content: "Cloud computing offers on-demand computing resources with models: IaaS (virtual machines), PaaS (platform services), SaaS (applications). Major providers include AWS, Azure, and Google Cloud. Key services include compute, storage, databases, networking, and serverless functions.",
    subject: "Cloud Computing",
    tags: ["AWS", "cloud", "infrastructure"]
  },
  {
    title: "Mobile App Development",
    content: "Mobile development approaches include native (iOS Swift, Android Kotlin), cross-platform (React Native, Flutter), and hybrid (Ionic, Cordova). Consider platform guidelines, responsive design, offline functionality, push notifications, and app store optimization.",
    subject: "Mobile Development",
    tags: ["mobile", "iOS", "Android"]
  },
  {
    title: "DevOps Practices",
    content: "DevOps combines development and operations with practices like CI/CD pipelines, infrastructure as code, containerization (Docker, Kubernetes), monitoring, logging, and automated testing. Tools include Jenkins, GitHub Actions, Terraform, and Prometheus.",
    subject: "DevOps",
    tags: ["CI/CD", "Docker", "automation"]
  },
  {
    title: "UI/UX Design Principles",
    content: "Good design focuses on user needs with principles like consistency, feedback, simplicity, accessibility, and visual hierarchy. Key elements include color theory, typography, spacing, navigation patterns, and responsive design. Always test with real users and iterate based on feedback.",
    subject: "Design",
    tags: ["UI", "UX", "design principles"]
  }
];

async function addDummyNotes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an existing user or create a test user
    let user = await User.findOne();
    if (!user) {
      // Create a test user if none exists
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123' // In production, this should be hashed
      });
      await user.save();
      console.log('Created test user');
    }
    
    console.log(`Using user: ${user.name} (${user.email})`);
    
    // Check if notes already exist for this user
    const existingNotesCount = await Note.countDocuments({ userId: user._id });
    if (existingNotesCount > 0) {
      console.log(`User already has ${existingNotesCount} notes. Skipping dummy data creation.`);
      return;
    }
    
    console.log('Adding dummy notes...');
    
    for (const noteData of dummyNotes) {
      const note = new Note({
        userId: user._id,
        ...noteData
      });
      await note.save();
      console.log(`Added note: ${noteData.title}`);
    }
    
    console.log(`Successfully added ${dummyNotes.length} dummy notes`);
    
  } catch (error) {
    console.error('Error adding dummy notes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Check if this file is run directly
if (require.main === module) {
  addDummyNotes();
}

module.exports = addDummyNotes;
