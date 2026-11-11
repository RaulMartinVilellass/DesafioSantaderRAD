/* Utilidades compartidas: llamadas a la API y botón de sesión del menú. */
(function () {
  "use strict";

  // Llama a la API (carpeta api/). Devuelve siempre {ok, ...}; nunca lanza error.
  window.api = function (ruta, cuerpo) {
    var opciones = { credentials: "same-origin" };
    if (cuerpo !== undefined) {
      opciones.method = "POST";
      opciones.headers = { "Content-Type": "application/json" };
      opciones.body = JSON.stringify(cuerpo);
    }
    return fetch("api/" + ruta + ".php", opciones)
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, error: "Respuesta no válida del servidor." };
        });
      })
      .catch(function () {
        return { ok: false, error: "No se pudo conectar con el servidor." };
      });
  };

  // Muestra un mensaje (éxito o error) dentro de un formulario
  window.mostrarMensaje = function (form, texto, esError) {
    var m = form.querySelector(".mensaje");
    if (!m) {
      m = document.createElement("p");
      m.className = "mensaje";
      m.setAttribute("role", "status");
      form.appendChild(m);
    }
    m.classList.toggle("error", !!esError);
    m.textContent = texto;
  };

  // Estado de sesión (se pide una sola vez por página)
  window.sesion = window.api("me");
})();
