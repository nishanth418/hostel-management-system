// frontend/script.js
// Fetches dashboard overview stats from Render backend and animates counter numbers

fetch("/api/dashboard")
    .then(response => response.json())
    .then(data => {
        const counts = [
            { id: "studentCount", val: data.students },
            { id: "studentPhoneCount", val: data.studentphones },
            { id: "hostelCount", val: data.hostels },
            { id: "roomCount", val: data.rooms },
            { id: "roomTypeCount", val: data.roomtypes },
            { id: "messCount", val: data.mess },
            { id: "messContactCount", val: data.messcontacts },
            { id: "mealCount", val: data.meals },
            { id: "staffCount", val: data.staff },
            { id: "staffPhoneCount", val: data.staffphones },
            { id: "wardenCount", val: data.wardens },
            { id: "wardenPhoneCount", val: data.wardenphones },
            { id: "supplierCount", val: data.suppliers },
            { id: "supplierPhoneCount", val: data.supplierphones },
            { id: "inventoryCount", val: data.inventory },
            { id: "procuresCount", val: data.procures },
            { id: "paymentCount", val: data.payments },
            { id: "paymentDetailCount", val: data.paymentdetails }
        ];

        counts.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                if (typeof window.animateCount === "function") {
                    window.animateCount(el, item.val, 700);
                } else {
                    el.textContent = item.val;
                }
            }
        });
    })
    .catch(error => {
        console.error("error loading dashboard:", error);
    });