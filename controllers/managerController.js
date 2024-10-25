const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function managerLogin (req, res) {
    try {
        res.render('manager/login');
    } catch (error) {
        console.error(error);
    }
}

async function managerReg (req, res) {
    try {
        res.render('manager/register', );
    } catch (error) {
        console.error(error);
    }
}

async function managerRegData (req, res) {
    try {
        const { name, phone, password } = req.body;
        const addManagerData = await prisma.Manager.create({
            data: {
                name: name,
                phone: phone,
                password: password
            }
        });

        console.log('Manager added');
        res.redirect('/manager/');
    } catch (error) {
        console.error(error);
    }
}

async function home(req, res) {
    try {
        const managerData = req.manager;
        const pk = parseInt(managerData.managerId);
        
        const manager = await prisma.Manager.findUnique({
            where: { id: pk },
        });

        res.render('manager/index', { data: manager })
    } catch (error) {
        console.error(error);
    }
}

// handle emp login requests
async function managerLoginProcess (req, res) {
    try {
        const { phone, password } = req.body;
        console.log(`${phone} ${password}`);
        
        const manager = await prisma.Manager.findUnique({
            where: {
                phone: phone
            }
        });

        if (!manager) {
            return res.status(404).json({ message: "Manager not found"});
        }

        let isPassVaild = false;

        if ((manager.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ managerId: manager.id }, CODE, { expiresIn: '1h' });

        res.cookie("managerToken", token, { httpOnly: true });

        res.redirect('/manager/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function managerLogout (req, res) {  
    res.clearCookie('managerToken');
    return res.redirect('/manager/');
}


module.exports = {
    managerLogin, managerReg, managerRegData, managerLoginProcess, managerLogout,
    home,
}