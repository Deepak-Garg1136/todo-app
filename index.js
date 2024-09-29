const fs = require("fs");
const express = require("express");
const session = require("express-session");
const validator = require("validator");
const bcrypt = require("bcrypt");
const multer = require("multer");
const connectDatabase = require("./db");
const db = require("./dbConfig");
const { error } = require("console");
// const { deepStrictEqual } = require("assert");
const app = express();
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Middleware to serve static files from the "public" directory
app.use(express.static("./public"));
app.use(express.static("./uploads"));
// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse form-data request bodies
// app.use(express.urlencoded({ extended: true }));

// Middleware to use sessions
app.use(
  session({
    secret: "secretSessionKey",
    resave: false,
    saveUninitialized: false,
  })
);

const upload = multer({
  dest: "./uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      // return cb(new Error(JSON.stringify("Only.png and.jpg format allowed!")));
    }
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

app.set("view engine", "ejs");

function authMiddleware(req, res, next) {
  if (req.session.is_logged_in) {
    next();
  } else {
    res.redirect("/login");
  }
}
// Middleware to limit the file size
function sizeOfFile(err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({ error: "File size is too large. Max limit is 1MB" });
  } else {
    next();
  }
}

app.post("/uploadFiles", upload.single("file"), sizeOfFile, (req, res) => {
  // console.log(file.mimetype);
  console.log(req.body);
  const updatedValue = req.body;
  if (!req.file) {
    res.status(400).json({ error: "Only .png and .jpeg files are allowed" });
  } else {
    db.Task.findOne({ email: req.session.email })
      .then((user) => {
        if (user) {
          const index = user.userData.findIndex(
            (element) => element.id == updatedValue.listId
          );
          if (index != -1) {
            user.userData[index].src = req.file.filename;
            user.save().then(() => {
              res.send({
                file: req.file.filename,
                task: req.body.task,
                message: "Image uploaded successfully",
              });
            });
            // Above  code can also be written as
            // user.save();
            // res.send({
            //   file: req.file.filename,
            //   task: req.body.task,
            //   message: "Image uploaded successfully",
            // });
          }
        } else {
          res.send({ message: "Internal server error" });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app
  .route("/login")
  .get((req, res) => {
    // console.log(req.session);
    if (req.session.is_logged_in) {
      res.redirect("/home");
      return;
    } else {
      res.sendFile(__dirname + "/public/login.html");
    }
  })
  .post((req, res) => {
    const currdata = req.body;
    // console.log(currdata);
    if (
      currdata.password.trim() === "" ||
      validator.isEmail(currdata.email) === false
    ) {
      res
        .status(400)
        .json({ messageerror: "Please enter the details properly" });
    } else if (!passwordPattern.test(currdata.password)) {
      res.status(400).json({
        messageerror: "weak password",
      });
    } else {
      db.User.findOne({ email: currdata.email })
        .then(async (user) => {
          if (user) {
            console.log(user);
            const passMatch = await bcrypt.compare(
              currdata.password,
              user.password
            );
            if (passMatch) {
              console.log("Login successful");
              req.session.username = user.username;
              req.session.email = currdata.email;
              req.session.is_logged_in = true;
              res.status(200).json({ message: "Login successful" });
            } else {
              res.status(401).json({ messageerror: "Invalid credentials" });
            }
          } else {
            res.status(401).json({ messageerror: "User does not exist" });
          }
          // res.redirect("/home");
        })
        .catch((error) => {
          console.log(error.message);
          res.status(401).json({ messageerror: "Something went wrong" });
        });
    }
  });

app.get("/signup", (req, res) => {
  res.redirect("/");
});
app.post("/signup", async (req, res) => {
  const currdata = req.body;

  if (
    currdata.username.trim() === "" ||
    currdata.password.trim() === "" ||
    !validator.isEmail(currdata.email)
  ) {
    res.status(400).json({ messageerror: "Please enter the details properly" });
  } else {
    if (!passwordPattern.test(currdata.password)) {
      res.status(400).json({
        messageerror:
          "Password must contain at least 8 characters, atleast one uppercase letter, atleast one lowercase letter and one number and special characters",
      });
    } else {
      const saltRounds = 12;
      const hashPass = await bcrypt.hash(currdata.password, saltRounds);
      const newObj = {
        username: currdata.username,
        password: hashPass,
        email: currdata.email,
      };
      db.User.findOne({ email: currdata.email }).then((user) => {
        if (user) {
          res.status(400).json({ messageerror: "Email already exists" });
        } else {
          db.User.create(newObj)
            .then(() => {
              console.log("User added Successfully");
              res.status(200).json({ message: "Registered successful" });
            })
            .catch((e) => {
              console.log(e.message);
              res.status(400).json({ messageerror: "Something went wrong" });
            });
        }
      });
    }
  }
});

app.get("/home", authMiddleware, (req, res) => {
  // if (req.session.is_logged_in) {
  //   res.sendFile(__dirname + "/public/home.html");
  // } else {
  //   res.redirect("/login");
  // }
  console.log(req.session);
  // res.sendFile(__dirname + "/public/home.html");
  res.render("home", {
    username: req.session.username,
  });
});
app.post("/todolist", (req, res) => {
  const task = req.body;
  //   console.log(`Received task: ${task}`);
  //   res.writeHead(400);
  let id = 1;
  db.Task.findOne({ email: req.session.email }).then((user) => {
    if (user) {
      console.log(user.userData, "user mil gaya");
      if (user.userData.length > 0) {
        // INFO :- This if condition is used to handle the senario when we delete all the tasks. in that case length of userData will be zero
        id = user.userData[user.userData.length - 1].id + 1;
      } else {
        id = 1;
      }
      user.userData.push({
        task: task.task,
        id: id,
        // check: task.check,
      });
      user.save().then(() => {
        //res.status(200).json({ message: "Task Added Successfully" });
        console.log("Task Added Successfully");
      });
    } else {
      db.Task.create({
        email: req.session.email,
        userData: [
          {
            task: task.task,
            id: 1,
            // check: task.check,
          },
        ],
      })
        .then(() => {
          console.log("Task added successfully");
        })
        .catch((e) => {
          console.log(e.message);
        });
    }
    console.log("Task added successfully");
    task.id = id;
    res.send(JSON.stringify(task));
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
app.get("/getTasks", (req, res) => {
  db.Task.findOne({ email: req.session.email }).then((user) => {
    if (user) {
      res.send(user.userData);
    } else {
      res.send([]);
    }
  });
});

app.put("/updateCheckValue", (req, res) => {
  const updatedValue = req.body;
  // console.log(updatedValue);
  db.Task.findOne({ email: req.session.email }).then((user) => {
    let index = user.userData.findIndex(
      (element) => element.id == updatedValue.listId
    );
    if (index != -1) {
      if (user.userData[index].check) {
        user.userData[index].check = false;
      } else {
        user.userData[index].check = true;
      }
      user.save().then(() => {
        console.log(user.userData);
        res.send(user.userData);
      });
    }
  });
});

app.delete("/deleteTask", (req, res) => {
  const deleteTask = req.body;
  db.Task.findOne({ email: req.session.email })
    .then((user) => {
      if (user) {
        let index = user.userData.findIndex(
          (element) => element.id == deleteTask.listId
        );

        if (index != -1) {
          user.userData.splice(index, 1);
          user.save().then(() => {
            res.send(JSON.stringify("Task Deleted successfully"));
          });
        }
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.put("/editTask", (req, res) => {
  const editedTask = req.body;
  db.Task.findOne({ email: req.session.email })
    .then((user) => {
      console.log("USER", user);
      if (user) {
        const index = user.userData.findIndex(
          (element) => element.id == editedTask.listId
        );
        console.log(index);
        if (index != -1) {
          user.userData[index].task = editedTask.task;
          user.save().then(() => {
            res.send(user.userData[index]);
          });
        }
      } else {
        res.send(JSON.stringify("User not found"));
      }
    })
    .catch((error) => {
      res.send(error);
    });
});

app.use((req, res) => {
  res.sendFile(__dirname + "/public/404.html");
});

connectDatabase()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(8000, () => {
      console.log("Server is running on port 8000");
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
