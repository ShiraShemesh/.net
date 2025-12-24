const uri = '/Jewelry';
let list = [];

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const name = document.getElementById('add-Name').value.trim();
    const color = parseInt(document.getElementById('add-Color').value, 10);
    const price = parseInt(document.getElementById('add-Price').value, 10);
    
    if (!name || isNaN(color) || isNaN(price)) {
        alert("Please fill all fields (Name, Color, Price) correctly");
        return false;
    }

    const item = { name, color, price };

    fetch(uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(response => {
        if (response.ok) {
            getItems();
            document.getElementById('add-Name').value = '';
            document.getElementById('add-Color').value = '';
            document.getElementById('add-Price').value = '';
        } else {
            console.error('Add failed with status:', response.status);
        }
    })
    .catch(error => console.error('Fetch error:', error));
    return false;
}

function deleteItem(id) {
    fetch(`${uri}/${id}`, { method: 'DELETE' })
        .then(() => getItems())
        .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
    const item = list.find(i => i.id === id);
    if (!item) return;
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-Color').value = item.color;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const itemId = document.getElementById('edit-id').value.trim();
    const name = document.getElementById('edit-name').value.trim();
    const color = parseInt(document.getElementById('edit-Color').value, 10);
    const price = parseInt(document.getElementById('edit-price').value, 10);
    
    if (!itemId || !name || isNaN(color) || isNaN(price)) {
        alert("Please fill all fields (ID, Name, Color, Price) correctly");
        return false;
    }
    
    const item = {
        id: parseInt(itemId, 10),
        name,
        color,
        price
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
    .then(response => {
        if (response.ok) {
            getItems();
            closeInput();
        } else {
            console.error('Update failed with status:', response.status);
        }
    })
    .catch(error => console.error('Fetch error:', error));

    return false;
}

function closeInput() {
    document.getElementById('editForm').style.display = 'none';
}

function _displayCount(count) {
    const name = count === 1 ? 'item' : 'items';
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

        let tdColor = tr.insertCell(2);
      tdColor.textContent = item.color;

        let tdPrice = tr.insertCell(3);
        tdPrice.textContent = item.price;

        let tdEdit = tr.insertCell(4);
        let editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button'; 
        editButton.addEventListener('click', () => displayEditForm(item.id));
        tdEdit.appendChild(editButton);

        let tdDelete = tr.insertCell(5);
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => deleteItem(item.id));
        tdDelete.appendChild(deleteButton);
    });
    list = data;
}
