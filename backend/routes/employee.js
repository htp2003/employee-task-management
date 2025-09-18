const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendEmail } = require('../utils/emailService');
const bcrypt = require('bcrypt');

// make code for login
function makeCode() {
    const num = Math.floor(Math.random() * 900000) + 100000;
    return num.toString();
}
// employee login via username/password
router.post('/loginPassword', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, error: 'missing info' });
    }

    try {
        const snapshot = await db.collection('employees')
            .where('username', '==', username)
            .get();

        if (snapshot.empty) {
            return res.json({ success: false, error: 'user not found' });
        }

        const empDoc = snapshot.docs[0];
        const empData = empDoc.data();

        const validPassword = await bcrypt.compare(password, empData.password);
        if (!validPassword) {
            return res.json({ success: false, error: 'wrong password' });
        }

        // login success
        res.json({
            success: true,
            employee: {
                id: empDoc.id,
                name: empData.name,
                email: empData.email,
                username: empData.username,
                role: empData.role
            }
        });
    } catch (err) {
        console.log('loginPassword error:', err);
        res.status(500).json({ success: false, error: 'server error' });
    }
});
// employee login via email
router.post('/loginEmail', async (req, res) => {
    const email = req.body.email;

    if (!email) return res.json({ error: 'need email' });

    try {
        // find employee by email
        const snapshot = await db.collection('employees').where('email', '==', email).get();

        if (snapshot.empty) {
            console.log('employee not found:', email);
            return res.json({ success: false, message: 'not found' });
        }

        const code = makeCode();
        console.log('sending code to:', email);

        // update with access code
        const empDoc = snapshot.docs[0];
        await empDoc.ref.update({
            accessCode: code,
            codeTime: new Date()
        });

        // send email
        const emailText = `Login code: ${code}\nExpires in 10 mins`;
        const result = await sendEmail(email, 'Your Login Code', emailText);

        if (!result.success) {
            console.log('email send failed');
            return res.status(500).json({ error: 'email failed' });
        }

        console.log('login code sent');
        res.json({ success: true });

    } catch (err) {
        console.log('login error:', err);
        res.json({ error: 'server problem' });
    }
});

// check access code
router.post('/validateAccessCode', async (req, res) => {
    const { accessCode, email } = req.body;

    if (!accessCode || !email) {
        return res.status(400).json({ success: false, error: 'missing info' });
    }

    try {
        const snapshot = await db.collection('employees').where('email', '==', email).get();

        if (snapshot.empty) {
            return res.json({ error: 'user not found' });
        }

        const empDoc = snapshot.docs[0];
        const empData = empDoc.data();

        console.log('validating code for:', email);

        if (empData.accessCode !== accessCode) {
            console.log('wrong access code');
            return res.json({ success: false, error: 'invalid code' });
        }

        // clear code after use
        await empDoc.ref.update({
            accessCode: '',
            lastLogin: new Date()
        });

        console.log('employee login success:', empData.name);

        res.json({
            success: true,
            employee: {
                id: empData.id,
                name: empData.name,
                email: empData.email,
                phoneNumber: empData.phoneNumber,
                role: empData.role
            }
        });

    } catch (error) {
        console.log('validate failed:', error);
        res.status(500).json({ success: false, error: 'validation error' });
    }
});

router.post('/verifySetupToken/:token', async (req, res) => {
    const token = req.params.token;
    try {
        const doc = await db.collection('employees').doc(token).get();

        if (!doc.exists) {
            return res.json({ valid: false, error: 'invalid token' })
        }
        const employee = doc.data();

        if (employee.isSetup) {
            return res.json({ valid: false, error: 'account is setup already' })
        }

        res.json({
            valid: true,
            employee: {
                name: employee.name,
                email: employee.email
            }
        })
    } catch (error) {
        return res.json({ valid: false, error: 'server error' })
    }
})

router.post('/setupAccount', async (req, res) => {
    const { token, username, password } = req.body;

    if (!token || !username || !password) return res.json({ success: false, error: 'missing required fields' });

    try {
        const doc = await db.collection('employees').doc(token).get();
        if (!doc.exists) {
            return res.json({ success: false, error: 'invalid token' });
        }

        const usernameCheck = await db.collection('employees').where('username', '==', username).get();
        if (!usernameCheck.empty) {
            return res.json({ success: false, error: 'username already exists' })
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);

        await db.collection('employees').doc(token).update({
            username: username,
            password: hashedPassword,
            isSetup: true,
            setupAt: new Date()
        });

        res.json({ success: true, message: 'account setup complete' })

    } catch (error) {
        return res.status(500).json({ success: false, error: 'server error, setup failed :(' })
    }
})

// get employee profile
router.post('/getProfile', async (req, res) => {
    const empId = req.body.employeeId;

    !empId ? res.json({ error: 'no id' }) : null;

    try {
        const doc = await db.collection('employees').doc(empId).get();

        if (!doc.exists) {
            return res.json({ error: 'profile not found' });
        }

        const data = doc.data();
        res.json({
            profile: {
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                role: data.role,
                id: data.id
            }
        });

    } catch (err) {
        console.log('profile error:', err);
        res.json({ error: 'cant get profile' });
    }
});

// update employee profile
router.post('/updateProfile', async (req, res) => {
    const { employeeId, name, email, phoneNumber } = req.body;

    if (!employeeId) return res.json({ success: false, message: 'need employee id' });

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        updateData.updatedAt = new Date();

        await db.collection('employees').doc(employeeId).update(updateData);

        console.log('profile updated:', employeeId);
        res.json({ success: true, message: 'profile updated' });

    } catch (error) {
        console.log('update failed:', error);
        res.status(500).json({ success: false, error: 'update failed' });
    }
});

// get employee tasks
router.post('/getMyTasks', async (req, res) => {
    const empId = req.body.employeeId;

    if (!empId) return res.json({ error: 'no employee id' });

    try {
        const snapshot = await db.collection('tasks')
            .where('assignedTo', '==', empId)
            .get();

        const tasks = [];
        snapshot.forEach(doc => {
            tasks.push(doc.data());
        });

        console.log('found tasks for emp:', tasks.length);
        res.json({ tasks: tasks });

    } catch (err) {
        console.log('get tasks error:', err);
        res.json({ error: 'cant load tasks' });
    }
});

// update task status
router.post('/updateTaskStatus', async (req, res) => {
    const { taskId, status } = req.body;

    !taskId ? res.json({ error: 'need task id' }) : null;

    try {
        await db.collection('tasks').doc(taskId).update({
            status: status || 'done',
            updatedAt: new Date()
        });

        console.log('task status updated:', taskId);
        res.json({ success: true });

    } catch (error) {
        console.log('task update failed:', error);
        res.status(500).json({ error: 'update failed' });
    }
});

module.exports = router;