# 🇩🇿 Sawti AI (صوتي) — Chatbot Vocal Algérien Intelligent

> **Application développée par : BENABOUD ROQIA**  
> *Étudiante / Chercheuse à l'Université d'Oum El Bouaghi (Algérie)*  
> *Contact : benaboud.roqia@univ-oeb.dz*

---

## 📌 Présentation du Projet

**Sawti AI (صوتي)** est le premier assistant vocal intelligent 100% conçu pour comprendre et parler la **Darija algérienne** (الدارجة الجزائرية) avec ses nuances régionales, son vocabulaire culturel et ses expressions typiques (*حنا في حنا، يعطيك الصحة، على بالي، واش يا خو، راك غاية، بريدي موب، شخشوخة، ليكيب ناسيونال*).

L'application intègre un **Avatar 3D interactif en temps réel**, la **reconnaissance vocale (STT)**, la **compréhension du langage naturel (NLP)** et la **synthèse vocale (TTS)** avec une persistance complète des sessions dans le navigateur.

---

## 🚀 Fonctionnalités Clés

### 🎙️ 1. Reconnaissance Vocale (Speech-to-Text)
- **Modèle IA :** `gemini-3.5-transcribe`
- Enregistrement direct au micro avec visualiseur d'ondes sonores en direct via l'API Web Audio (`AnalyserNode`).
- Prise en charge de l'import de notes vocales (WhatsApp, fichiers audio `.wav`, `.mp3`, `.m4a`, `.webm`).
- Transcription fidèle de la parole en **écriture arabe** et en **Arabizi phonétique** (chiffres 3 = ع, 7 = ح, 9 = ق, 5 = خ).

### 🧠 2. Compréhension du Langage & Culture Algérienne (NLP)
- **Modèle IA :** `gemini-3.8-flash`
- Maîtrise des dialectes régionaux algériens :
  - **Général** (Pan-algérien)
  - **Algérois** (العاصمي - القصبة، باب الواد)
  - **Oranais** (الوهراني - الغرب الجزائري)
  - **Constantinois** (القسنطيني - الشرق الجزائري)
  - **Saharien** (الصحراوي - الجنوب الكبير)
- **Recherche en Direct (Google Search Grounding) :** Permet à Sawti de fournir des réponses en temps réel sur le cours des devises au Square Port-Saïd, les démarches administratives (BaridiMob, CCP, Chifa), la météo et les matchs des Verts / Ligue 1 Mobilis.

### 🔊 3. Synthèse Vocale Haute Fidélité (Text-to-Speech)
- **Modèle IA :** `gemini-3.8-flash-tts`
- Génération audio naturelle au format WAV non compressé (24 kHz).
- Choix parmi 4 voix expressives :
  - **Amina (أمينة)** : Voix féminine chaleureuse et posée
  - **Walid (وليد)** : Voix masculine dynamique et moderne
  - **Karim (كريم)** : Voix masculine radiophonique profonde
  - **Leila (ليلى)** : Voix féminine douce et apaisante
- Contrôle de la vitesse de lecture (0.8x à 1.4x), mode audio automatique et téléchargement direct des fichiers `.wav`.

### 🤖 4. Avatar 3D Interactif (Three.js)
- Rendu 3D procédural en temps réel avec éclairage PBR studio.
- Casque aux couleurs nationales vert émeraude (`#047857`), couronne en titane blanc et transceivers audio dorés.
- **États émotionnels animés :**
  - **Écoute (`listening`) :** Visière rouge rubis & vert pulsante avec inclinaison attentive de la tête lors de l'enregistrement au micro.
  - **Réflexion (`thinking`) :** Anneau orbital rotatif bleu ciel pendant le traitement.
  - **Parole (`speaking`) :** Égaliseur d'ondes sonores animé sur la bouche et hochements de tête synchronisés avec la voix.
  - **Repos (`idle`) :** Respiration naturelle, clignements des yeux et suivi continu du curseur de la souris.
  - **Interactivité :** Cliquez sur l'avatar pour écouter sa salutation vocale instantanée en Darija.

### 💾 5. Persistance des Conversations (`localStorage`)
- Sauvegarde locale automatique de l'ensemble des discussions.
- Tiroir latéral de navigation des sessions avec :
  - Titres générés automatiquement selon la question posée.
  - Horodatage relatif (*الآن، البارحة، منذ يومين*).
  - Renommage en ligne des conversations et suppression sécurisée.
  - Moteur de recherche interne par mot-clé.
  - Exportation complète de l'historique au format JSON.

### 📖 6. Dictionnaire Culturel d'Expressions
- Guide intégré des proverbes et expressions populaires algériennes (*حنا في حنا، يعطيك الصحة، على بالي، راك غاية؟، واش يا خو، ماشي مشكل، ربي يحفظك، زَعْمَة*).
- Écoute de la prononciation correcte par synthèse vocale d'un simple clic.

---

## 🛠️ Pile Technologique

| Domaine | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| **3D Graphics** | Three.js (WebGL, PBR MeshStandardMaterial, CanvasTexture) |
| **Backend** | Node.js, Express, tsx (middleware Vite en dev) |
| **Intelligence Artificielle** | SDK `@google/genai` (Google Gemini API) |
| **Speech-to-Text** | `gemini-3.5-transcribe` |
| **NLP & Search** | `gemini-3.8-flash` avec outil `googleSearch` |
| **Text-to-Speech** | `gemini-3.8-flash-tts` & `gemini-3.8-flash-lite-tts` |
| **Typographie** | Polices Google Fonts *Cairo* (arabe) et *Plus Jakarta Sans* |

---

## 💻 Démarrage Rapide

### Prérequis
- Node.js (version 20 ou supérieure recommandée)
- Une clé API Google Gemini (`GEMINI_API_KEY`)

### Installation

1. Clonez ou ouvrez le projet dans votre environnement :
```bash
git clone <url-du-depot>
cd sawti-ai
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez votre clé API dans le fichier `.env` :
```env
GEMINI_API_KEY="VOTRE_CLE_API_GEMINI"
```

4. Lancez le serveur de développement full-stack :
```bash
npm run dev
```

L'application est accessible à l'adresse : **`http://localhost:3000`**

### Construction pour la production
```bash
npm run build
npm start
```

---

## 👤 Auteure & Crédits

- **Développeuse principale :** **BENABOUD ROQIA**
- **Institution :** Université d'Oum El Bouaghi (Algérie) 🇩🇿
- **Projet :** Sawti AI — Assistant conversationnel vocal algérien
- **Licence :** Apache-2.0
