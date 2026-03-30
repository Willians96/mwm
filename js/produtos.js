// --- LÓGICA DE RENDERIZAÇÃO DA LOJA (COM DADOS DO NETLIFY CMS) --- //
document.addEventListener("DOMContentLoaded", () => {
  const listaContainer = document.getElementById("produtos-lista");
  const filtrosContainer = document.getElementById("filtros-container");

  if (!listaContainer) return; // Só roda na aba de loja recomendada

  // Função auxiliar para definir classes e cores baseado na plataforma
  function getPlataformaInfo(plataforma) {
    if (!plataforma) return { class: "", bg: "#e6f0ff", color: "#3483fa", tag: "RECOMENDADO" };
    
    if (plataforma.toLowerCase().includes("mercado livre") || plataforma.toLowerCase() === "ml") {
      return { class: "platform-ml", bg: "#e6f0ff", color: "#3483fa", tag: "MERCADO LIVRE" };
    }
    if (plataforma.toLowerCase().includes("shopee")) {
      return { class: "platform-shopee", bg: "#fcefe9", color: "#ee4d2d", tag: "SHOPEE" };
    }
    if (plataforma.toLowerCase().includes("amazon")) {
      return { class: "platform-amazon", bg: "#f3f6fb", color: "#232F3E", tag: "NOVIDADE" };
    }
    return { class: "", bg: "#e6f0ff", color: "#3483fa", tag: "OFERTA" }; // Padrão
  }

  // Gera HTML de um Produto
  function renderProduto(produto, index) {
    const platInfo = getPlataformaInfo(produto.plataforma);

    // Ajuste da Imagem inicial (externa ou local pelo CMS)
    let urlImagem = produto.imagem || "img/loading-placeholder.gif"; // ou imagem cinza padrão

    // Inicialmente mostra um texto de "Carregando..." caso seja ML e não tenha preço fixo
    let precoExibicao = produto.preco || "Verificando...";

    return `
      <li class="product-card" data-categoria="${produto.categoria || 'Geral'}" id="prod-${index}">
        <div class="product-image-container">
          <span class="product-platform ${platInfo.class}">${platInfo.tag}</span>
          <img src="${urlImagem}" class="product-image" alt="${produto.nome}" loading="lazy" id="img-prod-${index}">
        </div>
        <div style="padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1;">
          <h3 class="product-title">${produto.nome}</h3>
          <div class="product-price-box" id="price-prod-${index}">
             <span class="product-price" style="font-size:1.1rem; color:#666;">${precoExibicao}</span>
          </div>
          <a href="${produto.link}" target="_blank" rel="noopener noreferrer" 
             style="background-color: ${platInfo.bg}; color: ${platInfo.color}; text-decoration: none; text-align: center; border-radius: 6px; padding: 10px; font-weight: 600; font-size: 0.9rem; transition: filter 0.2s; margin-top: auto;"
             onmouseover="this.style.filter='brightness(0.95)'" onmouseout="this.style.filter='brightness(1)'">
            Saiba Mais
          </a>
        </div>
      </li>
    `;
  }

  // Busca Preço Real-time na Function
  async function fetchPrecoDinamico(produto, index) {
    // Só busca de verdade se a url existir e se não tiver passado o preço fixo antes
    if (!produto.link) return;
    
    try {
      const resp = await fetch(`/api/get-price?url=${encodeURIComponent(produto.link)}`);
      if (resp.ok) {
        const data = await resp.json();
        
        // Atualiza a interface
        const priceEl = document.getElementById(`price-prod-${index}`);
        const imgEl = document.getElementById(`img-prod-${index}`);
        
        if (priceEl && data.price && data.price !== "Consultar Site") {
          // Extraindo o centavo se houver vírgula para simular ML visual
          const priceParts = data.price.split(",");
          const mainPrice = priceParts[0];
          const cents = priceParts[1] ? `<sup style="font-size:0.5em; vertical-align: top; top: 0.3em; margin-left:2px">${priceParts[1]}</sup>` : `<sup style="font-size:0.5em; vertical-align: top; top: 0.3em; margin-left:2px">00</sup>`;

          if (data.originalPrice && data.discount) {
            priceEl.innerHTML = `<span style="display: block; color: #999; font-size: 0.75em; font-weight: 400; text-decoration: line-through; margin-bottom: 2px;">${data.originalPrice}</span>
                                 <div style="display:flex; align-items:baseline;">
                                    <span class="product-price">${mainPrice}${cents}</span>
                                    <span style="color: #00A650; font-size: 0.8rem; font-weight: 500; margin-left: 6px;">${data.discount}</span>
                                 </div>`;
          } else {
            priceEl.innerHTML = `<span class="product-price">${mainPrice}${cents}</span>`;
          }
        } else if (priceEl && !produto.preco) {
           priceEl.innerHTML = `<span class="product-price" style="font-size:1.1rem; color:#666;">Ver Oferta Oficial</span>`;
        }
        
        if (imgEl && data.image && !produto.imagem) {
          imgEl.src = data.image;
        }
      }
    } catch (e) {
      console.log("Erro ao buscar preço dinâmico", e);
      const priceEl = document.getElementById(`price-prod-${index}`);
      if (priceEl && priceEl.textContent === "Verificando...") {
        priceEl.textContent = "Ver Preço Oficial";
      }
    }
  }

  // Exibe todos os produtos gerando os HTMLs
  function renderTodos(produtos) {
    if (!produtos || produtos.length === 0) {
      listaContainer.innerHTML = '<p style="text-align:center;width:100%;">Nenhum produto cadastrado ainda.</p>';
      return;
    }
    
    // 1. Gera o HTML de todos
    listaContainer.innerHTML = produtos.map((p, i) => renderProduto(p, i)).join('');
    
    // 2. Dispara requests dinâmicos para atualizar em tempo real
    produtos.forEach((p, i) => {
      // Se não definiu o preco/imagem no admin (ou mesmo se quiser sobrepor)
      if (!p.preco || !p.imagem || p.link.includes('meli.la') || p.link.includes('mercadolivre.com') || p.link.includes('shopee.com.br') || p.link.includes('shope.ee')) {
        fetchPrecoDinamico(p, i);
      }
    });
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
