const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');


// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(express.json());

// ... (other imports and configurations)

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Apartment Visitor Management API',
      description: 'API documentation for Apartment Visitor Management',
      version: '1.0.0',
    },
  },
  apis: ['./index.js'], // Update this to match your actual file name
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB
const uri = "mongodb+srv://aida:test123@cluster0.bx9feas.mongodb.net/";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("ApartmentVisitorManagement").command({ ping: 1 });
    console.log("MongoDB is connected");
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
}

run().catch(console.dir);

// async function run() {
//     try {
//       // Connect the client to the server (optional starting in v4.7)
//       await client.connect();
//       // Send a ping to confirm a successful connection
//       await client.db("ApartmentVisitorManagement").command({ ping: 1 });
//       console.log("MongoDB is connected");
//     } finally {
//       // Ensures that the client will close when you finish/error
//       // You should handle the closing of the client here
//       // await client.close();
//     }
//   }
  
//   run().catch(console.dir);
  
// run().catch(console.dir);

const db = client.db("ApartmentVisitorManagement");
const Visitorregistration = db.collection('Visitor');
const adminuser = db.collection('Admin');
const collectionsecurity = db.collection('Security');
const visitorPasses = db.collection('VisitorPass'); // Use the correct collection name

// swagger to register admin


/**
 * @swagger
 * /registeradmin:
 *   post:
 *     summary: Register admin
 *     description: Endpoint to register admin users
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: admins
 *         description: Array of admin objects
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admins registered successfully
 *       500:
 *         description: An error occurred while registering admins
 */
app.post('/registeradmin', (req, res) => {
    const admins = req.body;

    console.log('Received request to register admins:', admins);

    adminuser.insertMany(admins, (err, result) => {
        if (err) {
            console.error('Error inserting admins:', err);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        console.log('Admins registered:', result.insertedIds);
        res.status(201).json({ message: 'Admins registered successfully!' });
    });
});



// // post to register admin
// app.post('/registeradmin', (req, res) => {
//     const admins = req.body;

//     console.log('Received request to register admins:', admins);

//     adminuser.insertMany(admins, (err, result) => {
//         if (err) {
//             console.error('Error inserting admins:', err);
//             res.status(500).send('Internal Server Error');
//             return;
//         }
//         console.log('Admins registered:', result.insertedIds);
//         res.send('Admins registered successfully!');
//     });
// });


// Admin issue visitor pass
app.post('/issuevisitorpass', verifyToken, async (req, res) => {
    const { visitorId, validUntil } = req.body;

    try {
        const db = client.db("ApartmentVisitorManagement");
        const visitorPasses = db.collection('VisitorPass'); // Use the correct collection name

        // Get user information from the token
        const { username } = req.user;
        
        console.log('Issued By:', username);

        const newPass = {
            visitorId,
            issuedBy: username, // Set issuedBy based on the user from the token
            validUntil,
        };

        await visitorPasses.insertOne(newPass);
        res.status(201).json({ message: 'Visitor pass issued successfully' });
    } catch (error) {
        console.error('Issue Pass Error:', error.message);
        res.status(500).json({ error: 'An error occurred while issuing the pass', details: error.message });
    }
});

// Visitor Retrieve Their Pass
app.get('/retrievepass/:visitorId', async (req, res) => {
    const visitorId = req.params.visitorId;
  
    try {
      const db = client.db("ApartmentVisitorManagement");
      const visitorPasses = db.collection('VisitorPass'); // Use the correct collection name
  
      const pass = await visitorPasses.findOne({ visitorId }, { projection: { issuedAt: 0 } });
      // The projection: { issuedAt: 0 } excludes the issuedAt field from the response
  
      if (!pass) {
        return res.status(404).json({ error: 'No pass found for this visitor' });
      }
  
      res.json(pass);
    } catch (error) {
      console.error('Retrieve Pass Error:', error.message);
      res.status(500).json({ error: 'An error occurred while retrieving the pass', details: error.message });
    }
});



//function generate token1 for admin
function generateToken1(adminData)
{
  let token1 = jwt.sign
  (
    adminData,
    'admin',
    {expiresIn: '1h'}
  );
  return token1
}


//function verifytoken1 (admin)
function verifyToken1(req, res, next) {
   let header = req.headers.authorization;
 
   if (!header) {
     return res.status(401).send("Authorization header missing");
   }
 
   let token1 = header.split(' ')[1];
 
   jwt.verify(token1, 'admin', function (err, decoded) {
     if (err) {
       return res.status(403).send("Invalid Token");
     }
 
     req.user = decoded;
     next();
   });
 }

 


  //to login admin..
 // Route to login admin
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUser = await adminuser.findOne({ username, password }); // Rename variable
    if (adminUser) {
      console.log("Login Successful! Admin User:", adminUser);
      let token1 = generateToken1(adminUser);
      console.log("Token sent:", token1);
      res.send(token1);
    } else {
      console.log("Invalid username or password");
      res.send("Invalid username or password");
    }
  });
  

  //to register security (only admin can do it)
  app.post('/registersecurity', verifyToken1, (req, res) => {
    let Security = {
      username: req.body.username,
      password: req.body.password
    }; 
  
    collectionsecurity.insertOne(Security, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      console.log('Security registered');
      res.send('Security registered successfully!');
    })
    console.log('Security registered');
    res.send('Security registered successfully!');
    });


    //to login security..
  app.post('/loginsecurity', async (req, res) => {
    const { username, password } = req.body;
    const user = await collectionsecurity.findOne({ username,password });
    if (user) 
    {

      res.send("Login Succesful!")

    }

    else {
      res.send("Invalid username or password")
    }
  });


  //to register a visitor into mongodb only admin
app.post('/registervisitor', verifyToken1, (req, res) => {

    let visitor = {
      Name: req.body.Name,
      Phone_Number: req.body.Phone_Number,
      Address: req.body.Address,
      Floor_Wing: req.body.Floor_Wing,
      Whom_to_meet: req.body.Whom_to_meet,
      Reason_to_meet: req.body.Reason_to_meet
    }; 
   
    Visitorregistration.insertOne(visitor, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
      }
      else{
      console.log('Visitor registered:', result.insertedId);
      }
      

    });
    res.send('Visitor registered successfully!');
  });
  
// Middleware to verify token
function verifyToken(req, res, next) {
    let header = req.headers.authorization;
  
    if (!header) {
      return res.status(401).send("Authorization header missing");
    }
  
    let token = header.split(' ')[1];
  
    jwt.verify(token, 'admin', function (err, decoded) {
      if (err) {
        return res.status(403).send("Invalid Token");
      }
  
      req.user = decoded;
      next();
    });
  }
// Updated /viewvisitor endpoint
app.get('/viewvisitor', verifyToken, (req, res) => {
    Visitorregistration.find().toArray()
      .then(Visitor => {
        res.json(Visitor);
      })
      .catch(error => {
        console.error('Error retrieving visitor information:', error);
        res.status(500).send('An error occurred while retrieving visitor information');
      });
  });
  const port = 2000; // Declare the port here
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
//    app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
//   });

  app.put('/users/:id', verifyToken1, (req, res) => {
   const userId = req.params.id;
   const visitor = req.body;
 
   Visitorregistration.updateOne({ _id: new ObjectId(userId) }, { $set: visitor }, (err, result) => {
     if (err) {
       console.error('Error updating visitor:', err);
       res.status(500).send('Internal Server Error');
     } else {
       res.send('Visitor updated successfully');
     }
   });
 });
 
// Delete a visitor (admin only)
app.delete('/DeleteVisitor/:id', verifyToken1, (req, res) => {
  const userId = req.params.id;

  Visitorregistration
    .deleteOne({ _id: new ObjectId(userId) })
    .then(() => {
      res.send('Visitor data deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting visit detail:', error);
      res.status(500).send('An error occurred while deleting the visit detail');
    });
});


//database for mainadmin
adminuser
// Example data in the Admin collection
[
    {
      username: "aidazainuddin",
      password: "123456"
    }
  ]
  
