const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { sendEmail } = require('../utils/emailService');

// make code for login
function makeCode() {
    const num = Math.floor(Math.random() * 900000) + 100000;
    return num.toString();
}

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
                dept: empData.department
            }
        });

    } catch (error) {
        console.log('validate failed:', error);
        res.status(500).json({ success: false, error: 'validation error' });
    }
});

// get employee profile (bonus route for frontend)
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
                department: data.department,
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
    const { employeeId, name, email, department } = req.body;

    if (!employeeId) return res.json({ success: false, message: 'need employee id' });

    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (department) updateData.department = department;
        updateData.updatedAt = new Date();

        await db.collection('employees').doc(employeeId).update(updateData);

        console.log('profile updated:', employeeId);
        res.json({ success: true, message: 'profile updated' });

    } catch (error) {
        console.log('update failed:', error);
        res.status(500).json({ success: false, error: 'update failed' });
    }
});

module.exports = router;