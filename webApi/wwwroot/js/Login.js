const form = document.getElementById('loginForm');
const userUri = '/UserController'; 
const authUri = '/api/Auth';    
async function initGoogleSignIn() {
    try {
       
        const response = await fetch('/api/Auth/google-id');
        const data = await response.json();
        if (!data.available || !data.clientId) {
            const googleButton = document.getElementById("googleButton");
            if (googleButton) {
                googleButton.innerHTML = `
                    <button type="button" style="padding: 10px 20px; background-color: #ccc; color: #666; border: 1px solid #999; border-radius: 4px; cursor: not-allowed;" disabled>
                        🔒 Google - דרוש הגדרה של secret!
                    </button>
                `;
                googleButton.title = "דרוש הגדרה של Google Client ID ו-Secret כדי להשתמש בכניסה דרך Google";
            }
            console.warn("Google authentication is not configured");
            return;
        }

        google.accounts.id.initialize({
            client_id: data.clientId,
            callback: handleCredentialResponse
        });

        google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { theme: "outline", size: "large", text: "signin_with" }
        );
    } catch (error) {
        console.error("שגיאה בטעינת Google Client ID:", error);
        const googleButton = document.getElementById("googleButton");
        if (googleButton) {
            googleButton.innerHTML = `
                <button type="button" style="padding: 10px 20px; background-color: #ccc; color: #666; border: 1px solid #999; border-radius: 4px; cursor: not-allowed;" disabled>
                    ⚠️ שגיאה בטעינת Google
                </button>
            `;
        }
    }
}

window.onload = initGoogleSignIn;
form.addEventListener('submit', function (event) {
    event.preventDefault();
    checkAndLogin();
});
function handleCredentialResponse(response) {
    fetch(authUri + '/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
    })
        .then(res => res.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "User.html";
            } else if (data.error) {
                alert("שגיאה: " + data.error);
            }
        })
        .catch(err => {
            console.error("Login error:", err);
            alert("חלה שגיאה בתהליך ההתחברות.");
        });
}
document.getElementById('forgotPassword').addEventListener('click', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-Email').value.trim();

    if (!email) {
        alert("נא להזין קודם את כתובת המייל שלך");
        return;
    }
    fetch(userUri + '/check-email/' + email)
        .then(res => res.json())
        .then(data => {
            if (data.exists) {
                const newPass = prompt("בחר סיסמה חדשה לחשבון שלך:");
                if (newPass) {
                    updatePasswordOnServer(email, newPass);
                }
            } else {
                alert("המייל לא נמצא במערכת, אנא הירשם קודם.");
            }
        });
});

function updatePasswordOnServer(email, password) {
    fetch(authUri + '/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password })
    })
        .then(res => {
            if (res.ok) alert("הסיסמה עודכנה! כעת תוכלי להיכנס רגיל.");
            else alert("שגיאה בעדכון הסיסמה.");
        });
}
function checkAndLogin() {
    const name = document.getElementById('login-Name').value.trim();
    const email = document.getElementById('login-Email').value.trim();
    const password = document.getElementById('login-Password').value.trim();

    if (!name || !email || !password) {
        alert("נא למלא את כל השדות.");
        return;
    }

    fetch(authUri + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: name, Password: password, Email: email })
    })
        .then(response => {
            if (response.ok) return response.json();
            if (response.status === 401) throw new Error('שם משתמש או סיסמה שגויים');
            if (response.status === 404) throw new Error('משתמש לא קיים. אנא הירשם דרך גוגל או דף הרשמה');
            throw new Error('שגיאת שרת');
        })
        .then(data => {
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = 'User.html';
            }
        })
        .catch(error => alert(error.message));
}

function addItem() {
    const name = document.getElementById('login-Name').value.trim();
    const email = document.getElementById('login-Email').value.trim(); 
    const password = document.getElementById('login-Password').value.trim();

    if (!name || !email || !password) {
        alert("Please fill all fields correctly.");
        return Promise.reject(new Error('Invalid input'));
    }

    const item = {
        Name: name,
        Email: email, 
        Password: password
    };

    return fetch(authUri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(`Error ${response.status}: ${text}`); });
            }
            document.getElementById('login-Name').value = '';
            document.getElementById('login-Email').value = ''; 
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
    fetch(authUri)
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            if (typeof displayUsers === "function") {
                displayUsers(data);
            }
        })
        .catch(error => {
            console.error('Unable to get items.', error);
        });
}