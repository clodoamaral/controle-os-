import React, { useState, useEffect } from "react";

export default function Roteador() {
  // Controle de Sessão
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(() => {
    return localStorage.getItem("sistema_usuario_logado");
  });
  const [tipoPerfil, setTipoPerfil] = useState<"admin" | "convidado">(() => {
    return (localStorage.getItem("sistema_tipo_perfil") as "admin" | "convidado") || "admin";
  });

  // Credenciais de Login
  const [inputEmail, setInputEmail] = useState("");
  const [inputSenha, setInputSenha] = useState("");

  const [abaAtiva, setAbaAtiva] = useState<
    | "entrada_saida"
    | "consulta_estoque"
    | "registro_inventario"
    | "cadastrar_produto"
    | "ordens_servico"
    | "gerenciar_convidados"
  >("consulta_estoque");

  // Estados dos dados
  const [listaOS, setListaOS] = useState<any[]>([]);
  const [estoque, setEstoque] = useState<any[]>([]);
  const [baixas, setBaixas] = useState<any[]>([]);
  const [convidados, setConvidados] = useState<any[]>([]);

  // Novo Convidado (se admin quiser cadastrar)
  const [novoEmailConvidado, setNovoEmailConvidado] = useState("");
  const [novoSenhaConvidado, setNovoSenhaConvidado] = useState("");

  // Estados de Edição de Produtos
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [codigoProduto, setCodigoProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoriaProduto, setCategoriaProduto] = useState("Papel");
  const [qtdProduto, setQtdProduto] = useState("0");
  const [minProduto, setMinProduto] = useState("5");
  const [unidadeProduto, setUnidadeProduto] = useState("kg");

  // Estados de Entrada, Saída
  const [baixaNroOS, setBaixaNroOS] = useState("");
  const [baixaData, setBaixaData] = useState(new Date().toISOString().split("T")[0]);
  const [baixaNroRequisicao, setBaixaNroRequisicao] = useState("");
  const [baixaEmpresa, setBaixaEmpresa] = useState("Maxigrafica");
  const [baixaRequisitadoPor, setBaixaRequisitadoPor] = useState("");
  const [baixaManterEmpenho, setBaixaManterEmpenho] = useState("N");
  const [itensBaixa, setItensBaixa] = useState([
    { id: 1, estoque: "", descricao: "", itemOS: "", qtdade: "", unEstoque: "", c_custo: "", descricaoCusto: "", nEntr: "", classificacao: "", observacoes: "" }
  ]);

  useEffect(() => {
    if (!usuarioLogado) return;

    try {
      const osSalvas = localStorage.getItem("sistema_os_lista");
      if (osSalvas) setListaOS(JSON.parse(osSalvas));
    } catch (e) { console.error(e); }

    try {
      const estoqueSalvo = localStorage.getItem("sistema_estoque_v3");
      if (estoqueSalvo) {
        setEstoque(JSON.parse(estoqueSalvo));
      } else {
        const inicial = [
          { id: "1", nome: "Sulfite A4 75g", categoria: "Papel", quantidade: 4, minimo: 5, unidade: "resmas" },
          { id: "2", nome: "Couchê A3 250g", categoria: "Papel", quantidade: 2, minimo: 3, unidade: "resmas" },
          { id: "3", nome: "Toner Preto HP 3015", categoria: "Tinta", quantidade: 4, minimo: 2, unidade: "unidades" }
        ];
        setEstoque(inicial);
        localStorage.setItem("sistema_estoque_v3", JSON.stringify(inicial));
      }
    } catch (e) { console.error(e); }

    try {
      const baixasSalvas = localStorage.getItem("sistema_baixas");
      if (baixasSalvas) setBaixas(JSON.parse(baixasSalvas));
    } catch (e) { console.error(e); }

    try {
      const convSalvos = localStorage.getItem("sistema_convidados");
      if (convSalvos) {
        setConvidados(JSON.parse(convSalvos));
      } else {
        const padraoConv = [{ email: "convidado@grafica.com", senha: "123" }];
        setConvidados(padraoConv);
        localStorage.setItem("sistema_convidados", JSON.stringify(padraoConv));
      }
    } catch (e) { console.error(e); }
  }, [usuarioLogado]);

  // Processo de Login
  const fazerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLimpo = inputEmail.trim().toLowerCase();
    const senhaLimpa = inputSenha.trim();

    // Administrador Principal
    if (emailLimpo === "clodoccb@yahoo.com.br" && senhaLimpa === "159159") {
      localStorage.setItem("sistema_usuario_logado", emailLimpo);
      localStorage.setItem("sistema_tipo_perfil", "admin");
      setUsuarioLogado(emailLimpo);
      setTipoPerfil("admin");
      setAbaAtiva("consulta_estoque");
      return;
    }

    // Verificar se é um Convidado Cadastrado
    const convidadoEncontrado = convidados.find(
      c => c.email.toLowerCase() === emailLimpo && c.senha === senhaLimpa
    );

    if (convidadoEncontrado) {
      localStorage.setItem("sistema_usuario_logado", emailLimpo);
      localStorage.setItem("sistema_tipo_perfil", "convidado");
      setUsuarioLogado(emailLimpo);
      setTipoPerfil("convidado");
      setAbaAtiva("consulta_estoque");
      return;
    }

    alert("E-mail ou senha incorretos! Verifique seus dados.");
  };

  const fazerLogout = () => {
    localStorage.removeItem("sistema_usuario_logado");
    localStorage.removeItem("sistema_tipo_perfil");
    setUsuarioLogado(null);
    setInputEmail("");
    setInputSenha("");
  };

  const cadastrarConvidado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEmailConvidado || !novoSenhaConvidado) return;
    const novo = { email: novoEmailConvidado.trim(), senha: novoSenhaConvidado.trim() };
    const atualizado = [...convidados, novo];
    setConvidados(atualizado);
    localStorage.setItem("sistema_convidados", JSON.stringify(atualizado));
    setNovoEmailConvidado("");
    setNovoSenhaConvidado("");
    alert("Convidado cadastrado com sucesso!");
  };

  const excluirConvidado = (email: string) => {
    if (window.confirm(`Deseja remover o acesso de ${email}?`)) {
      const atualizado = convidados.filter(c => c.email !== email);
      setConvidados(atualizado);
      localStorage.setItem("sistema_convidados", JSON.stringify(atualizado));
    }
  };

  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border rounded-lg shadow-md p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <span className="bg-cyan-600 text-white font-bold px-3 py-1 rounded text-xs uppercase tracking-wider">
              Sistema Gráfico Interno
            </span>
            <h1 className="text-xl font-bold text-slate-800">Autenticação de Acesso</h1>
            <p className="text-xs text-slate-500">Informe suas credenciais para entrar no painel.</p>
          </div>

          <form onSubmit={fazerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={inputEmail}
                onChange={e => setInputEmail(e.target.value)}
                className="w-full p-2.5 border rounded text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
              <input
                type="password"
                required
                value={inputSenha}
                onChange={e => setInputSenha(e.target.value)}
                className="w-full p-2.5 border rounded text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs transition shadow cursor-pointer"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-400 pt-4 border-t">
            By Clodoaldo
          </div>
        </div>
      </div>
    );
  }

  // Funções de CRUD de Produtos (Restrito para Admin)
  const salvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoPerfil === "convidado") {
      alert("Acesso negado: Convidados possuem apenas permissão de visualização.");
      return;
    }
    let atualizado = [];
    const proximoCodigo = codigoProduto.trim() ? codigoProduto.trim() : String(estoque.length + 1);

    if (editandoId !== null) {
      atualizado = estoque.map(i => i.id === editandoId ? {
        ...i,
        id: proximoCodigo,
        nome: nomeProduto,
        categoria: categoriaProduto,
        quantidade: Number(qtdProduto),
        minimo: Number(minProduto),
        unidade: unidadeProduto
      } : i);
      setEditandoId(null);
      alert("Produto atualizado com sucesso!");
    } else {
      const novo = {
        id: proximoCodigo,
        nome: nomeProduto,
        categoria: categoriaProduto,
        quantidade: Number(qtdProduto),
        minimo: Number(minProduto),
        unidade: unidadeProduto
      };
      atualizado = [...estoque, novo];
      alert("Produto cadastrado com sucesso!");
    }
    setEstoque(atualizado);
    localStorage.setItem("sistema_estoque_v3", JSON.stringify(atualizado));
    setCodigoProduto("");
    setNomeProduto("");
    setQtdProduto("0");
    setMinProduto("5");
    setAbaAtiva("consulta_estoque");
  };

  const iniciarEdicao = (prod: any) => {
    if (tipoPerfil === "convidado") return;
    setEditandoId(prod.id);
    setCodigoProduto(String(prod.id || ""));
    setNomeProduto(prod.nome || prod.descricao || "");
    setCategoriaProduto(prod.categoria || "Papel");
    setQtdProduto(String(prod.quantidade ?? prod.qtdade ?? 0));
    setMinProduto(String(prod.minimo ?? 5));
    setUnidadeProduto(prod.unidade || "kg");
    setAbaAtiva("cadastrar_produto");
  };

  const excluirProduto = (id: any) => {
    if (tipoPerfil === "convidado") {
      alert("Acesso negado: Convidados não podem excluir itens.");
      return;
    }
    if (window.confirm("Deseja realmente excluir este produto?")) {
      const atualizado = estoque.filter(i => i.id !== id);
      setEstoque(atualizado);
      localStorage.setItem("sistema_estoque_v3", JSON.stringify(atualizado));
    }
  };

  const salvarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoPerfil === "convidado") {
      alert("Acesso negado: Convidados não podem registrar baixas.");
      return;
    }
    const novaBaixa = {
      id: Date.now(),
      nroOS: baixaNroOS,
      data: baixaData,
      nroRequisicao: baixaNroRequisicao,
      empresa: baixaEmpresa,
      requisitadoPor: baixaRequisitadoPor,
      manterEmpenho: baixaManterEmpenho,
      itens: itensBaixa
    };
    const novas = [novaBaixa, ...baixas];
    setBaixas(novas);
    localStorage.setItem("sistema_baixas", JSON.stringify(novas));
    alert("Baixa salva com sucesso!");
    setAbaAtiva("registro_inventario");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between font-sans">
      <div>
        {/* BARRA SUPERIOR COM ABAS - TOM AZUL PISCINA (CYAN) */}
        <header className="bg-cyan-600 text-white shadow-md border-b border-cyan-800 px-4 pt-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 pb-2">
            <div className="flex items-center gap-3">
              <span className="bg-cyan-900 text-white font-bold px-2 py-1 rounded text-xs">
                {tipoPerfil === "admin" ? "ADMINISTRADOR" : "CONVIDADO (VISUALIZAÇÃO)"}
              </span>
              <span className="text-xs text-cyan-100 font-medium">
                {usuarioLogado}
              </span>
              <button
                type="button"
                onClick={fazerLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition shadow cursor-pointer flex items-center gap-1"
                title="Sair e voltar para a tela inicial"
              >
                🚪 Sair
              </button>
            </div>

            {/* BOTÕES DE ABAS SUPERIORES - AZUL PISCINA */}
            <div className="flex flex-wrap gap-1 items-center">
              <button
                type="button"
                onClick={() => setAbaAtiva("entrada_saida")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "entrada_saida" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Entrada e Saída
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("consulta_estoque")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "consulta_estoque" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Consulta Estoque
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("registro_inventario")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "registro_inventario" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Registro de Inventário
              </button>

              {tipoPerfil === "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setCodigoProduto("");
                    setNomeProduto("");
                    setQtdProduto("0");
                    setMinProduto("5");
                    setAbaAtiva("cadastrar_produto");
                  }}
                  className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                    abaAtiva === "cadastrar_produto" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                  }`}
                >
                  Cadastrar Novo Produto
                </button>
              )}

              <button
                type="button"
                onClick={() => setAbaAtiva("ordens_servico")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "ordens_servico" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Ordens de Serviço
              </button>

              {tipoPerfil === "admin" && (
                <button
                  type="button"
                  onClick={() => setAbaAtiva("gerenciar_convidados")}
                  className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                    abaAtiva === "gerenciar_convidados" ? "bg-slate-100 text-slate-900 border-slate-300" : "bg-cyan-900 hover:bg-cyan-800 text-white border-transparent"
                  }`}
                >
                  👥 Gerenciar Convidados
                </button>
              )}
            </div>
          </div>
        </header>

        {/* CONTEÚDO DAS TELAS */}
        <main className="max-w-7xl mx-auto p-4">
          {/* ABA: ENTRADA E SAÍDA */}
          {abaAtiva === "entrada_saida" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800">Lançamento de Baixa de Estoque</h2>
                {tipoPerfil === "admin" && (
                  <button type="button" onClick={() => setItensBaixa([...itensBaixa, { id: Date.now(), estoque: "", descricao: "", itemOS: "", qtdade: "", unEstoque: "", c_custo: "", descricaoCusto: "", nEntr: "", classificacao: "", observacoes: "" }])} className="px-3 py-1 bg-cyan-600 text-white rounded text-xs font-bold cursor-pointer">
                    + Adicionar Linha
                  </button>
                )}
              </div>

              {tipoPerfil === "convidado" && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
                  Modo Convidado: Você está visualizando os campos, mas alterações estão desativadas.
                </div>
              )}

              <form onSubmit={salvarBaixa} className="space-y-4">
                <div className="grid grid-cols-6 gap-2 text-xs bg-cyan-50 p-3 rounded border">
                  <div>
                    <label className="block font-semibold">Nro da OS</label>
                    <input type="text" disabled={tipoPerfil === "convidado"} value={baixaNroOS} onChange={e => setBaixaNroOS(e.target.value)} className="w-full p-1 border rounded bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold">Data</label>
                    <input type="date" disabled={tipoPerfil === "convidado"} value={baixaData} onChange={e => setBaixaData(e.target.value)} className="w-full p-1 border rounded bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold">Nro Requisição</label>
                    <input type="text" disabled={tipoPerfil === "convidado"} value={baixaNroRequisicao} onChange={e => setBaixaNroRequisicao(e.target.value)} className="w-full p-1 border rounded bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold">Empresa</label>
                    <input type="text" disabled={tipoPerfil === "convidado"} value={baixaEmpresa} onChange={e => setBaixaEmpresa(e.target.value)} className="w-full p-1 border rounded bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold">Requisitado por</label>
                    <input type="text" disabled={tipoPerfil === "convidado"} value={baixaRequisitadoPor} onChange={e => setBaixaRequisitadoPor(e.target.value)} className="w-full p-1 border rounded bg-white" />
                  </div>
                  <div>
                    <label className="block font-semibold">Manter Empenho</label>
                    <select disabled={tipoPerfil === "convidado"} value={baixaManterEmpenho} onChange={e => setBaixaManterEmpenho(e.target.value)} className="w-full p-1 border rounded bg-white">
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-amber-300 text-slate-900 font-bold">
                        <th className="p-2 border">Estoque</th>
                        <th className="p-2 border">Descrição</th>
                        <th className="p-2 border">Qtdade</th>
                        <th className="p-2 border">Un</th>
                        <th className="p-2 border">C.Custo</th>
                        <th className="p-2 border">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensBaixa.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-1 border"><input type="text" disabled={tipoPerfil === "convidado"} value={item.estoque} onChange={e => { const copia = [...itensBaixa]; copia[idx].estoque = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded" /></td>
                          <td className="p-1 border"><input type="text" disabled={tipoPerfil === "convidado"} value={item.descricao} onChange={e => { const copia = [...itensBaixa]; copia[idx].descricao = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded" /></td>
                          <td className="p-1 border"><input type="number" disabled={tipoPerfil === "convidado"} value={item.qtdade} onChange={e => { const copia = [...itensBaixa]; copia[idx].qtdade = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded font-bold" /></td>
                          <td className="p-1 border"><input type="text" disabled={tipoPerfil === "convidado"} value={item.unEstoque} onChange={e => { const copia = [...itensBaixa]; copia[idx].unEstoque = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded" /></td>
                          <td className="p-1 border"><input type="text" disabled={tipoPerfil === "convidado"} value={item.c_custo} onChange={e => { const copia = [...itensBaixa]; copia[idx].c_custo = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded" /></td>
                          <td className="p-1 border"><input type="text" disabled={tipoPerfil === "convidado"} value={item.observacoes} onChange={e => { const copia = [...itensBaixa]; copia[idx].observacoes = e.target.value; setItensBaixa(copia); }} className="w-full p-1 border rounded" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {tipoPerfil === "admin" && (
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs cursor-pointer shadow">
                      Salvar Baixa
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ABA: CONSULTA ESTOQUE */}
          {abaAtiva === "consulta_estoque" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-800">Consulta de Estoque</h2>
                {tipoPerfil === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(null);
                      setCodigoProduto("");
                      setNomeProduto("");
                      setQtdProduto("0");
                      setMinProduto("5");
                      setAbaAtiva("cadastrar_produto");
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded cursor-pointer shadow"
                  >
                    + Cadastrar Novo Produto
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b text-slate-500 uppercase font-bold">
                      <th className="p-3">Código</th>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3 text-right">Qtd Atual</th>
                      <th className="p-3 text-right">Mínimo</th>
                      <th className="p-3">Unidade</th>
                      {tipoPerfil === "admin" && <th className="p-3 text-center">Ações (Editar / Excluir)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {estoque.length === 0 ? (
                      <tr>
                        <td colSpan={tipoPerfil === "admin" ? 7 : 6} className="p-4 text-center text-slate-500">Nenhum produto encontrado.</td>
                      </tr>
                    ) : (
                      estoque.map((item) => (
                        <tr key={item.id} className="hover:bg-cyan-50/40">
                          <td className="p-3 font-mono font-bold text-slate-600">{item.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{item.nome || item.descricao}</td>
                          <td className="p-3"><span className="bg-gray-200 px-2 py-0.5 rounded">{item.categoria || "Geral"}</span></td>
                          <td className="p-3 text-right font-mono font-bold text-cyan-600">{item.quantidade ?? item.qtdade ?? 0}</td>
                          <td className="p-3 text-right font-mono text-slate-600">{item.minimo ?? 5}</td>
                          <td className="p-3 text-slate-500">{item.unidade || "un"}</td>
                          {tipoPerfil === "admin" && (
                            <td className="p-3 text-center flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => iniciarEdicao(item)}
                                className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded font-bold text-xs transition cursor-pointer shadow-sm"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => excluirProduto(item.id)}
                                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-xs transition cursor-pointer shadow-sm"
                              >
                                🗑️ Excluir
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA: REGISTRO DE INVENTÁRIO */}
          {abaAtiva === "registro_inventario" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 mb-2">Registro de Inventário e Histórico de Baixas</h2>
              {baixas.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhuma baixa efetuada até o momento. Faça lançamentos na aba "Entrada e Saída".</p>
              ) : (
                <div className="space-y-4">
                  {baixas.map(b => (
                    <div key={b.id} className="border rounded-md bg-slate-50 p-4 text-xs space-y-2">
                      <div className="flex flex-wrap justify-between items-center bg-cyan-50 p-2 rounded border border-cyan-200 font-bold text-cyan-800">
                        <span>OS: {b.nroOS || "N/A"}</span>
                        <span>Data: {b.data}</span>
                        <span>Requisição: {b.nroRequisicao || "N/A"}</span>
                        <span>Empresa: {b.empresa}</span>
                        <span>Requisitado por: {b.requisitadoPor || "N/A"}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full border bg-white">
                          <thead>
                            <tr className="bg-gray-100 text-slate-600 font-bold border-b">
                              <th className="p-2 border">Estoque</th>
                              <th className="p-2 border">Descrição</th>
                              <th className="p-2 border">Qtdade</th>
                              <th className="p-2 border">Un</th>
                              <th className="p-2 border">C. Custo</th>
                              <th className="p-2 border">Observações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {b.itens?.map((it: any, iIdx: number) => (
                              <tr key={iIdx} className="border-b">
                                <td className="p-2 border font-mono">{it.estoque}</td>
                                <td className="p-2 border">{it.descricao}</td>
                                <td className="p-2 border font-bold text-cyan-600">{it.qtdade}</td>
                                <td className="p-2 border">{it.unEstoque}</td>
                                <td className="p-2 border">{it.c_custo}</td>
                                <td className="p-2 border">{it.observacoes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA: CADASTRAR OU EDITAR PRODUTO (Somente Admin) */}
          {abaAtiva === "cadastrar_produto" && tipoPerfil === "admin" && (
            <div className="max-w-xl mx-auto bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4 text-slate-800">
                {editandoId !== null ? "Editar Produto" : "Cadastrar Novo Produto"}
              </h2>
              <form onSubmit={salvarProduto} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Código do Produto (Opcional)</label>
                  <input type="text" value={codigoProduto} onChange={e => setCodigoProduto(e.target.value)} placeholder="Ex: 4, FIL-01, etc." className="w-full p-2 border rounded font-mono" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nome do Produto</label>
                  <input type="text" required value={nomeProduto} onChange={e => setNomeProduto(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Categoria</label>
                    <select value={categoriaProduto} onChange={e => setCategoriaProduto(e.target.value)} className="w-full p-2 border rounded">
                      <option value="Papel">Papel</option>
                      <option value="Tinta">Tinta</option>
                      <option value="Wire-o">Wire-o</option>
                      <option value="Filamento">Filamento</option>
                      <option value="Pantone">Pantone</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Qtd Atual</label>
                    <input type="number" value={qtdProduto} onChange={e => setQtdProduto(e.target.value)} className="w-full p-2 border rounded font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Mínimo</label>
                    <input type="number" value={minProduto} onChange={e => setMinProduto(e.target.value)} className="w-full p-2 border rounded font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unidade</label>
                  <input type="text" required value={unidadeProduto} onChange={e => setUnidadeProduto(e.target.value)} placeholder="ex: kg, rolos, unidades" className="w-full p-2 border rounded" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setAbaAtiva("consulta_estoque")} className="px-4 py-2 bg-gray-200 rounded font-bold cursor-pointer">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-bold shadow cursor-pointer">Salvar</button>
                </div>
              </form>
            </div>
          )}

          {/* ABA: ORDENS DE SERVIÇO */}
          {abaAtiva === "ordens_servico" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800">Ordens de Serviço ({listaOS.length} cadastradas)</h2>
              {listaOS.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">Nenhuma Ordem de Serviço encontrada.</p>
              ) : (
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-100 border-b font-bold text-slate-600">
                        <th className="p-2">Nro OS</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Descrição / Serviço</th>
                        <th className="p-2">Valor OS</th>
                        <th className="p-2">Posição Atual</th>
                        <th className="p-2">Previsão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaOS.map((os, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-cyan-700">{os.nroOS || os.id}</td>
                          <td className="p-2 font-semibold">{os.cliente || "N/A"}</td>
                          <td className="p-2">{os.servico || os.descricao || "N/A"}</td>
                          <td className="p-2 font-mono">{os.valor || "0,00"}</td>
                          <td className="p-2 font-bold text-amber-700">{os.posicao || os.statusOS || "Aberta"}</td>
                          <td className="p-2 font-mono text-slate-500">{os.previsao || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ABA: GERENCIAR CONVIDADOS (Apenas Admin) */}
          {abaAtiva === "gerenciar_convidados" && tipoPerfil === "admin" && (
            <div className="max-w-xl mx-auto bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-800">Cadastrar Novo E-mail de Convidado</h2>
              <form onSubmit={cadastrarConvidado} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">E-mail do Convidado</label>
                  <input
                    type="email"
                    required
                    value={novoEmailConvidado}
                    onChange={e => setNovoEmailConvidado(e.target.value)}
                    placeholder="convidado@grafica.com"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Senha de Acesso</label>
                  <input
                    type="password"
                    required
                    value={novoSenhaConvidado}
                    onChange={e => setNovoSenhaConvidado(e.target.value)}
                    placeholder="Defina uma senha"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-bold shadow cursor-pointer">
                    Salvar Convidado
                  </button>
                </div>
              </form>

              <div className="border-t pt-4">
                <h3 className="font-bold text-xs text-slate-700 mb-2">Convidados Atuais:</h3>
                <div className="space-y-2">
                  {convidados.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded bg-slate-50 text-xs">
                      <div>
                        <span className="font-bold">{c.email}</span> (Senha: {c.senha})
                      </div>
                      <button
                        type="button"
                        onClick={() => excluirConvidado(c.email)}
                        className="text-red-600 font-bold hover:underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="text-center py-4 text-xs text-slate-400 font-medium border-t mt-8">
        By Clodoaldo
      </footer>
    </div>
  );
}