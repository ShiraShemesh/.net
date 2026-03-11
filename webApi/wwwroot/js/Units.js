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

function getRoleFromToken() {
    const token = sessionStorage.getItem('token');
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
        if (addEmail)addEmail.style.display = 'block';
        if (editEmail) editEmail.style.display = 'block';
    }
}

function getAuthHeader() {
    const token = sessionStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
