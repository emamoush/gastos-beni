// ---------- Inicialización ----------
const { createClient } = supabase;
const sb = createClient(window.SUPABASE_CONFIG.SUPABASE_URL, window.SUPABASE_CONFIG.SUPABASE_ANON_KEY);

let gastos = [];
let filtroActual = 'todos';
let pagadorSeleccionado = 'Abigail';

// ---------- Formato ----------
const fmtMoneda = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const fmtFecha = (iso) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ---------- Selector de pagador (formulario) ----------
document.querySelectorAll('#pill-pagador button').forEach((btn) => {
  btn.addEventListener('click', () => {
    pagadorSeleccionado = btn.dataset.valor;
    document.querySelectorAll('#pill-pagador button').forEach((b) => b.classList.remove('activo'));
    btn.classList.add('activo');
  });
});
document.querySelector('#pill-pagador button[data-valor="Abigail"]').classList.add('activo');

// Fecha por defecto: hoy
document.getElementById('g-fecha').valueAsDate = new Date();

// ---------- Filtros ----------
document.getElementById('filtro-tabs').addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  filtroActual = e.target.dataset.filtro;
  document.querySelectorAll('#filtro-tabs button').forEach((b) => b.classList.remove('activo'));
  e.target.classList.add('activo');
  renderizarLista();
});

// ---------- Cargar gastos ----------
async function cargarGastos() {
  const { data, error } = await sb.from('gastos').select('*').order('fecha', { ascending: false }).order('creado_en', { ascending: false });
  if (error) {
    document.getElementById('tabla-gastos').innerHTML = `<div class="vacio">No se pudieron cargar los gastos.</div>`;
    return;
  }
  gastos = data;
  renderizarTodo();
}

function renderizarTodo() {
  renderizarSaldo();
  renderizarLista();
}

// ---------- Saldo ----------
function renderizarSaldo() {
  const totalAbigail = gastos.filter((g) => g.pagador === 'Abigail').reduce((s, g) => s + Number(g.importe), 0);
  const totalBruno = gastos.filter((g) => g.pagador === 'Bruno').reduce((s, g) => s + Number(g.importe), 0);

  document.getElementById('total-abigail').textContent = fmtMoneda(totalAbigail);
  document.getElementById('total-bruno').textContent = fmtMoneda(totalBruno);
  document.getElementById('cant-abigail').textContent = `${gastos.filter((g) => g.pagador === 'Abigail').length} gastos`;
  document.getElementById('cant-bruno').textContent = `${gastos.filter((g) => g.pagador === 'Bruno').length} gastos`;

  const diferencia = totalAbigail - totalBruno;
  const mitadDiferencia = Math.abs(diferencia) / 2;
  const numeroEl = document.getElementById('saldo-numero');
  const detalleEl = document.getElementById('saldo-detalle');
  const total = totalAbigail + totalBruno;

  if (total === 0) {
    numeroEl.innerHTML = 'Sin gastos cargados todavía';
    detalleEl.textContent = 'Empezá agregando el primero abajo.';
    return;
  }

  if (Math.abs(diferencia) < 0.01) {
    numeroEl.innerHTML = 'Están a la par';
    detalleEl.textContent = `Cada uno lleva pagado ${fmtMoneda(totalAbigail)}.`;
    return;
  }

  const deudor = diferencia > 0 ? 'Bruno' : 'Abigail';
  const acreedor = diferencia > 0 ? 'Abigail' : 'Bruno';

  numeroEl.innerHTML = `${fmtMoneda(mitadDiferencia)} <span class="quien-color">${deudor} → ${acreedor}</span>`;
  detalleEl.textContent = `Para que quede parejo, ${deudor} le debería transferir ${fmtMoneda(mitadDiferencia)} a ${acreedor}.`;
}

// ---------- Listado ----------
function renderizarLista() {
  const cont = document.getElementById('tabla-gastos');
  const lista = filtroActual === 'todos' ? gastos : gastos.filter((g) => g.pagador === filtroActual);

  if (lista.length === 0) {
    cont.innerHTML = `<div class="vacio">No hay gastos para mostrar acá todavía.</div>`;
    return;
  }

  cont.innerHTML = lista.map((g) => `
    <div class="fila-gasto">
      <div class="fecha">${fmtFecha(g.fecha)}</div>
      <div class="concepto">${escapeHtml(g.concepto)}</div>
      <div class="pagador-wrap">
        <span class="etiqueta-pagador ${g.pagador === 'Abigail' ? 'abigail' : 'bruno'}">${g.pagador}</span>
      </div>
      <div class="importe">${fmtMoneda(g.importe)}</div>
      <button class="btn-borrar" data-id="${g.id}" title="Borrar gasto">✕</button>
    </div>
  `).join('');

  cont.querySelectorAll('.btn-borrar').forEach((btn) => {
    btn.addEventListener('click', () => borrarGasto(btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Agregar gasto ----------
document.getElementById('form-gasto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fecha = document.getElementById('g-fecha').value;
  const concepto = document.getElementById('g-concepto').value.trim();
  const importe = parseFloat(document.getElementById('g-importe').value);

  if (!fecha || !concepto || !importe || importe <= 0) return;

  const { data, error } = await sb.from('gastos').insert({
    fecha, concepto, importe, pagador: pagadorSeleccionado,
  }).select();

  if (error) {
    alert('No se pudo guardar el gasto. Probá de nuevo.');
    return;
  }

  gastos.unshift(data[0]);
  renderizarTodo();
  document.getElementById('form-gasto').reset();
  document.getElementById('g-fecha').valueAsDate = new Date();
  document.querySelectorAll('#pill-pagador button').forEach((b) => b.classList.remove('activo'));
  document.querySelector('#pill-pagador button[data-valor="Abigail"]').classList.add('activo');
  pagadorSeleccionado = 'Abigail';
});

// ---------- Borrar gasto ----------
async function borrarGasto(id) {
  if (!confirm('¿Borrar este gasto? No se puede deshacer.')) return;
  const { error } = await sb.from('gastos').delete().eq('id', id);
  if (error) {
    alert('No se pudo borrar el gasto.');
    return;
  }
  gastos = gastos.filter((g) => g.id !== id);
  renderizarTodo();
}

// ---------- Arranque ----------
cargarGastos();
