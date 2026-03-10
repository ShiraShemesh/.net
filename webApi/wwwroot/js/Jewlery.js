const uri = '/Jewelry';
let list = [];

// פונקציית עזר להצגת הודעת טוסט
function showToast(message, isError = false) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: isError ? "#ff5f6d" : "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/jewelryHub", {
        accessTokenFactory: () => localStorage.getItem('token'),
        transport: signalR.HttpTransportType.WebSocket | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

connection.on("ItemAdded", (item) => {
    getItems();
    console.log("Item added:", item);
});

connection.on("ItemUpdated", (data) => {
    getItems();
    console.log("Item updated:", data);
});

connection.on("ItemDeleted", (itemId) => {
    getItems();
    console.log("Item deleted:", itemId);
});

async function connectToHub() {
    try {
        console.log(" Attempting to connect to JewelryHub...");
        await connection.start();
        console.log(" Connected to JewelryHub successfully!");
    } catch (err) {
        console.error(" Connection failed:", err);
        setTimeout(connectToHub, 5000);
    }
}

connection.onreconnecting((error) => {
    console.log("Reconnecting:", error);
});

connection.onreconnected((connectionId) => {
    console.log("Reconnected with connectionId:", connectionId);
});

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
        const addEmail = document.getElementById('add-Email');
        const editEmail = document.getElementById('edit-Email');
        if(addEmail) addEmail.style.display = 'block';
        if(editEmail) editEmail.style.display = 'block';
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
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