import Staff from "./../models/Staff.js";
import ManageStaff from "./../models/ManageStaff.js";
import Validation from "./../models/Validation.js";

const dataStore = [];
const validation = new Validation();
const manageStaff = new ManageStaff();

const getEleId = (id) => document.getElementById(id);

getEleId("btnThem").onclick = () => {
    // Hide "Cap Nhat" button
    getEleId("btnCapNhat").style.display = "none";
    // Show "Them Mon" button
    getEleId("btnThemNV").style.display = "block";
    // Reset the form
    getEleId("staffForm").reset();
};

/**
 * Delete a staff member from the list
 */
const deleteStaff = (id) => {
    manageStaff._deleteStaff(id);
    renderStaff(manageStaff.listStaff);
    setLocalStorage();
};
window.deleteStaff = deleteStaff;

const editStaff = (taiKhoan) => {
    // Hide "Them Mon" button
    getEleId("btnThemNV").style.display = "none";
    // Show "Cap Nhat" button
    getEleId("btnCapNhat").style.display = "block";
    const staff = manageStaff.getStaffById(taiKhoan);
    if (staff) {
        getEleId("tknv").value = staff.taiKhoan;
        getEleId("name").value = staff.hoTen;
        getEleId("email").value = staff.email;
        getEleId("password").value = staff.password;
        getEleId("datepicker").value = staff.ngayLam;
        getEleId("luongCB").value = staff.luongCB;
        getEleId("chucvu").value = staff.chucVu;
        getEleId("gioLam").value = staff.gioLam;
    }
};
window.editStaff = editStaff;

/**
 * Render the staff list in the table
 */
const renderStaff = (listStaff) => {
    let contentHTML = "";
    listStaff.forEach((staff) => {
        contentHTML += `
        <tr>
                <td>${staff.taiKhoan}</td>
                <td>${staff.hoTen}</td>
                <td>${staff.email}</td>
                <td>${staff.ngayLam}</td>
                <td>${staff.chucVu}</td>
                <td>${staff.tongLuong}</td>
                <td>${staff.loaiNhanVien}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteStaff('${staff.taiKhoan}')">Delete</button>
                    <button class="btn btn-info" data-toggle="modal" data-target="#myModal" onclick="editStaff('${staff.taiKhoan}')">Edit</button>
                </td>
            </tr>
        `;
    });
    getEleId("tableDanhSach").innerHTML = contentHTML;
};

/**
 * Save the staff list to local storage
 */
const setLocalStorage = () => {
    const dataString = JSON.stringify(manageStaff.listStaff);
    localStorage.setItem("LIST_STAFF", dataString);
};

/**
 * Get the staff list from local storage
 */
const getLocalStorage = () => {
    const dataString = localStorage.getItem("LIST_STAFF");
    if (dataString) {
        const dataJson = JSON.parse(dataString);
        manageStaff.listStaff = dataJson;
        renderStaff(manageStaff.listStaff);
    }
};
getLocalStorage();

/**
 * Collect staff information from the form
 */
const getInfoStaff = () => {
    const taiKhoan = getEleId("tknv").value;
    const hoTen = getEleId("name").value;
    const email = getEleId("email").value;
    const password = getEleId("password").value;
    const date = getEleId("datepicker").value;
    const luongCB = getEleId("luongCB").value;
    const chucVu = getEleId("chucvu").value;
    const gioLam = getEleId("gioLam").value;

    let isValid = true;

    isValid &= validation.isEmpty(taiKhoan, "Please enter account name", "tbTKNV") &&
               validation.checkAccount(taiKhoan, "Account must have 4-6 digits", "tbTKNV");

    isValid &= validation.isEmpty(hoTen, "Please enter name", "tbTen") &&
               validation.checkName(hoTen, "Name should contain letters only", "tbTen");

    isValid &= validation.isEmpty(email, "Please enter email", "tbEmail") &&
               validation.checkEmail(email, "Invalid email", "tbEmail");

    isValid &= validation.isEmpty(password, "Please enter password", "tbMatKhau") &&
               validation.checkPassword(password, "Password must be 6-10 characters with at least one number, uppercase letter, and special character", "tbMatKhau");

    isValid &= validation.isEmpty(date, "Please enter the work date", "tbNgay") &&
               validation.checkDate(date, "Date format should be mm/dd/yyyy", "tbNgay");

    isValid &= validation.isEmpty(luongCB, "Please enter salary", "tbLuongCB") &&
               validation.checkSalary(luongCB, "Salary must be between 1,000,000 and 20,000,000", "tbLuongCB");

    isValid &= validation.checkPosition(chucVu, "Please select a valid position", "tbChucVu");

    isValid &= validation.isEmpty(gioLam, "Please enter working hours", "tbGiolam") &&
               validation.checkWorkHours(gioLam, "Working hours must be between 80 and 200", "tbGiolam");

    if (isNaN(parseFloat(luongCB))) {
        alert("Invalid salary!");
        return null;
    }

    if (isValid) {
        const staff = new Staff(taiKhoan, hoTen, email, password, date, luongCB, chucVu, gioLam);
        return staff;
    }
    return null;
};

getEleId("btnThemNV").onclick = () => {
    const staff = getInfoStaff();
    if (staff) {
        manageStaff.addStaff(staff);
        renderStaff(manageStaff.listStaff);
        setLocalStorage();
        getEleId("btnDong").click(); // Close modal
    }
};

getEleId("btnCapNhat").onclick = () => {
    const staff = getInfoStaff();
    if (!staff) return;
    manageStaff.updateStaff(staff);
    renderStaff(manageStaff.listStaff);
    setLocalStorage();
    getEleId("btnDong").click(); // Close modal
};

/**
 * Search staff by position
 */
getEleId("searchName").addEventListener("keyup", () => {
    const keyword = getEleId("searchName").value;
    const filteredData = manageStaff.listStaff.filter((staff) => {
        return staff.loaiNhanVien.toLowerCase().includes(keyword.toLowerCase());
    });
    renderStaff(filteredData);
});

/**
 * Search staff by name
 */
getEleId("searchTen").addEventListener("keyup", () => {
    const keyword = getEleId("searchTen").value;
    const filteredData = manageStaff.listStaff.filter((staff) => {
        return staff.hoTen.toLowerCase().includes(keyword.toLowerCase());
    });
    renderStaff(filteredData);
});
