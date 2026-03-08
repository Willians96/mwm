/**
 * Lista de Produtos Afiliados
 * Para adicionar um novo produto, basta copiar um bloco { ... } e colar abaixo.
 */
const produtosAfiliados = [
  {
    id: 1,
    nome: "Notebook Lenovo IdeaPad Ryzen 5",
    preco: "R$ 2.499,00",
    imagem: "https://http2.mlstatic.com/D_NQ_NP_2X_824148-MLA74609802062_022024-F.webp",
    link: "https://www.mercadolivre.com.br/", // <-- COLOQUE SEU LINK DE AFILIADO AQUI
    plataforma: "Mercado Livre",
    categoria: "Computadores"
  },
  {
    id: 2,
    nome: "Kit Teclado e Mouse sem fio Logitech",
    preco: "R$ 150,00",
    imagem: "https://http2.mlstatic.com/D_NQ_NP_2X_616942-MLU74384661793_022024-F.webp",
    link: "https://www.mercadolivre.com.br/", // <-- COLOQUE SEU LINK DE AFILIADO AQUI
    plataforma: "Mercado Livre",
    categoria: "Periféricos"
  },
  {
    id: 3,
    nome: "Mousepad Extra Grande Gamer",
    preco: "R$ 45,00",
    imagem: "https://cf.shopee.com.br/file/br-11134207-7r98o-lsth6xwxg7kx2d",
    link: "https://shopee.com.br/", // <-- COLOQUE SEU LINK DE AFILIADO AQUI
    plataforma: "Shopee",
    categoria: "Acessórios"
  },
  {
    id: 4,
    nome: "SSD NVMe 1TB Kingston",
    preco: "R$ 380,00",
    imagem: "https://http2.mlstatic.com/D_NQ_NP_2X_709282-MLU52331826065_112022-F.webp",
    link: "https://www.mercadolivre.com.br/", // <-- COLOQUE SEU LINK DE AFILIADO AQUI
    plataforma: "Mercado Livre",
    categoria: "Hardware"
  },
  {
    id: 5,
    nome: "Filtro de Linha / DPS Clamper",
    preco: "R$ 65,00",
    imagem: "https://down-br.img.susercontent.com/file/br-11134207-7r98o-lstvng9x0w7u6f",
    link: "https://shopee.com.br/", // <-- COLOQUE SEU LINK DE AFILIADO AQUI
    plataforma: "Shopee",
    categoria: "Energia"
  }
];

// --- LÓGICA DE RENDERIZAÇÃO DA LOJA --- //
document.addEventListener("DOMContentLoaded", () => {
  const listaContainer = document.getElementById("produtos-lista");
  const filtrosContainer = document.getElementById("filtros-container");

  if (!listaContainer) return; // Só roda na página da loja

  // Função auxiliar para definir classes e cores baseado na plataforma
  function getPlataformaInfo(plataforma) {
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

    return `
      <li class="product-card card" data-categoria="${produto.categoria}">
        <div class="product-image-container">
          <span class="product-platform ${platInfo.class}">${produto.plataforma}</span>
          <img src="${produto.imagem}" class="product-image" alt="${produto.nome}" loading="lazy">
        </div>
        <h3 class="product-title">${produto.nome}</h3>
        <p class="product-price">${produto.preco}</p>
        <a href="${produto.link}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--full" style="background-color: ${platInfo.color}; border-color: ${platInfo.color}; color: ${platInfo.textColor}; margin-top: auto;">
          Ver na Loja
        </a>
      </li>
    `;
  }

  // Exibe todos os produtos
  function renderTodos(produtos) {
    listaContainer.innerHTML = produtos.map(renderProduto).join('');
  }

  // Filtros de Categoria
  function criarFiltros() {
    if (!filtrosContainer) return;

    // Pega categorias únicas
    const categorias = [...new Set(produtosAfiliados.map(p => p.categoria))].filter(Boolean);
    categorias.unshift("Todos");

    filtrosContainer.innerHTML = categorias.map((cat, index) => `
      <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${cat}">
        ${cat}
      </button>
    `).join('');

    // Eventos de Filtro
    const botoesFiltro = filtrosContainer.querySelectorAll(".filter-btn");
    botoesFiltro.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Remove class ativo de todos
        botoesFiltro.forEach(b => b.classList.remove("active"));
        // Adiciona no clicado
        e.target.classList.add("active");

        const categoriaSelecionada = e.target.getAttribute("data-filter");

        if (categoriaSelecionada === "Todos") {
          renderTodos(produtosAfiliados);
        } else {
          const filtrados = produtosAfiliados.filter(p => p.categoria === categoriaSelecionada);
          renderTodos(filtrados);
        }
      });
    });
  }

  // Inicializa a Loja
  renderTodos(produtosAfiliados);
  criarFiltros();
});
