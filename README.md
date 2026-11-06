# Clareira — Ecos de um reino

A experiência agora inclui uma jornada de ação em terceira pessoa: um aventureiro de armadura e capa, combate com vigor, esquiva, cura, inimigos e um chefe. A floresta facetada envolve uma rota de ruínas conectadas por pedras e balizas, com montanhas distantes, três santuários e quatro lugares novos. A exploração livre e os enigmas subterrâneos continuam disponíveis.

## Jogar a jornada

Execute **iniciar.cmd** ou **npm run dev**, abra http://localhost:5173 e escolha **Iniciar jornada**. **Contemplar o mundo** mantém a câmera de exploração livre.

| Controle | Ação |
| --- | --- |
| WASD / setas | Andar na direção da câmera |
| Arrastar / roda | Girar / aproximar a câmera |
| Shift | Correr, consumindo vigor |
| J / K | Corte / ataque forte |
| Espaço | Esquiva com breve invulnerabilidade |
| Q | Fixar / soltar o inimigo mais próximo |
| L | Usar um dos três frascos de cura |
| T | Descansar perto de um santuário, longe dos inimigos |
| U | Evoluir no santuário ativo usando brasas |
| E | Interagir com os lugares e personagens existentes |
| P | Pausar / continuar |

No toque, use as setas e os botões de ação; arraste o cenário para girar. O som é opcional, sintetizado no navegador, e começa desligado.

Siga a trilha da **Brasa da Primeira Luz** aos **Portões do Outono**, explore o **Pátio dos Esquecidos** e alcance o **Refúgio do Peregrino**. Ao sul, a **Coroa de Cinzas** abriga **Aster, o Guardião das Cinzas**. A trilha oeste leva à **Vigília Lunar** e à **Fonte da Lua**. O mapa acompanha o aventureiro e mostra caminhos e destinos. Os círculos âmbar anunciam golpes inimigos; esquive durante a preparação e ataque durante a recuperação. O guardião acelera a preparação abaixo de metade da vida.

Descansar restaura vida, vigor e frascos e faz os inimigos retornarem. Evoluir aumenta vida e dano. Morrer deixa as brasas no local da queda e permite renascer no santuário; alcançar o brilho recupera a moeda. Uma segunda morte substitui a queda anterior. Vínculo, brasas, santuário, queda e vitória do chefe são salvos em **localStorage** na chave **clareira-embers-v1**, separada dos enigmas anteriores. Inimigos comuns reaparecem ao recarregar. Caso o armazenamento esteja bloqueado, um aviso informa que o progresso vale somente na sessão.

A jornada possui colisão com troncos, pilares, margens, limites do mundo e encostas íngremes. Objetos pequenos decorativos não são obstáculos. Ao entrar em cavernas, a exploração usa a câmera subterrânea existente; o combate fica suspenso e retorna na superfície. O seletor de destinos continua disponível para exploração livre entre lugares existentes. Esta é uma experiência local de um jogador, sem inventário de equipamentos, multiplayer ou campanha extensa.

## Validação desta versão

**npm test** cobre 48 testes, incluindo gasto e recuperação de vigor, alcance e direção de ataques, preparação inimiga, invulnerabilidade, cura, morte e recuperação, santuários, evolução, persistência do chefe, pausa, colisão e continuidade das rotas. **npm run check** verifica imports, arquivos e elementos da interface. A sintaxe dos módulos também foi conferida.

A validação local em Chrome via **scripts/preview-smoke.mjs** abre o mundo, inicia a jornada, testa ataque, pausa, movimento até o primeiro encontro e fixação de alvo e verifica a interface a 1440 × 900 e 390 × 844. Capturas e relatório ficam em **test-results/**, ignorado no Git. O script requer uma instância isolada de Chrome na porta de depuração 9337 e o servidor local na porta 5173. O teste visual não substitui uma sessão prolongada para avaliar dificuldade e desempenho em celulares reais.

Novos módulos: **realm-layout.js** define destinos e rotas; **realm.js** constrói ruínas, santuários e horizonte; **combat-model.js** implementa regras independentes do renderizador; **journey.js** conecta personagem, câmera, colisão, HUD, áudio e persistência. Copas, pedras e flores repetidas usam geometria facetada mais leve.

---

## Documentação da exploração original

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
- Pausar congela as ondas, veados, goblins, borboletas, nuvens, moinho, partículas e o ciclo de dia/noite; a câmera continua livre. Um novo toque na água retoma o tempo. Acalmar remove todas as fontes.
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

`npm test` executa 31 testes: geometria recursiva, limites da margem ampliada, causalidade, superposição/cancelamento, preservação dos parâmetros, descarte de fontes, relevo, limites de exploração, classificação dos gestos, áreas do lago, da terra total, da terra explorável e da clareira aberta, além do comportamento dos veados, pátios nivelados e periodicidade do ciclo de dia/noite. Checagens de sintaxe também realizadas. A compilação dos shaders e a aparência/performance ainda precisam de validação em navegador; o navegador automatizado foi bloqueado pelas permissões do ambiente nesta sessão. Não há publicação concluída. O identificador reservado do Sites foi preservado em `.openai/hosting.json`.

Checklist manual: percorrer colinas em todas as direções; retornar ao lago; ampliar a janela mantendo a câmera; arrastar sobre a água sem criar fontes; testar toque com um/dois dedos; clicar em água escondida por árvores; sobrepor ondas; pausar ondas durante deslocamento; exportar PNG; conferir ausência de erros WebGL. Sombras centrais são atualizadas periodicamente conforme o sol; a floresta distante usa iluminação ambiente. Desempenho em aparelhos modestos ainda não medido.

Referência da navegação: https://threejs.org/docs/pages/OrbitControls.html



## Git e validação local

O repositório Git fica nesta pasta, com remoto destinado a https://github.com/Ambrosios13/A-Clareira.git. Consulte COMMIT.md para revisar o stage e criar o commit. Nenhum push foi realizado. Metadados locais do Sites, caches, logs e arquivos de ambiente são ignorados.

Execute npm test e npm run check. A verificação check valida imports locais, arquivos estáticos e elementos da interface usados pelo JavaScript. O workflow .github/workflows/checks.yml executa essas verificações em pushes e pull requests; não publica o site automaticamente.

## Cavernas e aldeias interativas

Quatro cavernas de goblins (Gruta dos Ecos Verdes, Caverna da Pedra Violeta, Gruta das Samambaias e Caverna da Ametista Antiga) e duas aldeias xamânicas fictícias (Aurora e Luar) têm destinos no seletor de viagem e marcadores no mapa. Use o seletor para chegar perto, clique nos objetos ou pressione E para a interação mais próxima. Entrar na caverna posiciona a câmera num túnel que leva ao salão interno de uma montanha rochosa. WASD e arraste continuam disponíveis; o deslocamento fica mais lento dentro da caverna, com limites que acompanham o piso, a largura variável e o teto. Esc ou Sair retorna à entrada; H retorna ao lago. Do lado de fora, a câmera permanece acima da superfície da montanha.

Cada caverna abriga oito goblins com nomes e variações de pele e roupa (32 no total). Eles percorrem o salão, as descidas, as minas e os dois ramais laterais, fazem pausas para admirar minérios brilhantes, desviam dos cristais, do relicário, da fogueira e uns dos outros, aproximam-se em duplas, param para conversar e retomam seus trajetos. Cabeças, orelhas, olhos, cintos e membros usam geometria arredondada; pernas e braços acompanham a caminhada. As conversas alternam gestos e balões com frases curtas escritas no código. Ao conversar com um goblin, ele interrompe o encontro, acena e fornece a dica do enigma. São comportamentos programáticos, sem geração de diálogo por IA. Pausar congela a simulação; a preferência por movimento reduzido também mantém os goblins parados.

Converse com os goblins para receber a sequência dos cristais. Verde → violeta → azul abre o relicário e revela um cristal luminoso. Uma sequência incorreta reinicia esse enigma. Nas aldeias, fogueira, tambor e totem geram efeitos distintos: intensidade da chama, anéis de luz e rotação dos símbolos geométricos. É necessário interagir com os três objetos diferentes para harmonizar cada aldeia. As construções, personagens e símbolos são fantasia original, sem representação de uma tradição real específica.

Descobertas e rituais são guardados em localStorage (`clareira-adventures-v1`) neste navegador. Recarregar preserva locais concluídos; sequências incompletas de cristais recomeçam. Caso o armazenamento esteja indisponível, a experiência funciona durante a sessão. No modo de contemplação não há combate. A jornada acima acrescenta combate na superfície; não há inventário de equipamentos ou contas online.

Cada montanha tem cerca de 86 metros de diâmetro, uma câmara superior de 51 metros de extensão e um salão de até 25 metros de largura. A superfície externa possui aproximadamente 98 mil triângulos, a abóbada 65.536 e o piso 36.864. Outras 112 formações minerais e 46 rochas por caverna acrescentam detalhe. Cores por vértice formam camadas minerais, com musgo na base, iluminação quente junto à fogueira e tons frios nos cristais. A montanha externa e a abóbada interna são malhas separadas, com abertura frontal; não há operação de CSG nem escavação dinâmica. O terreno fica nivelado sob esse conjunto. A partir de 150 metros, a montanha usa uma malha simplificada; o interior e os personagens deixam de ser desenhados à distância.

`dist/cave-model.js` compartilha a geometria e os limites de navegação; `caves.js` constrói montanha, abóbada, piso e minerais; `goblin-model.js` simula deslocamento e encontros; `goblins.js` cria os personagens, articulações e balões. `dist/places.js` define os destinos; `adventure-model.js` trata regras e progresso; `adventures.js` constrói cenas, personagens e alvos interativos. Os testes de aventuras cobrem destinos, cristais, rituais e restauração. Os testes de cavernas verificam índices das malhas, abertura, redução de detalhe, limites da câmera, terreno nivelado, trajetos e conversas em três sementes durante dois minutos simulados, pausa e interrupção de encontros. Ainda é necessário verificar visualmente a navegação interna, o clique nos objetos e a legibilidade das interfaces no navegador.

## Minas e profundezas

As duas novas cavernas reutilizam a construção procedural das anteriores. As quatro têm uma descida contínua atrás do salão dos goblins: corredores estreitos e sinuosos, duas galerias laterais, trilhos quebrados, escoras de madeira, vagonetas e um caderno abandonado. A zona pública chega a cerca de 29 metros abaixo do piso da entrada. Não há teletransporte entre o salão, as minas e as profundezas. Esc/Sair continua sendo um atalho de retorno à entrada; H retorna ao lago.

Os goblins visitam todos os setores públicos em rotas que seguem as curvas dos túneis. Encontram-se para conversar e se distraem com o brilho dos minerais. A magia branca milenar faz com que a passagem secreta pareça uma parede para eles: seu limite de circulação permanece ativo mesmo depois que o jogador revela a entrada. Não procuram nem acompanham o jogador até o clã.

Existe **uma única entrada** para a senda dos anões em todo o mundo. Ela não aparece no seletor de viagem. Ao explorar o fundo das minas, observe a pedra sem eco: aproxime-se e use E ou clique para examiná-la. O selo branco revela o caminho, que continua descendo por um corredor estreito até o Clã da Pedra Milenar, cerca de 65 metros abaixo da entrada. O salão contém moradias de pedra, oito anões com barbas e ferramentas, trabalhadores que golpeiam com picaretas, carregadores, forja e sino interativos. Converse com eles para conhecer o encantamento. Os movimentos e falas são programados.

O minimapa passa a mostrar o traçado subterrâneo e a profundidade; a senda só aparece após ser revelada. A câmera acompanha a inclinação do piso, estreita sua órbita nos túneis e respeita o selo fechado. A iluminação subterrânea usa lanternas e névoa escura, sem a luz direta do sol. Somente a rede da caverna atual é desenhada, com três luzes locais acompanhando as lanternas próximas. Personagens, forja, sino e efeitos pausam junto com a simulação. A câmera não tem colisão física com todo objeto decorativo; os limites principais são piso, paredes, teto e selo.

A descoberta da passagem, o encontro com o clã, a forja e o sino são salvos junto com o progresso anterior. Os seis lugares da superfície mantêm seu contador separado. Saves antigos continuam válidos. `underground-model.js` define o traçado, os limites, a entrada única e as rotas públicas; `underground.js` constrói minas e salão; `dwarves.js` cria os mineradores. Os testes verificam a continuidade da abóbada, índices das malhas, limites da câmera, exclusividade da entrada, migração de saves e visitas dos goblins a todos os setores em quinze minutos simulados para três sementes, sem cruzar o selo.

Verificação manual pendente: caminhar do salão às duas galerias laterais; observar os goblins nos diferentes níveis; revelar a passagem, descer e voltar pelo mesmo caminho; testar a forja e o sino; recarregar para conferir o progresso; verificar a iluminação, o enquadramento nas curvas e o desempenho real. A aparência e o WebGL ainda não foram validados em navegador nesta etapa.


A entrada das quatro descidas agora tem recorte real na malha do terreno, incluindo raycast. Uma câmara única de cinzas, numa galeria selada, abriga Vhar: duas marcas liberam a fissura. Esse progresso é independente dos anões. A navegação recebeu um pássaro animado e aceleração amortecida; R/F ajustam a altura externa, WASD desloca e arrastar orienta. Primitivas curvas receberam mais segmentos. São 37 testes aprovados; aparência, controle e custo gráfico precisam de validação no navegador.
