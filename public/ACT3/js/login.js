document.addEventListener('DOMContentLoaded', () => {
    const contenedorLogin = document.getElementById('container-login');
    const contenedorRegistro = document.getElementById('container-register');
    const btnMostrarRegistro = document.getElementById('show-register');
    const btnMostrarLogin = document.getElementById('show-login');

    const formularioLogin = document.getElementById('login-form');
    const formularioRegistro = document.getElementById('register-form');
    const cajaMensaje = document.getElementById('msg');

    const API_URL = '/api';

    const mostrarMensaje = (texto, esError = true) => {
        cajaMensaje.textContent = texto;
        cajaMensaje.className = esError ? 'msg-box error' : 'msg-box success';
        cajaMensaje.style.display = 'block';
    };

    btnMostrarRegistro.addEventListener('click', e => {
        e.preventDefault();
        contenedorLogin.style.display = 'none';
        contenedorRegistro.style.display = 'block';
        cajaMensaje.style.display = 'none';
    });

    btnMostrarLogin.addEventListener('click', e => {
        e.preventDefault();
        contenedorRegistro.style.display = 'none';
        contenedorLogin.style.display = 'block';
        cajaMensaje.style.display = 'none';
    });

    formularioRegistro.addEventListener('submit', async e => {
        e.preventDefault();

        const usuario = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();

        if (!usuario || !password) {
            mostrarMensaje('Completa todos los campos');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });

            const data = await res.json();

            if (res.ok) {
                mostrarMensaje('Usuario creado con éxito', false);
                formularioRegistro.reset();
                setTimeout(() => btnMostrarLogin.click(), 1500);
            } else {
                mostrarMensaje(data.error || 'Error en el registro');
            }
        } catch {
            mostrarMensaje('Error de conexión con el servidor');
        }
    });

    formularioLogin.addEventListener('submit', async e => {
        e.preventDefault();

        const usuario = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!usuario || !password) {
            mostrarMensaje('Usuario y contraseña requeridos');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('audi_token', data.token);
                localStorage.setItem('audi_usuario', data.usuario);

                mostrarMensaje('Acceso concedido...', false);
                setTimeout(() => {
                    window.location.href = '../../ACT2/pages/dashboard.html';
                }, 1200);
            } else {
                mostrarMensaje(data.error || 'Credenciales incorrectas');
            }
        } catch {
            mostrarMensaje('Error de conexión con el servidor');
        }
    });
});

