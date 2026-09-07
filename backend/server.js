const express = require("express");
const oracledb = require("oracledb");
const path = require("path");

/* oracle database configuration */

const dbConfig = {
    user: "hostel_db",
    password: "hostel123",
    connectString: "localhost:1521/xepdb1"
};

/* database helper functions */

async function runQuery(sql) {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            sql,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows.map(row => {
            const newRow = {};

            for (const key in row) {
                newRow[key.toLowerCase()] = row[key];
            }

            return newRow;
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function executeQuery(sql, binds) {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            sql,
            binds,
            { autoCommit: true }
        );

    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

/* express and static frontend setup */

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

/* page routes */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/students", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/students.html"));
});

app.get("/student-phones", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/student-phones.html"));
});

app.get("/hostels", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/hostels.html"));
});

app.get("/rooms", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/rooms.html"));
});

app.get("/room-types", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/room-types.html"));
});

app.get("/mess", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/mess.html"));
});

app.get("/mess-contacts", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/mess-contacts.html"));
});

app.get("/meals", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/meals.html"));
});

app.get("/staff", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/staff.html"));
});

app.get("/staff-phones", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/staff-phones.html"));
});

app.get("/wardens", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/wardens.html"));
});

app.get("/warden-phones", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/warden-phones.html"));
});

app.get("/suppliers", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/suppliers.html"));
});

app.get("/supplier-phones", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/supplier-phones.html"));
});

app.get("/inventory", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/inventory.html"));
});

app.get("/procures", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/procures.html"));
});

app.get("/payments", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/payments.html"));
});

app.get("/payment-details", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/payment-details.html"));
});

app.get("/reports", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/reports.html"));
});

app.get("/queries", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/queries.html"));
});

/* dashboard */

app.get("/api/dashboard", async (req, res) => {
    try {
        const rows = await runQuery(`
            select
                (select count(*) from student) as students,
                (select count(*) from hostel) as hostels,
                (select count(*) from room) as rooms,
                (select count(*) from mess) as mess,
                (select count(*) from payment) as payments,
                (select count(*) from staff) as staff,
                (select count(*) from room_type) as roomtypes,
                (select count(*) from meal) as meals,
                (select count(*) from warden) as wardens,
                (select count(*) from supplier) as suppliers,
                (select count(*) from inventory_item) as inventory,
                (select count(*) from student_phone) as studentphones,
                (select count(*) from mess_contact) as messcontacts,
                (select count(*) from staff_phone) as staffphones,
                (select count(*) from warden_phone) as wardenphones,
                (select count(*) from supplier_phone) as supplierphones,
                (select count(*) from procures) as procures,
                (select count(*) from payment_detail) as paymentdetails
            from dual
        `);

        res.json(rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "dashboard query failed" });
    }
});
/* student */

app.get("/api/students", async (req, res) => {
    try {
        const rows = await runQuery(`
            select studentid, studentname, gender, dob, email,
                   bloodgroup, mealplan, foodpreference,
                   guardianid, roomid, messid
            from student
            order by studentid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "student query failed",
            details: err.message
        });
    }
});

app.post("/api/students", async (req, res) => {
    try {
        const {
            studentid,
            studentname,
            gender,
            dob,
            email,
            bloodgroup,
            mealplan,
            foodpreference,
            guardianid,
            roomid,
            messid
        } = req.body;

        await executeQuery(
            `insert into student
            (studentid, studentname, gender, dob, email, bloodgroup,
             mealplan, foodpreference, guardianid, roomid, messid)
            values
            (:studentid, :studentname, :gender, to_date(:dob, 'yyyy-mm-dd'),
             :email, :bloodgroup, :mealplan, :foodpreference,
             :guardianid, :roomid, :messid)`,
            {
                studentid,
                studentname,
                gender,
                dob,
                email,
                bloodgroup,
                mealplan,
                foodpreference,
                guardianid: guardianid || null,
                roomid: roomid || null,
                messid: messid || null
            }
        );

        res.json({ message: "student added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add student",
            details: err.message
        });
    }
});

app.put("/api/students/:id", async (req, res) => {
    try {
        const {
            studentname,
            gender,
            dob,
            email,
            bloodgroup,
            mealplan,
            foodpreference,
            guardianid,
            roomid,
            messid
        } = req.body;

        await executeQuery(
            `update student
             set studentname = :studentname,
                 gender = :gender,
                 dob = to_date(:dob, 'yyyy-mm-dd'),
                 email = :email,
                 bloodgroup = :bloodgroup,
                 mealplan = :mealplan,
                 foodpreference = :foodpreference,
                 guardianid = :guardianid,
                 roomid = :roomid,
                 messid = :messid
             where studentid = :studentid`,
            {
                studentid: req.params.id,
                studentname,
                gender,
                dob,
                email,
                bloodgroup,
                mealplan,
                foodpreference,
                guardianid: guardianid || null,
                roomid: roomid || null,
                messid: messid || null
            }
        );

        res.json({ message: "student updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update student",
            details: err.message
        });
    }
});

app.delete("/api/students/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from student
             where studentid = :studentid`,
            {
                studentid: req.params.id
            }
        );

        res.json({ message: "student deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete student",
            details: err.message
        });
    }
});

/* student phone */

app.get("/api/student-phones", async (req, res) => {
    try {
        const rows = await runQuery(`
            select studentid, phoneno
            from student_phone
            order by studentid, phoneno
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "student phone query failed",
            details: err.message
        });
    }
});

app.post("/api/student-phones", async (req, res) => {
    try {
        const {
            studentid,
            phoneno
        } = req.body;

        await executeQuery(
            `insert into student_phone
            (studentid, phoneno)
            values
            (:studentid, :phoneno)`,
            {
                studentid,
                phoneno
            }
        );

        res.json({ message: "student phone added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add student phone",
            details: err.message
        });
    }
});

app.put("/api/student-phones/:studentid/:phoneno", async (req, res) => {
    try {
        const {
            newphoneno
        } = req.body;

        await executeQuery(
            `update student_phone
             set phoneno = :newphoneno
             where studentid = :studentid
             and phoneno = :phoneno`,
            {
                studentid: req.params.studentid,
                phoneno: req.params.phoneno,
                newphoneno
            }
        );

        res.json({ message: "student phone updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update student phone",
            details: err.message
        });
    }
});

app.delete("/api/student-phones/:studentid/:phoneno", async (req, res) => {
    try {
        await executeQuery(
            `delete from student_phone
             where studentid = :studentid
             and phoneno = :phoneno`,
            {
                studentid: req.params.studentid,
                phoneno: req.params.phoneno
            }
        );

        res.json({ message: "student phone deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete student phone",
            details: err.message
        });
    }
});
/* hostel */

app.get("/api/hostels", async (req, res) => {
    try {
        const rows = await runQuery(`
            select hostelid, hostelname, capacity, wardenid
            from hostel
            order by hostelid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "hostel query failed",
            details: err.message
        });
    }
});

app.post("/api/hostels", async (req, res) => {
    try {
        const {
            hostelid,
            hostelname,
            capacity,
            wardenid
        } = req.body;

        await executeQuery(
            `insert into hostel
            (hostelid, hostelname, capacity, wardenid)
            values
            (:hostelid, :hostelname, :capacity, :wardenid)`,
            {
                hostelid,
                hostelname,
                capacity,
                wardenid: wardenid || null
            }
        );

        res.json({ message: "hostel added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add hostel",
            details: err.message
        });
    }
});

app.put("/api/hostels/:id", async (req, res) => {
    try {
        const {
            hostelname,
            capacity,
            wardenid
        } = req.body;

        await executeQuery(
            `update hostel
             set hostelname = :hostelname,
                 capacity = :capacity,
                 wardenid = :wardenid
             where hostelid = :hostelid`,
            {
                hostelid: req.params.id,
                hostelname,
                capacity,
                wardenid: wardenid || null
            }
        );

        res.json({ message: "hostel updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update hostel",
            details: err.message
        });
    }
});

app.delete("/api/hostels/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from hostel
             where hostelid = :hostelid`,
            {
                hostelid: req.params.id
            }
        );

        res.json({ message: "hostel deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete hostel",
            details: err.message
        });
    }
});

/* room type */

app.get("/api/room-types", async (req, res) => {
    try {
        const rows = await runQuery(`
            select typeid, typename, ac_type, capacity
            from room_type
            order by typeid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "room type query failed",
            details: err.message
        });
    }
});

app.post("/api/room-types", async (req, res) => {
    try {
        const {
            typeid,
            typename,
            ac_type,
            capacity
        } = req.body;

        await executeQuery(
            `insert into room_type
            (typeid, typename, ac_type, capacity)
            values
            (:typeid, :typename, :ac_type, :capacity)`,
            {
                typeid,
                typename,
                ac_type,
                capacity
            }
        );

        res.json({ message: "room type added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add room type",
            details: err.message
        });
    }
});

app.put("/api/room-types/:id", async (req, res) => {
    try {
        const {
            typename,
            ac_type,
            capacity
        } = req.body;

        await executeQuery(
            `update room_type
             set typename = :typename,
                 ac_type = :ac_type,
                 capacity = :capacity
             where typeid = :typeid`,
            {
                typeid: req.params.id,
                typename,
                ac_type,
                capacity
            }
        );

        res.json({ message: "room type updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update room type",
            details: err.message
        });
    }
});

app.delete("/api/room-types/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from room_type
             where typeid = :typeid`,
            {
                typeid: req.params.id
            }
        );

        res.json({ message: "room type deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete room type",
            details: err.message
        });
    }
});

/* room */

app.get("/api/rooms", async (req, res) => {
    try {
        const rows = await runQuery(`
            select roomid, floorno, typeid, roomrent, hostelid
            from room
            order by roomid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "room query failed",
            details: err.message
        });
    }
});

app.post("/api/rooms", async (req, res) => {
    try {
        const {
            roomid,
            floorno,
            typeid,
            roomrent,
            hostelid
        } = req.body;

        await executeQuery(
            `insert into room
            (roomid, floorno, typeid, roomrent, hostelid)
            values
            (:roomid, :floorno, :typeid, :roomrent, :hostelid)`,
            {
                roomid,
                floorno,
                typeid,
                roomrent,
                hostelid
            }
        );

        res.json({ message: "room added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add room",
            details: err.message
        });
    }
});

app.put("/api/rooms/:id", async (req, res) => {
    try {
        const {
            floorno,
            typeid,
            roomrent,
            hostelid
        } = req.body;

        await executeQuery(
            `update room
             set floorno = :floorno,
                 typeid = :typeid,
                 roomrent = :roomrent,
                 hostelid = :hostelid
             where roomid = :roomid`,
            {
                roomid: req.params.id,
                floorno,
                typeid,
                roomrent,
                hostelid
            }
        );

        res.json({ message: "room updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update room",
            details: err.message
        });
    }
});

app.delete("/api/rooms/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from room
             where roomid = :roomid`,
            {
                roomid: req.params.id
            }
        );

        res.json({ message: "room deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete room",
            details: err.message
        });
    }
});
/* mess */

app.get("/api/mess", async (req, res) => {
    try {
        const rows = await runQuery(`
            select messid, messname, messtype, location
            from mess
            order by messid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "mess query failed",
            details: err.message
        });
    }
});

app.post("/api/mess", async (req, res) => {
    try {
        const {
            messid,
            messname,
            messtype,
            location
        } = req.body;

        await executeQuery(
            `insert into mess
            (messid, messname, messtype, location)
            values
            (:messid, :messname, :messtype, :location)`,
            {
                messid,
                messname,
                messtype,
                location
            }
        );

        res.json({ message: "mess added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add mess",
            details: err.message
        });
    }
});

app.put("/api/mess/:id", async (req, res) => {
    try {
        const {
            messname,
            messtype,
            location
        } = req.body;

        await executeQuery(
            `update mess
             set messname = :messname,
                 messtype = :messtype,
                 location = :location
             where messid = :messid`,
            {
                messid: req.params.id,
                messname,
                messtype,
                location
            }
        );

        res.json({ message: "mess updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update mess",
            details: err.message
        });
    }
});

app.delete("/api/mess/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from mess
             where messid = :messid`,
            {
                messid: req.params.id
            }
        );

        res.json({ message: "mess deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete mess",
            details: err.message
        });
    }
});

/* mess contact */

app.get("/api/mess-contacts", async (req, res) => {
    try {
        const rows = await runQuery(`
            select messid, phoneno
            from mess_contact
            order by messid, phoneno
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "mess contact query failed",
            details: err.message
        });
    }
});

app.post("/api/mess-contacts", async (req, res) => {
    try {
        const {
            messid,
            phoneno
        } = req.body;

        await executeQuery(
            `insert into mess_contact
            (messid, phoneno)
            values
            (:messid, :phoneno)`,
            {
                messid,
                phoneno
            }
        );

        res.json({ message: "mess contact added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add mess contact",
            details: err.message
        });
    }
});

app.put("/api/mess-contacts/:messid/:phoneno", async (req, res) => {
    try {
        const {
            newphoneno
        } = req.body;

        await executeQuery(
            `update mess_contact
             set phoneno = :newphoneno
             where messid = :messid
             and phoneno = :phoneno`,
            {
                messid: req.params.messid,
                phoneno: req.params.phoneno,
                newphoneno
            }
        );

        res.json({ message: "mess contact updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update mess contact",
            details: err.message
        });
    }
});

app.delete("/api/mess-contacts/:messid/:phoneno", async (req, res) => {
    try {
        await executeQuery(
            `delete from mess_contact
             where messid = :messid
             and phoneno = :phoneno`,
            {
                messid: req.params.messid,
                phoneno: req.params.phoneno
            }
        );

        res.json({ message: "mess contact deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete mess contact",
            details: err.message
        });
    }
});

/* meal */

app.get("/api/meals", async (req, res) => {
    try {
        const rows = await runQuery(`
            select mealid, mealname, description, price, messid
            from meal
            order by mealid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "meal query failed",
            details: err.message
        });
    }
});

app.post("/api/meals", async (req, res) => {
    try {
        const {
            mealid,
            mealname,
            description,
            price,
            messid
        } = req.body;

        await executeQuery(
            `insert into meal
            (mealid, mealname, description, price, messid)
            values
            (:mealid, :mealname, :description, :price, :messid)`,
            {
                mealid,
                mealname,
                description,
                price,
                messid
            }
        );

        res.json({ message: "meal added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add meal",
            details: err.message
        });
    }
});

app.put("/api/meals/:id", async (req, res) => {
    try {
        const {
            mealname,
            description,
            price,
            messid
        } = req.body;

        await executeQuery(
            `update meal
             set mealname = :mealname,
                 description = :description,
                 price = :price,
                 messid = :messid
             where mealid = :mealid`,
            {
                mealid: req.params.id,
                mealname,
                description,
                price,
                messid
            }
        );

        res.json({ message: "meal updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update meal",
            details: err.message
        });
    }
});

app.delete("/api/meals/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from meal
             where mealid = :mealid`,
            {
                mealid: req.params.id
            }
        );

        res.json({ message: "meal deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete meal",
            details: err.message
        });
    }
});
/* staff */

app.get("/api/staff", async (req, res) => {
    try {
        const rows = await runQuery(`
            select staffid, staffname, joiningdate, salary,
                   designation, messid
            from staff
            order by staffid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "staff query failed",
            details: err.message
        });
    }
});

app.post("/api/staff", async (req, res) => {
    try {
        const {
            staffid,
            staffname,
            joiningdate,
            salary,
            designation,
            messid
        } = req.body;

        await executeQuery(
            `insert into staff
            (staffid, staffname, joiningdate, salary, designation, messid)
            values
            (:staffid, :staffname, to_date(:joiningdate, 'yyyy-mm-dd'),
             :salary, :designation, :messid)`,
            {
                staffid,
                staffname,
                joiningdate,
                salary,
                designation,
                messid: messid || null
            }
        );

        res.json({ message: "staff added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add staff",
            details: err.message
        });
    }
});

app.put("/api/staff/:id", async (req, res) => {
    try {
        const {
            staffname,
            joiningdate,
            salary,
            designation,
            messid
        } = req.body;

        await executeQuery(
            `update staff
             set staffname = :staffname,
                 joiningdate = to_date(:joiningdate, 'yyyy-mm-dd'),
                 salary = :salary,
                 designation = :designation,
                 messid = :messid
             where staffid = :staffid`,
            {
                staffid: req.params.id,
                staffname,
                joiningdate,
                salary,
                designation,
                messid: messid || null
            }
        );

        res.json({ message: "staff updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update staff",
            details: err.message
        });
    }
});

app.delete("/api/staff/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from staff
             where staffid = :staffid`,
            {
                staffid: req.params.id
            }
        );

        res.json({ message: "staff deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete staff",
            details: err.message
        });
    }
});

/* staff phone */

app.get("/api/staff-phones", async (req, res) => {
    try {
        const rows = await runQuery(`
            select staffid, phoneno
            from staff_phone
            order by staffid, phoneno
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "staff phone query failed",
            details: err.message
        });
    }
});

app.post("/api/staff-phones", async (req, res) => {
    try {
        const {
            staffid,
            phoneno
        } = req.body;

        await executeQuery(
            `insert into staff_phone
            (staffid, phoneno)
            values
            (:staffid, :phoneno)`,
            {
                staffid,
                phoneno
            }
        );

        res.json({ message: "staff phone added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add staff phone",
            details: err.message
        });
    }
});

app.put("/api/staff-phones/:staffid/:phoneno", async (req, res) => {
    try {
        const {
            newphoneno
        } = req.body;

        await executeQuery(
            `update staff_phone
             set phoneno = :newphoneno
             where staffid = :staffid
             and phoneno = :phoneno`,
            {
                staffid: req.params.staffid,
                phoneno: req.params.phoneno,
                newphoneno
            }
        );

        res.json({ message: "staff phone updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update staff phone",
            details: err.message
        });
    }
});

app.delete("/api/staff-phones/:staffid/:phoneno", async (req, res) => {
    try {
        await executeQuery(
            `delete from staff_phone
             where staffid = :staffid
             and phoneno = :phoneno`,
            {
                staffid: req.params.staffid,
                phoneno: req.params.phoneno
            }
        );

        res.json({ message: "staff phone deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete staff phone",
            details: err.message
        });
    }
});
/* warden */

app.get("/api/wardens", async (req, res) => {
    try {
        const rows = await runQuery(`
            select wardenid, wardenname, email, joiningdate
            from warden
            order by wardenid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "warden query failed",
            details: err.message
        });
    }
});

app.post("/api/wardens", async (req, res) => {
    try {
        const {
            wardenid,
            wardenname,
            email,
            joiningdate
        } = req.body;

        await executeQuery(
            `insert into warden
            (wardenid, wardenname, email, joiningdate)
            values
            (:wardenid, :wardenname, :email,
             to_date(:joiningdate, 'yyyy-mm-dd'))`,
            {
                wardenid,
                wardenname,
                email,
                joiningdate
            }
        );

        res.json({ message: "warden added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add warden",
            details: err.message
        });
    }
});

app.put("/api/wardens/:id", async (req, res) => {
    try {
        const {
            wardenname,
            email,
            joiningdate
        } = req.body;

        await executeQuery(
            `update warden
             set wardenname = :wardenname,
                 email = :email,
                 joiningdate = to_date(:joiningdate, 'yyyy-mm-dd')
             where wardenid = :wardenid`,
            {
                wardenid: req.params.id,
                wardenname,
                email,
                joiningdate
            }
        );

        res.json({ message: "warden updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update warden",
            details: err.message
        });
    }
});

app.delete("/api/wardens/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from warden
             where wardenid = :wardenid`,
            {
                wardenid: req.params.id
            }
        );

        res.json({ message: "warden deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete warden",
            details: err.message
        });
    }
});

/* warden phone */

app.get("/api/warden-phones", async (req, res) => {
    try {
        const rows = await runQuery(`
            select wardenid, phoneno
            from warden_phone
            order by wardenid, phoneno
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "warden phone query failed",
            details: err.message
        });
    }
});

app.post("/api/warden-phones", async (req, res) => {
    try {
        const {
            wardenid,
            phoneno
        } = req.body;

        await executeQuery(
            `insert into warden_phone
            (wardenid, phoneno)
            values
            (:wardenid, :phoneno)`,
            {
                wardenid,
                phoneno
            }
        );

        res.json({ message: "warden phone added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add warden phone",
            details: err.message
        });
    }
});

app.put("/api/warden-phones/:wardenid/:phoneno", async (req, res) => {
    try {
        const {
            newphoneno
        } = req.body;

        await executeQuery(
            `update warden_phone
             set phoneno = :newphoneno
             where wardenid = :wardenid
             and phoneno = :phoneno`,
            {
                wardenid: req.params.wardenid,
                phoneno: req.params.phoneno,
                newphoneno
            }
        );

        res.json({ message: "warden phone updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update warden phone",
            details: err.message
        });
    }
});

app.delete("/api/warden-phones/:wardenid/:phoneno", async (req, res) => {
    try {
        await executeQuery(
            `delete from warden_phone
             where wardenid = :wardenid
             and phoneno = :phoneno`,
            {
                wardenid: req.params.wardenid,
                phoneno: req.params.phoneno
            }
        );

        res.json({ message: "warden phone deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete warden phone",
            details: err.message
        });
    }
});
/* supplier */

app.get("/api/suppliers", async (req, res) => {
    try {
        const rows = await runQuery(`
            select supplierid, suppliername
            from supplier
            order by supplierid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "supplier query failed",
            details: err.message
        });
    }
});

app.post("/api/suppliers", async (req, res) => {
    try {
        const {
            supplierid,
            suppliername
        } = req.body;

        await executeQuery(
            `insert into supplier
            (supplierid, suppliername)
            values
            (:supplierid, :suppliername)`,
            {
                supplierid,
                suppliername
            }
        );

        res.json({ message: "supplier added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add supplier",
            details: err.message
        });
    }
});

app.put("/api/suppliers/:id", async (req, res) => {
    try {
        const {
            suppliername
        } = req.body;

        await executeQuery(
            `update supplier
             set suppliername = :suppliername
             where supplierid = :supplierid`,
            {
                supplierid: req.params.id,
                suppliername
            }
        );

        res.json({ message: "supplier updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update supplier",
            details: err.message
        });
    }
});

app.delete("/api/suppliers/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from supplier
             where supplierid = :supplierid`,
            {
                supplierid: req.params.id
            }
        );

        res.json({ message: "supplier deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete supplier",
            details: err.message
        });
    }
});

/* supplier phone */

app.get("/api/supplier-phones", async (req, res) => {
    try {
        const rows = await runQuery(`
            select supplierid, phoneno
            from supplier_phone
            order by supplierid, phoneno
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "supplier phone query failed",
            details: err.message
        });
    }
});

app.post("/api/supplier-phones", async (req, res) => {
    try {
        const {
            supplierid,
            phoneno
        } = req.body;

        await executeQuery(
            `insert into supplier_phone
            (supplierid, phoneno)
            values
            (:supplierid, :phoneno)`,
            {
                supplierid,
                phoneno
            }
        );

        res.json({ message: "supplier phone added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add supplier phone",
            details: err.message
        });
    }
});

app.put("/api/supplier-phones/:supplierid/:phoneno", async (req, res) => {
    try {
        const {
            newphoneno
        } = req.body;

        await executeQuery(
            `update supplier_phone
             set phoneno = :newphoneno
             where supplierid = :supplierid
             and phoneno = :phoneno`,
            {
                supplierid: req.params.supplierid,
                phoneno: req.params.phoneno,
                newphoneno
            }
        );

        res.json({ message: "supplier phone updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update supplier phone",
            details: err.message
        });
    }
});

app.delete("/api/supplier-phones/:supplierid/:phoneno", async (req, res) => {
    try {
        await executeQuery(
            `delete from supplier_phone
             where supplierid = :supplierid
             and phoneno = :phoneno`,
            {
                supplierid: req.params.supplierid,
                phoneno: req.params.phoneno
            }
        );

        res.json({ message: "supplier phone deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete supplier phone",
            details: err.message
        });
    }
});

/* inventory */

app.get("/api/inventory", async (req, res) => {
    try {
        const rows = await runQuery(`
            select itemid, itemname, category, unit
            from inventory_item
            order by itemid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "inventory query failed",
            details: err.message
        });
    }
});

app.post("/api/inventory", async (req, res) => {
    try {
        const {
            itemid,
            itemname,
            category,
            unit
        } = req.body;

        await executeQuery(
            `insert into inventory_item
            (itemid, itemname, category, unit)
            values
            (:itemid, :itemname, :category, :unit)`,
            {
                itemid,
                itemname,
                category,
                unit
            }
        );

        res.json({ message: "inventory item added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add inventory item",
            details: err.message
        });
    }
});

app.put("/api/inventory/:id", async (req, res) => {
    try {
        const {
            itemname,
            category,
            unit
        } = req.body;

        await executeQuery(
            `update inventory_item
             set itemname = :itemname,
                 category = :category,
                 unit = :unit
             where itemid = :itemid`,
            {
                itemid: req.params.id,
                itemname,
                category,
                unit
            }
        );

        res.json({ message: "inventory item updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update inventory item",
            details: err.message
        });
    }
});

app.delete("/api/inventory/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from inventory_item
             where itemid = :itemid`,
            {
                itemid: req.params.id
            }
        );

        res.json({ message: "inventory item deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete inventory item",
            details: err.message
        });
    }
});
/* procures */

app.get("/api/procures", async (req, res) => {
    try {
        const rows = await runQuery(`
            select messid, supplierid, itemid, quantity
            from procures
            order by messid, supplierid, itemid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "procures query failed",
            details: err.message
        });
    }
});

app.post("/api/procures", async (req, res) => {
    try {
        const {
            messid,
            supplierid,
            itemid,
            quantity
        } = req.body;

        await executeQuery(
            `insert into procures
            (messid, supplierid, itemid, quantity)
            values
            (:messid, :supplierid, :itemid, :quantity)`,
            {
                messid,
                supplierid,
                itemid,
                quantity
            }
        );

        res.json({ message: "procurement added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add procurement",
            details: err.message
        });
    }
});

app.put("/api/procures/:messid/:supplierid/:itemid", async (req, res) => {
    try {
        const {
            quantity
        } = req.body;

        await executeQuery(
            `update procures
             set quantity = :quantity
             where messid = :messid
             and supplierid = :supplierid
             and itemid = :itemid`,
            {
                messid: req.params.messid,
                supplierid: req.params.supplierid,
                itemid: req.params.itemid,
                quantity
            }
        );

        res.json({ message: "procurement updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update procurement",
            details: err.message
        });
    }
});

app.delete("/api/procures/:messid/:supplierid/:itemid", async (req, res) => {
    try {
        await executeQuery(
            `delete from procures
             where messid = :messid
             and supplierid = :supplierid
             and itemid = :itemid`,
            {
                messid: req.params.messid,
                supplierid: req.params.supplierid,
                itemid: req.params.itemid
            }
        );

        res.json({ message: "procurement deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete procurement",
            details: err.message
        });
    }
});

/* payment */

app.get("/api/payments", async (req, res) => {
    try {
        const rows = await runQuery(`
            select paymentid, studentid, amount, paymentmethod,
                   status, paymentdate
            from payment
            order by paymentid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "payment query failed",
            details: err.message
        });
    }
});

app.post("/api/payments", async (req, res) => {
    try {
        const {
            paymentid,
            studentid,
            amount,
            paymentmethod,
            status,
            paymentdate
        } = req.body;

        await executeQuery(
            `insert into payment
            (paymentid, studentid, amount, paymentmethod, status, paymentdate)
            values
            (:paymentid, :studentid, :amount, :paymentmethod, :status,
             to_date(:paymentdate, 'yyyy-mm-dd'))`,
            {
                paymentid,
                studentid,
                amount,
                paymentmethod,
                status,
                paymentdate
            }
        );

        res.json({ message: "payment added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add payment",
            details: err.message
        });
    }
});

app.put("/api/payments/:id", async (req, res) => {
    try {
        const {
            studentid,
            amount,
            paymentmethod,
            status,
            paymentdate
        } = req.body;

        await executeQuery(
            `update payment
             set studentid = :studentid,
                 amount = :amount,
                 paymentmethod = :paymentmethod,
                 status = :status,
                 paymentdate = to_date(:paymentdate, 'yyyy-mm-dd')
             where paymentid = :paymentid`,
            {
                paymentid: req.params.id,
                studentid,
                amount,
                paymentmethod,
                status,
                paymentdate
            }
        );

        res.json({ message: "payment updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update payment",
            details: err.message
        });
    }
});

app.delete("/api/payments/:id", async (req, res) => {
    try {
        await executeQuery(
            `delete from payment
             where paymentid = :paymentid`,
            {
                paymentid: req.params.id
            }
        );

        res.json({ message: "payment deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete payment",
            details: err.message
        });
    }
});

/* payment detail */

app.get("/api/payment-details", async (req, res) => {
    try {
        const rows = await runQuery(`
            select paymentid, detailid, monthname, yearno,
                   amount, latefee
            from payment_detail
            order by paymentid, detailid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "payment detail query failed",
            details: err.message
        });
    }
});

app.post("/api/payment-details", async (req, res) => {
    try {
        const {
            paymentid,
            detailid,
            monthname,
            yearno,
            amount,
            latefee
        } = req.body;

        await executeQuery(
            `insert into payment_detail
            (paymentid, detailid, monthname, yearno, amount, latefee)
            values
            (:paymentid, :detailid, :monthname, :yearno, :amount, :latefee)`,
            {
                paymentid,
                detailid,
                monthname,
                yearno,
                amount,
                latefee
            }
        );

        res.json({ message: "payment detail added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to add payment detail",
            details: err.message
        });
    }
});

app.put("/api/payment-details/:paymentid/:detailid", async (req, res) => {
    try {
        const {
            monthname,
            yearno,
            amount,
            latefee
        } = req.body;

        await executeQuery(
            `update payment_detail
             set monthname = :monthname,
                 yearno = :yearno,
                 amount = :amount,
                 latefee = :latefee
             where paymentid = :paymentid
             and detailid = :detailid`,
            {
                paymentid: req.params.paymentid,
                detailid: req.params.detailid,
                monthname,
                yearno,
                amount,
                latefee
            }
        );

        res.json({ message: "payment detail updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to update payment detail",
            details: err.message
        });
    }
});

app.delete("/api/payment-details/:paymentid/:detailid", async (req, res) => {
    try {
        await executeQuery(
            `delete from payment_detail
             where paymentid = :paymentid
             and detailid = :detailid`,
            {
                paymentid: req.params.paymentid,
                detailid: req.params.detailid
            }
        );

        res.json({ message: "payment detail deleted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "failed to delete payment detail",
            details: err.message
        });
    }
});
/* reports */

/* report 1 - student and hostel */

app.get("/api/reports/student-hostel", async (req, res) => {
    try {
        const rows = await runQuery(`
            select s.studentid,
                   s.studentname,
                   s.gender,
                   r.roomid,
                   h.hostelname
            from student s
            join room r on s.roomid = r.roomid
            join hostel h on r.hostelid = h.hostelid
            order by s.studentid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "student hostel report failed",
            details: err.message
        });
    }
});

/* report 2 - student payments */

app.get("/api/reports/student-payments", async (req, res) => {
    try {
        const rows = await runQuery(`
            select s.studentid,
                   s.studentname,
                   p.paymentid,
                   p.amount,
                   p.paymentmethod,
                   p.status,
                   p.paymentdate
            from student s
            join payment p on s.studentid = p.studentid
            order by s.studentid, p.paymentid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "student payment report failed",
            details: err.message
        });
    }
});

/* report 3 - hostel occupancy */

app.get("/api/reports/hostel-occupancy", async (req, res) => {
    try {
        const rows = await runQuery(`
            select h.hostelid,
                   h.hostelname,
                   h.capacity,
                   count(s.studentid) as occupied
            from hostel h
            left join room r on h.hostelid = r.hostelid
            left join student s on r.roomid = s.roomid
            group by h.hostelid, h.hostelname, h.capacity
            order by h.hostelid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "hostel occupancy report failed",
            details: err.message
        });
    }
});

/* report 4 - mess and meals */

app.get("/api/reports/mess-meals", async (req, res) => {
    try {
        const rows = await runQuery(`
            select m.messid,
                   m.messname,
                   m.messtype,
                   ml.mealid,
                   ml.mealname,
                   ml.price
            from mess m
            join meal ml on m.messid = ml.messid
            order by m.messid, ml.mealid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "mess meal report failed",
            details: err.message
        });
    }
});

/* report 5 - staff and mess */

app.get("/api/reports/staff-mess", async (req, res) => {
    try {
        const rows = await runQuery(`
            select st.staffid,
                   st.staffname,
                   st.designation,
                   st.salary,
                   m.messid,
                   m.messname
            from staff st
            left join mess m on st.messid = m.messid
            order by st.staffid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "staff mess report failed",
            details: err.message
        });
    }
});

/* report 6 - procurement */

app.get("/api/reports/procurement", async (req, res) => {
    try {
        const rows = await runQuery(`
            select m.messname,
                   s.suppliername,
                   i.itemname,
                   i.category,
                   p.quantity,
                   i.unit
            from procures p
            join mess m on p.messid = m.messid
            join supplier s on p.supplierid = s.supplierid
            join inventory_item i on p.itemid = i.itemid
            order by m.messname, s.suppliername, i.itemname
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "procurement report failed",
            details: err.message
        });
    }
});

/* report 7 - payment details */

app.get("/api/reports/payment-details", async (req, res) => {
    try {
        const rows = await runQuery(`
            select p.studentid,
                   s.studentname,
                   p.paymentid,
                   p.paymentmethod,
                   p.status,
                   pd.detailid,
                   pd.monthname,
                   pd.yearno,
                   pd.amount,
                   pd.latefee
            from payment p
            join student s on p.studentid = s.studentid
            join payment_detail pd on p.paymentid = pd.paymentid
            order by p.studentid, p.paymentid, pd.detailid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "payment detail report failed",
            details: err.message
        });
    }
});

/* report 8 - warden and hostel */

app.get("/api/reports/warden-hostel", async (req, res) => {
    try {
        const rows = await runQuery(`
            select w.wardenid,
                   w.wardenname,
                   w.email,
                   h.hostelid,
                   h.hostelname,
                   h.capacity
            from warden w
            left join hostel h on w.wardenid = h.wardenid
            order by w.wardenid
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "warden hostel report failed",
            details: err.message
        });
    }
});

/* execute sql query */

app.post("/api/execute-query", async (req, res) => {
    try {
        let sql = req.body.sql;

        if (!sql || !sql.trim()) {
            return res.status(400).json({
                success: false,
                error: "sql query is required"
            });
        }

        sql = sql.trim().replace(/;+\s*$/, "");

        const connection = await oracledb.getConnection(dbConfig);

        try {
            const result = await connection.execute(
                sql,
                [],
                {
                    outFormat: oracledb.OUT_FORMAT_OBJECT,
                    autoCommit: true
                }
            );

            if (result.rows) {
                const rows = result.rows.map(row => {
                    const newRow = {};

                    for (const key in row) {
                        newRow[key.toLowerCase()] = row[key];
                    }

                    return newRow;
                });

                return res.json({
                    success: true,
                    rows: rows
                });
            }

            res.json({
                success: true,
                rows: [],
                rowsAffected: result.rowsAffected || 0,
                message: "query executed successfully"
            });

        } finally {
            await connection.close();
        }

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* server start */

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});
