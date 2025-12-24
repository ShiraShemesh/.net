const form = document.getElementById('loginForm');
const uri = '/User';  

form.addEventListener('submit', function (event) {
    event.preventDefault(); 
    checkAndLogin();
});

function checkAndLogin() {
    const name = document.getElementById('login-Name').value.trim();
    const age = parseInt(document.getElementById('login-Age').value, 10);
    const password = document.getElementById('login-Password').value.trim();

    if (!name || isNaN(age) || !password) {
        alert("Please fill all fields correctly.");
        return;
    }
//האם להוריד????
    const storedKey = 'token_' + name+"_"+password;
    const storedToken = localStorage.getItem(storedKey);
    if (storedToken) {
        fetch(uri)
            .then(r => {
                if (!r.ok) return r.text().then(t => { throw new Error(t); });
                return r.json();
            })
            .then(users => {
                const match = users.find(u => (u.Name ?? u.name) === name && (u.Password ?? u.password) === password);
                if (match) {
                    localStorage.setItem('token', storedToken);
                    window.location.href = 'User.html';
                } else {
                    alert('Wrong credentials for existing user.');
                }
            })
            .catch(err => {
                console.error('Unable to validate stored token.', err);
                alert('Failed to validate user: ' + err.message);
            });
        return;
    }

    fetch(uri + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: name, Password: password })
    })
    .then(response => {
        if (response.ok) return response.json();
        if (response.status === 401) return null; // not found
        throw new Error('Login failed');
    })
    .then(data => {
        if (data && data.token) {
            localStorage.setItem(storedKey, data.token);
            localStorage.setItem('token', data.token);
            window.location.href = 'User.html';
        } else {
            addItem().then(() => {
                return fetch(uri + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Name: name, Password: password })
                });
            })
            .then(r => { if (!r.ok) throw new Error('Login after create failed'); return r.json(); })
            .then(d => { localStorage.setItem(storedKey, d.token); localStorage.setItem('token', d.token); window.location.href = 'User.html'; })
            .catch(err => { console.error(err); alert('Login/create failed: ' + err.message); });
        }
    })
    .catch(error => {
        console.error('Unable to login/check users.', error);
        alert('Failed to check/login users: ' + error.message);
    });
    }

function addItem() {
    const name = document.getElementById('login-Name').value.trim();
    const age = parseInt(document.getElementById('login-Age').value, 10);
    const password = document.getElementById('login-Password').value.trim();

    if (!name || isNaN(age) || !password) {
        alert("Please fill all fields correctly.");
        return Promise.reject(new Error('Invalid input'));
    }

    const item = {
        Name: name,
        Age: age,
        Password: password
    };

    return fetch(uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Error ${response.status}: ${text}`); });
            }
            document.getElementById('login-Name').value = '';
            document.getElementById('login-Age').value = '';
            document.getElementById('login-Password').value = '';
            getItems();
          
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('Failed to add user: ' + error.message);
            throw error;
        });
}

function getItems() {
    fetch(uri)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            displayUsers(data);
        })
        .catch(error => {
            console.error('Unable to get items.', error);
        });
}




