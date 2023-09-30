const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import the cors package
const multer = require('multer');

const app = express();
const port = 3000;

// Replace these with your own secret key and user data
const secretKey = 'your-secret-key';
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  },
  // Add more user data as needed
];

app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Define a route for handling user authentication
app.post('/api/signIn', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email and password (you should use a secure authentication method in production)
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Generate an access token for the user
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    secretKey,
    { expiresIn: '1m' } // You can adjust the token expiration time
  );

  // Return the access token and user data
  res.json({ accessToken, user });
  console.log(`res sign`,accessToken, user);

});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }

  jwt.verify(token.replace('Bearer ', ''), secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }
    req.user = decoded; // Stockez les informations de l'utilisateur dans req.user
    next();
  });
}
const produits = [
  { id: 1, nom: 'Produit 1', prix: 10 },
  { id: 2, nom: 'Produit 2', prix: 20 },
  { id: 3, nom: 'Produit 3', prix: 30 },
];

const employees = require('./employees.json');


// Endpoint to retrieve paginated employee data
app.get('/api/employees', (req, res) => {
  const page = parseInt(req.query.page || 1);
  const perPage = parseInt(req.query.per_page || 10);

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedEmployees = employees.slice(startIndex, endIndex);


  const response = {
    data: paginatedEmployees,
    page: page,
    per_page: perPage,
    total: employees.length,
    total_pages: Math.ceil(employees.length / perPage),
  };
  console.log(`res`,response);

  res.json(response);
});

app.post('/api/sign-in-with-token', (req, res) => {
  const { accessToken } = req.body;

  try {
    // Verify the access token using your secret key
    const decoded = jwt.verify(accessToken, secretKey);

    // You can perform additional checks and validation here if needed.

    // Assuming the token is valid, you can send a success response.
    res.json({ accessToken, user: decoded });

  } catch (error) {
    // If the token is invalid or has expired, return an error response.
    res.status(401).json({ message: 'Authentication failed' });
  }
});




// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a route to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  console.log('req image:', req.file);
  // Access the uploaded image data from req.file
  const imageBuffer = req.file.buffer;
  console.log('Received an image:', imageBuffer);

  res.status(200).json({ message: 'Image uploaded successfully.' });
});





const employee = [
  { _id: 1, name: 'Employee 1',tech:'tech 1',sub:'sub 1' },
  { _id: 2, name: 'Employee 2' ,tech:'tech 2',sub:'sub 2'},
  { _id: 3, name: 'Employee 3',tech:'tech 3',sub:'sub 3' },
  { _id: 4, name: 'Employee 3',tech:'tech 3',sub:'sub 3' },
  { _id: 5, name: 'Employee 3',tech:'tech 3',sub:'sub 3' },
  { _id: 6, name: 'Employee 3',tech:'tech 3',sub:'sub 3' },
  { _id: 7, name: 'Employee 3',tech:'tech 3',sub:'sub 3' },

  // Add more employees as needed
];

// Define the route to get the list of employees
app.get('/aliens', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
console.log(req.query)
  // Calculate the startIndex and endIndex based on the requested page and limit
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Slice the employees array to get the requested page of employees
  const pageEmployees = employee.slice(startIndex, endIndex);

  res.json({
    page: page,
    limit: limit,
    total: employee.length,
    data: pageEmployees,
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
