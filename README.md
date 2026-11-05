# Clareira — Um jardim de ondas

Um mundo procedural 3D com lago interativo de 84 × 62 metros (5,56 vezes a área da versão de 36 × 26), clareira central, colinas contínuas e 4.500 árvores de três famílias: carvalhos, bétulas e coníferas. A floresta se estende até cerca de 700 metros do centro, com terreno até 900 metros. Caminhos, pedras, relva, flores e plantas aquáticas completam o cenário. A área terrestre total é 5,10 vezes a anterior, a terra explorável 5,43 vezes e a faixa aberta da clareira 5,13 vezes (sempre descontando o lago). O limite do ponto de observação passou de 200 para 460 metros. As copas formam áreas de verde-esmeralda, dourado, coral, rosa e violeta. A água turquesa destaca cristas em tons de ouro e rosa. O código permanece na pasta `prisma` para preservar o caminho de execução existente.

## Abrir

Execute `iniciar.cmd` e visite http://localhost:5173. Alternativamente, use `npm run dev` nesta pasta. Requer Node.js 22.8 ou superior e navegador com WebGL 2. Não precisa instalar pacotes. Three.js 0.180.0 carrega do jsDelivr; é necessária internet. As fontes externas são opcionais. Todo o cenário é geometria criada pelo código, sem modelos ou imagens externos.

## Explorar

- Clique ou toque brevemente na água para iniciar ondas; arrastar não cria ondas. Colinas, troncos e copas na frente da água bloqueiam o clique.
- Arraste com o botão esquerdo para olhar ao redor; botão direito + arraste desloca o ponto de observação. A roda aproxima ou afasta.
- WASD ou setas deslocam câmera e ponto de observação na direção da vista; Shift acelera. A câmera acompanha a altura do terreno e permanece acima dele. É uma câmera de exploração livre, sem colisão física com árvores.
- No celular, um dedo gira; dois dedos deslocam/aproximam. Os botões direcionais também permitem percorrer o mundo.
- O minimapa mostra o lago, as fazendas, os pontos de descoberta e a posição/direção da câmera. Voltar ao lago ou H retorna à vista central. Redimensionar a janela preserva a posição explorada. Ondas +/− recolhe os controles.
- Cada toque pode criar uma fonte, duas fontes, seis fontes em hexágono ou 27 fontes num triângulo recursivo.
- Comprimento de onda muda a distância entre cristas. Duração controla o amortecimento e a extensão temporal do trem de ondas. Valores valem para novas fontes; ondas existentes preservam os parâmetros.
- Pausar congela as ondas, veados, borboletas, nuvens, moinho, partículas e o ciclo de dia/noite; a câmera continua livre. Um novo toque na água retoma o tempo. Acalmar remove todas as fontes.
- Guardar instante exporta o cenário em PNG.
- No teclado: Tab até o cenário e Enter para interagir no centro da vista, quando a água está visível; Espaço para pausar/continuar. Os controles usam elementos HTML nativos.
- O lago começa tranquilo. A preferência por movimento reduzido desativa o movimento ambiente das partículas; ondas são acionadas pelo usuário.

## Fazendas e carroças

Três fazendas distintas ocupam pátios nivelados e estão marcadas no mapa:

- Pomar do Sol: casa clara, telhado de terracota, árvores frutíferas e carroça com colheita (−135, 115).
- Lavanda da Colina: casa com telhado violeta, fileiras de lavanda, poço e carroça (210, −100).
- Sítio do Moinho: celeiro avermelhado, moinho animado, trigo, fardos e carroça (−300, −45).

Uma quarta carroça fica perto da clareira. São objetos estacionados, construídos em código; não há veículos dirigíveis. As árvores e os veados evitam os pátios.

## Dia e noite

Um dia completo dura oito minutos de simulação e começa às 08:00. O relógio permite avançar seis horas sem alterar a idade das ondas. Sol, lua, estrelas, céu, névoa, iluminação do terreno e tonalidade da água acompanham o horário. Janelas e luminárias acendem durante a noite. Pausar também congela o horário, mas mantém a câmera livre. Sombras centrais são atualizadas a cada dois segundos de simulação durante o dia. Os reflexos da água usam captura estática com correção de luminosidade; não são recapturados durante cada mudança de horário.

## Veados

Trinta animais são construídos com geometria procedural, incluindo corpo, pescoço, orelhas, patas articuladas, cascos, cauda e galhadas em parte do grupo. Alternam caminhada e pastagem; os passos dependem da distância percorrida e as patas usam cinemática inversa simples para acompanhar o solo. Os trajetos evitam água e troncos, limitam a inclinação e mantêm distância entre animais. São comportamentos artísticos, sem simulação zoológica completa. Pedras pequenas e copas não participam do desvio. Quatro animais começam próximos à margem frontal, oito percorrem os prados intermediários e dezoito ficam em regiões mais distantes do bosque.

## Acabamento do mundo

A clareira aberta tem aproximadamente 252 × 186 metros, com o lago de 84 × 62 no centro. O prado florido, a colina violeta e as pedras do poente estão marcados no minimapa. O solo combina cor, granulação e trilhas sinuosas; as pedras têm veios e musgo; as margens recebem juncos, samambaias, cogumelos e troncos com anéis de madeira. Há flores sobre parte das folhas aquáticas e borboletas animadas.

A água usa uma captura cúbica do ambiente feita ao carregar (aproximação estática de reflexos; não reflete os veados em tempo real), variação de brilho, padrões de luz na água rasa e uma borda suave na margem. O céu tem gradiente, halo solar e nuvens procedurais. Formas e cores são geradas em código, sem imagens externas.

Objetos são agrupados por região; vegetação baixa e outros detalhes deixam de ser desenhados à distância. A geometria distante reaparece ao se aproximar. O desempenho real ainda não foi medido no navegador.

## Como funciona

O deslocamento vertical da água é a soma assinada de trens de ondas circulares. Cada contribuição depende da distância à fonte, idade, comprimento de onda, velocidade e amortecimento. Uma janela suave impede movimento antes da chegada da frente de onda e encerra o trem após sua duração. A superfície 3D e suas normais mudam com a soma, criando encontros construtivos e destrutivos, realçados por iluminação e linhas discretas nas cristas.

O padrão fractal subdivide recursivamente a disposição triangular de fontes em três níveis (3³ = 27). A inspiração em Nico’s Fractal Machine é a exploração de regras geométricas simples e repetidas com resposta imediata. Não é uma reprodução do algoritmo original nem uma alegação de que toda interferência seja fractal.

Modelo artístico de ondas lineares, com unidades em metros e segundos dentro da escala virtual. Não resolve Navier–Stokes, colisões de fluido ou reflexão nas margens. A água é recortada na margem do lago. Fontes muito perto da margem têm sua disposição reduzida para permanecer dentro dela. São mantidas até 48 fontes; novas fontes substituem as mais antigas quando esse limite é atingido. Fontes expiradas são descartadas.

## Estrutura e validação

`dist/model.js`: modelo CPU, padrões, validação e gerenciamento de fontes. `dist/water.js`: shader de deslocamento e iluminação da água, com cálculo analítico da inclinação em uma passagem pelas fontes. `dist/world.js`: dimensões compartilhadas, altura do terreno e limites de navegação. `dist/navigation.js`: OrbitControls, deslocamento, minimapa, toque versus arraste e retorno. `dist/grove.js`: cenário procedural com instâncias agrupadas espacialmente para descarte de partes fora da vista. `dist/wildlife-model.js`: trajetos, pastagem, separação dos veados e desvio de troncos e água. `dist/deer.js`: modelos programáticos, articulações, ajuste das patas ao relevo e sombras de contato. `dist/materials.js`: textura procedural de solo, trilhas, veios e musgo. `dist/scenery.js`: samambaias, cogumelos, juncos, troncos, flores aquáticas, pontos de descoberta e borboletas. `dist/atmosphere.js`: céu procedural, halo solar e nuvens suaves. `dist/farms.js`: fazendas, plantações, carroças, moinho e luminárias. `dist/daylight.js`: horário e curvas de iluminação. `dist/app.js`: interação, simulação e exportação. `dist/index.html` e `dist/style.css`: interface responsiva. `server.mjs`: servidor local sem dependências.

`npm test` executa dezessete testes: geometria recursiva, limites da margem ampliada, causalidade, superposição/cancelamento, preservação dos parâmetros, descarte de fontes, relevo, limites de exploração, classificação dos gestos, áreas do lago, da terra total, da terra explorável e da clareira aberta, além do comportamento dos veados, pátios nivelados e periodicidade do ciclo de dia/noite. Checagens de sintaxe também realizadas. A compilação dos shaders e a aparência/performance ainda precisam de validação em navegador; o navegador automatizado foi bloqueado pelas permissões do ambiente nesta sessão. Não há publicação concluída. O identificador reservado do Sites foi preservado em `.openai/hosting.json`.

Checklist manual: percorrer colinas em todas as direções; retornar ao lago; ampliar a janela mantendo a câmera; arrastar sobre a água sem criar fontes; testar toque com um/dois dedos; clicar em água escondida por árvores; sobrepor ondas; pausar ondas durante deslocamento; exportar PNG; conferir ausência de erros WebGL. Sombras centrais são atualizadas periodicamente conforme o sol; a floresta distante usa iluminação ambiente. Desempenho em aparelhos modestos ainda não medido.

Referência da navegação: https://threejs.org/docs/pages/OrbitControls.html



## Git e validação local

O repositório Git fica nesta pasta, com remoto destinado a https://github.com/Ambrosios13/A-Clareira.git. Consulte COMMIT.md para revisar o stage e criar o commit. Nenhum push foi realizado. Metadados locais do Sites, caches, logs e arquivos de ambiente são ignorados.

Execute npm test e npm run check. A verificação check valida imports locais, arquivos estáticos e elementos da interface usados pelo JavaScript. O workflow .github/workflows/checks.yml executa essas verificações em pushes e pull requests; não publica o site automaticamente.
