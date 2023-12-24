const express = require('express')
const app = express()
const port = 2000
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
app.use(express.json())

///connect to Mondodb
const { MongoClient, ServerApiVersion, Admin } = require('mongodb');
const uri = "mongodb+srv://aida:test123@cluster0.bx9feas.mongodb.net/";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
      // Connect the client to the server (optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("ApartmentVisitorManagement").command({ ping: 1 });
      console.log("MongoDB is connected");
    } finally {
      // Ensures that the client will close when you finish/error
      // You should handle the closing of the client here
      // await client.close();
    }
  }
  
  run().catch(console.dir);
  
run().catch(console.dir);

const db = client.db("ApartmentVisitorManagement");
const Visitorregistration = db.collection('Visitor');
const Admin = db.collection('Admin'); // This is the line causing the error
const collectionsecurity = db.collection('Security');


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


//post to register admin,
//post to register admin,
app.post('/registeradmin', (req, res) => {
    let adminData = {
      username: req.body.username,
      password: req.body.password
    }; 
  
    Admin.insertOne(adminData, (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('Admin registered:', result.insertedId);
      res.send('Admin registered successfully!');
    });
  });
  

  //to login admin..
 // Route to login admin
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUser = await Admin.findOne({ username, password }); // Rename variable
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
  

  //to view visitor into database (both admin and security)
app.get('/viewvisitor', (req, res) => 
  {
    Visitorregistration.find().toArray()
      .then(Visitor => {
        res.json(Visitor);
      })
      .catch(error => {
        console.error('Error retrieving visitor information:', error);
        res.status(500).send('An error occurred while retrieving visitor information');
      });
    });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });

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
      username: "syazwinapauzi",
      password: "123456"
    }
  ]
  
