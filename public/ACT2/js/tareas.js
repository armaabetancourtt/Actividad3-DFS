class Tarea {
    constructor(data) {
        this.id = data.id || data._id; 
        this.titulo = data.titulo || "Sin título";
        this.descripcion = data.descripcion || "Sin descripción detallada";
        this.categoria = data.categoria || "General";
        this.estado = data.estado || "Sin Iniciar";
        this.creadaPor = data.creadaPor || "Usuario Audi";
        this.asignadoA = data.asignadoA || "Pendiente de asignar";
        this.fechaCreacion = data.fechaCreacion || this.generarFechaActual();
        this.fechaLimiteISO = data.fechaLimiteISO || "";
        this.fechaLimiteTexto = data.fechaLimiteTexto || "Sin fecha";
    }

    generarFechaActual() {
        const d = new Date();
        const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return `${d.getDate().toString().padStart(2, '0')}-${meses[d.getMonth()]}-${d.getFullYear()}`;
    }
}

class GestorDeTareas {
    constructor() {
        this.API_URL = '/api/tareas'; 
        this.USERS_URL = '/api/usuarios';
        this.token = localStorage.getItem('audi_token');
        this.usuarioActivo = this.obtenerNombreUsuario();
        this.tickets = [];

        this.gridCreadas = document.getElementById('task-grid-creadas');
        this.gridAsignadas = document.getElementById('task-grid-asignadas');
        this.inputTitulo = document.getElementById('tituloTarea');
        this.inputDescripcion = document.getElementById('descripcionTarea'); 
        this.selectCat = document.getElementById('categoriaTarea');
        this.selectEst = document.getElementById('estadoOperativo');
        this.inputAsignadoA = document.getElementById('asignadoA'); 
        this.selDia = document.getElementById('fecha-dia');
        this.selMes = document.getElementById('fecha-mes');
        this.selAnio = document.getElementById('fecha-anio');
        this.editId = document.getElementById('edit-id');
        this.formTitle = document.getElementById('form-title');
        this.btnAgregar = document.getElementById('btn-audi');
        this.btnCancelar = document.getElementById('btn-cancel');
        this.formCard = document.getElementById('form-card');
        this.errorMsg = document.getElementById('error-msg');

        if (!this.token) {
            window.location.href = '../../index.html';
            return;
        }

        this.init();
    }

    obtenerNombreUsuario() {
        const nombreLocal = localStorage.getItem('audi_user_name');
        if (nombreLocal && nombreLocal !== "undefined") return nombreLocal;
        if (this.token) {
            try {
                const base64Url = this.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                const nombreToken = payload.usuario || payload.nombre || payload.username;
                if (nombreToken) {
                    localStorage.setItem('audi_user_name', nombreToken);
                    return nombreToken;
                }
            } catch (e) { console.error(e); }
        }
        return "Técnico Audi";
    }

    init() {
        this.poblarSelectoresFecha();
        this.cargarUsuarios();
        this.btnAgregar.onclick = () => this.procesarTicket();
        this.btnCancelar.onclick = () => this.cancelarEdicion();
        this.cargarTareas();
    }

    async cargarUsuarios() {
        try {
            const res = await fetch(this.USERS_URL, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const usuarios = await res.json();
            if (this.inputAsignadoA) {
                this.inputAsignadoA.innerHTML = '<option value="">Seleccionar Responsable...</option>';
                usuarios.forEach(user => {
                    const nombre = user.usuario || user.nombre;
                    if (nombre) {
                        const opt = document.createElement('option');
                        opt.value = nombre;
                        opt.textContent = nombre;
                        this.inputAsignadoA.appendChild(opt);
                    }
                });
            }
        } catch (err) { console.error(err); }
    }

    poblarSelectoresFecha() {
        if(!this.selDia || !this.selAnio) return;
        for (let i = 1; i <= 31; i++) {
            let opt = document.createElement('option');
            opt.value = i.toString().padStart(2, '0');
            opt.textContent = i;
            this.selDia.appendChild(opt);
        }
        for (let i = 2026; i <= 2030; i++) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            this.selAnio.appendChild(opt);
        }
    }

    async cargarTareas() {
        try {
            const res = await fetch(this.API_URL, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (res.status === 401 || res.status === 403) {
                window.location.href = '../../index.html';
                return;
            }
            const datos = await res.json();
            this.tickets = datos.map(t => new Tarea(t));
            this.render();
        } catch (err) { console.error(err); }
    }

    async procesarTicket() {
        const id = this.editId.value;
        const mesesTexto = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const iso = `${this.selAnio.value}-${this.selMes.value}-${this.selDia.value}`;
        const textoLimite = `${this.selDia.value}-${mesesTexto[parseInt(this.selMes.value) - 1]}-${this.selAnio.value}`;
        
        const body = {
            titulo: this.inputTitulo.value.trim(),
            descripcion: this.inputDescripcion.value.trim(),
            categoria: this.selectCat.value,
            estado: this.selectEst.value,
            creadaPor: this.usuarioActivo,
            asignadoA: this.inputAsignadoA.value,
            fechaLimiteISO: iso,
            fechaLimiteTexto: textoLimite
        };

        if (!body.titulo || !body.asignadoA) {
            this.errorMsg.style.display = "block";
            setTimeout(() => this.errorMsg.style.display = "none", 3000);
            return;
        }

        const url = id ? `${this.API_URL}/${id}` : this.API_URL;
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                this.cancelarEdicion();
                this.cargarTareas();
            }
        } catch (err) { console.error(err); }
    }

    async eliminarTicket(id) {
        if (!confirm("¿Eliminar este ticket permanentemente del sistema?")) return;
        try {
            const res = await fetch(`${this.API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (res.ok) this.cargarTareas();
        } catch (err) { console.error(err); }
    }

    async toggleEstado(id) {
        const ticket = this.tickets.find(t => t.id == id);
        if (!ticket) return;
        const nuevoEstado = ticket.estado === "Finalizado" ? "En Progreso" : "Finalizado";
        try {
            const res = await fetch(`${this.API_URL}/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) this.cargarTareas();
        } catch (err) { console.error(err); }
    }

    editarTicket(id) {
        const ticket = this.tickets.find(t => t.id == id);
        if (!ticket) return;
        this.editId.value = ticket.id;
        this.inputTitulo.value = ticket.titulo;
        this.inputDescripcion.value = ticket.descripcion;
        this.selectCat.value = ticket.categoria;
        this.selectEst.value = ticket.estado;
        this.inputAsignadoA.value = ticket.asignadoA;
        if (ticket.fechaLimiteISO) {
            const parts = ticket.fechaLimiteISO.split('-');
            if(parts.length === 3) {
                this.selAnio.value = parts[0];
                this.selMes.value = parts[1];
                this.selDia.value = parts[2];
            }
        }
        this.formTitle.innerText = "Editando Ticket Técnico";
        this.formCard.classList.add('editing');
        this.btnCancelar.style.display = "inline-block";
        this.btnAgregar.textContent = "Actualizar en Sistema";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    cancelarEdicion() {
        this.editId.value = "";
        this.inputTitulo.value = "";
        this.inputDescripcion.value = "";
        this.inputAsignadoA.value = "";
        this.selectEst.value = "Sin Iniciar";
        this.formTitle.innerText = "Gestor de Tareas";
        this.formCard.classList.remove('editing');
        this.btnCancelar.style.display = "none";
        this.btnAgregar.textContent = "Registrar en Sistema";
    }

    crearHTMLTarea(t) {
        const li = document.createElement('li');
        li.className = 'task-card';
        
        if (t.estado === "Finalizado") {
            li.classList.add('completada');
        }
        
        li.innerHTML = `
            <div class="task-header">
                <span class="category-label">${t.categoria}</span>
                <span class="status-label">
                    <i class="fa-solid fa-circle dot-${t.categoria}"></i> ${t.estado}
                </span>
            </div>
            <div class="task-content-wrapper">
                <h3>${t.titulo}</h3>
                <p class="task-desc">${t.descripcion}</p>
                <div class="task-info">
                    <p><strong>De:</strong> ${t.creadaPor}</p>
                    <p><strong>Para:</strong> ${t.asignadoA}</p>
                </div>
                <div class="task-dates">
                    <span><i class="fa-solid fa-plus"></i> ${t.fechaCreacion}</span>
                    <span><i class="fa-solid fa-hourglass-half"></i> ${t.fechaLimiteTexto}</span>
                </div>
            </div>
            <div class="task-footer">
                <div class="task-actions">
                    <button class="btn-sm toggle-btn">
                        <i class="fa-solid ${t.estado === "Finalizado" ? 'fa-rotate-left' : 'fa-check'}"></i>
                    </button>
                    <button class="btn-sm edit-btn">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-sm delete-btn">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        const btns = li.querySelectorAll('button');
        btns[0].onclick = () => this.toggleEstado(t.id);
        btns[1].onclick = () => this.editarTicket(t.id);
        btns[2].onclick = () => this.eliminarTicket(t.id);

        return li;
    }

    render() {
        if (this.gridCreadas) this.gridCreadas.innerHTML = '';
        if (this.gridAsignadas) this.gridAsignadas.innerHTML = '';

        this.tickets.forEach(t => {
            if (t.creadaPor === this.usuarioActivo && t.asignadoA === this.usuarioActivo) {
                this.gridAsignadas.appendChild(this.crearHTMLTarea(t));
            } else if (t.creadaPor === this.usuarioActivo) {
                this.gridCreadas.appendChild(this.crearHTMLTarea(t));
            } else if (t.asignadoA === this.usuarioActivo) {
                this.gridAsignadas.appendChild(this.crearHTMLTarea(t));
            }
        });
    }
}

class AudiMenu {
    constructor() {
        this.menuIcon = document.getElementById('menu-icon');
        this.navMenu = document.getElementById('nav-menu');
        this.closeIcon = document.getElementById('close-icon');
        this.links = document.querySelectorAll('#nav-menu-list a');
        if (this.menuIcon && this.navMenu) this.init();
    }
    openMenu() { this.navMenu.classList.add('active'); }
    closeMenu() { this.navMenu.classList.remove('active'); }
    init() {
        this.menuIcon.onclick = () => this.openMenu();
        if (this.closeIcon) this.closeIcon.onclick = () => this.closeMenu();
        this.links.forEach(link => link.onclick = () => this.closeMenu());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new GestorDeTareas();
    new AudiMenu();
});
