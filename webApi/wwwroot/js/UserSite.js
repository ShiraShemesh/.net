const uri = '/User';
let list = [];

function getItems() {
    fetch(uri)
        .then(response => {
            if (!response.ok) {
                return response.text().then(t => { throw new Error(t); });
            }
            return response.json();
        })
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const name = document.getElementById('add-Name').value.trim();
    const age = document.getElementById('add-Age').value.trim();
    const password = document.getElementById('add-Password').value.trim();
    if (!name || !age || !password) {
        alert("Please fill all fields");
        return false;
    }

    const token = localStorage.getItem('token'); // שליפת טוקן של המשתמש הנוכחי 
    const storedKey = 'token_' + name + "_" + password;
    const newUser = { Name: name, Age: parseInt(age), Password: password };

    fetch(uri)
        .then(response => {
            if (!response.ok) return response.text().then(t => { throw new Error(t); });
            return response.json();
        })
        .then(users => {
            const exists = users.find(u => (u.Name ?? u.name) === name && (u.Password ?? u.password) === password);
            if (exists) {
                return;
            }
            return fetch(uri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newUser)
            })
                .then(resp => {
                    if (!resp.ok) return resp.text().then(t => { throw new Error(t); });
                    return fetch(uri + '/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ Name: name, Password: password })
                    });
                })
                .then(r => {
                    if (!r.ok) return r.text().then(t => { throw new Error(t); });
                    return r.json();
                })
                .then(data => {
                    if (data && data.token) {
                        localStorage.setItem(storedKey, data.token);
                        // כאן הורדתי את השורה שדורסת את ה-token הכללי כדי שלא תתנתקי
                    }
                    getItems();
                    document.getElementById('add-Name').value = '';
                    document.getElementById('add-Age').value = '';
                    document.getElementById('add-Password').value = '';
                });
        })
        .catch(error => {
            console.error('Add/create failed:', error);
            alert('Failed to create user: ' + error.message);
        });

    return false;
}

function deleteItem(id) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("עליך להיות מחובר כדי למחוק!");
        return;
    }

    const user = list.find(u => u.id === id);
    const oldName = user ? (user.Name ?? user.name) : null;
    const oldPass = user ? (user.Password ?? user.password) : null;
    const oldKey = oldName && oldPass ? 'token_' + oldName + "_" + oldPass : null;

    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("אין לך הרשאת מנהל לביצוע מחיקה.");
                }
                return response.text().then(t => { throw new Error(t); });
            }

            if (oldKey) {
                const tokenVal = localStorage.getItem(oldKey);
                localStorage.removeItem(oldKey);
                const current = localStorage.getItem('token');
                if (current && tokenVal && current === tokenVal) {
                    localStorage.removeItem('token');
                }
            }
            getItems();
        })
        .catch(error => {
            console.error('Unable to delete item.', error);
            alert(error.message);
        });
}

function displayEditForm(id) {
    const item = list.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-Id').value = item.id;
    document.getElementById('edit-Name').value = item.name ?? item.Name;
    document.getElementById('edit-Age').value = item.age ?? item.Age;
    document.getElementById('edit-Password').value = item.password ?? item.Password;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const itemId = document.getElementById('edit-Id').value;
    const name = document.getElementById('edit-Name').value.trim();
    const age = document.getElementById('edit-Age').value.trim();
    const password = document.getElementById('edit-Password').value.trim();

    if (!itemId || !name || !age || !password) {
        alert("Please fill all fields");
        return false;
    }

    const token = localStorage.getItem('token');

    const item = {
        id: parseInt(itemId),
        name,
        age: parseInt(age),
        Password: password
    };

    const oldUser = list.find(u => u.id === parseInt(itemId));
    const oldName = oldUser ? (oldUser.Name ?? oldUser.name) : null;
    const oldPass = oldUser ? (oldUser.Password ?? oldUser.password) : null;
    const oldKey = oldName && oldPass ? 'token_' + oldName + "_" + oldPass : null;

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("אין לך הרשאת מנהל לעדכן משתמשים.");
                }
                return response.text().then(t => { throw new Error(t); });
            }

            getItems();

            const newKey = 'token_' + name + "_" + password;
            if (oldKey && oldKey !== newKey) {
                const oldTokenVal = localStorage.getItem(oldKey);
                localStorage.removeItem(oldKey);
                const current = localStorage.getItem('token');
                if (current && oldTokenVal && current === oldTokenVal) {
                    localStorage.removeItem('token');
                }
            }

            return fetch(uri + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Name: name, Password: password })
            });
        })
        .then(r => {
            if (r && r.ok) return r.json();
            closeInput();
        })
        .then(d => {
            if (d && d.token) {
                const newKey = 'token_' + name + "_" + password;
                localStorage.setItem(newKey, d.token);
                localStorage.setItem('token', d.token);
            }
            closeInput();
        })
        .catch(error => {
            console.error('Update failed:', error);
            alert(error.message);
        });

    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(count) {
    document.getElementById('counter').innerText =
        `${count} ${count === 1 ? 'item' : 'items'}`;
}

function _displayItems(data) {
    const tBody = document.getElementById('list');
    tBody.innerHTML = '';
    _displayCount(data.length);
    data.forEach(item => {
        const tr = tBody.insertRow();

        tr.insertCell(0).textContent = item.id;
        tr.insertCell(1).textContent = item.name ?? item.Name;
        tr.insertCell(2).textContent = item.age ?? item.Age;
        tr.insertCell(3).textContent = item.password ?? item.Password;

        const editTd = tr.insertCell(4);
        const delTd = tr.insertCell(5);


        const editBtn = document.createElement('button');
        editBtn.className = 'edit-button';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => displayEditForm(item.id);
        editTd.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-button';
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteItem(item.id);
        delTd.appendChild(delBtn);

    });

    list = data;
}