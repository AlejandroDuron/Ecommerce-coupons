# Ecommerce-coupons
La Cuponera es una aplicación web fullstack desarrollada con React y Supabase que gestiona la publicación, compra y canje de cupones de descuento. Simula un flujo de negocio real con múltiples roles, autenticación, pagos simulados y generación de cupones digitales, priorizando escalabilidad y buenas prácticas.
---

## 🧠 Stack tecnológico

* **Frontend:** React JS
* **Backend / BaaS:** Supabase

  * Autenticación (Supabase Auth)
  * Base de datos PostgreSQL
* **Estilos:** Tailwind CSS / Bootstrap

---

## ⚙️ Requisitos previos

* Node.js >= 18
* npm o yarn
* Cuenta activa en Supabase

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/la-cuponera.git
cd la-cuponera
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación se ejecutará en:

* 

---

## 🔐 Funcionalidades – Fase 1

* Visualización de ofertas aprobadas vigentes por rubro
* Registro y autenticación de clientes
* Compra de cupones con pago simulado
* Generación automática de cupones con código único
* Visualización de cupones por cliente

---

## 🗂️ Roles del sistema

* **Administrador:** Gestión global del sistema
* **Administrador de empresa:** Gestión de ofertas y empleados
* **Empleado:** Canje de cupones
* **Cliente:** Compra y uso de cupones

---

## 🗃️ Modelo de datos (Supabase)

* users
* companies
* offers
* coupons
* categories
* employees

---

## 🧪 Buenas prácticas aplicadas

* Separación de responsabilidades
* Control de acceso por roles
* Estados bien definidos para ofertas y cupones
* Uso de PostgreSQL con Supabase

---

## 🎯 Enfoque profesional

Este proyecto simula un sistema real de negocio y demuestra:

* Desarrollo frontend con React
* Modelado de datos relacional
* Autenticación y control de accesos
* Diseño de aplicaciones escalables

---

## 📚 Contexto académico

* **Materia:** Desarrollo Web II
* **Tipo:** Proyecto grupal (4–5 integrantes)

---

**Proyecto académico con mentalidad profesional.** 🚀

