// --- LÓGICA DE RENDERIZAÇÃO DA LOJA (COM DADOS DO NETLIFY CMS) --- //
document.addEventListener("DOMContentLoaded", () => {
  const listaContainer = document.getElementById("produtos-lista");
  const filtrosContainer = document.getElementById("filtros-container");

  if (!listaContainer) return; // Só roda na aba de loja recomendada

  // Função auxiliar para definir classes e cores baseado na plataforma
  function getPlataformaInfo(plataforma) {
    if (!plataforma) return { class: "", color: "var(--color-primary)", textColor: "#fff" };
    
    if (plataforma.toLowerCase().includes("mercado livre") || plataforma.toLowerCase() === "ml") {
      return { class: "platform-ml", color: "#3483fa", textColor: "#fff" };
    }
    if (plataforma.toLowerCase().includes("shopee")) {
      return { class: "platform-shopee", color: "#ee4d2d", textColor: "#fff" };
    }
    if (plataforma.toLowerCase().includes("amazon")) {
      return { class: "platform-amazon", color: "#ff9900", textColor: "#111" };
    }
    return { class: "", color: "var(--color-primary)", textColor: "#fff" }; // Padrão
  }

  // Gera HTML de um Produto
  function renderProduto(produto) {
    const platInfo = getPlataformaInfo(produto.plataforma);

    // Ajuste da Imagem (externa ou local pelo CMS)
    let urlImagem = produto.imagem;
    if (produto.imagem_externa) {
      urlImagem = produto.imagem_externa;
    }

    return `
      <li class="product-card card" data-categoria="${produto.categoria || 'Geral'}">
        <div class="product-image-container">
          ${produto.plataforma ? `<span class="product-platform ${platInfo.class}">${produto.plataforma}</span>` : ''}
          <img src="${urlImagem || ''}" class="product-image" alt="${produto.nome}" loading="lazy">
        </div>
        <h3 class="product-title">${produto.nome}</h3>
        <p class="product-price">${produto.preco}</p>
        <a href="${produto.link}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--full" style="background-color: ${platInfo.color}; border-color: ${platInfo.color}; color: ${platInfo.textColor}; margin-top: auto;">
          Ver na Loja
        </a>
      </li>
    `;
  }

  // Exibe todos os produtos gerando os HTMLs
  function renderTodos(produtos) {
    if (!produtos || produtos.length === 0) {
      listaContainer.innerHTML = '<p style="text-align:center;width:100%;">Nenhum produto cadastrado ainda.</p>';
      return;
    }
    listaContainer.innerHTML = produtos.map(renderProduto).join('');
  }

  // Filtros Dinâmicos de Categoria
  function criarFiltros(produtos) {
    if (!filtrosContainer || !produtos) return;

    // Pega as categorias únicas e remove undefined/null
    let categorias = produtos.map(p => p.categoria).filter(Boolean);
    categorias = [...new Set(categorias)];
    
    // Insere "Todos" no início
    categorias.unshift("Todos");

    filtrosContainer.innerHTML = categorias.map((cat, index) => `
      <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${cat}">
        ${cat}
      </button>
    `).join('');

    // Eventos de clique no Filtro
    const botoesFiltro = filtrosContainer.querySelectorAll(".filter-btn");
    botoesFiltro.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Remove active de todos
        botoesFiltro.forEach(b => b.classList.remove("active"));
        // Adiciona classe active no selecionado
        e.target.classList.add("active");

        const categoriaSelecionada = e.target.getAttribute("data-filter");

        if (categoriaSelecionada === "Todos") {
          renderTodos(produtos);
        } else {
          const filtrados = produtos.filter(p => p.categoria === categoriaSelecionada);
          renderTodos(filtrados);
        }
      });
    });
  }

  // Inicializa buscando os dados JSON que são alimentados pelo CMS
  fetch('data/produtos.json')
    .then(response => {
      if (!response.ok) {
         throw new Error('Falha ao buscar produtos.json');
      }
      return response.json();
    })
    .then(data => {
      // Netlify CMS cria objetos baseados na config, como colocamos "itens" como lista, pegamos dele:
      const produtosListados = data.itens || [];
      renderTodos(produtosListados);
      criarFiltros(produtosListados);
    })
    .catch(error => {
      console.error("Erro ao tentar carregar a lista de produtos:", error);
      listaContainer.innerHTML = '<p style="text-align: center; width: 100%;">Dificuldades em carregar a vitrine no momento.</p>';
    });
});
