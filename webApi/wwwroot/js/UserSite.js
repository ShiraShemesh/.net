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

    const storedKey = 'token_' + name+"_"+password;
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
                headers: { 'Content-Type': 'application/json' },
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
                    localStorage.setItem('token', data.token);
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
    // find the user to know which token key to remove
    const user = list.find(u => u.id === id);
    const oldName = user ? (user.Name ?? user.name) : null;
    const oldPass = user ? (user.Password ?? user.password ?? user.Passward) : null;
    const oldKey = oldName && oldPass ? 'token_' + oldName + "_" + oldPass : null;

    fetch(`${uri}/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                return response.text().then(t => { throw new Error(t); });
            }
            // if token exists for that user, remove it
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
        .catch(error => console.error('Unable to delete item.', error));
}


function displayEditForm(id) {
    const item = list.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-Id').value = item.id;
    document.getElementById('edit-Name').value = item.name;
    document.getElementById('edit-Age').value = item.age;
    document.getElementById('edit-Password').value = item.Password;
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

    const item = {
        id: parseInt(itemId),
        name,
        age: parseInt(age),
        Password: password
    };

    // remember old user values to update token key if name/password changed
    const oldUser = list.find(u => u.id === parseInt(itemId));
    const oldName = oldUser ? (oldUser.Name ?? oldUser.name) : null;
    const oldPass = oldUser ? (oldUser.Password ?? oldUser.password ?? oldUser.Passward) : null;
    const oldKey = oldName && oldPass ? 'token_' + oldName + "_" + oldPass : null;

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(t => { throw new Error(t); });
            }
            getItems();
            // after successful update, if name/password changed we need to update the token key
            const newKey = 'token_' + name + "_" + password;
            if (oldKey && oldKey !== newKey) {
                // remove old key and its session token if it matches
                const oldTokenVal = localStorage.getItem(oldKey);
                localStorage.removeItem(oldKey);
                const current = localStorage.getItem('token');
                if (current && oldTokenVal && current === oldTokenVal) {
                    localStorage.removeItem('token');
                }
            }

            // try to get a fresh token for the updated credentials and store under new key
            fetch(uri + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Name: name, Password: password })
            })
            .then(r => {
                if (!r.ok) {
                    // cannot get token (wrong password etc.) — just close the editor
                    closeInput();
                    return;
                }
                return r.json();
            })
            .then(d => {
                if (d && d.token) {
                    localStorage.setItem(newKey, d.token);
                    localStorage.setItem('token', d.token);
                }
                closeInput();
            })
            .catch(err => {
                console.error('Token update failed:', err);
                closeInput();
            });
        })
        .catch(error => console.error('Update failed:', error));

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
        tr.insertCell(1).textContent = item.name;
        tr.insertCell(2).textContent = item.age;
     tr.insertCell(3).textContent = item.Password;
        const editTd = tr.insertCell(4);
        const editBtn = document.createElement('button');
        editBtn.className = ('edit-button')
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => displayEditForm(item.id);
        editTd.appendChild(editBtn);

        const delTd = tr.insertCell(5);
        const delBtn = document.createElement('button');
        delBtn.className = ('delete-button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deleteItem(item.id);
        delTd.appendChild(delBtn);
    });

    list = data;
}
