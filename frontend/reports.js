function loadReport(url, tableId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector(`#${tableId} tbody`);

            tbody.innerHTML = "";

            data.forEach(row => {
                const tr = document.createElement("tr");

                Object.values(row).forEach(value => {
                    const td = document.createElement("td");

                    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                        value = value.substring(0, 10);
                    }

                    td.textContent = value ?? "";
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("error loading report:", error);
        });
}

loadReport("/api/reports/student-hostel", "studentHostelReport");

loadReport("/api/reports/student-payments", "studentPaymentReport");

loadReport("/api/reports/hostel-occupancy", "hostelOccupancyReport");

loadReport("/api/reports/mess-meals", "messMealReport");

loadReport("/api/reports/staff-mess", "staffMessReport");

loadReport("/api/reports/procurement", "procurementReport");

loadReport("/api/reports/payment-details", "paymentDetailsReport");

loadReport("/api/reports/warden-hostel", "wardenHostelReport");