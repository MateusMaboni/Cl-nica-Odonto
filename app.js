const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const state = {
  role: "doctor",
  page: "overview",
  patients: [
    { id: 1, name: "Marina Costa", reason: "Acompanhamento", initials: "MC", color: "avatar-blue", last: "12 out", next: "24 out" },
    { id: 2, name: "Lucas Almeida", reason: "Prevenção", initials: "LA", color: "avatar-peach", last: "08 out", next: "28 out" },
    { id: 3, name: "Beatriz Nunes", reason: "Retorno", initials: "BN", color: "avatar-lilac", last: "02 out", next: "31 out" }
  ],
  methods: [
    { id: 1, name: "Acolhimento na primeira consulta", category: "Experiência do paciente", description: "Uma sequência de perguntas abertas para entender expectativas, receios e preferências de comunicação.", public: true, author: "Dra. Ana Martins", uses: 24, icon: "♡" },
    { id: 2, name: "Checklist de preparação da sala", category: "Organização clínica", description: "Lista adaptável para conferir materiais, organização e prontidão antes de cada atendimento.", public: false, author: "Dra. Ana Martins", uses: 8, icon: "✓" },
    { id: 3, name: "Orientações após a consulta", category: "Orientação pós-consulta", description: "Modelo para organizar orientações aprovadas pelo profissional e confirmar se o paciente compreendeu.", public: true, author: "Dra. Ana Martins", uses: 17, icon: "✦" }
  ],
  routines: [
    { id: 1, title: "Seguir a rotina de higiene orientada na consulta", when: "Diariamente", note: "Siga as instruções personalizadas que seu dentista forneceu.", done: false },
    { id: 2, title: "Anotar dúvidas para a próxima consulta", when: "Antes da próxima consulta", note: "Registre perguntas ou mudanças que gostaria de comentar.", done: false },
    { id: 3, title: "Conferir a data do próximo atendimento", when: "Uma vez", note: "Sua próxima consulta está prevista para 24 de outubro.", done: true }
  ],
  nextPatientId: 4, nextMethodId: 4, nextRoutineId: 4,
  search: ""
};

const navConfig = {
  doctor: [
    ["overview", "⌂", "Visão geral"], ["patients", "♙", "Pacientes", "3"], ["methods", "▤", "Meus métodos"], ["community", "◎", "Comunidade"], ["settings", "⚙", "Configurações"]
  ],
  patient: [
    ["patientHome", "⌂", "Meu espaço"], ["myRoutine", "✓", "Minha rotina"], ["myGuidance", "▤", "Orientações"], ["settings", "⚙", "Configurações"]
  ]
};
const pageTitles = {
  overview: "Visão geral", patients: "Pacientes", methods: "Meus métodos", community: "Comunidade profissional",
  patientHome: "Meu espaço", myRoutine: "Minha rotina", myGuidance: "Minhas orientações", settings: "Configurações"
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(x => x[0]?.toUpperCase() || "").join("");
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function setRole(role) {
  state.role = role;
  state.page = role === "doctor" ? "overview" : "patientHome";
  $("#roleSwitch").value = role;
  render();
}
function navigate(page) {
  state.page = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function renderNav() {
  $("#mainNav").innerHTML = navConfig[state.role].map(([id, icon, label, count]) => `
    <button class="nav-item ${state.page === id ? "active" : ""}" data-page="${id}">
      <span class="nav-icon">${icon}</span><span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ""}
    </button>`).join("");
  $$("#mainNav [data-page]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.page)));
}
function header(eyebrow, title, subtitle, action="") {
  return `<div class="page-header"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function statCard(label, number, note, icon, positive="") {
  return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-number">${number}</div><div class="stat-foot ${positive}">${note}</div></div>`;
}
function appointment(time, name, detail, status, statusClass, initialsText, color) {
  return `<div class="appointment"><div class="time-block"><strong>${time}</strong><small>HOJE</small></div><span class="avatar ${color}">${initialsText}</span><div class="appointment-main"><strong>${name}</strong><small>${detail}</small></div><span class="status ${statusClass}">${status}</span></div>`;
}
function methodItem(m) {
  return `<div class="method-card"><div class="method-icon">${m.icon || "✦"}</div><div class="method-info"><strong>${escapeHTML(m.name)}</strong><p>${escapeHTML(m.description)}</p><div class="meta-line"><span class="tag">${escapeHTML(m.category)}</span><span class="tag ${m.public ? "public" : "private"}">${m.public ? "Compartilhado" : "Privado"}</span></div></div><button class="text-link" data-method-toggle="${m.id}">${m.public ? "Tornar privado" : "Compartilhar"}</button></div>`;
}
function renderOverview() {
  return `${header("QUINTA-FEIRA, 22 DE OUTUBRO", "Bom dia, Dra. Ana 🌿", "Um espaço organizado para cuidar dos detalhes e dar mais continuidade ao atendimento.", `<button class="btn btn-primary" data-action="add-patient">＋ Novo paciente</button>`)}
    <div class="welcome-banner"><div class="welcome-copy"><span class="eyebrow">SEU ESPAÇO DE CUIDADO</span><h2>Um bom atendimento começa com boas informações.</h2><p>Organize seus acompanhamentos, aprimore seus métodos e compartilhe conhecimento com a comunidade.</p></div><div class="welcome-art" aria-hidden="true">✳</div></div>
    <div class="stats-grid">${statCard("Pacientes acompanhados", state.patients.length, "Registros demonstrativos", "♙")}${statCard("Métodos criados", state.methods.length, `${state.methods.filter(m=>m.public).length} compartilhados`, "▤")}${statCard("Consultas hoje", "04", "Agenda de demonstração", "◷")}${statCard("Orientações concluídas", `${state.routines.filter(r=>r.done).length}/${state.routines.length}`, "Na rotina de exemplo", "✓", "positive")}</div>
    <div class="content-grid">
      <div class="stack">
        <section class="panel"><div class="panel-head"><div><h3>Agenda de hoje</h3><p>Uma visão rápida dos próximos atendimentos</p></div><button class="text-link" data-page="patients">Ver pacientes →</button></div><div class="appointment-list">${appointment("09:00","Marina Costa","Acompanhamento · Sala 02","Confirmado","status-confirmed","MC","avatar-blue")}${appointment("10:30","Lucas Almeida","Prevenção · Sala 01","Confirmado","status-confirmed","LA","avatar-peach")}${appointment("13:15","Beatriz Nunes","Retorno · Sala 02","A confirmar","status-pending","BN","avatar-lilac")}</div></section>
        <section class="panel"><div class="panel-head"><div><h3>Métodos em destaque</h3><p>Seus modelos de atendimento</p></div><button class="text-link" data-page="methods">Ver todos →</button></div><div class="method-list">${state.methods.slice(0,2).map(methodItem).join("")}</div></section>
      </div>
      <div class="stack">
        <section class="panel"><div class="panel-head"><div><h3>Atividade recente</h3><p>O que está acontecendo no seu espaço</p></div></div><div class="activity-list"><div class="activity-item"><span class="activity-dot"></span><div><p><strong>Orientação atualizada</strong> para a rotina de demonstração.</p><small>Hoje, 09:15</small></div></div><div class="activity-item"><span class="activity-dot"></span><div><p>Seu método <strong>Acolhimento na primeira consulta</strong> está compartilhado.</p><small>Ontem, 16:40</small></div></div><div class="activity-item"><span class="activity-dot"></span><div><p>Você tem <strong>1 paciente</strong> com retorno próximo.</p><small>Ontem, 11:20</small></div></div></div></section>
        <section class="panel"><div class="panel-head"><div><h3>Uma ideia para evoluir</h3><p>Melhoria contínua</p></div><span class="stat-icon">✧</span></div><div style="padding:0 20px 19px"><p style="font-size:12px;line-height:1.7;color:#71898e;margin:0 0 13px">Registre pequenos problemas recorrentes. Com o tempo, os registros podem ajudar a revelar padrões que passariam despercebidos.</p><button class="btn btn-quiet btn-small" data-page="methods">Explorar meus métodos →</button></div></section>
      </div>
    </div>`;
}
function renderPatients() {
  const filtered = state.patients.filter(p => `${p.name} ${p.reason}`.toLowerCase().includes(state.search.toLowerCase()));
  return `${header("ACOMPANHAMENTO CLÍNICO", "Seus pacientes", "Mantenha os registros organizados e encontre rapidamente o que precisa.", `<button class="btn btn-primary" data-action="add-patient">＋ Adicionar paciente</button>`)}
    <div class="toolbar" style="margin-bottom:16px"><div class="search-bar"><span>⌕</span><input id="patientSearch" placeholder="Buscar por nome ou acompanhamento..." value="${escapeHTML(state.search)}"></div><span class="tag">${filtered.length} registros de demonstração</span></div>
    <div class="notice"><strong>Privacidade:</strong> este protótipo armazena os exemplos apenas na memória desta página. Não use dados reais de pacientes.</div>
    <div class="patient-list">${filtered.length ? filtered.map(p=>`<article class="patient-row"><span class="avatar ${p.color}">${p.initials}</span><div class="patient-info"><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.reason)} · Perfil de demonstração</small></div><div class="patient-last">Último registro<strong>${p.last}</strong></div><div class="patient-last">Próximo retorno<strong>${p.next}</strong></div><button class="btn btn-quiet btn-small" data-patient-detail="${p.id}">Abrir perfil →</button></article>`).join("") : `<div class="panel empty-state"><div class="empty-icon">⌕</div><strong>Nenhum resultado encontrado</strong><p>Tente buscar por outro nome ou adicione um novo perfil de demonstração.</p></div>`}</div>`;
}
function renderMethods() {
  return `${header("AUTONOMIA PROFISSIONAL", "Meus métodos", "Crie modelos de atendimento que se adaptem ao seu jeito de trabalhar.", `<button class="btn btn-primary" data-action="add-method">＋ Criar método</button>`)}
    <div class="notice"><strong>Você decide:</strong> seus métodos começam privados. Ao compartilhar, publique apenas conhecimento profissional genérico, sem dados pessoais ou clínicos identificáveis.</div>
    <section class="panel"><div class="panel-head"><div><h3>Seus modelos</h3><p>${state.methods.length} métodos · organize, ajuste e escolha o que compartilhar</p></div><span class="tag public">${state.methods.filter(m=>m.public).length} públicos</span></div><div class="method-list">${state.methods.map(methodItem).join("")}</div></section>
    <section class="panel" style="margin-top:17px"><div class="panel-head"><div><h3>Como seus métodos podem evoluir</h3><p>Um ciclo de melhoria que mantém você no controle</p></div></div><div class="stats-grid" style="padding:0 20px 20px;margin:0;grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat-card"><div class="stat-icon">✎</div><strong style="display:block;margin:10px 0 5px;font-size:12px">1. Crie</strong><span class="stat-foot">Registre objetivo, etapas e critérios.</span></div><div class="stat-card"><div class="stat-icon">↗</div><strong style="display:block;margin:10px 0 5px;font-size:12px">2. Compartilhe</strong><span class="stat-foot">Publique se quiser receber contribuições.</span></div><div class="stat-card"><div class="stat-icon">⟳</div><strong style="display:block;margin:10px 0 5px;font-size:12px">3. Aprimore</strong><span class="stat-foot">Crie sua versão com base no aprendizado.</span></div></div></section>`;
}
const communityMethods = [
  {name:"Checklist de acolhimento", category:"Experiência do paciente", desc:"Uma estrutura para entender expectativas, esclarecer dúvidas e ajudar a pessoa a se sentir acolhida.", author:"Dra. Paula Ribeiro", initials:"PR", uses:42, icon:"♡"},
  {name:"Organização do fluxo da sala", category:"Organização clínica", desc:"Sugestão de etapas para preparar a sala e reduzir esquecimentos entre atendimentos.", author:"Dr. Rafael Lima", initials:"RL", uses:31, icon:"✓"},
  {name:"Revisão de orientações", category:"Acompanhamento", desc:"Modelo de conversa para verificar compreensão e registrar perguntas para o retorno.", author:"Dra. Camila Souza", initials:"CS", uses:27, icon:"✦"},
  {name:"Registro de melhoria contínua", category:"Qualidade", desc:"Como registrar ocorrências, analisar recorrências e documentar ações de melhoria.", author:"Dr. André Melo", initials:"AM", uses:19, icon:"↗"}
];
function renderCommunity() {
  return `${header("CONHECIMENTO COMPARTILHADO", "Comunidade profissional", "Aprenda com outros profissionais, compartilhe ideias e adapte métodos à sua realidade.", `<button class="btn btn-quiet" data-page="methods">Meus métodos ↗</button>`)}
    <div class="notice"><strong>Comunidade demonstrativa:</strong> os exemplos abaixo são fictícios. Publicações reais devem ter moderação, autoria clara e não substituir julgamento clínico ou diretrizes profissionais.</div>
    <div class="toolbar" style="margin-bottom:17px"><div class="search-bar"><span>⌕</span><input id="communitySearch" placeholder="Buscar métodos por tema..." value="${escapeHTML(state.search)}"></div><select id="communityCategory"><option value="">Todas as categorias</option><option>Experiência do paciente</option><option>Organização clínica</option><option>Acompanhamento</option><option>Qualidade</option></select></div>
    <div class="community-grid" id="communityGrid">${renderCommunityCards()}</div>`;
}
function renderCommunityCards() {
  const all = [...communityMethods, ...state.methods.filter(m=>m.public).map(m=>({...m, author:"Você", initials:"VO"}))];
  const search = state.search.toLowerCase();
  const category = $("#communityCategory")?.value || "";
  const list = all.filter(m=>(`${m.name} ${m.desc} ${m.category}`).toLowerCase().includes(search) && (!category || m.category===category));
  if (!list.length) return `<div class="panel empty-state" style="grid-column:1/-1"><div class="empty-icon">⌕</div><strong>Nenhum método encontrado</strong><p>Experimente outra palavra ou categoria.</p></div>`;
  return list.map((m,i)=>`<article class="community-card"><div class="meta-line"><span class="tag">${escapeHTML(m.category)}</span><span class="tag public">Compartilhado</span></div><h3>${escapeHTML(m.name)}</h3><p>${escapeHTML(m.desc || m.description)}</p><div class="card-meta"><span class="card-author"><span class="mini-avatar">${escapeHTML(m.initials || "PR")}</span>${escapeHTML(m.author)}</span><span>♡ ${m.uses || 1} usos</span></div><button class="btn btn-quiet btn-small" style="margin-top:15px" data-use-method="${escapeHTML(m.name)}">Adaptar para mim <span>→</span></button></article>`).join("");
}
function renderPatientHome() {
  return `${header("SEU ESPAÇO DE CUIDADO", "Olá, Marina 🌿", "Um lugar simples para acompanhar suas orientações e manter suas dúvidas organizadas.")}
    <div class="patient-hero"><span class="avatar avatar-blue">MC</span><div><span class="eyebrow">ACOMPANHAMENTO</span><h2>Seu cuidado, no seu ritmo.</h2><p>Profissional de referência: Dra. Ana Martins · Perfil de demonstração</p></div><span class="status status-confirmed hero-badge">Acompanhamento ativo</span></div>
    <div class="stats-grid">${statCard("Próxima consulta","24 out","Sexta-feira · 09:00","◷")}${statCard("Orientações",""+state.routines.length,"Na sua rotina atual","▤")}${statCard("Concluídas",""+state.routines.filter(r=>r.done).length,"Você pode atualizar seu progresso","✓")}${statCard("Dúvidas anotadas","0","Prepare-se para conversar","♡")}</div>
    <div class="content-grid"><div class="stack"><section class="panel"><div class="panel-head"><div><h3>Minha rotina</h3><p>Orientações disponibilizadas pelo profissional</p></div><button class="text-link" data-page="myRoutine">Ver rotina →</button></div><div class="activity-list">${state.routines.slice(0,3).map(r=>`<div class="activity-item"><span class="activity-dot" style="background:${r.done?'#79b39a':'#87b7b5'}"></span><div><p><strong>${escapeHTML(r.title)}</strong></p><small>${escapeHTML(r.when)} · ${r.done?'Concluída':'Pendente'}</small></div></div>`).join("")}</div></section><section class="panel"><div class="panel-head"><div><h3>Antes da próxima consulta</h3><p>Pequenas anotações podem ajudar na conversa</p></div></div><div style="padding:0 20px 20px"><textarea id="patientQuestion" rows="3" placeholder="Escreva uma dúvida para lembrar depois..." style="width:100%;border:1px solid var(--border);border-radius:10px;padding:12px;resize:vertical;outline-color:#8db9b7"></textarea><div style="display:flex;justify-content:flex-end;margin-top:9px"><button class="btn btn-primary btn-small" data-action="save-question">Salvar anotação</button></div></div></section></div><div class="stack"><section class="panel"><div class="panel-head"><div><h3>Próxima consulta</h3><p>Seu próximo encontro</p></div><span class="stat-icon">◷</span></div><div style="padding:0 20px 20px"><div style="font:700 23px Manrope,sans-serif">24 de outubro</div><p style="color:#80969a;font-size:11px;line-height:1.7">Sexta-feira · 09:00<br>Consulta de acompanhamento</p><span class="status status-confirmed">Agendada · exemplo</span></div></section><div class="notice"><strong>Lembrete:</strong> este protótipo apresenta exemplos fictícios. Em uma plataforma real, orientações e mudanças clínicas devem ser fornecidas ou confirmadas pelo profissional responsável.</div></div></div>`;
}
function renderRoutine() {
  return `${header("ACOMPANHAMENTO PERSONALIZADO", "Minha rotina", "Marque o que você concluiu e consulte as orientações disponibilizadas para você.", `<button class="btn btn-quiet" data-action="routine-help">Como funciona? <span>?</span></button>`)}
    <div class="notice"><strong>Importante:</strong> a rotina é um recurso de acompanhamento. Ela não substitui orientações clínicas personalizadas nem deve alterar tratamentos sem conversar com seu dentista.</div>
    <div class="panel"><div class="panel-head"><div><h3>Orientações atuais</h3><p>${state.routines.filter(r=>r.done).length} de ${state.routines.length} concluídas</p></div><span class="tag">${Math.round(state.routines.filter(r=>r.done).length/Math.max(state.routines.length,1)*100)}% concluído</span></div><div class="routine-list" style="padding:0 20px 20px">${state.routines.map(r=>`<label class="routine-item ${r.done?'completed':''}"><input type="checkbox" data-routine="${r.id}" ${r.done?'checked':''}><span class="routine-copy"><strong>${escapeHTML(r.title)}</strong><p>${escapeHTML(r.note || "Orientação registrada pelo profissional.")}</p><small>${escapeHTML(r.when)}</small></span></label>`).join("")}</div></div>`;
}
function renderGuidance() {
  return `${header("INFORMAÇÕES PARA VOCÊ", "Minhas orientações", "Consulte os registros e as informações que o profissional disponibilizou no seu espaço.")}
    <div class="notice"><strong>Transparência:</strong> o paciente deve visualizar apenas informações que o profissional decidiu disponibilizar. Prontuários completos e notas internas não são publicados automaticamente.</div>
    <div class="panel"><div class="panel-head"><div><h3>Orientações compartilhadas</h3><p>Exemplos de informações disponibilizadas pela sua equipe</p></div><span class="tag">3 itens</span></div><div class="method-list">
      <div class="method-card"><div class="method-icon">✓</div><div class="method-info"><strong>Rotina de higiene personalizada</strong><p>Consulte as instruções dadas durante sua consulta e confirme com o profissional se algo não estiver claro.</p><div class="meta-line"><span class="tag">Rotina</span><span class="tag">Atualizado em 20 out</span></div></div></div>
      <div class="method-card"><div class="method-icon">◷</div><div class="method-info"><strong>Preparação para o retorno</strong><p>Separe suas dúvidas e anote mudanças que queira discutir no próximo atendimento.</p><div class="meta-line"><span class="tag">Consulta</span><span class="tag">Atualizado em 20 out</span></div></div></div>
      <div class="method-card"><div class="method-icon">♡</div><div class="method-info"><strong>Contato com a clínica</strong><p>Use os canais oficiais da clínica para dúvidas urgentes ou para confirmar informações de atendimento.</p><div class="meta-line"><span class="tag">Comunicação</span></div></div></div>
    </div></div>`;
}
function renderSettings() {
  const doctor = state.role === "doctor";
  return `${header("PREFERÊNCIAS", "Configurações", "Ajuste seu espaço para que ele funcione de um jeito confortável para você.")}
    <div class="notice"><strong>Protótipo:</strong> estas opções são ilustrativas. Contas reais, permissões, armazenamento seguro e auditoria precisam ser implementados no servidor.</div>
    <div class="settings-grid">
      <section class="setting-card"><h3>Seu perfil</h3><p>${doctor?"Informações básicas do espaço profissional.":"Preferências do seu espaço de paciente."}</p><div class="setting-row"><div><strong>Nome de exibição</strong><small>${doctor?"Dra. Ana Martins":"Marina Costa"} · demonstração</small></div><button class="text-link" data-action="edit-profile">Editar</button></div><div class="setting-row"><div><strong>Tipo de espaço</strong><small>${doctor?"Profissional odontológico":"Paciente"}</small></div><span class="tag">Ativo</span></div></section>
      <section class="setting-card"><h3>Privacidade e acesso</h3><p>Preferências conceituais para uma experiência mais segura.</p><div class="setting-row"><div><strong>Confirmação antes de publicar</strong><small>Revisar antes de compartilhar métodos</small></div><input class="toggle" type="checkbox" checked aria-label="Confirmação antes de publicar"></div><div class="setting-row"><div><strong>Notificações de atividade</strong><small>Receber avisos de atualizações</small></div><input class="toggle" type="checkbox" checked aria-label="Notificações de atividade"></div><div class="setting-row"><div><strong>Resumo semanal</strong><small>Resumo da atividade do espaço</small></div><input class="toggle" type="checkbox" aria-label="Resumo semanal"></div></section>
      <section class="setting-card"><h3>Organização</h3><p>Deixe as informações mais fáceis de encontrar.</p><div class="setting-row"><div><strong>Categoria padrão</strong><small>${doctor?"Organização clínica":"Orientações pessoais"}</small></div><span class="tag">Editável</span></div><div class="setting-row"><div><strong>Ajuda e acessibilidade</strong><small>Atalhos e dicas de uso</small></div><button class="text-link" data-action="help">Ver dicas</button></div></section>
      <section class="setting-card"><h3>Sobre o Sereno</h3><p>Um conceito de plataforma para organização de informações e troca de conhecimento odontológico.</p><div class="setting-row"><div><strong>Versão</strong><small>Protótipo de interface · 0.1</small></div><span class="tag">Demonstração</span></div><div class="setting-row"><div><strong>Dados demonstrativos</strong><small>Não são registros clínicos reais</small></div><span class="tag public">Local</span></div></section>
    </div>`;
}
function render() {
  renderNav();
  $("#breadcrumbCurrent").textContent = pageTitles[state.page] || "Visão geral";
  const isDoctor = state.role === "doctor";
  $("#profileName").textContent = isDoctor ? "Dra. Ana Martins" : "Marina Costa";
  $("#profileRole").textContent = isDoctor ? "Cirurgiã-dentista · demonstração" : "Área do paciente";
  $("#profileAvatar").textContent = isDoctor ? "AM" : "MC";
  $("#topAvatar").textContent = isDoctor ? "AM" : "MC";
  $("#topAvatar").className = "avatar " + (isDoctor ? "avatar-teal" : "avatar-blue");
  const renderers = { overview:renderOverview, patients:renderPatients, methods:renderMethods, community:renderCommunity, patientHome:renderPatientHome, myRoutine:renderRoutine, myGuidance:renderGuidance, settings:renderSettings };
  if ((isDoctor && !["overview","patients","methods","community","settings"].includes(state.page)) || (!isDoctor && !["patientHome","myRoutine","myGuidance","settings"].includes(state.page))) state.page = isDoctor ? "overview" : "patientHome";
  $("#pageContent").innerHTML = (renderers[state.page] || renderOverview)();
  bindPageEvents();
}
function bindPageEvents() {
  $$("[data-page]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.page)));
  $$("[data-action]").forEach(btn => btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    if (action === "add-method") openDialog("methodDialog");
    if (action === "add-patient") openDialog("patientDialog");
    if (action === "add-routine") openDialog("routineDialog");
    if (action === "save-question") {
      const field = $("#patientQuestion");
      if (!field || !field.value.trim()) return showToast("Escreva uma anotação antes de salvar.");
      showToast("Anotação salva nesta demonstração.");
      field.value = "";
    }
    if (action === "routine-help") showToast("Marque a caixa ao concluir. Em uma versão real, seu profissional poderá atualizar as orientações.");
    if (action === "edit-profile") showToast("A edição de perfil será conectada em uma versão com contas reais.");
    if (action === "help" || action === "help-top") showToast("Use o menu lateral para navegar. Os dados desta versão são fictícios.");
  }));
  $$("[data-method-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const m = state.methods.find(x => x.id === Number(btn.dataset.methodToggle));
    if (!m) return;
    m.public = !m.public;
    render();
    showToast(m.public ? "Método compartilhado na demonstração." : "Método marcado como privado.");
  }));
  $$("[data-use-method]").forEach(btn => btn.addEventListener("click", () => {
    const name = btn.dataset.useMethod;
    const found = [...communityMethods, ...state.methods].find(m=>m.name===name);
    state.methods.push({ id: state.nextMethodId++, name: `Minha versão: ${name}`, category: found?.category || "Outro", description: `Versão pessoal adaptada a partir de um método de referência. Revise e personalize antes de usar.`, public: false, author: "Dra. Ana Martins", uses: 0, icon: "✎" });
    showToast("Cópia pessoal criada. Ela começa privada.");
    navigate("methods");
  }));
  $$("[data-routine]").forEach(input => input.addEventListener("change", () => {
    const r = state.routines.find(x => x.id === Number(input.dataset.routine));
    if (r) r.done = input.checked;
    render();
    showToast("Progresso da rotina atualizado.");
  }));
  $$("[data-patient-detail]").forEach(btn => btn.addEventListener("click", () => {
    const p = state.patients.find(x=>x.id===Number(btn.dataset.patientDetail));
    if (p) showToast(`Perfil de ${p.name}: em uma versão real, aqui ficam os registros autorizados.`);
  }));
  const patientSearch = $("#patientSearch");
  if (patientSearch) patientSearch.addEventListener("input", () => {
    const pos = patientSearch.selectionStart;
    state.search = patientSearch.value;
    const page = $("#pageContent");
    page.innerHTML = renderPatients();
    bindPageEvents();
    const newInput = $("#patientSearch"); newInput.focus(); newInput.setSelectionRange(pos,pos);
  });
  const communitySearch = $("#communitySearch");
  if (communitySearch) communitySearch.addEventListener("input", () => {
    const pos = communitySearch.selectionStart;
    state.search = communitySearch.value;
    $("#communityGrid").innerHTML = renderCommunityCards();
    bindPageEvents();
    const newInput = $("#communitySearch"); newInput.focus(); newInput.setSelectionRange(pos,pos);
  });
  const category = $("#communityCategory");
  if (category) category.addEventListener("change", () => $("#communityGrid").innerHTML = renderCommunityCards());
}
function openDialog(id) {
  const d = document.getElementById(id);
  if (d && typeof d.showModal === "function") d.showModal();
  else showToast("Seu navegador não oferece suporte ao formulário.");
}
function closeDialog(id) { const d = document.getElementById(id); if (d?.open) d.close(); }

$("#roleSwitch").addEventListener("change", e => { state.search = ""; setRole(e.target.value); });
$("#helpButton").addEventListener("click", () => showToast("Protótipo demonstrativo. Use o seletor à esquerda para alternar entre profissional e paciente."));
$("#notificationButton").addEventListener("click", () => showToast("Você está em dia com as notificações de demonstração."));
$("#profileButton").addEventListener("click", () => navigate("settings"));

["closeMethodDialog","cancelMethod"].forEach(id=>$("#"+id).addEventListener("click",()=>closeDialog("methodDialog")));
["closeRoutineDialog","cancelRoutine"].forEach(id=>$("#"+id).addEventListener("click",()=>closeDialog("routineDialog")));
["closePatientDialog","cancelPatient"].forEach(id=>$("#"+id).addEventListener("click",()=>closeDialog("patientDialog")));

$("#methodForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#methodName").value.trim(), description = $("#methodDescription").value.trim();
  if (!name || !description) return;
  state.methods.unshift({ id: state.nextMethodId++, name, category: $("#methodCategory").value, description, public: $("#methodPublic").checked, author: "Dra. Ana Martins", uses: 0, icon: "✦" });
  closeDialog("methodDialog"); e.target.reset(); navigate("methods");
  showToast("Método criado. Você pode editá-lo ou alterar o compartilhamento.");
});
$("#routineForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("#routineTitle").value.trim();
  if (!title) return;
  state.routines.push({ id: state.nextRoutineId++, title, when: $("#routineWhen").value, note: $("#routineNote").value.trim(), done: false });
  closeDialog("routineDialog"); e.target.reset(); navigate("myRoutine");
  showToast("Orientação adicionada à rotina demonstrativa.");
});
$("#patientForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#patientNameInput").value.trim();
  if (!name) return;
  state.patients.push({ id: state.nextPatientId++, name, reason: $("#patientReasonInput").value, initials: initials(name), color: ["avatar-blue","avatar-peach","avatar-lilac","avatar-teal"][state.patients.length%4], last: "—", next: "A definir" });
  closeDialog("patientDialog"); e.target.reset(); navigate("patients");
  showToast("Perfil de demonstração adicionado.");
});
$$(".modal").forEach(dialog => dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); }));

render();
