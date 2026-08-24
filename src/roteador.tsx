import React, { useState, useEffect } from "react";

export default function Roteador() {
  // Estados do Estoque e Produtos
  const [estoque, setEstoque] = useState<any[]>([]);
  const [baixas, setBaixas] = useState<any[]>([]);
  const [convidados, setConvidados] = useState<any[]>([]);

  // Controle de Sessão e Usuário
  const [usuarioLogado, setUsuarioLogado] = useState<string | null>(() => {
    return localStorage.getItem("sistema_usuario_logado");
  });

  const [tipoPerfil, setTipoPerfil] = useState<"admin" | "convidado font-bold">(
    () => {
      return (
        (localStorage.getItem("sistema_tipo_perfil") as "admin" | "convidado") ||
        "admin"
      );
    }
  );

  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [categoriaImpressao, setCategoriaImpressao] = useState<string>("TODAS");
  const [buscaOS, setBuscaOS] = useState<string>("");

  // Credenciais de Login
  const [inputEmail, setInputEmail] = useState("");
  const [inputSenha, setInputSenha] = useState("");

  // Cadastro de Convidados
  const [novoEmailConvidado, setNovoEmailConvidado] = useState("");
  const [novoSenhaConvidado, setNovoSenhaConvidado] = useState("");

  // Navegação
  const [abaAtiva, setAbaAtiva] = useState<string>("consulta_estoque");
  const [editandoId, setEditandoId] = useState<number | string | null>(null);

  // Formulário de Cadastro de Produto
  const [codigoProduto, setCodigoProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoriaProduto, setCategoriaProduto] = useState("Blanqueta");
  const [qtdProduto, setQtdProduto] = useState("0");
  const [minProduto, setMinProduto] = useState("5");
  const [unidadeProduto, setUnidadeProduto] = useState("Un");

  // Estados de Entrada e Saída
  const [baixaNroOS, setBaixaNroOS] = useState("");
  const [baixaData, setBaixaData] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [baixaNroRequisicao, setBaixaNroRequisicao] = useState("");
  const [baixaEmpresa, setBaixaEmpresa] = useState("Maxigrafica");
  const [baixaRequisitadoPor, setBaixaRequisitadoPor] = useState("");
  const [itensBaixa, setItensBaixa] = useState([
    {
      id: 1,
      estoque: "",
      descricao: "",
      itemOS: "",
      qtdade: "",
      unEstoque: "",
      c_custo: "",
      descricaoCusto: "",
      nEntr: "",
      classificacao: "",
      observacoes: "",
    },
  ]);

  // =========================================================
  // CARREGAR DADOS COM PERSISTÊNCIA SEGURA DE OS
  // =========================================================
  useEffect(() => {
    if (!usuarioLogado) return;

    // 1. Carregar Estoque
    try {
      const estoqueSalvo = localStorage.getItem("sistema_estoque") || localStorage.getItem("sistema_estoque_v3");
      if (estoqueSalvo) {
        setEstoque(JSON.parse(estoqueSalvo));
      } else {
        const inicial = [
          { id: "1", nome: "Sulfite A4 75g", categoria: "Papel", quantidade: 3, minimo: 5, unidade: "Resmas" },
          { id: "2", nome: "Couchê A3 250g", categoria: "Papel", quantidade: 2, minimo: 3, unidade: "Resmas" },
          { id: "3", nome: "Toner Preto HP 3015", categoria: "Tinta", quantidade: 4, minimo: 2, unidade: "Un" },
          { id: "1785789956133", nome: "Filamento p/ Espiral Amarelo 110C - 2.2mm", categoria: "Filamento", quantidade: 10.8, minimo: 5, unidade: "Kg" },
          { id: "15201", nome: "Bopp Brilho 18µ - 29,0 X 2.000m", categoria: "BOPP", quantidade: 1, minimo: 0, unidade: "Un" },
          { id: "14261", nome: "Bopp Brilho 18µ - 32,0 X 2.000m", categoria: "BOPP", quantidade: 9, minimo: 3, unidade: "Un" },
          { id: "14147", nome: "Bopp Brilho 18µ - 32,0 X 3.600m", categoria: "BOPP", quantidade: 0, minimo: 0, unidade: "Un" }
        ];
        setEstoque(inicial);
        localStorage.setItem("sistema_estoque", JSON.stringify(inicial));
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Carregar Convidados
    try {
      const convSalvos = localStorage.getItem("sistema_convidados");
      if (convSalvos) {
        setConvidados(JSON.parse(convSalvos));
      } else {
        const padraoConv = [{ email: "convidado@grafica.com", senha: "123" }];
        setConvidados(padraoConv);
        localStorage.setItem("sistema_convidados", JSON.stringify(padraoConv));
      }
    } catch (e) {
      console.error(e);
    }

    // 3. CARREGAR OS SALVAS (Busca da nova chave segura e faz fallback nas antigas)
    try {
      const osSeguras = localStorage.getItem("sistema_baixar_os_salvas_v4");
      const osAntigasV3 = localStorage.getItem("sistema_baixas_v3");
      
      if (osSeguras) {
        setBaixas(JSON.parse(osSeguras));
      } else if (osAntigasV3) {
        const parsed = JSON.parse(osAntigasV3);
        setBaixas(parsed);
        localStorage.setItem("sistema_baixar_os_salvas_v4", JSON.stringify(parsed));
      }
    } catch (e) {
      console.error(e);
    }
  }, [usuarioLogado]);

  const registrarMovimentacaoInventario = (novasMovs: any[]) => {
    try {
      const atual = localStorage.getItem("sistema_movimentacoes_estoque");
      const listaAnterior = atual ? JSON.parse(atual) : [];
      const listaAtualizada = [...novasMovs, ...listaAnterior];
      localStorage.setItem(
        "sistema_movimentacoes_estoque",
        JSON.stringify(listaAtualizada)
      );
    } catch (e) {
      console.error("Erro ao registrar inventário:", e);
    }
  };

  const buscarProdutoPorCodigo = (codigoDigitado: string, index: number) => {
    if (!codigoDigitado.trim()) return;

    const produtoEncontrado = estoque.find(
      (p) => String(p.id).trim().toLowerCase() === codigoDigitado.trim().toLowerCase()
    );

    if (produtoEncontrado) {
      const copia = [...itensBaixa];
      copia[index].descricao = produtoEncontrado.nome || produtoEncontrado.descricao || "";
      copia[index].unEstoque = produtoEncontrado.unidade || "Un";
      setItensBaixa(copia);
    }
  };

  // Salvar Baixa Manual de OS com Salvamento Seguro
 const salvarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoPerfil === "convidado font-bold") {
        alert("Acesso negado: Convidados não podem registrar baixas.");
        return;
    }

    const novaBaixa = {
        id: Date.now(),
        nroOS: baixaNroOS ? baixaNroOS.trim() : "Sem OS",
        nomeCliente: baixaRequisitadoPor || "Cliente Padrão",
      nomeCliente: baixaRequisitadoPor || "Cliente Padrão",
      situacao: "Baixa Realizada",
      descricaoServico: itensBaixa[0]?.descricao || "Lançamento Avulso de Estoque",
      valorOS: 0,
      posicaoAtual: "Concluído",
      dtPrevisaoCliente: baixaData,
      dtIniCalculado: "",
      dtFimCalculado: "",
      atraso: "",
      nrOrcamento: baixaNroRequisicao || "-",
      empresa: baixaEmpresa,
      itens: itensBaixa.filter(
        (i) => i.estoque.trim() || i.descricao.trim()
      ),
    };

    const baixasAtualizadas = [novaBaixa, ...baixas];
    setBaixas(baixasAtualizadas);
    localStorage.setItem(
      "sistema_baixar_os_salvas_v4",
      JSON.stringify(baixasAtualizadas)
    );

    const novasMovimentacoes: any[] = [];
    const estoqueAtualizado = estoque.map((prod) => {
      let qtdAbatida = 0;
      novaBaixa.itens.forEach((item) => {
        if (
          (item.estoque &&
            String(item.estoque).trim() === String(prod.id).trim()) ||
          (item.descricao &&
            item.descricao.trim().toLowerCase() ===
              (prod.nome || "").trim().toLowerCase())
        ) {
          const qtdItem = parseFloat(item.qtdade.replace(",", ".")) || 0;
          qtdAbatida += qtdItem;
        }
      });

      if (qtdAbatida > 0) {
        const novaQtd = Math.max(0, (prod.quantidade || 0) - qtdAbatida);
        novasMovimentacoes.push({
          id: Date.now() + Math.random(),
          data: new Date().toLocaleString("pt-BR"),
          tipo: "Saída (Baixa)",
          codigo: prod.id,
          produto: prod.nome || prod.descricao,
          quantidade: qtdAbatida,
          unidade: prod.unidade || "Un",
          observacao: baixaNroOS ? `Baixa realizada na OS N°: ${baixaNroOS}` : "Baixa realizada sem OS",
        });
        return { ...prod, quantidade: novaQtd };
      }
      return prod;
    });

    if (novasMovimentacoes.length > 0) {
      registrarMovimentacaoInventario(novasMovimentacoes);
    }

    setEstoque(estoqueAtualizado);
    localStorage.setItem(
      "sistema_estoque",
      JSON.stringify(estoqueAtualizado)
    );

    setBaixaNroOS("");
    setBaixaNroRequisicao("");
    setBaixaRequisitadoPor("");
    setItensBaixa([
      {
        id: 1,
        estoque: "",
        descricao: "",
        itemOS: "",
        qtdade: "",
        unEstoque: "",
        c_custo: "",
        descricaoCusto: "",
        nEntr: "",
        classificacao: "",
        observacoes: "",
      },
    ]);

    alert("Baixa realizada e estoque atualizado com sucesso!");
    setAbaAtiva("consulta_os");
  };

  const excluirOS = (id: number) => {
    if (tipoPerfil === "convidado font-bold") return;
    if (window.confirm("Deseja realmente remover o registro desta OS?")) {
      const atualizadas = baixas.filter((b) => b.id !== id);
      setBaixas(atualizadas);
      localStorage.setItem("sistema_baixar_os_salvas_v4", JSON.stringify(atualizadas));
    }
  };

  // IMPORTAÇÃO DE OS COM PERSISTÊNCIA SEGURA
  const handleImportarArquivoZenit = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const conteudo = evt.target?.result as string;
      if (!conteudo) return;

      const linhas = conteudo
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
      if (linhas.length < 2) {
        alert("O arquivo selecionado não contém dados válidos.");
        return;
      }

      let delimitador = ";";
      if (linhas[0].includes(";")) delimitador = ";";
      else if (linhas[0].includes("\t")) delimitador = "\t";
      else if (linhas[0].includes(",")) delimitador = ",";

      const cabecalhos = linhas[0]
        .split(delimitador)
        .map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ""));

      let idxOS = cabecalhos.findIndex(
        (c) =>
          c === "os" ||
          c === "nro os" ||
          c === "nro_os" ||
          c.includes("ordem")
      );
      let idxCliente = cabecalhos.findIndex(
        (c) => c.includes("cliente") || c.includes("nome")
      );
      let idxSituacao = cabecalhos.findIndex(
        (c) => c.includes("situacao") || c.includes("situação")
      );
      let idxServico = cabecalhos.findIndex(
        (c) => c.includes("servico") || c.includes("serviço") || c.includes("desc")
      );
      let idxValor = cabecalhos.findIndex(
        (c) => c.includes("valor") || c.includes("vl")
      );
      let idxPosicao = cabecalhos.findIndex(
        (c) => c.includes("posicao") || c.includes("posição")
      );
      let idxPrevisao = cabecalhos.findIndex((c) => c.includes("previs"));
      let idxIni = cabecalhos.findIndex((c) => c.includes("ini"));
      let idxFim = cabecalhos.findIndex((c) => c.includes("fim"));
      let idxAtraso = cabecalhos.findIndex((c) => c.includes("atraso"));
      let idxOrcamento = cabecalhos.findIndex((c) => c.includes("orçamento") || c.includes("orcamento"));
      let idxEmpresa = cabecalhos.findIndex((c) => c.includes("empresa"));

      const novasOS: any[] = [];

      for (let i = 1; i < linhas.length; i++) {
        const col = linhas[i]
          .split(delimitador)
          .map((c) => c.trim().replace(/^"|"$/g, ""));
        if (col.length === 0 || !col.some((c) => c !== "")) continue;

        const valNum = idxValor !== -1 ? parseFloat(col[idxValor].replace(/\./g, "").replace(",", ".")) || 0 : 0;

        novasOS.push({
          id: Date.now() + i,
          nroOS: idxOS !== -1 && col[idxOS] ? col[idxOS] : "087" + (100 + i),
          nomeCliente: idxCliente !== -1 && col[idxCliente] ? col[idxCliente] : "Cliente Não Informado",
          situacao: idxSituacao !== -1 && col[idxSituacao] ? col[idxSituacao] : "Aguardando",
          descricaoServico: idxServico !== -1 && col[idxServico] ? col[idxServico] : "Serviço Gráfico",
          valorOS: valNum,
          posicaoAtual: idxPosicao !== -1 && col[idxPosicao] ? col[idxPosicao] : "Em fila",
          dtPrevisaoCliente: idxPrevisao !== -1 && col[idxPrevisao] ? col[idxPrevisao] : "-",
          dtIniCalculado: idxIni !== -1 && col[idxIni] ? col[idxIni] : "-",
          dtFimCalculado: idxFim !== -1 && col[idxFim] ? col[idxFim] : "-",
          atraso: idxAtraso !== -1 && col[idxAtraso] ? col[idxAtraso] : "",
          nrOrcamento: idxOrcamento !== -1 && col[idxOrcamento] ? col[idxOrcamento] : "-",
          empresa: idxEmpresa !== -1 && col[idxEmpresa] ? col[idxEmpresa] : "Maxigrafica",
        });
      }

      if (novasOS.length > 0) {
        // Junta com as OS já existentes para não sobrescrever nem perder nada
        const baixasAtualizadas = [...novasOS, ...baixas];
        setBaixas(baixasAtualizadas);
        localStorage.setItem(
          "sistema_baixar_os_salvas_v4",
          JSON.stringify(baixasAtualizadas)
        );

        alert(`Sucesso! ${novasOS.length} Ordens de Serviço importadas e salvas permanentemente.`);
        setAbaAtiva("consulta_os");
      } else {
        alert("Não foi possível identificar registros no arquivo.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  // IMPRESSÃO SELECIONANDO O TIPO NO MENU
  const imprimirRelatorio = () => {
    const listaProdutos = estoque || [];
    
    const produtosFiltrados = listaProdutos.filter((p: any) => {
      if (categoriaImpressao === "TODAS") return true;
      return (p.categoria || "").toLowerCase() === categoriaImpressao.toLowerCase();
    });

    if (produtosFiltrados.length === 0) {
      alert("Nenhum produto encontrado para esta categoria!");
      return;
    }

    const categorias = Array.from(
      new Set(produtosFiltrados.map((p: any) => p.categoria || "Outros"))
    );

    const janela = window.open("", "", "width=900,height=700");
    if (!janela) return;

    janela.document.write(`
      <html>
        <head>
          <title>Ficha de Contagem de Estoque</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 2px solid #000; padding: 4px; text-align: left; font-size: 13px; }
            td { padding: 4px; font-size: 13px; vertical-align: bottom; }
            .categoria-header { font-weight: bold; font-size: 14px; padding-top: 15px; padding-bottom: 5px; }
            .tr-linha { border-bottom: 1px dotted #ccc; }
            .text-right { text-align: right; }
            .linha-contada { letter-spacing: -1px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">Código</th>
                <th style="width: 15%;">Qtd.contada</th>
                <th style="width: 15%; text-align: right;">Qtd.estoque</th>
                <th style="width: 8%; text-align: center;">Un</th>
                <th style="width: 37%;">Descrição</th>
                <th style="width: 15%; text-align: right;">Estoque mínimo</th>
              </tr>
            </thead>
            <tbody>
              ${categorias
                .map(
                  (cat: any) => `
                <tr>
                  <td colSpan="6" class="categoria-header">Descrição: ${cat}</td>
                </tr>
                ${produtosFiltrados
                  .filter((p: any) => (p.categoria || "Outros") === cat)
                  .map(
                    (p: any) => `
                    <tr class="tr-linha">
                      <td>${p.codigo || p.id}</td>
                      <td class="linha-contada">____________</td>
                      <td class="text-right">${p.quantidade ?? 0}</td>
                      <td style="text-align: center;">${p.unidade || "Un"}</td>
                      <td>${p.nome || p.descricao}</td>
                      <td class="text-right">${
                        p.estoque_minimo || p.minimo || 0
                      }</td>
                    </tr>
                  `
                  )
                  .join("")}
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
      janela.close();
    }, 300);
  };

  // Autenticação
  const fazerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLimpo = inputEmail.trim().toLowerCase();
    const senhaLimpa = inputSenha.trim();

    if (emailLimpo === "clodoccb@yahoo.com.br" && senhaLimpa === "159159") {
      localStorage.setItem("sistema_usuario_logado", emailLimpo);
      localStorage.setItem("sistema_tipo_perfil", "admin");
      setUsuarioLogado(emailLimpo);
      setTipoPerfil("admin");
      setAbaAtiva("consulta_estoque");
      return;
    }

    const convidadoEncontrado = convidados.find(
      (c) => c.email.toLowerCase() === emailLimpo && c.senha === senhaLimpa
    );

    if (convidadoEncontrado) {
      localStorage.setItem("sistema_usuario_logado", emailLimpo);
      localStorage.setItem("sistema_tipo_perfil", "convidado");
      setUsuarioLogado(emailLimpo);
      setTipoPerfil("convidado font-bold");
      setAbaAtiva("consulta_estoque");
      return;
    }

    alert("E-mail ou senha incorretos!");
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
    const novo = {
      email: novoEmailConvidado.trim(),
      senha: novoSenhaConvidado.trim(),
    };
    const atualizado = [...convidados, novo];
    setConvidados(atualizado);
    localStorage.setItem("sistema_convidados", JSON.stringify(atualizado));
    setNovoEmailConvidado("");
    setNovoSenhaConvidado("");
    alert("Convidado cadastrado com sucesso!");
  };

  const excluirConvidado = (email: string) => {
    if (window.confirm(`Deseja remover o acesso de ${email}?`)) {
      const atualizado = convidados.filter((c) => c.email !== email);
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
            <h1 className="text-xl font-bold text-slate-800">
              Autenticação de Acesso
            </h1>
            <p className="text-xs text-slate-500">
              Informe suas credenciais para entrar no painel.
            </p>
          </div>

          <form onSubmit={fazerLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full p-2.5 border rounded text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={inputSenha}
                onChange={(e) => setInputSenha(e.target.value)}
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

  // CRUD Produtos
  const salvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    if (tipoPerfil === "convidado font-bold") return;
    let atualizado = [];
    const proximoCodigo = codigoProduto.trim()
      ? codigoProduto.trim()
      : String(estoque.length + 1);

    const qtdNovaNum = Number(qtdProduto);

    if (editandoId !== null) {
      const itemExistente = estoque.find((i) => i.id === editandoId);
      if (itemExistente && itemExistente.quantidade !== qtdNovaNum) {
        const diferenca = qtdNovaNum - (itemExistente.quantidade || 0);
        registrarMovimentacaoInventario([
          {
            id: Date.now() + Math.random(),
            data: new Date().toLocaleString("pt-BR"),
            tipo: diferenca > 0 ? "Entrada (Acerto)" : "Saída (Acerto)",
            codigo: proximoCodigo,
            produto: nomeProduto,
            quantidade: Math.abs(diferenca),
            unidade: unidadeProduto,
            observacao: "Acerto manual de estoque",
          },
        ]);
      }

      atualizado = estoque.map((i) =>
        i.id === editandoId
          ? {
              ...i,
              id: proximoCodigo,
              nome: nomeProduto,
              categoria: categoriaProduto,
              quantidade: qtdNovaNum,
              minimo: Number(minProduto),
              unidade: unidadeProduto,
            }
          : i
      );
      setEditandoId(null);
      alert("Produto atualizado com sucesso!");
    } else {
      const novo = {
        id: proximoCodigo,
        nome: nomeProduto,
        categoria: categoriaProduto,
        quantidade: qtdNovaNum,
        minimo: Number(minProduto),
        unidade: unidadeProduto,
      };
      atualizado = [...estoque, novo];

      if (qtdNovaNum > 0) {
        registrarMovimentacaoInventario([
          {
            id: Date.now() + Math.random(),
            data: new Date().toLocaleString("pt-BR"),
            tipo: "Entrada (Cadastro)",
            codigo: proximoCodigo,
            produto: nomeProduto,
            quantidade: qtdNovaNum,
            unidade: unidadeProduto,
            observacao: "Cadastro inicial de novo produto",
          },
        ]);
      }

      alert("Produto cadastrado com sucesso!");
    }

    setEstoque(atualizado);
    localStorage.setItem("sistema_estoque", JSON.stringify(atualizado));
    setCodigoProduto("");
    setNomeProduto("");
    setQtdProduto("0");
    setMinProduto("5");
    setUnidadeProduto("Un");
    setAbaAtiva("consulta_estoque");
  };

  const iniciarEdicao = (prod: any) => {
    if (tipoPerfil === "convidado font-bold") return;
    setEditandoId(prod.id);
    setCodigoProduto(String(prod.id || ""));
    setNomeProduto(prod.nome || prod.descricao || "");
    setCategoriaProduto(prod.categoria || "Blanqueta");
    setQtdProduto(String(prod.quantidade ?? prod.qtdade ?? 0));
    setMinProduto(String(prod.minimo ?? 5));
    setUnidadeProduto(prod.unidade || "Un");
    setAbaAtiva("cadastrar_produto");
  };

  const excluirProduto = (id: any) => {
    if (tipoPerfil === "convidado font-bold") return;
    if (window.confirm("Deseja realmente excluir este produto?")) {
      const atualizado = estoque.filter((i) => i.id !== id);
      setEstoque(atualizado);
      localStorage.setItem("sistema_estoque", JSON.stringify(atualizado));
    }
  };

  const osFiltradas = baixas.filter((b) => {
    const termo = buscaOS.toLowerCase().trim();
    if (!termo) return true;
    return (
      (b.nroOS || "").toLowerCase().includes(termo) ||
      (b.nomeCliente || "").toLowerCase().includes(termo) ||
      (b.descricaoServico || "").toLowerCase().includes(termo) ||
      (b.empresa || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between font-sans">
      <div>
        {/* CABEÇALHO */}
        <header className="bg-cyan-600 text-white shadow-md border-b border-cyan-800 px-4 pt-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 pb-2">
            <div className="flex items-center gap-3">
              <span className="bg-cyan-900 text-white font-bold px-2 py-1 rounded text-xs">
                {tipoPerfil === "admin" ? "ADMINISTRADOR" : "CONVIDADO"}
              </span>
              <span className="text-xs text-cyan-100 font-medium">
                {usuarioLogado}
              </span>
              <button
                type="button"
                onClick={fazerLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition shadow cursor-pointer flex items-center gap-1"
              >
                🚪 Sair
              </button>
            </div>

            <div className="flex flex-wrap gap-1 items-center">
              <button
                type="button"
                onClick={() => setAbaAtiva("entrada_saida")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "entrada_saida"
                    ? "bg-slate-100 text-slate-900 border-slate-300"
                    : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Entrada e Saída
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("consulta_estoque")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "consulta_estoque"
                    ? "bg-slate-100 text-slate-900 border-slate-300"
                    : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                Consulta Estoque
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("consulta_os")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "consulta_os"
                    ? "bg-slate-100 text-slate-900 border-slate-300"
                    : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                }`}
              >
                📋 Consultar OS
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva("registro_inventario")}
                className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                  abaAtiva === "registro_inventario"
                    ? "bg-slate-100 text-slate-900 border-slate-300"
                    : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
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
                    setUnidadeProduto("Un");
                    setAbaAtiva("cadastrar_produto");
                  }}
                  className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                    abaAtiva === "cadastrar_produto"
                      ? "bg-slate-100 text-slate-900 border-slate-300"
                      : "bg-cyan-500 hover:bg-cyan-400 text-white border-transparent"
                  }`}
                >
                  Cadastrar Novo Produto
                </button>
              )}

              {tipoPerfil === "admin" && (
                <button
                  type="button"
                  onClick={() => setAbaAtiva("gerenciar_convidados")}
                  className={`px-3.5 py-2 rounded-t-md text-xs font-bold transition shadow-sm border-t border-x cursor-pointer ${
                    abaAtiva === "gerenciar_convidados"
                      ? "bg-slate-100 text-slate-900 border-slate-300"
                      : "bg-cyan-900 hover:bg-cyan-800 text-white border-transparent"
                  }`}
                >
                  👥 Gerenciar Convidados
                </button>
              )}
            </div>
          </div>
        </header>

        {/* TELAS DO SISTEMA */}
        <main className="max-w-7xl mx-auto p-4">
          {/* ENTRADA E SAÍDA */}
          {abaAtiva === "entrada_saida" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Lançamento de Baixa de Estoque
                </h2>

                <div className="flex items-center gap-2">
                  {tipoPerfil === "admin" && (
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-xs cursor-pointer shadow flex items-center gap-1 transition">
                      📂 Importar CSV/SSV do GE Zenit
                      <input
                        type="file"
                        accept=".csv,.ssv,.txt"
                        onChange={handleImportarArquivoZenit}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <form onSubmit={salvarBaixa} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      N° da OS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 1042"
                      value={baixaNroOS}
                      onChange={(e) => setBaixaNroOS(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={baixaData}
                      onChange={(e) => setBaixaData(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cliente / Requisitado por
                    </label>
                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={baixaRequisitadoPor}
                      onChange={(e) => setBaixaRequisitadoPor(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={baixaEmpresa}
                      onChange={(e) => setBaixaEmpresa(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">Itens da Baixa</h3>
                  {itensBaixa.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded border">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cód. Produto</label>
                        <input
                          type="text"
                          placeholder="Código"
                          value={item.estoque}
                          onChange={(e) => {
                            const copia = [...itensBaixa];
                            copia[index].estoque = e.target.value;
                            setItensBaixa(copia);
                            buscarProdutoPorCodigo(e.target.value, index);
                          }}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        />
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Descrição do Material</label>
                        <input
                          type="text"
                          placeholder="Descrição"
                          value={item.descricao}
                          onChange={(e) => {
                            const copia = [...itensBaixa];
                            copia[index].descricao = e.target.value;
                            setItensBaixa(copia);
                          }}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantidade</label>
                        <input
                          type="text"
                          placeholder="0"
                          value={item.qtdade}
                          onChange={(e) => {
                            const copia = [...itensBaixa];
                            copia[index].qtdade = e.target.value;
                            setItensBaixa(copia);
                          }}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        {itensBaixa.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setItensBaixa(itensBaixa.filter((_, i) => i !== index));
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setItensBaixa([
                        ...itensBaixa,
                        {
                          id: Date.now(),
                          estoque: "",
                          descricao: "",
                          itemOS: "",
                          qtdade: "",
                          unEstoque: "",
                          c_custo: "",
                          descricaoCusto: "",
                          nEntr: "",
                          classificacao: "",
                          observacoes: "",
                        },
                      ])
                    }
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold cursor-pointer"
                  >
                    + Adicionar Outro Item
                  </button>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs shadow cursor-pointer transition"
                  >
                    Salvar Baixa e Atualizar Estoque
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONSULTA DE ESTOQUE */}
          {abaAtiva === "consulta_estoque" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Estoque Atual</h2>
                
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filtrar tabela..."
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="p-2 border rounded text-xs outline-none w-44"
                  />

                  <div className="flex items-center gap-1 bg-slate-50 border p-1 rounded">
                    <span className="text-[11px] font-semibold text-slate-600 px-1">Imprimir:</span>
                    <select
                      value={categoriaImpressao}
                      onChange={(e) => setCategoriaImpressao(e.target.value)}
                      className="p-1.5 border rounded text-xs bg-white outline-none font-medium text-slate-700"
                    >
                      <option value="TODAS">📦 Todas as Categorias</option>
                      {Array.from(new Set(estoque.map((p) => p.categoria || "Outros"))).map((cat: any) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={imprimirRelatorio}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded text-xs transition cursor-pointer shadow flex items-center gap-1"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-xs text-slate-700">
                      <th className="p-3 font-semibold">Código</th>
                      <th className="p-3 font-semibold">Nome / Descrição</th>
                      <th className="p-3 font-semibold">Categoria</th>
                      <th className="p-3 font-semibold">Quantidade</th>
                      <th className="p-3 font-semibold">Unidade</th>
                      <th className="p-3 font-semibold">Mínimo</th>
                      <th className="p-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {estoque
                      .filter((p) => {
                        if (!filtroCategoria) return true;
                        return (
                          (p.categoria || "").toLowerCase().includes(filtroCategoria.toLowerCase()) ||
                          (p.nome || "").toLowerCase().includes(filtroCategoria.toLowerCase())
                        );
                      })
                      .map((prod) => {
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50">
                            <td className="p-3 font-medium text-slate-700">{prod.id}</td>
                            <td className="p-3 font-medium text-slate-800">{prod.nome || prod.descricao}</td>
                            <td className="p-3 text-slate-600">{prod.categoria}</td>
                            <td className={`p-3 font-bold ${Number(prod.quantidade) <= Number(prod.minimo) ? 'text-red-600' : 'text-slate-800'}`}>
                              {prod.quantidade}
                            </td>
                            <td className="p-3 text-slate-600">{prod.unidade}</td>
                            <td className="p-3 text-slate-600">{prod.minimo}</td>
                            <td className="p-3 text-right space-x-2">
                              {tipoPerfil === "admin" && (
                                <>
                                  <button
                                    onClick={() => iniciarEdicao(prod)}
                                    className="text-cyan-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => excluirProduto(prod.id)}
                                    className="text-red-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONSULTA DE OS */}
          {abaAtiva === "consulta_os" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Ordens de Serviço Registradas / Importadas
                </h2>
                <input
                  type="text"
                  placeholder="Buscar por OS, cliente ou serviço..."
                  value={buscaOS}
                  onChange={(e) => setBuscaOS(e.target.value)}
                  className="p-2 border rounded text-xs outline-none w-72"
                />
              </div>

              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-xs text-slate-700">
                      <th className="p-3 font-semibold whitespace-nowrap">N° OS</th>
                      <th className="p-3 font-semibold">Cliente</th>
                      <th className="p-3 font-semibold">Serviço</th>
                      <th className="p-3 font-semibold">Situação</th>
                      <th className="p-3 font-semibold">Valor (R$)</th>
                      <th className="p-3 font-semibold">Previsão</th>
                      <th className="p-3 font-semibold">Empresa</th>
                      <th className="p-3 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {osFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400">
                          Nenhuma Ordem de Serviço encontrada.
                        </td>
                      </tr>
                    ) : (
                      osFiltradas.map((os) => (
                        <tr key={os.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-700">{os.nroOS}</td>
                          <td className="p-3 text-slate-800">{os.nomeCliente}</td>
                          <td className="p-3 text-slate-600">{os.descricaoServico}</td>
                          <td className="p-3">
                            <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {os.situacao}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">
                            R$ {Number(os.valorOS || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-slate-600">{os.dtPrevisaoCliente}</td>
                          <td className="p-3 text-slate-600">{os.empresa}</td>
                          <td className="p-3 text-right">
                            {tipoPerfil === "admin" && (
                              <button
                                onClick={() => excluirOS(os.id)}
                                className="text-red-600 hover:underline font-semibold cursor-pointer"
                              >
                                Excluir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REGISTRO DE INVENTÁRIO */}
          {abaAtiva === "registro_inventario" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800">Registro Histórico de Movimentações</h2>
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b text-xs text-slate-700">
                      <th className="p-3 font-semibold">Data / Hora</th>
                      <th className="p-3 font-semibold">Tipo</th>
                      <th className="p-3 font-semibold">Código</th>
                      <th className="p-3 font-semibold">Produto</th>
                      <th className="p-3 font-semibold">Quantidade</th>
                      <th className="p-3 font-semibold">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {(() => {
                      try {
                        const hist = JSON.parse(localStorage.getItem("sistema_movimentacoes_estoque") || "[]");
                        if (hist.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-slate-400">
                                Nenhuma movimentação registrada ainda.
                              </td>
                            </tr>
                          );
                        }
                        return hist.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-600">{m.data}</td>
                            <td className="p-3 font-semibold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${m.tipo.includes('Entrada') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {m.tipo}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">{m.codigo}</td>
                            <td className="p-3 font-medium text-slate-800">{m.produto}</td>
                            <td className="p-3 font-bold text-slate-800">{m.quantidade} {m.unidade}</td>
                            <td className="p-3 text-slate-500">{m.observacao}</td>
                          </tr>
                        ));
                      } catch {
                        return (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-slate-400">
                              Erro ao carregar histórico.
                            </td>
                          </tr>
                        );
                      }
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CADASTRAR PRODUTO */}
          {abaAtiva === "cadastrar_produto" && tipoPerfil === "admin" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-4 max-w-xl mx-auto">
              <h2 className="text-base font-bold text-slate-800">
                {editandoId !== null ? "Editar Produto" : "Cadastrar Novo Produto"}
              </h2>

              <form onSubmit={salvarProduto} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código do Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: 15201"
                    value={codigoProduto}
                    onChange={(e) => setCodigoProduto(e.target.value)}
                    className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Descrição</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Papel Sulfite A4"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    required
                    value={categoriaProduto}
                    onChange={(e) => setCategoriaProduto(e.target.value)}
                    className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      required
                      value={qtdProduto}
                      onChange={(e) => setQtdProduto(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mínimo</label>
                    <input
                      type="number"
                      required
                      value={minProduto}
                      onChange={(e) => setMinProduto(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade</label>
                    <select
                      value={unidadeProduto}
                      onChange={(e) => setUnidadeProduto(e.target.value)}
                      className="w-full p-2 border rounded text-xs outline-none bg-white font-medium text-slate-700 focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Un">Un (Unidade)</option>
                      <option value="Kg">Kg (Quilograma)</option>
                      <option value="Lt">Lt (Litro)</option>
                      <option value="Resmas">Resmas</option>
                      <option value="Pct">Pct (Pacote)</option>
                      <option value="M">M (Metro)</option>
                      <option value="Rolo">Rolo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("consulta_estoque")}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs cursor-pointer shadow"
                  >
                    Salvar Produto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* GERENCIAR CONVIDADOS */}
          {abaAtiva === "gerenciar_convidados" && tipoPerfil === "admin" && (
            <div className="bg-white border rounded-b-md rounded-tr-md p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
              <h2 className="text-base font-bold text-slate-800">Gerenciar Acessos de Convidados</h2>

              <form onSubmit={cadastrarConvidado} className="space-y-4 bg-slate-50 p-4 rounded border">
                <h3 className="text-xs font-bold text-slate-700">Cadastrar Novo Convidado</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Acesso</label>
                  <input
                    type="email"
                    required
                    value={novoEmailConvidado}
                    onChange={(e) => setNovoEmailConvidado(e.target.value)}
                    className="w-full p-2 border rounded text-xs outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={novoSenhaConvidado}
                    onChange={(e) => setNovoSenhaConvidado(e.target.value)}
                    className="w-full p-2 border rounded text-xs outline-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-xs cursor-pointer shadow"
                >
                  Adicionar Convidado
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">Convidados Atuais</h3>
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b text-xs text-slate-700">
                        <th className="p-3 font-semibold">E-mail</th>
                        <th className="p-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {convidados.map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-800">{c.email}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => excluirConvidado(c.email)}
                              className="text-red-600 hover:underline font-semibold cursor-pointer"
                            >
                              Remover Acesso
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t py-4 text-center text-xs text-slate-500">
        Sistema Interno de Controle Gráfico &bull; Desenvolvido por Clodoaldo
      </footer>
    </div>
  );
}