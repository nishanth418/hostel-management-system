fetch("/api/dashboard")
    .then(response => response.json())
    .then(data => {
        document.getElementById("studentCount").textContent = data.students;
        document.getElementById("studentPhoneCount").textContent = data.studentphones;
        document.getElementById("hostelCount").textContent = data.hostels;
        document.getElementById("roomCount").textContent = data.rooms;
        document.getElementById("roomTypeCount").textContent = data.roomtypes;
        document.getElementById("messCount").textContent = data.mess;
        document.getElementById("messContactCount").textContent = data.messcontacts;
        document.getElementById("mealCount").textContent = data.meals;
        document.getElementById("staffCount").textContent = data.staff;
        document.getElementById("staffPhoneCount").textContent = data.staffphones;
        document.getElementById("wardenCount").textContent = data.wardens;
        document.getElementById("wardenPhoneCount").textContent = data.wardenphones;
        document.getElementById("supplierCount").textContent = data.suppliers;
        document.getElementById("supplierPhoneCount").textContent = data.supplierphones;
        document.getElementById("inventoryCount").textContent = data.inventory;
        document.getElementById("procuresCount").textContent = data.procures;
        document.getElementById("paymentCount").textContent = data.payments;
        document.getElementById("paymentDetailCount").textContent = data.paymentdetails;
    })
    .catch(error => {
        console.error("error loading dashboard:", error);
    });