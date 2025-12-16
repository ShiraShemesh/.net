const uri = '/School';
let list = [];

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const name = document.getElementById('add-Name').value.trim();
    const grade = parseInt(document.getElementById('add-Grade').value, 10);
    const age = parseInt(document.getElementById('add-Age').value, 10);

    if (!name || isNaN(grade) || isNaN(age)) {
        alert("Please fill all");
        return;
    }

    const item = { name, grade, age };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(() => {
            getItems();
            document.getElementById('add-Name').value = '';
            document.getElementById('add-Grade').value = '';
            document.getElementById('add-Age').value = '';
        })
        .catch(error => console.error('Unable to add item.', error));
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
    const item = list.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-Id').value = item.id;
    document.getElementById('edit-Name').value = item.name;
    document.getElementById('edit-Grade').value = item.grade;
    document.getElementById('edit-Age').value = item.age;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const id = parseInt(document.getElementById('edit-Id').value, 10);
    const name = document.getElementById('edit-Name').value.trim();
    const grade = parseInt(document.getElementById('edit-Grade').value, 10);
    const age = parseInt(document.getElementById('edit-Age').value, 10);

    if (!name || isNaN(grade) || isNaN(age)) {
        alert("Please fill all");
        return false;
    }

    const item = { id, name, grade, age };

    fetch(`${uri}/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(() => getItems())
        .catch(error => console.error('Unable to update item.', error));

    closeInput();
    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(count) {
    const name = count === 1 ? 'student' : 'students';
    document.getElementById('counter').innerText = `${count} ${name}`;
}

function _displayItems(data) {
    const tBody = document.getElementById('list');
    tBody.innerHTML = '';

    _displayCount(data.length);

    data.forEach(item => {
        const tr = tBody.insertRow();

        let tdId = tr.insertCell(0);
        tdId.textContent = item.id;

        let tdName = tr.insertCell(1);
        tdName.textContent = item.name;

        let tdGrade = tr.insertCell(2);
        tdGrade.textContent = item.grade;

        let tdAge = tr.insertCell(3);
        tdAge.textContent = item.age;

        let tdEdit = tr.insertCell(4);
        let editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => displayEditForm(item.id));
        tdEdit.appendChild(editButton);

        let tdDelete = tr.insertCell(5);
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteItem(item.id));
        tdDelete.appendChild(deleteButton);
    });

    list = data;
}
