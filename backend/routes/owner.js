const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendSMS } = require('../config/vonage');
const { sendEmail } = require('../utils/emailService');
const { messaging } = require('firebase-admin');

//random 6 digit code
function generateAccessCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//create new access code
router.post('/createNewAccessCode', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: 'Phone number required' });
        }

        //gen code
        const accessCode = generateAccessCode();
        //save to firebase
        await db.collection('owners').doc(phoneNumber).set({
            phoneNumber: phoneNumber,
            accessCode: accessCode,
            createdAt: new Date()
        });

        //send sms
        const smsResult = await sendSMS(phoneNumber, `Your access code: ${accessCode}`);

        if (!smsResult.success) {
            return res.status(500).json({ success: false, error: 'Failed to send SMS' });
        }

        console.log(`Code sent to ${phoneNumber}`);
        res.json({ success: true, message: 'Access code sent via SMS' });

    } catch (error) {
        console.error('Error creating access code:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//validate access code
router.post('/validateAccessCode', async (req, res) => {
    try {
        const { accessCode, phoneNumber } = req.body;

        if (!accessCode || !phoneNumber) {
            return res.status(400).json({ success: false, error: 'Access code and phoneNumber number required' });
        }

        //get from fb
        const ownerDoc = await db.collection('owners').doc(phoneNumber).get();

        if (!ownerDoc.exists) {
            return res.status(400).json({ success: false, error: 'Phone number not found' });
        }

        const ownerData = ownerDoc.data();

        if (ownerData.accessCode !== accessCode) {
            return res.status(400).json({ success: false, error: 'Invalid access code' });
        }

        //clean up access code after validate
        await db.collection('owners').doc(phoneNumber).update({
            accessCode: '',
            validatedAt: new Date()
        });

        res.json({ success: true });

    } catch (error) {
        console.error(`Auth check failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//create employee
router.post('/createEmployee', async (req, res) => {
    try {
        const { name, email, phoneNumber, role } = req.body;

        if (!name || !email || !phoneNumber || !role) {
            return res.status(400).json({ success: false, error: 'Name, email, phoneNumber number, role required' });
        }

        const employeeId = `emp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        //save to firebase
        await db.collection('employees').doc(employeeId).set({
            id: employeeId,
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            role: role,
            createdAt: new Date(),
            isSetup: false
        });

        //send email with setup link
        const setupLink = `http://localhost:5173/employee/setup?token=${employeeId}`;
        const emailResult = await sendEmail(
            email,
            'Welcome - Setup Your Account',
            `Hi ${name},\n\nPlease setup your account by clicking this link:\n${setupLink}\n\nBest regards,\nTask Management Team`
        );

        if (!emailResult.success) {
            console.warn(`Email failed: ${emailResult.error}`);
            //continue even if email fails
        }

        res.json({ success: true, employeeId: employeeId });

    } catch (error) {
        console.error(`Create failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//get employee by id
router.post('/getEmployee', async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ success: false, error: 'Employee ID required' });
        }
        const employeeDoc = await db.collection('employees').doc(employeeId).get();

        if (!employeeDoc.exists) {
            return res.status(404).json({ success: false, error: 'Employee not found' });
        }

        res.json({ success: true, employee: employeeDoc.data() });

    } catch (error) {
        console.error(`Get failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//edit employee
router.post('/updateEmployee', async (req, res) => {
    try {
        const { employeeId, name, email, phoneNumber, role } = req.body;
        if (!employeeId) {
            return res.status(400).json({ success: false, error: 'need employee ID' });
        }
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (role) updateData.role = role;
        updateData.updatedAt = new Date();

        await db.collection('employees').doc(employeeId).update(updateData);

        res.json({ success: true, message: 'employee updated' });

    } catch (error) {
        console.error(`Update failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
})
//delete employee
router.post('/deleteEmployee', async (req, res) => {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ success: false, error: 'Employee ID required' });
        }

        await db.collection('employees').doc(employeeId).delete();

        res.json({ success: true });

    } catch (error) {
        console.error(`Delete failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

//get all employees, use for owner dashboard
router.get('/getAllEmployees', async (req, res) => {
    try {
        const employeesSnapshot = await db.collection('employees').get();
        const employees = [];

        employeesSnapshot.forEach(doc => {
            employees.push(doc.data());
        });

        res.json({ success: true, employees: employees });

    } catch (error) {
        console.error(`List failed: ${error.message}`);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// create task for employee
router.post('/createTask', async (req, res) => {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title || !assignedTo) {
        return res.json({ error: 'need title and employee' });
    }

    try {
        const taskId = 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

        console.log('creating task:', title);
        console.log('due date received:', dueDate);

        // fix date handling
        let dueDateObj = null;
        if (dueDate) {
            dueDateObj = new Date(dueDate);
            console.log('converted due date:', dueDateObj);
        }

        await db.collection('tasks').doc(taskId).set({
            id: taskId,
            title: title,
            description: description || '',
            assignedTo: assignedTo,
            assignedBy: 'owner',
            status: 'pending',
            createdAt: new Date(),
            dueDate: dueDateObj
        });

        console.log('task created:', taskId);
        res.json({ success: true, taskId: taskId });

    } catch (err) {
        console.log('create task failed:', err);
        res.status(500).json({ error: 'task creation failed' });
    }
});

// get all tasks
router.get('/getAllTasks', async (req, res) => {
    try {
        const snapshot = await db.collection('tasks').get();
        const taskList = [];

        snapshot.forEach(doc => {
            taskList.push(doc.data());
        });

        console.log('found tasks:', taskList.length);
        res.json({ tasks: taskList });

    } catch (error) {
        console.log('get tasks error:', error);
        res.json({ error: 'cant load tasks' });
    }
});

// delete task
router.post('/deleteTask', async (req, res) => {
    const taskId = req.body.taskId;

    if (!taskId) {
        return res.json({ success: false, message: 'no task id' });
    }

    try {
        await db.collection('tasks').doc(taskId).delete();
        console.log('deleted task:', taskId);

        res.json({ success: true });
    } catch (err) {
        console.log('delete task failed:', err);
        res.status(500).json({ success: false, message: 'delete failed' });
    }
});
module.exports = router;