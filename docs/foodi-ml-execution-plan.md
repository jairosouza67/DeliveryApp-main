# Plano de Execucao: Cardapio baseado em FooDI-ML + precos Areias do Seixo

## Objetivo

Substituir o catalogo atual por um cardapio de bebidas enriquecido com dados do dataset FooDI-ML, usando:

- imagens e textos do dataset Glovo/FooDI-ML;
- precos de referencia da carta do bar Areias do Seixo;
- dados locais do BebeMais para estoque, disponibilidade e curadoria final.

## Premissas confirmadas

- O uso nao sera comercial, entao as imagens do dataset podem ser usadas neste contexto.
- A fonte de precificacao passa a ser a carta em PDF do Areias do Seixo.
- O dataset FooDI-ML fornece nome, secao, descricao e caminho de imagem, mas nao fornece preco nem estoque.
- O frontend atual esta formatado em real brasileiro, enquanto a carta do bar esta em euro.

## Dados extraidos da carta Areias do Seixo

Trechos relevantes identificados no PDF:

- Sodas & Soft Drinks
- Beers
- Cocktails
- Fortified Wines
- Gin
- Whisky
- Vodka
- Tequila
- Mezcal
- Rum
- Cachaca
- Bitter, Vermute & Pastis
- Liqueurs
- Brandy
- Portuguese Brandy
- Cognac & Armagnac

Exemplos de precos extraidos:

- Coca-Cola: 4,00 EUR
- Coca-Cola Zero: 4,00 EUR
- SevenUp: 4,00 EUR
- Fever Tree Tonic Water 0,20l: 4,00 EUR
- Super Bock Mini 0,20l: 3,00 EUR
- Super Bock 0,33l: 4,00 EUR
- Super Bock alcohol-free 0,33l: 4,00 EUR
- Craft Beer Sovina IPA: 7,00 EUR
- Craft Beer Sovina Stout: 7,00 EUR
- Port Tonic: 10,50 EUR
- Caipirinha: 12,00 EUR
- Expresso Martini: 14,50 EUR
- Aperol Spritz: 15,00 EUR
- Jack Daniels: 9,00 EUR
- Jim Beam: 9,00 EUR
- Johnnie Walker Black Label 12 y.o.: 13,00 EUR
- Grey Goose: 16,00 EUR
- Belvedere: 16,00 EUR
- Plantation 3 Stars: 15,00 EUR
- Capucana: 14,00 EUR
- Campari: 12,00 EUR
- Amendoa Amarga: 9,00 EUR

## Leitura tecnica do problema

O mapeamento entre o PDF e o dataset nao e direto.

- O PDF trabalha com carta de bar e doses/porcoes.
- O dataset contem produtos de app delivery com nomes, secoes e imagens heterogeneas.
- O projeto atual usa apenas `name`, `type`, `price`, `in_stock`, `description` e `image_url`.
- A moeda atual no frontend esta fixada em `R$`, o que entra em conflito com a nova fonte de precos em `EUR`.

Conclusao: a importacao precisa de uma camada de normalizacao, curadoria e regra de precificacao por correspondencia exata ou por categoria.

## Estrategia de precificacao

### Regra 1: correspondencia exata por nome

Quando um item do dataset corresponder a um item da carta por nome normalizado, usar o preco do PDF.

Exemplos de correspondencia direta:

- `Coca-Cola` -> `4.00 EUR`
- `Coca-Cola Zero` -> `4.00 EUR`
- `Jack Daniels` -> `9.00 EUR`
- `Grey Goose` -> `16.00 EUR`
- `Belvedere` -> `16.00 EUR`
- `Campari` -> `12.00 EUR`

### Regra 2: correspondencia por variante ou marca

Quando houver pequenas diferencas de escrita, volume ou sufixo, usar heuristica de marca + categoria + volume aproximado.

Exemplos:

- `Jack Daniel's Tennessee` -> `Jack Daniels`
- `Johnnie Walker Black` -> `Johnnie Walker Black Label 12 y.o.`
- `Tonica Fever Tree 200ml` -> `Fever Tree Tonic Water 0,20l`

### Regra 3: fallback por categoria

Quando nao houver match confiavel por nome, usar preco padrao por categoria derivado da carta.

Tabela inicial de fallback sugerida:

- `soft_drink`: `4.00 EUR`
- `water`: `3.00 EUR`
- `juice`: `7.00 EUR`
- `beer_standard`: `4.00 EUR`
- `beer_craft`: `7.00 EUR`
- `cocktail`: `12.00 EUR` a `15.50 EUR`
- `fortified_wine`: `10.50 EUR` a `19.00 EUR`
- `gin`: `14.00 EUR` a `22.00 EUR`
- `whisky_standard`: `9.00 EUR` a `13.00 EUR`
- `whisky_premium`: `20.00 EUR` a `40.00 EUR`
- `vodka`: `16.00 EUR`
- `rum`: `15.00 EUR` a `20.00 EUR`
- `cachaca`: `14.00 EUR`
- `liqueur`: `9.00 EUR` a `11.00 EUR`

### Regra 4: curadoria manual para itens sem ancoragem

Itens do dataset sem correspondencia valida e sem fallback confiavel ficam em estado `draft` para revisao manual.

## Mudancas de dados necessarias

Expandir a tabela `products` para suportar fonte e metadados do dataset e da precificacao.

Campos novos recomendados:

- `currency_code text default 'EUR'`
- `price_source text`
- `price_reference_label text`
- `source_dataset text`
- `source_product_name text`
- `source_section text`
- `source_description text`
- `source_country_code text`
- `source_city_code text`
- `source_store_name text`
- `source_image_path text`
- `brand text`
- `volume_label text`
- `package_type text`
- `alcoholic boolean`
- `abv text`
- `status text default 'draft'`

## Mudancas de frontend necessarias

### 1. Moeda dinamica

Remover formatacao fixa em `R$` e centralizar formatacao monetaria.

Arquivos impactados:

- `src/components/ProductCard.tsx`
- `src/components/CartDrawer.tsx`
- `src/pages/Catalogo.tsx`
- `src/pages/ProductDetails.tsx`
- `src/pages/Cart.tsx`
- `src/pages/Checkout.tsx`
- `src/pages/admin/Products.tsx`
- `src/pages/admin/Dashboard.tsx`

### 2. Cartao de produto enriquecido

Mostrar os atributos mais relevantes da bebida:

- marca;
- volume;
- tipo de embalagem;
- alcoolico ou nao alcoolico;
- origem ou secao da carta quando fizer sentido.

### 3. Detalhe do produto enriquecido

Exibir na pagina de detalhes:

- descricao original do dataset;
- secao de origem;
- informacoes derivadas como marca, volume e graduacao;
- origem da imagem;
- referencia de preco utilizada.

## Pipeline de importacao

### Fase 1. Download e recorte

- Baixar o CSV do FooDI-ML.
- Nao baixar todas as imagens.
- Filtrar apenas secoes relacionadas a bebidas.
- Limitar idiomas e paises para manter coerencia do cardapio.

### Fase 2. Normalizacao

- Limpar nomes e descricoes.
- Extrair marca, volume e embalagem por regex.
- Classificar categoria normalizada.
- Marcar se o item e alcoolico ou nao.

### Fase 3. Match de preco

- Aplicar dicionario de equivalencias com itens da carta.
- Aplicar heuristica de correspondencia parcial.
- Aplicar fallback por categoria.
- Registrar `price_source = 'areias-do-seixo-pdf'`.

### Fase 4. Imagens

- Selecionar apenas imagens dos produtos aprovados.
- Copiar para storage controlado do projeto.
- Gravar URL final em `image_url`.

### Fase 5. Publicacao

- Inserir produtos no Supabase com `status = 'draft'`.
- Revisar no admin.
- Publicar apenas os aprovados.

## Ordem de implementacao

### Etapa 1. Base tecnica

- Atualizar schema SQL.
- Atualizar tipos do Supabase.
- Criar utilitario unico de formatacao monetaria com suporte a `EUR`.

### Etapa 2. Ingestao

- Criar script `scripts/import-foodi-ml.ts`.
- Criar arquivo local de mapeamento `scripts/price-mapping.areias.json`.
- Gerar lote curado de produtos.

### Etapa 3. Interface

- Atualizar `ProductRecord`.
- Atualizar card de produto.
- Atualizar pagina de catalogo.
- Atualizar pagina de detalhes.

### Etapa 4. Revisao

- Verificar imagens quebradas.
- Verificar precos incoerentes.
- Verificar categorias incorretas.
- Verificar itens sem descricao.

## Riscos tecnicos

- A carta e baseada em consumo de bar, nao necessariamente em embalagem de varejo.
- Nem todo item do dataset tera correspondencia confiavel no PDF.
- O dataset e muito grande para ingestao bruta; a curadoria precisa ser incremental.
- Sem moeda dinamica, o frontend exibira precos incorretos.

## Resultado esperado

Ao final, o projeto tera:

- cardapio de bebidas com imagens do FooDI-ML;
- descricoes enriquecidas e atributos relevantes por bebida;
- precos em euro baseados na carta Areias do Seixo;
- fluxo de curadoria para itens sem match de preco seguro.