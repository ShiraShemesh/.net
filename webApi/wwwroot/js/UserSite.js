const uri = '/User';
let list = [];
async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
    }
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
        return null;
    }
    return response.json();
}
//פונקצית עזר לקבלת הנתונים מהטופס
function getElements(methodName) {
    const name = document.getElementById(`${methodName}-Name`).value.trim();
    const email = document.getElementById(`${methodName}-Email`).value.trim();
    const password = document.getElementById(`${methodName}-Password`).value.trim();

    if (!email || !password || !name) {
        alert("Please fill all fields");
        return;
    }
    return { Name: name, Email: email, Password: password };
}
function getEmailFromToken() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
}
function getRoleFromToken() {
    const token = sessionStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1]; 
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.type;
    } catch (e) {
        console.error("שגיאה בפיענוח הטוקן:", e);
        return null;
    }
}
function getItems() {
    fetch(uri, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
        .then(handleResponse)
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get users.', error));
}

function addItem() {
    const newUser = getElements('add');
    if (!newUser) return false;

    // לא עושים GET לפני POST! פשוט שולחים והשרת יחזיר שגיאה אם המייל קיים
    fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...newUser, IsAdmin: false })
    })
        .then(response => {
            if (response.ok) {
                alert("המשתמש נוסף בהצלחה!");
                getItems();
                // ניקוי שדות...
            } else {
                alert("שגיאה בהוספה (ייתכן שהמייל כבר קיים)");
            }
        })
        .catch(error => console.error("Error:", error));

    return false;
}
function deleteItem(id) {
    const token = sessionStorage.getItem('token');
    if (!token) return alert("עליך להיות מחובר כדי למחוק!");

    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(handleResponse)
        .then(() => getItems())
        .catch(error => alert(error.message));
}

function updateItem() {
    const itemId = document.getElementById('edit-Id').value;
    const name = document.getElementById('edit-Name').value.trim();
    const email = document.getElementById('edit-Email').value.trim();
    const password = document.getElementById('edit-Password').value.trim();
    const isAdminField = document.getElementById('edit-IsAdmin');
    const isAdmin = isAdminField ? isAdminField.checked : false;

    const token = sessionStorage.getItem('token');

    const item = {
        id: parseInt(itemId),
        Name: name,
        Email: email,
        Password: password,
        IsAdmin: isAdmin
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.status === 200) {
                              return response.json();
            } else if (response.status === 204) {
                          return null;
            } else {
                throw new Error("Update failed");
            }
        })
        .then(data => {
            if (data && data.token) {
                sessionStorage.setItem('token', data.token); 
                console.log("Token refreshed");
            }
            getItems();
            closeInput();
            alert("העדכון בוצע בהצלחה!");
        })
        .catch(error => alert(error.message));
}

function _displayItems(data) {
    const role = getRoleFromToken();
    const tBody = document.getElementById('list');
    tBody.innerHTML = '';
    list = data; 
    if (role === "Admin") {
        document.getElementById('add-user-section').style.display = 'block'; // // סימון לפי הנתון מהשרת
    }
    list.forEach(item => {
        const tr = tBody.insertRow();
        tr.insertCell(0).textContent = item.id;
        tr.insertCell(1).textContent = item.name;
        tr.insertCell(2).textContent = item.email;
        tr.insertCell(3).textContent = item.password;
        tr.insertCell(4).textContent = item.isAdmin ? "Admin" : "User";

        // כפתור עריכה
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => displayEditForm(item.id);
        tr.insertCell(5).appendChild(editBtn);

        // כפתור מחיקה רק למנהל
        if (role === "Admin") {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => deleteItem(item.id);
            tr.insertCell(6).appendChild(delBtn);
        }
    });
}

function displayEditForm(id) {
    //Kבדוק בשרת את הנתונים ולהחזיר מהשרת רשימה ממוינת!!!!
    var role = getRoleFromToken();
    const item = list.find(i => i.id === id);
    if (!item) return;

    // מילוי השדות הרגילים
    document.getElementById('edit-Id').value = item.id;
    document.getElementById('edit-Name').value = item.name ?? item.Name ?? '';
    document.getElementById('edit-Email').value = item.email ?? item.Email ?? '';
    document.getElementById('edit-Password').value = item.password ?? item.Password ?? '';
    // טיפול בצ'קבוקס המנהל
    const adminSection = document.getElementById('admin-section');
    const adminCheckbox = document.getElementById('edit-IsAdmin');

    if (role === "Admin") {
        adminSection.style.display = 'block'; // הצגת כל האזור למנהל
        adminCheckbox.checked = item.isAdmin ?? item.IsAdmin ?? false;

    } else {
        adminSection.style.display = 'none';
    }

    document.getElementById('editForm').style.display = 'block';
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}