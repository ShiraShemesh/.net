const uri = '/Jewelry';
let instruments = [];
let list = [];

function getItems() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayItems(data))
        .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
    const name = document.getElementById('add-Name').value.trim();
    const category = document.getElementById('add-Category').value;
    const price = parseInt(document.getElementById('add-Price').value, 10);
    
    if (!name || !category || isNaN(price)) {
        alert("Please fill all fields (Name, Category, Price)");
        return false;
    }

    const item = { name, category, price };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.status === 200 || response.status === 201 || response.status === 204) {
                getItems();
                document.getElementById('add-Name').value = '';
                document.getElementById('add-Category').value = '';
                document.getElementById('add-Price').value = '';
            } else {
                console.error('Add failed with status:', response.status);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    return false;
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
    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-category').value = item.category;
    document.getElementById('edit-price').value = item.price;
    document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
    const itemId = document.getElementById('edit-id').value.trim();
    const name = document.getElementById('edit-name').value.trim();
    const category = document.getElementById('edit-category').value;
    const price = document.getElementById('edit-price').value.trim();
    
    if (!itemId || !name || !category || !price || isNaN(parseInt(price))) {
        alert("Please fill all fields (ID, Name, Category, Price)");
        return false;
    }
    
    const item = {
        id: parseInt(itemId, 10),
        name: name,
        category: category,
        price: parseInt(price, 10)
    };

    fetch(`${uri}/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (response.status === 200 || response.status === 204 || response.status === 201) {
                getItems();
                closeInput();
            } else {
                console.error('Update failed with status:', response.status);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

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

        let tdCategory = tr.insertCell(2);
        tdCategory.textContent = item.category;

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