-- ==========================================================
-- Hostel Management System - PostgreSQL Database Schema & Data
-- Compatible with Supabase PostgreSQL
-- ==========================================================

-- Drop existing tables if re-running (reverse dependency order)
drop table if exists payment_detail cascade;
drop table if exists payment cascade;
drop table if exists student_phone cascade;
drop table if exists student cascade;
drop table if exists procures cascade;
drop table if exists inventory_item cascade;
drop table if exists supplier_phone cascade;
drop table if exists supplier cascade;
drop table if exists staff_phone cascade;
drop table if exists staff cascade;
drop table if exists meal cascade;
drop table if exists mess_contact cascade;
drop table if exists mess cascade;
drop table if exists room cascade;
drop table if exists room_type cascade;
drop table if exists hostel cascade;
drop table if exists warden_phone cascade;
drop table if exists warden cascade;
drop view if exists dual cascade;

-- Compatibility view for legacy queries containing "from dual"
create or replace view dual as select 'X'::varchar as dummy;

-- 1. Warden
create table warden (
    wardenid varchar(10) primary key,
    wardenname varchar(100) not null,
    email varchar(100),
    joiningdate date
);

insert into warden values ('W101', 'Dr. Rajesh Kumar', 'rajesh.k@univ.edu', to_date('15-06-2018', 'dd-mm-yyyy'));
insert into warden values ('W102', 'Prof. Anita Sharma', 'anita@univ.edu', to_date('01-08-2019', 'dd-mm-yyyy'));
insert into warden values ('W103', 'Dr. Suresh Menon', 'suresh.m@univ.edu', to_date('10-01-2020', 'dd-mm-yyyy'));
insert into warden values ('W104', 'Prof. Priya Nair', 'priya.n@univ.edu', to_date('20-07-2021', 'dd-mm-yyyy'));
insert into warden values ('W105', 'Dr. Amit Verma', 'amit.v@univ.edu', to_date('05-03-2022', 'dd-mm-yyyy'));

-- 2. Warden Phone
create table warden_phone (
    wardenid varchar(10),
    phoneno varchar(20),
    primary key (wardenid, phoneno),
    foreign key (wardenid) references warden(wardenid) on delete cascade
);

insert into warden_phone values ('W101', '9876500001');
insert into warden_phone values ('W101', '9876500002');
insert into warden_phone values ('W102', '9876500003');
insert into warden_phone values ('W103', '9876500004');
insert into warden_phone values ('W104', '9876500005');

-- 3. Hostel
create table hostel (
    hostelid varchar(10) primary key,
    hostelname varchar(100) not null,
    capacity numeric,
    wardenid varchar(10),
    foreign key (wardenid) references warden(wardenid)
);

insert into hostel values ('H1', 'Cauvery Boys Hostel', 4, 'W101');
insert into hostel values ('H2', 'Ganga Girls Hostel', 4, 'W102');
insert into hostel values ('H3', 'Yamuna Boys Hostel', 3, 'W103');
insert into hostel values ('H4', 'Krishna Girls Hostel', 3, 'W104');
insert into hostel values ('H5', 'Narmada PG Hostel', 2, 'W105');

-- 4. Room Type
create table room_type (
    typeid varchar(10) primary key,
    typename varchar(30),
    ac_type varchar(20),
    capacity numeric
);

insert into room_type values ('RT1', 'Single', 'AC', 1);
insert into room_type values ('RT2', 'Double', 'Non-AC', 2);
insert into room_type values ('RT3', 'Triple', 'Non-AC', 3);

-- 5. Room
create table room (
    roomid varchar(10) primary key,
    floorno numeric,
    typeid varchar(10),
    roomrent numeric,
    hostelid varchar(10),
    foreign key (typeid) references room_type(typeid),
    foreign key (hostelid) references hostel(hostelid)
);

insert into room values ('R101', 1, 'RT1', 5000, 'H1');
insert into room values ('R102', 1, 'RT2', 4000, 'H1');
insert into room values ('R201', 2, 'RT3', 3500, 'H2');
insert into room values ('R202', 2, 'RT2', 4000, 'H3');
insert into room values ('R301', 3, 'RT1', 5000, 'H4');

-- 6. Mess
create table mess (
    messid varchar(10) primary key,
    messname varchar(100),
    messtype varchar(30),
    location varchar(100)
);

insert into mess values ('M1', 'North Dining Hall', 'Pure Veg', 'North Campus Block A');
insert into mess values ('M2', 'South Dining Hall', 'Non-Veg Special', 'South Campus Block B');
insert into mess values ('M3', 'Central Mess', 'Mixed', 'Central Plaza Block C');
insert into mess values ('M4', 'Executive Dining', 'Continental', 'Guest House Block D');
insert into mess values ('M5', 'Fast Food and Snacks', 'Quick Bites', 'Student Activity Center');

-- 7. Mess Contact
create table mess_contact (
    messid varchar(10),
    phoneno varchar(20),
    primary key (messid, phoneno),
    foreign key (messid) references mess(messid) on delete cascade
);

insert into mess_contact values ('M1', '044-220011');
insert into mess_contact values ('M1', '044-220012');
insert into mess_contact values ('M2', '044-220021');
insert into mess_contact values ('M3', '044-220031');
insert into mess_contact values ('M4', '044-220041');

-- 8. Meal
create table meal (
    mealid varchar(10) primary key,
    mealname varchar(100),
    description varchar(200),
    price numeric,
    messid varchar(10),
    foreign key (messid) references mess(messid)
);

insert into meal values ('ML1', 'North Indian Thali', 'Roti, Dhal Makhni, Paneer, Rice', 120, 'M1');
insert into meal values ('ML2', 'South Indian Meals', 'Sambhar, Rasam, Curd Rice, Pori, Payasam', 90, 'M1');
insert into meal values ('ML3', 'Chicken Biryani', 'Chicken Dum Biryani, Raita', 180, 'M2');
insert into meal values ('ML4', 'Continental Breakfast', 'Toast, Omlette, Juice, Coffee', 150, 'M4');
insert into meal values ('ML5', 'Mini Executive Thali', 'Chapati, Mixed Veg Curry, Pulao', 110, 'M3');

-- 9. Staff
create table staff (
    staffid varchar(10) primary key,
    staffname varchar(100),
    joiningdate date,
    salary numeric,
    designation varchar(50),
    messid varchar(10),
    foreign key (messid) references mess(messid)
);

insert into staff values ('ST1', 'Ramesh Chandra', to_date('01-02-2019', 'dd-mm-yyyy'), 35000, 'Head Chef', 'M1');
insert into staff values ('ST2', 'Murugan P.', to_date('15-05-2020', 'dd-mm-yyyy'), 28000, 'Assistant Cook', 'M1');
insert into staff values ('ST3', 'Joseph D''souza', to_date('10-11-2018', 'dd-mm-yyyy'), 38000, 'Master Chef', 'M2');
insert into staff values ('ST4', 'Sunita Devi', to_date('01-08-2021', 'dd-mm-yyyy'), 18000, 'Cleaner', 'M2');
insert into staff values ('ST5', 'Govind Ram', to_date('20-01-2022', 'dd-mm-yyyy'), 22000, 'Store Keeper', 'M3');

-- 10. Staff Phone
create table staff_phone (
    staffid varchar(10),
    phoneno varchar(20),
    primary key (staffid, phoneno),
    foreign key (staffid) references staff(staffid) on delete cascade
);

insert into staff_phone values ('ST1', '9444100001');
insert into staff_phone values ('ST2', '9444100002');
insert into staff_phone values ('ST3', '9444100003');
insert into staff_phone values ('ST3', '9444100004');
insert into staff_phone values ('ST4', '9444100005');

-- 11. Supplier
create table supplier (
    supplierid varchar(10) primary key,
    suppliername varchar(100)
);

insert into supplier values ('SUP1', 'Fresh Farm Provisions');
insert into supplier values ('SUP2', 'Metro Dairy Products');
insert into supplier values ('SUP3', 'Coastal Poultry & Meats');
insert into supplier values ('SUP4', 'National Grain Traders');
insert into supplier values ('SUP5', 'Green Valley Vegetables');

-- 12. Supplier Phone
create table supplier_phone (
    supplierid varchar(10),
    phoneno varchar(20),
    primary key (supplierid, phoneno),
    foreign key (supplierid) references supplier(supplierid) on delete cascade
);

insert into supplier_phone values ('SUP1', '9884011111');
insert into supplier_phone values ('SUP2', '9884022222');
insert into supplier_phone values ('SUP3', '9884033333');
insert into supplier_phone values ('SUP3', '9884033334');
insert into supplier_phone values ('SUP4', '9884044444');

-- 13. Inventory Item
create table inventory_item (
    itemid varchar(10) primary key,
    itemname varchar(100),
    category varchar(50),
    unit varchar(20)
);

insert into inventory_item values ('IT101', 'Basmati Rice', 'Grains', 'Kg');
insert into inventory_item values ('IT102', 'Toned Milk', 'Dairy', 'Litre');
insert into inventory_item values ('IT103', 'Refined Sunflower Oil', 'Cooking Oil', 'Litre');
insert into inventory_item values ('IT104', 'Fresh Broiler Chicken', 'Meat', 'Kg');
insert into inventory_item values ('IT105', 'Potato', 'Vegetables', 'Kg');

-- 14. Procures
create table procures (
    messid varchar(10),
    supplierid varchar(10),
    itemid varchar(10),
    quantity numeric,
    primary key (messid, supplierid, itemid),
    foreign key (messid) references mess(messid),
    foreign key (supplierid) references supplier(supplierid),
    foreign key (itemid) references inventory_item(itemid)
);

insert into procures values ('M1', 'SUP4', 'IT101', 500);
insert into procures values ('M1', 'SUP2', 'IT102', 200);
insert into procures values ('M2', 'SUP3', 'IT104', 150);
insert into procures values ('M2', 'SUP1', 'IT105', 300);
insert into procures values ('M3', 'SUP4', 'IT103', 100);

-- 15. Student
create table student (
    studentid varchar(10) primary key,
    studentname varchar(100) not null,
    gender varchar(10),
    dob date,
    email varchar(100),
    bloodgroup varchar(5),
    mealplan varchar(20),
    foodpreference varchar(20),
    guardianid varchar(10),
    roomid varchar(10),
    messid varchar(10),
    foreign key (guardianid) references student(studentid),
    foreign key (roomid) references room(roomid),
    foreign key (messid) references mess(messid)
);

insert into student values ('S1001', 'Rahul Sharma', 'Male', to_date('12-04-2003', 'dd-mm-yyyy'), 'rahul.s@univ.edu', 'B+', 'Premium', 'Veg', null, 'R101', 'M1');
insert into student values ('S1002', 'Sneha Patel', 'Female', to_date('25-08-2004', 'dd-mm-yyyy'), 'sneha.p@univ.edu', 'O+', 'Standard', 'Non-Veg', null, 'R201', 'M2');
insert into student values ('S1003', 'Rohan Verma', 'Male', to_date('15-01-2005', 'dd-mm-yyyy'), 'rohan.v@univ.edu', 'A+', 'Standard', 'Veg', 'S1001', 'R102', 'M1');
insert into student values ('S1004', 'Ananya Iyer', 'Female', to_date('30-09-2005', 'dd-mm-yyyy'), 'ananya.i@univ.edu', 'AB+', 'Standard', 'Veg', 'S1002', 'R201', 'M2');
insert into student values ('S1005', 'Vikram Singh', 'Male', to_date('05-11-2004', 'dd-mm-yyyy'), 'vikram.s@univ.edu', 'B-', 'Premium', 'Non-Veg', 'S1001', 'R202', 'M3');

-- 16. Student Phone
create table student_phone (
    studentid varchar(10),
    phoneno varchar(20),
    primary key (studentid, phoneno),
    foreign key (studentid) references student(studentid) on delete cascade
);

insert into student_phone values ('S1001', '9876543210');
insert into student_phone values ('S1001', '9876543211');
insert into student_phone values ('S1002', '9876543212');
insert into student_phone values ('S1003', '9876543213');
insert into student_phone values ('S1004', '9876543214');
insert into student_phone values ('S1005', '9876543215');

-- 17. Payment
create table payment (
    paymentid varchar(10) primary key,
    studentid varchar(10) not null,
    amount numeric,
    paymentmethod varchar(30),
    status varchar(200),
    paymentdate date,
    foreign key (studentid) references student(studentid)
);

insert into payment values ('PAY1001', 'S1001', 12500, 'NetBanking', 'Successful', to_date('05-08-2026', 'dd-mm-yyyy'));
insert into payment values ('PAY1002', 'S1002', 14000, 'UPI', 'Successful', to_date('06-08-2026', 'dd-mm-yyyy'));
insert into payment values ('PAY1003', 'S1003', 11000, 'Credit Card', 'Successful', to_date('07-08-2026', 'dd-mm-yyyy'));
insert into payment values ('PAY1004', 'S1004', 11000, 'UPI', 'Pending', to_date('10-08-2026', 'dd-mm-yyyy'));
insert into payment values ('PAY1005', 'S1005', 15000, 'Debit Card', 'Successful', to_date('12-08-2026', 'dd-mm-yyyy'));

-- 18. Payment Detail
create table payment_detail (
    paymentid varchar(10),
    detailid varchar(10),
    monthname varchar(30),
    yearno numeric,
    amount numeric,
    latefee numeric,
    primary key (paymentid, detailid),
    foreign key (paymentid) references payment(paymentid) on delete cascade
);

insert into payment_detail values ('PAY1001', 'D1', 'August', 2026, 11500, 1000);
insert into payment_detail values ('PAY1002', 'D1', 'August', 2026, 13000, 1000);
insert into payment_detail values ('PAY1003', 'D1', 'August', 2026, 10000, 1000);
insert into payment_detail values ('PAY1003', 'D2', 'July (Arrears)', 2026, 0, 1000);
insert into payment_detail values ('PAY1005', 'D1', 'August', 2026, 14000, 1000);
