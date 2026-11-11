/* Perfil de la persona con sesión: avatar, menú (Perfil / Salir) y ventanas emergentes.
   Se carga después de api.js en todas las páginas. */
(function () {
  "use strict";

  var SECTORES = ["Tecnología", "Diseño", "Salud", "Logística", "Otro"];
  var ESTUDIOS = ["Bachillerato", "Formación Profesional", "Universidad", "Otros"];
  var PALETA = ["#2a3a9c", "#c2185b", "#00796b", "#d84315", "#6a1b9a", "#1565c0",
                "#2e7d32", "#ad1457", "#4527a0", "#b71c1c", "#00695c", "#5d4037"];

  function nodo(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function colorAleatorio() { return PALETA[Math.floor(Math.random() * PALETA.length)]; }

  // Si no hay color guardado se deduce del nombre (siempre el mismo para la misma persona)
  function colorDe(color, nombre) {
    if (/^#[0-9a-f]{6}$/i.test(color || "")) return color;
    var h = 0, n = nombre || "";
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return PALETA[h % PALETA.length];
  }

  function inicial(nombre) {
    var c = Array.from((nombre || "").trim())[0];
    return c ? c.toUpperCase() : "?";
  }

  // Avatar: la imagen si existe; si no, la inicial grande sobre un color
  function avatar(nombre, imagen, color, tam) {
    var a = nodo("span", "avatar" + (tam ? " avatar-" + tam : ""));
    a.setAttribute("aria-hidden", "true");
    if (imagen && /^data:image\/(jpeg|png|webp);base64,/.test(imagen)) {
      var im = nodo("img");
      im.alt = "";
      im.src = imagen;
      a.appendChild(im);
    } else {
      a.style.background = colorDe(color, nombre);
      a.textContent = inicial(nombre);
    }
    return a;
  }

  // Recorta la imagen a un cuadrado de 256 px y la devuelve como JPEG (pesa pocos KB)
  function reducir(archivo, listo, fallo) {
    var url = URL.createObjectURL(archivo), img = new Image();
    img.onload = function () {
      var t = Math.min(img.width, img.height), c = document.createElement("canvas"), x;
      c.width = c.height = 256;
      x = c.getContext("2d");
      x.fillStyle = "#fff";
      x.fillRect(0, 0, 256, 256);
      x.drawImage(img, (img.width - t) / 2, (img.height - t) / 2, t, t, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      listo(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = function () { URL.revokeObjectURL(url); fallo(); };
    img.src = url;
  }

  /* Selector de imagen.
     opciones: { imagen, color, nombre (texto o función, para la inicial) }
     valor(): undefined = sin cambios · "" = quitar · "data:image..." = imagen nueva */
  function selectorImagen(contenedor, opciones) {
    opciones = opciones || {};
    var color = /^#[0-9a-f]{6}$/i.test(opciones.color || "") ? opciones.color : colorAleatorio();
    var original = opciones.imagen || null, cambio;
    var prev = nodo("span"), acc = nodo("div", "acciones-img"), fila = nodo("div", "botones-img");
    var elegir = nodo("button", "btn btn-navy btn-peq", "Elegir imagen");
    var quitar = nodo("button", "btn btn-borde btn-peq", "Quitar");
    var ayuda = nodo("small", "", "JPG, PNG o WEBP. Se recorta en cuadrado.");
    var fichero = nodo("input");
    elegir.type = quitar.type = "button";
    fichero.type = "file";
    fichero.accept = "image/png,image/jpeg,image/webp";
    fichero.hidden = true;
    ayuda.setAttribute("role", "status");

    function nombre() {
      return typeof opciones.nombre === "function" ? opciones.nombre() : (opciones.nombre || "");
    }
    function pintar() {
      var actual = cambio !== undefined ? cambio : original;
      var nuevo = avatar(nombre(), actual, color, "lg");
      prev.replaceWith(nuevo);
      prev = nuevo;
      quitar.hidden = !actual;
    }

    elegir.addEventListener("click", function () { fichero.click(); });
    quitar.addEventListener("click", function () { cambio = ""; pintar(); });
    fichero.addEventListener("change", function () {
      var f = fichero.files && fichero.files[0];
      fichero.value = "";
      if (!f) return;
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { ayuda.textContent = "Usa una imagen JPG, PNG o WEBP."; return; }
      reducir(f, function (d) { cambio = d; ayuda.textContent = "Imagen lista."; pintar(); },
        function () { ayuda.textContent = "No se pudo leer esa imagen."; });
    });

    fila.appendChild(elegir);
    fila.appendChild(quitar);
    acc.appendChild(fila);
    acc.appendChild(ayuda);
    contenedor.classList.add("campo-imagen");
    contenedor.appendChild(prev);
    contenedor.appendChild(acc);
    contenedor.appendChild(fichero);
    pintar();

    return {
      valor: function () { return cambio; },
      color: function () { return color; },
      refrescar: pintar,
      reiniciar: function (img) { original = img || null; cambio = undefined; pintar(); }
    };
  }

  window.avatarLSBM = avatar;
  window.selectorImagen = selectorImagen;

  /* ---------- Ventanas emergentes ---------- */
  function crearVentana(id, titulo) {
    var d = nodo("dialog", "modal modal-estrecho"), caja = nodo("div", "modal-caja"),
        cab = nodo("div", "modal-cab"), h = nodo("h2", "", titulo),
        x = nodo("button", "modal-cerrar", "✕"), cuerpo = nodo("div", "modal-cuerpo");
    d.id = id;
    h.id = id + "-t";
    d.setAttribute("aria-labelledby", h.id);
    x.type = "button";
    x.setAttribute("aria-label", "Cerrar");
    x.addEventListener("click", function () { d.close(); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    cab.appendChild(h);
    cab.appendChild(x);
    caja.appendChild(cab);
    caja.appendChild(cuerpo);
    d.appendChild(caja);
    document.body.appendChild(d);
    return { dialogo: d, cuerpo: cuerpo };
  }

  function campo(etiqueta, control) {
    var l = nodo("label", "", etiqueta);
    l.appendChild(control);
    return l;
  }
  function entrada(tipo, nombre, valor, extra) {
    var i = nodo("input");
    i.type = tipo; i.name = nombre; i.value = valor || "";
    if (extra) Object.keys(extra).forEach(function (k) { i[k] = extra[k]; });
    return i;
  }
  function desplegable(nombre, opciones, valor) {
    var s = nodo("select"), lista = opciones.slice();
    s.name = nombre;
    if (valor && lista.indexOf(valor) < 0) lista.unshift(valor);
    lista.forEach(function (o) {
      var op = nodo("option", "", o);
      op.value = o;
      if (o === valor) op.selected = true;
      s.appendChild(op);
    });
    return s;
  }

  /* ---------- Estado de la sesión y menú de la cabecera ---------- */
  var yo = null, menus = [];

  function pintarBoton(boton) {
    boton.textContent = "";
    boton.appendChild(avatar(yo.nombre, yo.imagen, yo.color, "sm"));
    boton.appendChild(nodo("span", "usuario-nombre", yo.nombre));
    var f = nodo("span", "usuario-flecha", "▾");
    f.setAttribute("aria-hidden", "true");
    boton.appendChild(f);
    boton.setAttribute("aria-label", "Menú de " + yo.nombre);
  }
  function actualizarCabecera() {
    menus.forEach(function (m) { pintarBoton(m.boton); });
  }

  function cerrarListas() {
    menus.forEach(function (m) { m.lista.hidden = true; m.boton.setAttribute("aria-expanded", "false"); });
  }

  function construirMenu(enlace) {
    var cont = nodo("div", "usuario-menu"), boton = nodo("button", "usuario-boton"),
        lista = nodo("div", "usuario-lista"), bp = nodo("button", "", "Perfil"), bs = nodo("button", "", "Salir");
    boton.type = bp.type = bs.type = "button";
    boton.setAttribute("aria-haspopup", "menu");
    boton.setAttribute("aria-expanded", "false");
    lista.setAttribute("role", "menu");
    lista.hidden = true;
    bp.setAttribute("role", "menuitem");
    bs.setAttribute("role", "menuitem");
    lista.appendChild(bp);
    lista.appendChild(bs);
    cont.appendChild(boton);
    cont.appendChild(lista);
    enlace.replaceWith(cont);
    menus.push({ boton: boton, lista: lista });
    pintarBoton(boton);

    boton.addEventListener("click", function (e) {
      e.stopPropagation();
      var abrir = lista.hidden;
      cerrarListas();
      lista.hidden = !abrir;
      boton.setAttribute("aria-expanded", String(abrir));
      if (abrir) bp.focus();
    });
    lista.addEventListener("click", function (e) { e.stopPropagation(); });
    bp.addEventListener("click", function () { cerrarListas(); abrirPerfil(); });
    bs.addEventListener("click", function () { cerrarListas(); abrirSalir(); });
    lista.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        (document.activeElement === bp ? bs : bp).focus();
      }
    });
  }

  document.addEventListener("click", cerrarListas);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var abierto = menus.filter(function (m) { return !m.lista.hidden; })[0];
    cerrarListas();
    if (abierto) abierto.boton.focus();
  });

  /* ---------- Ventana "Perfil" ---------- */
  var ventanaPerfil = null;

  function abrirPerfil() {
    if (ventanaPerfil) ventanaPerfil.dialogo.remove();
    var esEmpresa = yo.tipo === "empresa", p = yo.perfil || {};
    var v = crearVentana("modal-perfil", "Perfil");
    ventanaPerfil = v;

    v.cuerpo.appendChild(nodo("p", "modal-intro", esEmpresa
      ? "Así verán tu empresa los visitantes de la feria."
      : "Así te verán las empresas de la feria."));

    var form = nodo("form", "formulario"), zonaImg = nodo("div"), x, campos = {};
    form.noValidate = false;
    zonaImg.appendChild(nodo("span", "etq", "Icono"));
    form.appendChild(zonaImg);
    var zonaSel = nodo("div");
    zonaImg.appendChild(zonaSel);
    zonaImg.style.display = "grid";
    zonaImg.style.gap = "8px";

    var selector = selectorImagen(zonaSel, {
      imagen: yo.imagen, color: yo.color,
      nombre: function () { return (campos.nombre && campos.nombre.value) || yo.nombre; }
    });

    if (esEmpresa) {
      campos.nombre = entrada("text", "nombre_empresa", p.nombre_empresa, { required: true, maxLength: 150 });
      campos.contacto = entrada("text", "contacto", p.contacto, { required: true, maxLength: 150 });
      campos.web = entrada("url", "sitio_web", p.sitio_web, { maxLength: 255, placeholder: "https://tuempresa.com/trabaja-con-nosotros" });
      campos.sector = desplegable("sector", SECTORES, p.sector);
      campos.desc = nodo("textarea");
      campos.desc.rows = 4; campos.desc.name = "descripcion"; campos.desc.maxLength = 2000;
      campos.desc.value = p.descripcion || "";
      form.appendChild(campo("Nombre de la empresa", campos.nombre));
      form.appendChild(campo("Persona de contacto", campos.contacto));
      form.appendChild(campo("Enlace web para que te envíen el CV (opcional)", campos.web));
      form.appendChild(campo("Sector", campos.sector));
      form.appendChild(campo("¿Qué quieres presentar?", campos.desc));
    } else {
      campos.nombre = entrada("text", "nombre", p.nombre, { required: true, maxLength: 250 });
      campos.estudios = desplegable("estudios", ESTUDIOS, p.estudios);
      campos.sector = desplegable("sector", SECTORES, p.sector);
      form.appendChild(campo("Nombre y apellidos", campos.nombre));
      form.appendChild(campo("Estudios", campos.estudios));
      form.appendChild(campo("Sector que más te interesa", campos.sector));
    }
    campos.nombre.addEventListener("input", function () { selector.refrescar(); });

    var fila = nodo("div", "modal-botones"), guardar = nodo("button", "btn btn-navy", "Guardar cambios"),
        cancelar = nodo("button", "btn btn-borde", "Cerrar");
    guardar.type = "submit";
    cancelar.type = "button";
    cancelar.addEventListener("click", function () { v.dialogo.close(); });
    fila.appendChild(guardar);
    fila.appendChild(cancelar);
    form.appendChild(fila);
    v.cuerpo.appendChild(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var datos = esEmpresa
        ? { nombre_empresa: campos.nombre.value, contacto: campos.contacto.value, sitio_web: campos.web.value,
            sector: campos.sector.value, descripcion: campos.desc.value }
        : { nombre: campos.nombre.value, estudios: campos.estudios.value, sector: campos.sector.value };
      var img = selector.valor();
      if (img !== undefined) datos.imagen = img;
      guardar.disabled = true;
      api("perfil", datos).then(function (r) {
        guardar.disabled = false;
        if (!r.ok) { mostrarMensaje(form, r.error, true); return; }
        return api("me").then(function (m) {
          if (m.ok && m.logueado) { yo = m; actualizarCabecera(); selector.reiniciar(m.imagen); }
          mostrarMensaje(form, "Perfil guardado.", false);
        });
      });
    });

    v.dialogo.addEventListener("close", function () { v.dialogo.remove(); if (ventanaPerfil === v) ventanaPerfil = null; });
    v.dialogo.showModal();
  }

  /* ---------- Ventana "¿Quieres salir?" ---------- */
  function abrirSalir() {
    var v = crearVentana("modal-salir", "¿Quieres salir?");
    v.cuerpo.appendChild(nodo("p", "modal-texto", "Se cerrará tu sesión, " + yo.nombre + ". Podrás volver a entrar cuando quieras."));
    var fila = nodo("div", "modal-botones"), si = nodo("button", "btn btn-navy", "Sí, salir"),
        no = nodo("button", "btn btn-borde", "Cancelar");
    si.type = no.type = "button";
    no.addEventListener("click", function () { v.dialogo.close(); });
    si.addEventListener("click", function () {
      si.disabled = true;
      api("logout", {}).then(function () { window.location.href = "index.html"; });
    });
    fila.appendChild(si);
    fila.appendChild(no);
    v.cuerpo.appendChild(fila);
    v.dialogo.addEventListener("close", function () { v.dialogo.remove(); });
    v.dialogo.showModal();
    no.focus();
  }

  window.sesion.then(function (s) {
    if (!s.ok || !s.logueado) return;
    yo = s;
    document.querySelectorAll(".enlace-login").forEach(construirMenu);
  });
})();
