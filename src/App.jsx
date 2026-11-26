import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertCircle, ArrowUpRight, CalendarDays, Check, CheckCircle2,
  ChevronDown, Circle, ClipboardList, Clock3, LayoutDashboard, ListTodo,
  LoaderCircle, LogOut, Menu, Plus, Search, SlidersHorizontal, Sparkles,
  Target, Trash2, X, Pencil, RefreshCw
} from 'lucide-react'
import { api, normalizarLista } from './services/api'

const statusOptions = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Concluída', label: 'Concluída' }
]
const priorityOptions = ['Baixa', 'Média', 'Alta']

const emptyForm = { titulo: '', descricao: '', status: 'Pendente', prioridade: 'Média' }

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [mobileMenu, setMobileMenu] = useState(false)

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listar()
      setTasks(normalizarLista(data))
    } catch (err) {
      setError(`${err.message}. Confira se a API está ativa e se o CORS está configurado.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [])

  const counts = useMemo(() => ({
    total: tasks.length,
    pendentes: tasks.filter(t => statusOf(t) === 'Pendente').length,
    andamento: tasks.filter(t => statusOf(t) === 'Em andamento').length,
    concluidas: tasks.filter(t => statusOf(t) === 'Concluída').length
  }), [tasks])

  const filteredTasks = useMemo(() => tasks.filter(task => {
    const title = String(task.titulo || task.title || '').toLowerCase()
    const description = String(task.descricao || task.description || '').toLowerCase()
    const matchesSearch = `${title} ${description}`.includes(search.toLowerCase())
    const matchesFilter = filter === 'Todas' || statusOf(task) === filter
    return matchesSearch && matchesFilter
  }), [tasks, search, filter])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditing(task)
    setForm({
      titulo: task.titulo || task.title || '',
      descricao: task.descricao || task.description || '',
      status: statusOf(task),
      prioridade: priorityOf(task)
    })
    setModalOpen(true)
  }

  async function saveTask(event) {
    event.preventDefault()
    if (!form.titulo.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim()
      }
      if (editing) await api.atualizar(editing.id, payload)
      else await api.criar(payload)
      setModalOpen(false)
      await loadTasks()
    } catch (err) {
      setError(`Não foi possível salvar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(task, nextStatus) {
    try {
      await api.atualizar(task.id, {
        titulo: task.titulo || task.title || '',
        descricao: task.descricao || task.description || '',
        status: nextStatus,
        prioridade: priorityOf(task)
      })
      await loadTasks()
    } catch (err) {
      setError(`Não foi possível atualizar o status: ${err.message}`)
    }
  }

  async function deleteTask(task) {
    const title = task.titulo || task.title || 'esta tarefa'
    if (!window.confirm(`Deseja realmente excluir "${title}"?`)) return
    try {
      await api.excluir(task.id)
      await loadTasks()
    } catch (err) {
      setError(`Não foi possível excluir: ${err.message}`)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Check size={21} strokeWidth={3} /></div>
          <span>task<span>flow</span></span>
          <button className="icon-button close-menu" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></button>
        </div>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <nav className="nav-menu">
          <a className="nav-item active" href="#inicio" onClick={() => setMobileMenu(false)}><LayoutDashboard size={18} /> Visão geral</a>
          <a className="nav-item" href="#tarefas" onClick={() => setMobileMenu(false)}><ListTodo size={18} /> Minhas tarefas <span className="nav-count">{counts.total}</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Sparkles size={17} /></div>
            <strong>Um passo de cada vez.</strong>
            <p>Organize suas atividades e acompanhe seu progresso.</p>
          </div>
          <div className="profile">
            <div className="avatar">TF</div>
            <div className="profile-text"><strong>Meu espaço</strong><span>Conta pessoal</span></div>
            <LogOut size={17} className="profile-more" />
          </div>
        </div>
      </aside>

      <main className="main-content" id="inicio">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>Visão geral</strong></div>
          <div className="topbar-right"><span className="today-label"><CalendarDays size={16} /> {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span><div className="top-avatar">TF</div></div>
        </header>

        <div className="page-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> SEU PAINEL DE PRODUTIVIDADE</div>
              <h1>Visão geral<span>.</span></h1>
              <p className="subtitle">Planeje seu dia, acompanhe suas tarefas e faça acontecer.</p>
            </div>
            <button className="primary-button" onClick={openNew}><Plus size={18} /> Nova tarefa</button>
          </section>

          {error && <div className="error-banner"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError('')} aria-label="Fechar"><X size={17} /></button></div>}

          <section className="stats-grid">
            <StatCard label="Total de tarefas" value={counts.total} icon={<ClipboardList />} tone="purple" detail="Todas as atividades" />
            <StatCard label="Pendentes" value={counts.pendentes} icon={<Clock3 />} tone="orange" detail="Aguardando início" />
            <StatCard label="Em andamento" value={counts.andamento} icon={<Activity />} tone="blue" detail="Em progresso" />
            <StatCard label="Concluídas" value={counts.concluidas} icon={<CheckCircle2 />} tone="green" detail="Tarefas finalizadas" />
          </section>

          <section className="progress-panel">
            <div className="progress-copy">
              <div className="progress-icon"><Target size={19} /></div>
              <div><strong>Seu progresso</strong><p>Continue assim! Cada tarefa concluída é uma conquista.</p></div>
            </div>
            <div className="progress-value"><strong>{counts.total ? Math.round(counts.concluidas / counts.total * 100) : 0}%</strong><span>concluído</span></div>
            <div className="progress-track"><div style={{ width: `${counts.total ? counts.concluidas / counts.total * 100 : 0}%` }} /></div>
          </section>

          <section className="tasks-section" id="tarefas">
            <div className="section-heading">
              <div><h2>Minhas tarefas</h2><p>Gerencie e acompanhe suas atividades.</p></div>
              <button className="refresh-button" onClick={loadTasks} title="Atualizar lista"><RefreshCw size={16} /> Atualizar</button>
            </div>
            <div className="toolbar">
              <div className="search-box"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarefa..." /></div>
              <div className="filter-wrap"><SlidersHorizontal size={16} /><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filtrar por status"><option>Todas</option>{statusOptions.map(s => <option key={s.value}>{s.value}</option>)}</select><ChevronDown size={15} /></div>
            </div>

            {loading ? (
              <div className="empty-state"><LoaderCircle className="spin" size={28} /><strong>Carregando tarefas...</strong><span>Estamos buscando seus dados na AWS.</span></div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state"><div className="empty-icon"><ListTodo size={25} /></div><strong>{tasks.length ? 'Nenhuma tarefa encontrada' : 'Tudo começa com uma tarefa'}</strong><span>{tasks.length ? 'Tente alterar sua busca ou filtro.' : 'Adicione sua primeira tarefa para começar a organizar seu dia.'}</span>{!tasks.length && <button className="primary-button" onClick={openNew}><Plus size={17} /> Criar primeira tarefa</button>}</div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task, index) => <TaskRow key={task.id || index} task={task} onEdit={() => openEdit(task)} onDelete={() => deleteTask(task)} onStatus={value => changeStatus(task, value)} />)}
              </div>
            )}
            <div className="list-footer"><span>Mostrando <strong>{filteredTasks.length}</strong> de <strong>{tasks.length}</strong> tarefas</span><span className="live-indicator"><span /> Sincronizado com AWS</span></div>
          </section>
          <footer className="footer">TaskFlow <span>·</span> Organize melhor. Conquiste mais.</footer>
        </div>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModalOpen(false)}>
        <form className="task-modal" onSubmit={saveTask}>
          <div className="modal-heading"><div><span className="modal-kicker">{editing ? 'ATUALIZAR ITEM' : 'NOVO ITEM'}</span><h2>{editing ? 'Editar tarefa' : 'Criar tarefa'}</h2><p>Preencha os detalhes da sua atividade.</p></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Fechar"><X /></button></div>
          <label>Título da tarefa <span>*</span><input autoFocus required maxLength="120" placeholder="Ex.: Finalizar atividade de programação" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></label>
          <label>Descrição<textarea rows="4" placeholder="Adicione detalhes sobre esta tarefa..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></label>
          <div className="form-two">
            <label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{statusOptions.map(s => <option key={s.value}>{s.value}</option>)}</select></label>
            <label>Prioridade<select value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}>{priorityOptions.map(p => <option key={p}>{p}</option>)}</select></label>
          </div>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar tarefa'}</button></div>
        </form>
      </div>}
    </div>
  )
}

function statusOf(task) {
  const value = String(task.status || 'Pendente').toLowerCase()
  if (['concluída', 'concluida', 'concluido', 'concluído', 'completed'].includes(value)) return 'Concluída'
  if (['em andamento', 'em_andamento', 'andamento', 'in progress'].includes(value)) return 'Em andamento'
  return 'Pendente'
}
function priorityOf(task) {
  const value = String(task.prioridade || task.priority || 'Média')
  return priorityOptions.find(p => p.toLowerCase() === value.toLowerCase()) || 'Média'
}
function StatCard({ label, value, icon, tone, detail }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><ArrowUpRight className="stat-arrow" size={17} /></div>
}
function TaskRow({ task, onEdit, onDelete, onStatus }) {
  const status = statusOf(task)
  const title = task.titulo || task.title || 'Tarefa sem título'
  const description = task.descricao || task.description || 'Sem descrição'
  const priority = priorityOf(task)
  return <article className="task-row">
    <div className={`task-check ${status === 'Concluída' ? 'checked' : ''}`}>{status === 'Concluída' ? <Check size={14} /> : <Circle size={17} />}</div>
    <div className="task-main"><strong className={status === 'Concluída' ? 'completed-title' : ''}>{title}</strong><p>{description}</p></div>
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority}</span>
    <select className={`status-select status-${status === 'Concluída' ? 'done' : status === 'Em andamento' ? 'progress' : 'pending'}`} value={status} onChange={e => onStatus(e.target.value)} aria-label={`Status de ${title}`}>{statusOptions.map(s => <option key={s.value}>{s.value}</option>)}</select>
    <div className="task-actions"><button onClick={onEdit} title="Editar tarefa" aria-label="Editar tarefa"><Pencil size={16} /></button><button onClick={onDelete} title="Excluir tarefa" aria-label="Excluir tarefa"><Trash2 size={16} /></button></div>
  </article>
}

export default App