---
name: Design Vitrine Afiliado
description: Padrões visuais (HTML/CSS) e estruturais para criar vitrines de produtos com design premium, shadows flutuantes, filtros roláveis em categorias e cards dinâmicos estilo Mercado Livre e Shopee.
---

# Skill: Design de Vitrine Premium (Afiliados)

Esta skill documenta o padrão visual (UI/UX) implementado para a vitrine de afiliados, transformando layouts básicos em lojas de alta conversão espelhadas no setup do **Mercado Livre** ou **Amazon**.

## 1. Grid e Barra de Categorias Rolável (Chips)

O layout dos Filtros (departamentos) abandona botões brutos e adota **Chips Roláveis** na horizontal (Mobile First) para evitar a quebra do grid na tela do smartphone.

**CSS da Navegação (Filtros):**
```css
/* Container que permite deslizar o dedo horizontalmente no mobile */
.filter-bar-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* Scroll suave no iOS */
  padding-bottom: 12px;
  margin: var(--space-4) 0;
}

/* Divisão dos Chips */
.filter-bar {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  width: max-content; /* Impede a quebra de linha dos botões */
  margin: 0 auto;
}

/* Os botões em formato de "Pílula" */
.filter-btn {
  padding: 8px 18px;
  border: none;
  background: #f5f5f5;
  color: #333;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

/* Estado ativo e hover */
.filter-btn.active, .filter-btn:hover {
  background: #3483fa;
  color: #fff;
}
```

## 2. Estrutura CSS do Card de Produto (Efeito Premium)

Os *Product Cards* exigem:
1. **Fundo estritamente branco** com bordas leves cinzas para delimitar limites sem pesar a visão.
2. **Efeito Hover:** Sombras suaves (box-shadow) ativadas com transição ao passar o cursor, gerando um efeito 3D/Elevação.
3. **Imagens Isométricas:** Contêiner isolado da imagem com \`object-fit: contain\` para nenhuma foto ficar fora de proporção.

**CSS dos Cards:**
```css
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
  overflow: hidden; /* Cobre pontas afiadas */
}

/* Sombra flutuante 3D animada */
.product-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.product-image-container {
  background: #fff;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px; /* Trava o tamanho exato da foto */
  position: relative;
}

.product-image {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
```

## 3. Selos (Tags das Lojas Oficiais)
Selos criam "Gatilhos de Autoridade". Eles flutuam no canto **superior esquerdo** ou superior direito da imagem usando `position: absolute`.

```css
.product-platform {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 3px;
  color: white;
  text-transform: uppercase;
}

/* Cores das marcas reais: */
.platform-ml { background-color: #3483fa; }   /* Tag Azul Original */
.platform-shopee { background-color: #ee4d2d; } /* Laranja Forte */
```

## 4. Títulos Estabilizados (Line-Clamp)
Produtos de lojistas diferentes quase nunca têm tamanhos padronizados de caracteres nos Títulos de Cadastro. Isso gera "degraus" horrorosos na altura de uma fileira de 3 a 4 produtos. Sempre trave os títulos em 2 linhas com limite "três pontinhos (!...)":

```css
.product-title {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  
  /* Sistema Anti-Desalinhamento */
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  flex-grow: 1; /* Preenche o vazio se tiver só 1 linha de título */
}
```

## 5. Simulação de Preço Varejista (Selo De/Por)
Para fazer o visual do preço parecer super promocional:
- O preço anterior (se existir) fica riscado na cor `#999` com um letreiro pequeno.
- O preço final deve ter os números maiores (1.5rem ou mais), ao lado da flag em VERDE de porcentagem `(54% OFF)`.
- Use uma lógica em Javascript para extrair os **centavos** do retorno da API e colocá-los "em cima" como expoente (\`<sup>\`), emulando a fonte original do ML.

*Exemplo de injeção JS dinâmica:*
```javascript
// Quebra 'R$ 150,90' no meio para montar o Centavo flutuante "⁹⁰":
const priceParts = data.price.split(",");
const mainPrice = priceParts[0];
const cents = priceParts[1] 
    ? \`<sup style="font-size:0.5em; vertical-align: top; top: 0.3em;">\${priceParts[1]}</sup>\` 
    : \`<sup style="font-size:0.5em; vertical-align: top; top: 0.3em;">00</sup>\`;

priceEl.innerHTML = \`<span style="color: #999; font-size: 0.75em; text-decoration: line-through;">\${data.originalPrice}</span>
  <div style="display:flex; align-items:baseline;">
    <span class="product-price">\${mainPrice}\${cents}</span>
    <span style="color: #00A650; font-size: 0.8rem; font-weight: 500; margin-left: 6px;">\${data.discount}</span>
  </div>\`;
```

A combinação destas lógicas de design faz com que nossos blocos injetados artificialmente da nuvem transpareçam 100% de confiança para o clique e compra de comissão do Afiliado.
