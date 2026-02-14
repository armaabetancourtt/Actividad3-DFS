document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('audi_token');
    const userName = localStorage.getItem('audi_user_name');
    const welcomeTitle = document.getElementById('welcome-user');

    if (!token) {
        window.location.href = '../../ACT3/pages/login.html';
        return;
    }

    if (userName) {
        welcomeTitle.innerText = `BIENVENIDO, ${userName.toUpperCase()}`;
    }

    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => navMenu.classList.add('active'));
    closeIcon.addEventListener('click', () => navMenu.classList.remove('active'));

    document.getElementById('btn-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('audi_token');
        localStorage.removeItem('audi_user_name');
        window.location.href = '../../ACT3/pages/login.html';
    });
});
