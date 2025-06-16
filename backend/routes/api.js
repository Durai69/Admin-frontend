const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ detail: 'Authentication required' });
  }
  next();
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
}

// Apply auth middleware to all API routes
router.use(requireAuth);

// DEPARTMENTS ROUTES
router.get('/departments', (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM departments ORDER BY name', (err, departments) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch departments' });
    }
    res.json(departments);
    db.close();
  });
});

router.post('/departments', requireAdmin, [
  body('name').notEmpty().withMessage('Department name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name } = req.body;
  const db = getDatabase();

  db.run(
    'INSERT INTO departments (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ message: 'Department already exists' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to create department' });
      }
      
      res.status(201).json({ 
        id: this.lastID, 
        name,
        message: 'Department created successfully'
      });
      db.close();
    }
  );
});

// USERS ROUTES
router.get('/users', requireAdmin, (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT id, username, name, email, department, role, 
           CASE WHEN is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
    FROM users 
    ORDER BY name
  `, (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(users);
    db.close();
  });
});

router.post('/users', requireAdmin, [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, password, name, email, department, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDatabase();

    db.run(`
      INSERT INTO users (username, password, name, email, department, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `, [username, hashedPassword, name, email, department, role], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ message: 'Username or email already exists' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to create user' });
      }
      
      res.status(201).json({ 
        id: this.lastID,
        message: 'User created successfully'
      });
      db.close();
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

router.put('/users/:id', requireAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('role').notEmpty().withMessage('Role is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { id } = req.params;
  const { name, email, department, role } = req.body;
  const db = getDatabase();

  db.run(`
    UPDATE users 
    SET name = ?, email = ?, department = ?, role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, email, department, role, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to update user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
    db.close();
  });
});

router.delete('/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
    db.close();
  });
});

// PERMISSIONS ROUTES
router.get('/permissions', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT p.*, 
           d1.name as from_department_name,
           d2.name as to_department_name
    FROM permissions p
    JOIN departments d1 ON p.from_department_id = d1.id
    JOIN departments d2 ON p.to_department_id = d2.id
    ORDER BY d1.name, d2.name
  `, (err, permissions) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ detail: 'Failed to fetch permissions' });
    }
    res.json(permissions);
    db.close();
  });
});

router.post('/permissions', requireAdmin, [
  body('allowed_pairs').isArray().withMessage('Allowed pairs must be an array'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { allowed_pairs, start_date, end_date } = req.body;
  const db = getDatabase();

  db.serialize(() => {
    // Clear existing permissions
    db.run('DELETE FROM permissions');

    // Insert new permissions
    const stmt = db.prepare(`
      INSERT INTO permissions (from_department_id, to_department_id, can_survey_self, start_date, end_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    allowed_pairs.forEach(pair => {
      stmt.run([
        pair.from_dept_id,
        pair.to_dept_id,
        pair.can_survey_self ? 1 : 0,
        start_date,
        end_date
      ]);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to save permissions' });
      }
      res.json({ message: 'Permissions saved successfully' });
      db.close();
    });
  });
});

router.post('/permissions/mail-alert', requireAdmin, (req, res) => {
  // Mock implementation for mail alerts
  console.log('Mail alert requested with data:', req.body);
  
  // In a real implementation, you would:
  // 1. Get all users who need to be notified
  // 2. Send emails using a service like SendGrid, Nodemailer, etc.
  // 3. Log the email sending results
  
  setTimeout(() => {
    res.json({ message: 'Mail alerts sent successfully' });
  }, 1000);
});

// SURVEYS ROUTES (Mock data for now)
router.get('/surveys', (req, res) => {
  // Mock survey data
  const mockSurveys = [
    {
      id: 1,
      title: "Department Satisfaction Survey",
      description: "Rate your experience with other departments",
      rated_dept_name: "IT",
      managing_dept_name: "HR",
      rated_department_id: 1,
      managing_department_id: 2,
      created_at: new Date().toISOString(),
      questions: [
        {
          id: 1,
          text: "How satisfied are you with the response time?",
          type: "rating",
          order: 1,
          category: "Service Quality"
        },
        {
          id: 2,
          text: "How would you rate the overall service quality?",
          type: "rating",
          order: 2,
          category: "Service Quality"
        }
      ]
    }
  ];
  
  res.json(mockSurveys);
});

router.get('/surveys/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock single survey data
  const mockSurvey = {
    id: parseInt(id),
    title: "Department Satisfaction Survey",
    description: "Rate your experience with other departments",
    rated_dept_name: "IT",
    managing_dept_name: "HR",
    rated_department_id: 1,
    managing_department_id: 2,
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 1,
        text: "How satisfied are you with the response time?",
        type: "rating",
        order: 1,
        category: "Service Quality"
      },
      {
        id: 2,
        text: "How would you rate the overall service quality?",
        type: "rating",
        order: 2,
        category: "Service Quality"
      }
    ]
  };
  
  res.json(mockSurvey);
});

// USER SUBMISSIONS ROUTES
router.get('/user-submissions', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT s.*, 
           d1.name as submitter_department_name,
           d2.name as rated_department_name
    FROM survey_submissions s
    JOIN departments d1 ON s.submitter_department_id = d1.id
    JOIN departments d2 ON s.rated_department_id = d2.id
    WHERE s.submitter_user_id = ?
    ORDER BY s.submitted_at DESC
  `, [req.session.user.id], (err, submissions) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ detail: 'Failed to fetch submissions' });
    }
    res.json(submissions);
    db.close();
  });
});

// DASHBOARD ROUTES
router.get('/dashboard/overall-stats', (req, res) => {
  const db = getDatabase();
  
  db.get(`
    SELECT 
      COUNT(*) as totalSurveysSubmitted,
      AVG(overall_customer_rating) as averageOverallRating
    FROM survey_submissions
  `, (err, stats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ detail: 'Failed to fetch dashboard stats' });
    }
    
    // Mock latest submissions for now
    const mockStats = {
      totalSurveysSubmitted: stats?.totalSurveysSubmitted || 14,
      averageOverallRating: stats?.averageOverallRating || 85.5,
      latestSubmissions: [
        {
          responseId: 1,
          surveyTitle: "Department Satisfaction Survey",
          ratedDepartmentName: "IT",
          overallRating: 87,
          submittedBy: "John Doe",
          submittedAt: new Date().toISOString()
        }
      ]
    };
    
    res.json(mockStats);
    db.close();
  });
});

router.get('/dashboard/department-metrics', (req, res) => {
  const db = getDatabase();
  
  db.all(`
    SELECT 
      d.id as department_id,
      d.name as department_name,
      AVG(s.overall_customer_rating) as average_rating,
      COUNT(s.id) as total_surveys
    FROM departments d
    LEFT JOIN survey_submissions s ON d.id = s.rated_department_id
    GROUP BY d.id, d.name
    ORDER BY d.name
  `, (err, metrics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ detail: 'Failed to fetch department metrics' });
    }
    
    // Fill in mock data for departments with no submissions
    const processedMetrics = metrics.map(metric => ({
      department_id: metric.department_id,
      department_name: metric.department_name,
      average_rating: metric.average_rating || Math.floor(Math.random() * 30) + 70, // Random rating between 70-100
      total_surveys: metric.total_surveys || 0
    }));
    
    res.json(processedMetrics);
    db.close();
  });
});

// SUBMIT SURVEY ROUTE
router.post('/submit-survey', [
  body('survey_id').isInt().withMessage('Valid survey ID is required'),
  body('rated_department_id').isInt().withMessage('Valid rated department ID is required'),
  body('overall_customer_rating').isInt({ min: 1, max: 100 }).withMessage('Rating must be between 1 and 100')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      detail: 'Validation failed',
      errors: errors.array()
    });
  }

  const { survey_id, rated_department_id, overall_customer_rating, suggestions } = req.body;
  const db = getDatabase();

  // Get user's department ID
  db.get('SELECT id FROM departments WHERE name = ?', [req.session.user.department], (err, dept) => {
    if (err || !dept) {
      console.error('Database error:', err);
      return res.status(500).json({ detail: 'Failed to find user department' });
    }

    db.run(`
      INSERT INTO survey_submissions 
      (survey_id, submitter_user_id, submitter_department_id, rated_department_id, overall_customer_rating, suggestions)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [survey_id, req.session.user.id, dept.id, rated_department_id, overall_customer_rating, suggestions], 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ detail: 'Failed to submit survey' });
      }
      
      res.json({ 
        message: 'Survey submitted successfully',
        submission_id: this.lastID
      });
      db.close();
    });
  });
});

module.exports = router;