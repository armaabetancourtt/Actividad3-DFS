document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('audi_token');
    if (token) {
        window.location.href = '../../ACT2/pages/tareas.html';
        return;
    }

    const containerLogin = document.getElementById('container-login');
    const containerRegister = document.getElementById('container-register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const msgBox = document.getElementById('msg');

    const API_URL = '/api';

    const showMessage = (text, isError = true) => {
        msgBox.textContent = text;
        msgBox.className = isError ? 'msg-box error' : 'msg-box success';
        msgBox.style.display = 'block';
    };

    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        containerLogin.style.display = 'none';
        containerRegister.style.display = 'block';
        msgBox.style.display = 'none';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        containerRegister.style.display = 'none';
        containerLogin.style.display = 'block';
        msgBox.style.display = 'none';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Usuario creado con éxito.', false);
                registerForm.reset();
                setTimeout(() => showLogin.click(), 2000);
            } else {
                showMessage(data.error || 'Error en el registro');
            }
        } catch (err) {
            showMessage('Error de conexión con el servidor');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('audi_token', data.token);
                showMessage('Acceso concedido. Redirigiendo...', false);
                setTimeout(() => window.location.href = '../../ACT2/pages/tareas.html', 1500);
            } else {
                showMessage(data.error || 'Credenciales incorrectas');
            }
        } catch (err) {
            showMessage('Error de conexión con el servidor');
        }
    });
});
