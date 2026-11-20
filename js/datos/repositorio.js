// CAPA 1 · DATOS — sincronizado con MySQL vía /api/sistema + caché local
const Repo = (() => {
  const BASE = "http://localhost:4000/api";
  const CLAVE = "eb1";

  const cfgBase = () =>
    typeof Curriculo !== "undefined" && Curriculo.configInicial ? Curriculo.configInicial() : {};

  let S;
  try {
    S = JSON.parse(localStorage.getItem(CLAVE) || "null");
  } catch (e) {}

  S = S || {
    cfg: cfgBase(),
    alumnos: [],
    pagos: [],
    asis: {},
    notas: {},
    seq: 1,
    rec: 1
  };

  let ultimoEnvio = Promise.resolve();

  const guardarCache = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(S));
    } catch (e) {}
  };

  const headersAuth = () => {
    const token = localStorage.getItem("eb_token") || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const normalizarAlumno = (bd) => {
    const existente = S.alumnos.find((x) => x.codigo === bd.codigo) || {};
    const mat = bd.matriculas && bd.matriculas[0] ? bd.matriculas[0] : null;
    const gradoNum = mat && mat.grado ? mat.grado.numero : (mat ? mat.gradoId : (existente.grado || 1));
    const fechaNac = bd.nacimiento ? String(bd.nacimiento).slice(0, 10) : (existente.nac || "");

    const cuotas = mat && Array.isArray(mat.cuotas)
      ? mat.cuotas.map((c) => ({
          id: c.id,
          label: c.label,
          monto: Number(c.monto || 0),
          vence: c.vence ? String(c.vence).slice(0, 10) : "",
          pagada: Boolean(c.pago),
          pago: c.pago || null
        }))
      : (existente.cuotas || []);

    const enc = bd.encargado
      ? {
          nombre: bd.encargado.nombre || "",
          parentesco: bd.encargado.parentesco || "",
          identidad: bd.encargado.identidad || "",
          tel: bd.encargado.telefono || "",
          correo: bd.encargado.correo || ""
        }
      : (existente.enc || { nombre: "", parentesco: "", identidad: "", tel: "", correo: "" });

    const emerg = bd.emergencia
      ? {
          nombre: bd.emergencia.nombre || "",
          tel: bd.emergencia.telefono || ""
        }
      : (existente.emerg || { nombre: "", tel: "" });

    return {
      ...existente,
      ...bd,
      nac: fechaNac,
      grado: Number(gradoNum),
      anio: mat ? mat.anio : (existente.anio || new Date().getFullYear()),
      enc,
      emerg,
      cuotas,
      clases:
        existente.clases ||
        (typeof Curriculo !== "undefined" && Curriculo.clases ? Curriculo.clases(Number(gradoNum)) : [])
    };
  };

  const sincronizarTodo = async () => {
    const res = await fetch(`${BASE}/sistema/estado`, { headers: headersAuth() });
    if (!res.ok) throw new Error(`Error al sincronizar (${res.status})`);
    const { alumnos = [], configuraciones = [], pagos = [] } = await res.json();

    S.alumnos = alumnos.map(normalizarAlumno);

    const baseCfg = cfgBase();
    configuraciones.forEach((c) => {
      const gNum = c.grado ? c.grado.numero : c.gradoId;
      S.cfg[gNum] = {
        ...(baseCfg[gNum] || { mat: [] }),
        ...(S.cfg[gNum] || {}),
        matricula: Number(c.matricula || 0),
        pension: Number(c.pension || 0)
      };
    });

    S.pagos = pagos.map((p) => {
      const al = p.cuota && p.cuota.matricula ? p.cuota.matricula.alumno : null;
      return {
        id: p.id,
        recibo: p.recibo,
        codigo: al ? al.codigo : "",
        alumno: al ? `${al.nombres} ${al.apellidos}` : "",
        concepto: p.cuota ? p.cuota.label : "Pago",
        monto: Number(p.monto || 0),
        metodo: p.metodo,
        fecha: p.fecha ? String(p.fecha).slice(0, 10) : ""
      };
    });

    guardarCache();
    return S;
  };

  const registrarMatriculaCompleta = (datos, alumnoLocal) => {
    S.alumnos.push(alumnoLocal);
    guardarCache();

    ultimoEnvio = fetch(`${BASE}/sistema/matricular`, {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify(datos)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al guardar matrícula");
        const normalizado = normalizarAlumno(data.alumno);
        const idx = S.alumnos.findIndex((x) => x.codigo === alumnoLocal.codigo);
        if (idx >= 0) S.alumnos[idx] = normalizado;
        else S.alumnos.push(normalizado);
        Object.assign(alumnoLocal, normalizado);
        guardarCache();
        return normalizado;
      })
      .catch((err) => {
        S.alumnos = S.alumnos.filter((x) => x.codigo !== alumnoLocal.codigo);
        guardarCache();
        throw err;
      });

    return ultimoEnvio;
  };

  const registrarPagosBD = async (cuotaIds, metodo, fecha) => {
    const res = await fetch(`${BASE}/sistema/pagos`, {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ cuotaIds, metodo, fecha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al registrar el pago");
    await sincronizarTodo();
    return data.pagos || [];
  };

  const guardarConfiguracionBD = async (grado, matricula, pension) => {
    const res = await fetch(`${BASE}/sistema/configuracion`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({ grado: Number(grado), matricula: Number(matricula), pension: Number(pension) })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error al guardar configuración");

    const baseCfg = cfgBase();
    S.cfg[grado] = {
      ...(baseCfg[grado] || { mat: [] }),
      ...(S.cfg[grado] || {}),
      matricula: Number(matricula),
      pension: Number(pension)
    };
    guardarCache();
    return S.cfg[grado];
  };

  const generarCodigoUnico = () => {
    let n = (S.alumnos.length || 0) + 1;
    let cod = "ALU" + String(n).padStart(3, "0");
    while (S.alumnos.some((a) => a.codigo === cod)) {
      n++;
      cod = "ALU" + String(n).padStart(3, "0");
    }
    return cod;
  };

  return {
    guardar: guardarCache,
    sincronizarTodo,
    cargarAlumnos: sincronizarTodo,
    esperarGuardado: () => ultimoEnvio,
    alumnos: () => S.alumnos,
    pagos: () => S.pagos,
    porCodigo: (c) => S.alumnos.find((a) => a.codigo === c),
    porIdentidad: (i) => S.alumnos.find((a) => a.identidad === i),
    nuevoCodigo: generarCodigoUnico,
    nuevoRecibo: () => (S.pagos.length ? Math.max(...S.pagos.map((p) => Number(p.recibo || 0))) + 1 : 1),
    registrarMatriculaCompleta,
    registrarPagosBD,
    guardarConfiguracionBD,
    config: (g) => {
      const base = cfgBase();
      if (!S.cfg[g]) S.cfg[g] = base[g] || { mat: [], matricula: 1500, pension: 1200 };
      return S.cfg[g];
    },
    guardarConfig: (g, c) => {
      S.cfg[g] = c;
      guardarCache();
    },
    asistencia: (k) => (S.asis[k] = S.asis[k] || {}),
    notas: (cod) => (S.notas[cod] = S.notas[cod] || {})
  };
})();