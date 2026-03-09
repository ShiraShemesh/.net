const uri = '/Jewelry';
let list = [];
function getRoleFromToken() {
    const token = localStorage.getItem('token');
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
function checkUIPermissions() {
    if (getRoleFromToken() === 'Admin') {
        document.getElementById('add-Email').style.display = 'block';
        document.getElementById('edit-Email').style.display = 'block';
    }
}
checkUIPermissions();
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function getItems() {
    fetch(uri, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => {
            if (response.status === 401) {
                alert("לא מחובר או שהתחברות פגה");
                window.location.href = 'login.html';
                return;
            }
            return response.json();
        })
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const color = parseInt(document.getElementById('add-Color').value, 10);
    const price = parseInt(document.getElementById('add-Price').value, 10);
    const email = getRoleFromToken() === 'Admin' ? document.getElementById('add-Email').value.trim() : "";

    const item = {
        Email: email,
        Color: color,
        Price: price
    };

    fetch(uri, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.ok) {
                getItems();
                document.getElementById('add-Email').value = '';
            }
        });
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
        .then(response => {
            if (response.ok) {
                getItems();
            } else if (response.status === 403) {
                alert("אין לך הרשאה למחוק פריט זה!");
            } else {
                alert("מחיקה נכשלה");
            }
        })
        .catch(error => console.error('Unable to delete item.', error));
}

function updateItem() {
    const itemId = document.getElementById('edit-id').value;
    const emailValue = getRoleFromToken() === 'Admin' ? document.getElementById('edit-Email').value : "";
    const colorValue = parseInt(document.getElementById('edit-Color').value, 10);
    const priceValue = parseInt(document.getElementById('edit-price').value, 10);

    const item = {
        Id: parseInt(itemId, 10),
        Email: emailValue,
        Color: colorValue,
        Price: priceValue
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.ok) {
                getItems();
                closeInput();
            } else if (response.status === 403) {
                alert("אין לך הרשאה לערוך פריט זה");
            }
        });
}
function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(count) {
    const email = count === 1 ? 'item' : 'items';
    document.getElementById('counter').innerText = `${count} ${email}`;
}
function displayEditForm(id) {
    const item = list.find(i => i.id === id);
    if (!item) return;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-Email').value = item.email;
    document.getElementById('edit-Color').value = item.color;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('editForm').style.display = 'block';
}

function _displayItems(data) {
    const tBody = document.getElementById('list');
    tBody.innerHTML = '';
    _displayCount(data.length);

    data.forEach(item => {
        const tr = tBody.insertRow();

        tr.insertCell(0).textContent = item.id;
        tr.insertCell(1).textContent = item.email;
        tr.insertCell(2).textContent = item.color;
        tr.insertCell(3).textContent = item.price;

        let tdEdit = tr.insertCell(4);
        let editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
            displayEditForm(item.id);
            if (getRoleFromToken() === 'Admin') {
                document.getElementById('edit-Email').value = item.email;
            }
        };
        tdEdit.appendChild(editButton);

        let tdDelete = tr.insertCell(5);
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteItem(item.id);
        tdDelete.appendChild(deleteButton);
    });
    list = data;
}
