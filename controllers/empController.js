const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function empLogin (req, res) {
    res.render('emp/login');
}

async function empReg (req, res) {
    try {
        const category = await prisma.JobCategory.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
        res.render('emp/register', { data: category });
    } catch (error) {
        console.error(error);
    }
}

async function empRegData (req, res) {
    try {
        const { name, phone, category, exp, edu, addr, place, password } = req.body;
        const addEmpData = await prisma.Employee.create({
            data: {
                name: name,
                phone: phone,
                expertiseId: parseInt(category),
                experience: parseInt(exp),
                education: edu,
                address: addr,
                place: place,
                password: password
            }
        });

        console.log('Employee added');
        res.redirect('/emp/login');
    } catch (error) {
        console.error(error);
    }
}

async function home(req, res) {
    try {
        const empData = req.emp;
        const pk = empData.empId;
        console.log(empData);
        
        // Fetch employee details along with their associated job category
        const emp = await prisma.employee.findUnique({
            where: { id: pk },
            include: {
                expertise: true // This will include the associated JobCategory
            }
        });

        res.render('emp/index', { data: emp })
    } catch (error) {
        console.error(error);
    }
}

// handle emp login requests
async function empLoginProcess (req, res) {
    try {
        const { phone, password } = req.body;
        console.log(`${phone} ${password}`);
        
        const emp = await prisma.Employee.findUnique({
            where: {
                phone: phone
            }
        });

        if (!emp) {
            return res.status(404).json({ message: "Emp not found"});
        }

        let isPassVaild = false;

        if ((emp.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ empId: emp.id }, CODE, { expiresIn: '1h' });

        res.cookie("empToken", token, { httpOnly: true });

        res.redirect('/emp/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function empLogout (req, res) {  
    res.clearCookie('empToken');
    return res.redirect('/emp/login');
}


module.exports = {
    empLogin, empReg, empRegData, empLoginProcess, empLogout,
    home,
}