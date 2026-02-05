class AudiMenu {
    constructor() {
        this.menuIcon = document.getElementById('menu-icon');
        this.navMenu = document.getElementById('nav-menu');
        this.closeIcon = document.getElementById('close-icon');
        this.form = document.querySelector('.formulario');

        this.init();
    }

    init() {
        if (this.menuIcon && this.navMenu) {
            this.menuIcon.addEventListener('click', () => this.toggleMenu(true));
            
            if (this.closeIcon) {
                this.closeIcon.addEventListener('click', () => this.toggleMenu(false));
            }

            this.navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.toggleMenu(false);
                }
            });
        }

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    toggleMenu(state) {
        this.navMenu.classList.toggle('active', state);
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const data = {
            nombre: document.getElementById('nombre')?.value,
            email: document.getElementById('email')?.value,
            mensaje: document.getElementById('mensaje')?.value
        };

        if (Object.values(data).every(val => val?.trim())) {
            alert(`Gracias ${data.nombre}, hemos recibido tu mensaje.`);
            this.form.reset();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudiMenu();
});