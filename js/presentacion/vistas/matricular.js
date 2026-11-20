// CAPA 3 · PRESENTACIÓN — pantalla Matricular
V.mat = () => {
  const d = new Date(), an = d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear();
  const par = opt(["Madre", "Padre", "Abuelo/a", "Tío/a", "Otro"].map((x) => [x, x]));
  $("#view").innerHTML = `<h2>Matricular a un niño</h2><p class="sub">Llena los datos y elige el grado. El código y las clases se asignan solos.</p>
<form id="fm" class="card"><h3 style="margin-top:0">Datos del niño</h3><div class="g">${F("nom", "Nombres")}${F("ape", "Apellidos")}${F("nac", "Fecha de nacimiento", "date")}${SEL("sex", "Sexo", opt([["Femenino", "Femenino"], ["Masculino", "Masculino"]]))}${F("ide", "N.º de identidad o partida de nacimiento")}${SEL("gr", "Grado a matricular", GOPT)}${F("an", "Año lectivo", "number", `value="${an}" min="2020" max="2100"`)}${F("pro", "Escuela de procedencia (opcional)")}${F("sal", "Alergias o condición médica (opcional)")}${F("dir", "Dirección")}</div>
<h3>Encargado</h3><div class="g">${F("en", "Nombre completo")}${SEL("par", "Parentesco", par)}${F("ei", "N.º de identidad")}${F("et", "Teléfono (8 dígitos)", "tel")}${F("ec", "Correo (opcional)", "email")}</div>
<h3>Contacto de emergencia</h3><div class="g">${F("mn", "Nombre")}${F("mt", "Teléfono (8 dígitos)", "tel")}</div>
<button id="btnMat">Matricular</button> <span id="e" class="er"></span></form><div id="res"></div>`;

  $("#fm").onsubmit = async (e) => {
    e.preventDefault();
    const v = (i) => $("#" + i).value.trim();
    const btn = $("#btnMat");
    btn.disabled = true;
    $("#e").textContent = "Guardando en base de datos...";

    try {
      const datos = {
        nombres: v("nom"),
        apellidos: v("ape"),
        nac: v("nac"),
        sexo: v("sex"),
        identidad: v("ide"),
        grado: +v("gr"),
        anio: +v("an"),
        procedencia: v("pro"),
        salud: v("sal") || "Ninguna",
        direccion: v("dir"),
        enc: { nombre: v("en"), parentesco: v("par"), identidad: v("ei"), tel: v("et"), correo: v("ec") },
        emerg: { nombre: v("mn"), tel: v("mt") }
      };

      Validaciones.matricula(datos);
      const aviso = Validaciones.aviso(datos);
      if (aviso && !confirm(aviso)) {
        $("#e").textContent = "";
        return;
      }

      const a = Matriculas.matricular(datos);
      await Repo.esperarGuardado(); // Espera confirmación real de MySQL

      $("#e").textContent = "";
      $("#fm").hidden = true;
      $("#res").innerHTML = `<p class="ok">Matrícula registrada en la base de datos. Entrega este código a la familia: lo necesitan para pagar.</p>${ficha(a)}<button onclick="go('pag','${a.codigo}')">Cobrar matrícula</button><button class="s" onclick="print()">Imprimir ficha</button><button class="s" onclick="go('mat')">Matricular otro niño</button>`;
    } catch (x) {
      $("#e").textContent = x.message || "Error al guardar la matrícula.";
    } finally {
      btn.disabled = false;
    }
  };
};