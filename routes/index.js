var express = require('express');
var router = express.Router();

const nodemailer = require("nodemailer");

const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const passport = require("passport");
// const LocalStrategy = require("passport-local");

const fs = require("fs");
const path = require("path");
const upload = require("./multer");

passport.use(User.createStrategy());

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: "Homepage" });
});
//  ---------signup----------
router.get('/signup', function (req, res, next) {
  res.render('signup', { title: "Sign-Up" });
});
router.post('/signup', function (req, res, next) {
  const { name, username, email, password } = req.body;
  User.register({ name, username, email }, password)
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => res.send(err));
});

//  ---------------------login-----------
router.get('/login', function (req, res, next) {
  res.render('login', { title: "Log-In" });
});
router.post('/login', passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
}), function (req, res, next) {
});
// --------------profile-----------
router.get("/profile", isLoggedIn, function (req, res, next) {
  res.render("profile", { title: "Profile", user: req.user });
});

router.post("/profile", upload.single("avatar"), function (req, res, next) {
  const updatedUser = {
    about: req.body.about,
  };
  if (req.file) {
    if (req.body.oldavatar !== "dummy.png") {
      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          req.body.oldavatar
        )
      );
    }

    updatedUser.avatar = req.file.filename;
  }

  User.findByIdAndUpdate(req.user._id, updatedUser)
    .then(() => {
      res.redirect("/profile");
    })
    .catch((err) => res.send(err));
});

//  ------------settings---------
router.get("/settings", isLoggedIn, function (req, res, next) {
  res.render("settings", { title: "Settings", user: req.user });
});

router.post("/settings", isLoggedIn, function (req, res, next) {
  User.findByIdAndUpdate(req.user._id, req.body)
    .then(() => {
      res.redirect("/settings");
    })
    .catch((err) => res.send(err));
});
// ----------reset-------
router.get("/reset-password", isLoggedIn, function (req, res, next) {
  res.render("reset", { title: "Reset Password", user: req.user });
});

router.post("/reset-password", isLoggedIn, function (req, res, next) {
  req.user.changepassword(
    req.body.oldpassword,
    req.body.newpassword,
    function (err) {
      if (err) return res.send(err);
      res.redirect("/signout");
    }
  );
});

//  -------------forget-password---------------
router.get("/forget", function (req, res, next) {
  res.render("forget");
});

router.post("/forget-password", function (req, res, next) {
  User.findOne({"_id":req.body.id}).then((data)=>{
    console.log(data)
    data.otp = "value assign krdena"
    data.save()
  })
  
  //send email

  res.redirect("/login");
});

//  -------------delete-----------
router.get("/delete", isLoggedIn, function (req, res, next) {
  User.findByIdAndDelete(req.user._id).then(() => {
    res.redirect('/signout')
  }).catch(err => {
    res.send(err)
  })
});
//  ---------changepassword------------
router.get("/change-password/:id", function (req, res, next) {
  res.render("changepassword", { id: req.params.id });
});

// router.post("/change-password/:id", function (req, res) {
//     User.findById(req.params.id)
//         .then((user) => {
//             if (user.resetPasswordToken === 1) {
//                 user.setPassword(req.body.password, function (err) {
//                     if (err) return res.send(err);
//                     user.resetPasswordToken = 0;
//                     user.save();
//                     res.redirect("/signout");
//                 });
//             } else {
//                 res.send(
//                     "Link Expired! <a href='/forget-password'>Try Again.</a>"
//                 );
//             }
//         })
//         .catch((err) => res.send(err));
// });

// --------------home-----------
router.get('/home', isLoggedIn, function (req, res, next) {
  res.render('home', { title: "Home" });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}
                // -------signout----------
router.get("/signout", function (req, res, next) {
  req.logout(function () {
      res.redirect("/login");
  });
});

// -------------stories-----------
router.get('/stories', isLoggedIn, function (req, res, next) {
  res.render('stories', { title: "Stories" });
});
// -------------camera-----------
router.get('/camera', isLoggedIn, function (req, res, next) {
  res.render('camera', { title: "Camera" });
});
// -------------map-----------
router.get('/map', isLoggedIn, function (req, res, next) {
  res.render('map', { title: "Map" });
});
//  ---------write--------
router.get("/write", function (req, res, next) {
  res.render("write", { title: "Write-Blog" });
});
router.post("/uploadFile", upload.single("avatar"), function (req, res, next) {
  res.json({
    success: 1,
    file: {
      url: "http://localhost:3000/uploads/" + req.file.filename,
    },
  });
});

module.exports = router;
