/* ==========================================================================
   Kepler — i18n.js
   Language picker. English lives in the HTML itself; other languages replace
   any element marked with data-i18n. The choice is remembered per browser.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "kepler-lang";

  // Strings that are built at runtime and so have no English copy in the HTML.
  const en = {
    "hero.downloadFor": "Download for {os}",
    "hero.yourSystem":  "your system",
    "common.copied":    "Copied",
    "common.copiedToast": "Copied to clipboard"
  };

  const dict = {
    es: {
      "nav.overview": "Resumen",
      "nav.security": "Seguridad",
      "nav.developers": "Desarrolladores",
      "nav.docs": "Documentación",
      "nav.download": "Descargar",
      "nav.donate": "Donar",
      "shots.main": "Kepler con el panel de IA integrado: Claude, ChatGPT, Gemini, Copilot y Perplexity a un clic.",
      "shots.side": "Navegación segura: privada, solo HTTPS, todos los rastreadores bloqueados, nada guardado.",

      "hero.eyebrow": "Código abierto · Auditado · v0.9 beta",
      "hero.title": "Navega a oscuras.<br /><span class=\"thin\">Entrega limpio.</span>",
      "hero.lede": "Kepler es un navegador para quienes leen el código fuente. Cada pestaña se ejecuta en su propio proceso sellado, cada petición rinde cuentas y todo es una compilación reproducible que puedes recompilar tú mismo en unos once minutos.",
      "hero.download": "Descargar Kepler",
      "hero.downloadFor": "Descargar para {os}",
      "hero.yourSystem": "tu sistema",
      "hero.meta2": "Sin telemetría, nunca",

      "stat1": "Puntos de telemetría",
      "stat2": "Minutos de compilación limpia",
      "stat3": "Motor escrito en Rust",
      "stat4": "Auditorías independientes",

      "anon.eyebrow": "Anónimo por defecto",
      "anon.title": "Sin rostro. Sin nombre. Sin rastro.",
      "anon.lede": "Como una máscara entre la multitud, Kepler te hace indistinguible. La huella aplanada, las pestañas selladas y los relés en órbita opcionales hacen que los sitios que visitas vean a un usuario de Kepler, nunca a ti.",
      "anon.li1": "Todos los usuarios de Kepler presentan la misma huella: canvas, fuentes, zona horaria y pantalla.",
      "anon.li2": "Las cookies y el almacenamiento mueren con la pestaña, salvo que digas lo contrario.",
      "anon.li3": "Los relés en órbita ocultan tu dirección IP tras tres saltos voluntarios.",
      "anon.li4": "Sin cuenta, sin inicio de sesión, sin servidor de sincronización que sepa quién eres.",

      "launch.eyebrow": "Hecho para despegar",
      "launch.title": "Diseñado como un vehículo de lanzamiento.",
      "launch.lede": "Los cohetes no tienen una segunda oportunidad, así que cada etapa se prueba antes de volar. Kepler se construye igual: un motor en Rust que arranca en frío en menos de un segundo y un proceso de publicación donde nada sale sin verificarse.",
      "launch.li1": "Arranque en frío en menos de un segundo, incluso con un perfil reforzado.",
      "launch.li2": "Rust con seguridad de memoria en los analizadores, la pila de red y el intermediario del sandbox.",
      "launch.li3": "Cada analizador se somete a fuzzing continuo antes de que una versión deje la plataforma.",
      "launch.li4": "Compilaciones firmadas y reproducibles: mismo commit, mismos bytes, en cada lanzamiento.",

      "verify.eyebrow": "Confía, luego verifica",
      "verify.title": "No te fíes de nuestra palabra.",
      "verify.lede": "Cada versión incluye una firma separada y una atestación de compilación. Tres comandos y sabrás que el binario en tu disco es el del registro público.",
      "common.copy": "Copiar",
      "common.copied": "Copiado",
      "common.copiedToast": "Copiado al portapapeles",

      "faq.eyebrow": "Preguntas",
      "faq.title": "Las respuestas cortas.",
      "faq.q1": "¿Kepler es un fork de otro navegador?",
      "faq.a1": "La capa de renderizado partió de un motor de código abierto existente; la pila de red, el intermediario del sandbox, el particionador de almacenamiento y el entorno de extensiones son nuevos y están escritos en Rust. La divergencia está documentada commit a commit en la documentación.",
      "faq.q2": "¿Kepler recopila algo?",
      "faq.a2": "No. No hay SDK de analítica, ni pings de fallos, ni opción de «uso anónimo» activada por defecto. Los informes de fallos existen, pero son archivos en tu disco que tú decides adjuntar a una incidencia.",
      "faq.q3": "¿Funcionarán mis extensiones?",
      "faq.a3": "Las extensiones que usan la API estándar de WebExtensions suelen funcionar. Todo lo que pida permisos amplios de host debe declararlos en un manifiesto de capacidades que apruebas permiso por permiso, no todos a la vez.",
      "faq.q4": "¿Qué me aporta realmente lo «reproducible»?",
      "faq.a4": "Significa que un servidor de compilación comprometido no puede darte un binario distinto al de los demás sin que se note de inmediato. Cualquiera puede recompilar la versión y comparar los hashes.",
      "faq.q5": "¿Es seguro usar la beta a diario?",
      "faq.a5": "Es lo bastante estable como para que el equipo la use a diario, pero la API de extensiones y el formato de perfil aún pueden cambiar antes de la 1.0. Fija una versión si la automatizas.",

      "cta.eyebrow": "Listo cuando tú lo estés",
      "cta.title": "Apunta a la oscuridad y despega.",
      "cta.lede": "Gratis, de código abierto y silencioso por defecto.",
      "cta.get": "Obtener Kepler",
      "cta.docs": "Leer la documentación",

      "footer.tagline": "Un proyecto de navegador independiente. Hecho en abierto, financiado por personas, no por anuncios.",
      "footer.product": "Producto",
      "footer.project": "Proyecto",
      "footer.community": "Comunidad",
      "footer.download": "Descargar",
      "footer.security": "Seguridad",
      "footer.developers": "Desarrolladores",
      "footer.changelog": "Cambios",
      "footer.documentation": "Documentación",
      "footer.build": "Compilar desde el código",
      "footer.protocol": "Protocolo",
      "footer.disclosure": "Divulgación",
      "footer.source": "Repositorio de código",
      "footer.issues": "Gestor de incidencias",
      "footer.matrix": "Canal de Matrix",
      "footer.mailing": "Lista de correo",
      "footer.bottom": "KEPLER · MPL-2.0 · SIN RASTREADORES EN ESTA PÁGINA"
    },

    fr: {
      "nav.overview": "Aperçu",
      "nav.security": "Sécurité",
      "nav.developers": "Développeurs",
      "nav.docs": "Docs",
      "nav.download": "Télécharger",
      "nav.donate": "Faire un don",
      "shots.main": "Kepler avec le panneau d'IA intégré : Claude, ChatGPT, Gemini, Copilot et Perplexity à portée de clic.",
      "shots.side": "Navigation sécurisée : privée, HTTPS uniquement, tous les traqueurs bloqués, rien enregistré.",

      "hero.eyebrow": "Open source · Audité · v0.9 bêta",
      "hero.title": "Naviguez dans l'ombre.<br /><span class=\"thin\">Livrez propre.</span>",
      "hero.lede": "Kepler est un navigateur pour celles et ceux qui lisent le code source. Chaque onglet tourne dans son propre processus scellé, chaque requête est traçable, et l'ensemble est une compilation reproductible que vous pouvez refaire vous-même en onze minutes environ.",
      "hero.download": "Télécharger Kepler",
      "hero.downloadFor": "Télécharger pour {os}",
      "hero.yourSystem": "votre système",
      "hero.meta2": "Aucune télémétrie, jamais",

      "stat1": "Points de télémétrie",
      "stat2": "Minutes pour une compilation propre",
      "stat3": "Du moteur écrit en Rust",
      "stat4": "Audits indépendants",

      "anon.eyebrow": "Anonyme par défaut",
      "anon.title": "Pas de visage. Pas de nom. Pas de trace.",
      "anon.lede": "Comme un masque dans la foule, Kepler vous rend impossible à distinguer. L'empreinte aplatie, les onglets scellés et les relais en orbite optionnels font que les sites visités voient un utilisateur de Kepler, jamais vous.",
      "anon.li1": "Chaque utilisateur de Kepler présente la même empreinte : canvas, polices, fuseau horaire et écran.",
      "anon.li2": "Les cookies et le stockage meurent avec l'onglet, sauf si vous en décidez autrement.",
      "anon.li3": "Les relais en orbite masquent votre adresse IP derrière trois sauts bénévoles.",
      "anon.li4": "Pas de compte, pas de connexion, pas de serveur de synchronisation qui sait qui vous êtes.",

      "launch.eyebrow": "Conçu pour décoller",
      "launch.title": "Construit comme un lanceur spatial.",
      "launch.lede": "Une fusée n'a pas de seconde chance : chaque étage est testé avant de voler. Kepler est construit de la même façon : un moteur en Rust qui démarre à froid en moins d'une seconde, et une chaîne de publication où rien ne part sans vérification.",
      "launch.li1": "Démarrage à froid en moins d'une seconde, même avec un profil renforcé.",
      "launch.li2": "Du Rust sûr en mémoire dans les analyseurs, la pile réseau et le courtier du bac à sable.",
      "launch.li3": "Chaque analyseur est soumis à du fuzzing continu avant qu'une version ne quitte le pas de tir.",
      "launch.li4": "Compilations signées et reproductibles : même commit, mêmes octets, à chaque lancement.",

      "verify.eyebrow": "Faire confiance, puis vérifier",
      "verify.title": "Ne nous croyez pas sur parole.",
      "verify.lede": "Chaque version est livrée avec une signature détachée et une attestation de compilation. Trois commandes et vous savez que le binaire sur votre disque est celui du registre public.",
      "common.copy": "Copier",
      "common.copied": "Copié",
      "common.copiedToast": "Copié dans le presse-papiers",

      "faq.eyebrow": "Questions",
      "faq.title": "Les réponses courtes.",
      "faq.q1": "Kepler est-il un fork d'un navigateur existant ?",
      "faq.a1": "La couche de rendu est partie d'un moteur open source existant ; la pile réseau, le courtier du bac à sable, le partitionneur de stockage et l'environnement d'extensions sont nouveaux et écrits en Rust. La divergence est documentée commit par commit.",
      "faq.q2": "Kepler collecte-t-il quoi que ce soit ?",
      "faq.a2": "Non. Aucun SDK d'analyse, aucun ping de plantage, aucune option « usage anonyme » activée par défaut. Les rapports de plantage existent, mais ce sont des fichiers sur votre disque que vous choisissez de joindre à un ticket.",
      "faq.q3": "Mes extensions fonctionneront-elles ?",
      "faq.a3": "Les extensions utilisant l'API WebExtensions standard fonctionnent en général. Toute demande de permissions d'hôte étendues doit être déclarée dans un manifeste de capacités que vous approuvez permission par permission.",
      "faq.q4": "Qu'est-ce que « reproductible » m'apporte vraiment ?",
      "faq.a4": "Un serveur de compilation compromis ne peut pas vous livrer un binaire différent de celui des autres sans que cela se voie immédiatement. N'importe qui peut recompiler la version et comparer les empreintes.",
      "faq.q5": "La bêta est-elle sûre au quotidien ?",
      "faq.a5": "Elle est assez stable pour que l'équipe l'utilise tous les jours, mais l'API d'extensions et le format de profil peuvent encore changer avant la 1.0. Figez une version si vous l'automatisez.",

      "cta.eyebrow": "Prêt quand vous l'êtes",
      "cta.title": "Visez l'obscurité et partez.",
      "cta.lede": "Gratuit, open source et silencieux par défaut.",
      "cta.get": "Obtenir Kepler",
      "cta.docs": "Lire la documentation",

      "footer.tagline": "Un projet de navigateur indépendant. Construit en public, financé par des personnes, pas par la publicité.",
      "footer.product": "Produit",
      "footer.project": "Projet",
      "footer.community": "Communauté",
      "footer.download": "Télécharger",
      "footer.security": "Sécurité",
      "footer.developers": "Développeurs",
      "footer.changelog": "Journal des modifications",
      "footer.documentation": "Documentation",
      "footer.build": "Compiler depuis les sources",
      "footer.protocol": "Protocole",
      "footer.disclosure": "Divulgation",
      "footer.source": "Dépôt de code",
      "footer.issues": "Suivi des tickets",
      "footer.matrix": "Salon Matrix",
      "footer.mailing": "Liste de diffusion",
      "footer.bottom": "KEPLER · MPL-2.0 · AUCUN TRAQUEUR SUR CETTE PAGE"
    },

    de: {
      "nav.overview": "Überblick",
      "nav.security": "Sicherheit",
      "nav.developers": "Entwickler",
      "nav.docs": "Doku",
      "nav.download": "Download",
      "nav.donate": "Spenden",
      "shots.main": "Kepler mit dem integrierten KI-Panel – Claude, ChatGPT, Gemini, Copilot und Perplexity nur einen Klick entfernt.",
      "shots.side": "Sicheres Surfen: privat, nur HTTPS, jeder Tracker blockiert, nichts gespeichert.",

      "hero.eyebrow": "Open Source · Geprüft · v0.9 Beta",
      "hero.title": "Dunkel surfen.<br /><span class=\"thin\">Sauber liefern.</span>",
      "hero.lede": "Kepler ist ein Browser für Menschen, die den Quellcode lesen. Jeder Tab läuft in einem eigenen versiegelten Prozess, jede Anfrage ist nachvollziehbar, und das Ganze ist ein reproduzierbarer Build, den du in etwa elf Minuten selbst neu bauen kannst.",
      "hero.download": "Kepler herunterladen",
      "hero.downloadFor": "Für {os} herunterladen",
      "hero.yourSystem": "dein System",
      "hero.meta2": "Keine Telemetrie, niemals",

      "stat1": "Telemetrie-Endpunkte",
      "stat2": "Minuten für einen sauberen Build",
      "stat3": "Der Engine in Rust",
      "stat4": "Unabhängige Audits",

      "anon.eyebrow": "Standardmäßig anonym",
      "anon.title": "Kein Gesicht. Kein Name. Keine Spur.",
      "anon.lede": "Wie eine Maske in der Menge macht Kepler dich ununterscheidbar. Geglätteter Fingerabdruck, versiegelte Tabs und optionale Orbit-Relays sorgen dafür, dass besuchte Seiten einen Kepler-Nutzer sehen – niemals dich.",
      "anon.li1": "Alle Kepler-Nutzer zeigen denselben Fingerabdruck – Canvas, Schriften, Zeitzone und Bildschirm.",
      "anon.li2": "Cookies und Speicher sterben mit dem Tab, sofern du nichts anderes sagst.",
      "anon.li3": "Orbit-Relays verbergen deine IP-Adresse hinter drei freiwilligen Hops.",
      "anon.li4": "Kein Konto, keine Anmeldung, kein Sync-Server, der weiß, wer du bist.",

      "launch.eyebrow": "Gebaut zum Abheben",
      "launch.title": "Konstruiert wie eine Trägerrakete.",
      "launch.lede": "Raketen haben keinen zweiten Versuch, also wird jede Stufe vor dem Flug getestet. Kepler wird genauso gebaut: eine Rust-Engine, die in unter einer Sekunde kalt startet, und eine Release-Pipeline, in der nichts ohne Prüfung ausgeliefert wird.",
      "launch.li1": "Kaltstart in unter einer Sekunde, selbst mit einem gehärteten Profil.",
      "launch.li2": "Speichersicheres Rust in Parsern, Netzwerk-Stack und Sandbox-Broker.",
      "launch.li3": "Jeder Parser wird kontinuierlich gefuzzt, bevor ein Release die Startrampe verlässt.",
      "launch.li4": "Signierte, reproduzierbare Builds – gleicher Commit, gleiche Bytes, bei jedem Start.",

      "verify.eyebrow": "Vertrauen, dann prüfen",
      "verify.title": "Verlass dich nicht auf unser Wort.",
      "verify.lede": "Jedes Release kommt mit einer separaten Signatur und einer Build-Attestierung. Drei Befehle, und du weißt, dass die Binärdatei auf deiner Platte die aus dem öffentlichen Log ist.",
      "common.copy": "Kopieren",
      "common.copied": "Kopiert",
      "common.copiedToast": "In die Zwischenablage kopiert",

      "faq.eyebrow": "Fragen",
      "faq.title": "Die kurzen Antworten.",
      "faq.q1": "Ist Kepler ein Fork eines bestehenden Browsers?",
      "faq.a1": "Die Rendering-Schicht basiert ursprünglich auf einer bestehenden Open-Source-Engine; Netzwerk-Stack, Sandbox-Broker, Speicherpartitionierung und Erweiterungs-Laufzeit sind neu und in Rust geschrieben. Die Abweichungen sind Commit für Commit dokumentiert.",
      "faq.q2": "Sammelt Kepler überhaupt etwas?",
      "faq.a2": "Nein. Kein Analytics-SDK, keine Absturz-Pings, kein standardmäßig aktivierter „anonyme Nutzung“-Schalter. Absturzberichte gibt es, aber als Dateien auf deiner Platte, die du selbst an ein Issue anhängst.",
      "faq.q3": "Funktionieren meine Erweiterungen?",
      "faq.a3": "Erweiterungen, die die Standard-WebExtensions-API nutzen, funktionieren in der Regel. Wer breite Host-Berechtigungen will, muss sie in einem Fähigkeiten-Manifest deklarieren, das du Berechtigung für Berechtigung freigibst.",
      "faq.q4": "Was bringt mir „reproduzierbar“ wirklich?",
      "faq.a4": "Ein kompromittierter Build-Server kann dir keine andere Binärdatei unterschieben als allen anderen, ohne dass es sofort auffällt. Jeder kann das Release neu bauen und die Hashes vergleichen.",
      "faq.q5": "Taugt die Beta für den Alltag?",
      "faq.a5": "Sie ist stabil genug, dass das Team sie täglich nutzt, aber Erweiterungs-API und Profilformat können sich vor 1.0 noch ändern. Pinne eine Version, wenn du dagegen skriptest.",

      "cta.eyebrow": "Bereit, wenn du es bist",
      "cta.title": "Richte ihn ins Dunkle und los.",
      "cta.lede": "Kostenlos, quelloffen und standardmäßig still.",
      "cta.get": "Kepler holen",
      "cta.docs": "Doku lesen",

      "footer.tagline": "Ein unabhängiges Browser-Projekt. Offen entwickelt, von Menschen finanziert, nicht von Werbung.",
      "footer.product": "Produkt",
      "footer.project": "Projekt",
      "footer.community": "Community",
      "footer.download": "Download",
      "footer.security": "Sicherheit",
      "footer.developers": "Entwickler",
      "footer.changelog": "Änderungsprotokoll",
      "footer.documentation": "Dokumentation",
      "footer.build": "Aus dem Quellcode bauen",
      "footer.protocol": "Protokoll",
      "footer.disclosure": "Meldung von Lücken",
      "footer.source": "Quellcode-Repository",
      "footer.issues": "Issue-Tracker",
      "footer.matrix": "Matrix-Kanal",
      "footer.mailing": "Mailingliste",
      "footer.bottom": "KEPLER · MPL-2.0 · KEINE TRACKER AUF DIESER SEITE"
    },

    pt: {
      "nav.overview": "Visão geral",
      "nav.security": "Segurança",
      "nav.developers": "Desenvolvedores",
      "nav.docs": "Docs",
      "nav.download": "Baixar",
      "nav.donate": "Doar",
      "shots.main": "Kepler com o painel de IA integrado — Claude, ChatGPT, Gemini, Copilot e Perplexity a um clique.",
      "shots.side": "Navegação segura: privada, só HTTPS, todos os rastreadores bloqueados, nada salvo.",

      "hero.eyebrow": "Código aberto · Auditado · v0.9 beta",
      "hero.title": "Navegue no escuro.<br /><span class=\"thin\">Entregue limpo.</span>",
      "hero.lede": "Kepler é um navegador para quem lê o código-fonte. Cada aba roda em seu próprio processo selado, cada requisição é rastreável, e tudo é uma compilação reproduzível que você mesmo pode recompilar em cerca de onze minutos.",
      "hero.download": "Baixar Kepler",
      "hero.downloadFor": "Baixar para {os}",
      "hero.yourSystem": "seu sistema",
      "hero.meta2": "Sem telemetria, nunca",

      "stat1": "Endpoints de telemetria",
      "stat2": "Minutos para compilação limpa",
      "stat3": "Do motor escrito em Rust",
      "stat4": "Auditorias independentes",

      "anon.eyebrow": "Anônimo por padrão",
      "anon.title": "Sem rosto. Sem nome. Sem rastro.",
      "anon.lede": "Como uma máscara na multidão, o Kepler torna você indistinguível. Impressão digital achatada, abas seladas e relés em órbita opcionais fazem com que os sites que você visita vejam um usuário do Kepler — nunca você.",
      "anon.li1": "Todo usuário do Kepler apresenta a mesma impressão digital — canvas, fontes, fuso horário e tela.",
      "anon.li2": "Cookies e armazenamento morrem com a aba, a menos que você diga o contrário.",
      "anon.li3": "Os relés em órbita escondem seu endereço IP atrás de três saltos voluntários.",
      "anon.li4": "Sem conta, sem login, sem servidor de sincronização que saiba quem você é.",

      "launch.eyebrow": "Feito para decolar",
      "launch.title": "Projetado como um veículo de lançamento.",
      "launch.lede": "Foguetes não têm segunda chance, então cada estágio é testado antes de voar. O Kepler é construído do mesmo jeito: um motor em Rust que inicia a frio em menos de um segundo e um processo de publicação em que nada sai sem verificação.",
      "launch.li1": "Início a frio em menos de um segundo, mesmo com um perfil reforçado.",
      "launch.li2": "Rust com segurança de memória nos analisadores, na pilha de rede e no intermediário do sandbox.",
      "launch.li3": "Cada analisador passa por fuzzing contínuo antes que uma versão deixe a plataforma.",
      "launch.li4": "Compilações assinadas e reproduzíveis — mesmo commit, mesmos bytes, a cada lançamento.",

      "verify.eyebrow": "Confie, depois verifique",
      "verify.title": "Não acredite só na nossa palavra.",
      "verify.lede": "Cada versão vem com uma assinatura separada e uma atestação de compilação. Três comandos e você sabe que o binário no seu disco é o do registro público.",
      "common.copy": "Copiar",
      "common.copied": "Copiado",
      "common.copiedToast": "Copiado para a área de transferência",

      "faq.eyebrow": "Perguntas",
      "faq.title": "As respostas curtas.",
      "faq.q1": "O Kepler é um fork de outro navegador?",
      "faq.a1": "A camada de renderização partiu de um motor de código aberto existente; a pilha de rede, o intermediário do sandbox, o particionador de armazenamento e o ambiente de extensões são novos e escritos em Rust. A divergência está documentada commit a commit.",
      "faq.q2": "O Kepler coleta alguma coisa?",
      "faq.a2": "Não. Não há SDK de análise, nem pings de falhas, nem opção de \"uso anônimo\" ativada por padrão. Relatórios de falha existem, mas são arquivos no seu disco que você escolhe anexar a uma issue.",
      "faq.q3": "Minhas extensões vão funcionar?",
      "faq.a3": "Extensões que usam a API padrão WebExtensions geralmente funcionam. Qualquer coisa que peça permissões amplas de host precisa declará-las em um manifesto de capacidades que você aprova permissão por permissão.",
      "faq.q4": "O que \"reproduzível\" me traz de fato?",
      "faq.a4": "Significa que um servidor de compilação comprometido não pode entregar a você um binário diferente do de todo mundo sem que isso fique visível na hora. Qualquer pessoa pode recompilar a versão e comparar os hashes.",
      "faq.q5": "A beta é segura para uso diário?",
      "faq.a5": "É estável o bastante para a equipe usá-la todos os dias, mas a API de extensões e o formato de perfil ainda podem mudar antes da 1.0. Fixe uma versão se for automatizar.",

      "cta.eyebrow": "Pronto quando você estiver",
      "cta.title": "Aponte para o escuro e vá.",
      "cta.lede": "Gratuito, de código aberto e silencioso por padrão.",
      "cta.get": "Obter Kepler",
      "cta.docs": "Ler a documentação",

      "footer.tagline": "Um projeto independente de navegador. Feito em público, financiado por pessoas, não por anúncios.",
      "footer.product": "Produto",
      "footer.project": "Projeto",
      "footer.community": "Comunidade",
      "footer.download": "Baixar",
      "footer.security": "Segurança",
      "footer.developers": "Desenvolvedores",
      "footer.changelog": "Registro de mudanças",
      "footer.documentation": "Documentação",
      "footer.build": "Compilar do código-fonte",
      "footer.protocol": "Protocolo",
      "footer.disclosure": "Divulgação",
      "footer.source": "Repositório do código",
      "footer.issues": "Rastreador de issues",
      "footer.matrix": "Canal no Matrix",
      "footer.mailing": "Lista de e-mails",
      "footer.bottom": "KEPLER · MPL-2.0 · SEM RASTREADORES NESTA PÁGINA"
    }
  };

  const supported = ["en"].concat(Object.keys(dict));
  const originals = new WeakMap();

  function readSaved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function save(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  function initialLang() {
    const saved = readSaved();
    if (saved && supported.includes(saved)) return saved;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return supported.includes(nav) ? nav : "en";
  }

  let current = "en";

  function t(key) {
    const table = dict[current];
    if (table && table[key] != null) return table[key];
    return en[key];
  }

  function apply() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      const key = el.dataset.i18n;
      let value = t(key);
      if (value == null) value = originals.get(el);
      if (el.dataset.os != null) value = value.replace("{os}", el.dataset.os || t("hero.yourSystem"));
      el.innerHTML = value;
    });
    document.documentElement.lang = current;
    const select = document.getElementById("langSelect");
    if (select) select.value = current;
  }

  function setLang(lang) {
    current = supported.includes(lang) ? lang : "en";
    save(current);
    apply();
  }

  window.Kepler = window.Kepler || {};
  window.Kepler.t = t;
  window.Kepler.i18n = { apply: apply, setLang: setLang };

  current = initialLang();
  apply();

  const select = document.getElementById("langSelect");
  if (select) select.addEventListener("change", () => setLang(select.value));
})();
