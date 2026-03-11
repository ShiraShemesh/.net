const uri = '/Jewelry';
let list = [];

checkUIPermissions();

function getItems() {
    fetch(uri, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
        .then(response => {
            if (response.status === 401) {
                alert("לא מחובר או שהתחברות פגה");
                window.location.href = 'Login.html';
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
                showToast("הפריט נוסף בהצלחה!");
                document.getElementById('add-Email').value = '';
                document.getElementById('add-Price').value = '';
            } else {
                showToast("שגיאה בהוספת הפריט", true);
            }
        })
        .catch(error => console.error(' Unable to add item.', error));
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
        .then(response => {
            if (response.ok) {
                showToast("הפריט נמחק בהצלחה!");
            } else if (response.status === 403) {
                showToast("אין לך הרשאה למחוק פריט זה!", true);
            } else {
                showToast("מחיקה נכשלה", true);
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
                showToast("הפריט עודכן בהצלחה!");
                closeInput();
            } else if (response.status === 403) {
                showToast("אין לך הרשאה לערוך פריט זה", true);
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
