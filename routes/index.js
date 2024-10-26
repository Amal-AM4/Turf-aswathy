const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

var express = require('express');
const adminController = require('../controllers/adminController');
const managerController = require('../controllers/managerController');
const userController = require('../controllers/userController');


const authAdmin = require('../middlewares/authAdmin');
const authManager = require('../middlewares/authManager');
const authUser = require('../middlewares/authUser');

var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  const userToken = req.cookies.userToken;

  if (userToken === undefined) {
    try {
      res.render('index', { userActive: false, });
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      const user = jwt.verify(userToken, CODE);
      const pk = parseInt(user.userId);

      const users = await prisma.User.findFirst({
        where: { id: pk }
      });
  
      res.render('index', { data: users, userActive: true, });
    } catch (error) {
      console.error(error);
    }
  }
});

// Assuming you have a route file or in your main app file
router.get('/search-turf', async (req, res) => {
  const { place } = req.query;

  try {
      const turfs = await prisma.Turf.findMany({
          where: { place: { contains: place, mode: 'insensitive' } },
          include: { turfSchedules: true }
      });
      res.json(turfs);
  } catch (error) {
      console.error("Error fetching turf data:", error);
      res.status(500).json({ error: "Server error" });
  }
});

// router.get('/book-schedule/3/6');

// admin
router.get('/admin/logout', adminController.adminLogout);
router.get('/admin/login', adminController.adminLogin);
router.get('/admin/index',authAdmin, adminController.home);

router.post('/admin/login', adminController.adminLoginProcess);


// manager
router.get('/manager/', managerController.managerLogin);
router.get('/manager/logout', managerController.managerLogout);
router.get('/manager/register', managerController.managerReg);
router.get('/manager/index', authManager, managerController.home);
router.get('/manager/addTurf', authManager, managerController.addTurf);
router.get('/manager/addSchedule/:id', authManager, managerController.addSchedule);

router.post('/manager/register', managerController.managerRegData);
router.post('/manager/login', managerController.managerLoginProcess);
router.post('/manager/addTurf/:mId', managerController.addNewTurf);
router.post('/manager/addSchedule/:id', managerController.addScheduleTime);

// user
router.get('/user/login', userController.login);
router.get('/user/logout', userController.userLogout);
router.get('/user/register', userController.register);
router.get('/user/dashboard', authUser, userController.dashboard);

router.post('/user/register', userController.registerUserData);
router.post('/user/login', userController.userLoginProcess);



module.exports = router;