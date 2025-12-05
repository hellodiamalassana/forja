const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/config');

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: config.anthropicApiKey,
});

const SYSTEM_PROMPT = `Tu es un expert en développement d'applications desktop avec Electron.js.

Ton rôle est de générer du code Electron complet et fonctionnel basé sur les descriptions des utilisateurs.

RÈGLES IMPORTANTES:
1. Génère TOUJOURS du code complet et prêt à l'emploi
2. Utilise les meilleures pratiques Electron (IPC, preload, sécurité)
3. Structure le code en fichiers séparés: main.js, preload.js, renderer.js, index.html, package.json
4. Inclus tous les imports et dépendances nécessaires
5. Le code doit être moderne (ES6+), propre et commenté
6. Gère les erreurs correctement
7. Utilise un design responsive et moderne (Tailwind CSS ou CSS moderne)

FORMAT DE RÉPONSE:
Tu dois répondre en JSON avec cette structure exacte:
{
  "aiResponse": "Explication de ce que tu as créé en français",
  "files": {
    "package.json": "contenu du fichier",
    "main.js": "contenu du fichier",
    "preload.js": "contenu du fichier",
    "index.html": "contenu du fichier",
    "renderer.js": "contenu du fichier",
    "styles.css": "contenu du fichier (optionnel)"
  }
}

EXEMPLE D'APPLICATION:
Pour "créer une calculatrice", tu génères:
- package.json avec Electron et les dépendances
- main.js avec la fenêtre principale
- preload.js pour la sécurité IPC
- index.html avec l'interface de la calculatrice
- renderer.js avec la logique métier
- styles.css avec un design moderne

Assure-toi que le code est immédiatement exécutable avec "npm install && npm start".`;

async function generateElectronApp(userDescription, conversationHistory = []) {
  try {
    console.log('🤖 Génération avec Claude...');

    // Build messages
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `Génère une application Electron complète pour: ${userDescription}

Réponds UNIQUEMENT avec un objet JSON valide contenant "aiResponse" et "files".`
      }
    ];

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    const rawContent = response.content[0].text;
    console.log('✅ Réponse Claude reçue');

    // Parse JSON response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide de Claude');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.files || !parsed.aiResponse) {
      throw new Error('Réponse incomplète: files ou aiResponse manquant');
    }

    // Validate required Electron files
    const requiredFiles = ['package.json', 'main.js', 'index.html'];
    const missingFiles = requiredFiles.filter(f => !parsed.files[f]);

    if (missingFiles.length > 0) {
      console.warn(`⚠️  Fichiers manquants: ${missingFiles.join(', ')}`);
    }

    return {
      aiResponse: parsed.aiResponse,
      code: parsed,
      files: parsed.files,
      tokensUsed: response.usage
    };

  } catch (error) {
    console.error('❌ Erreur Claude Service:', error);

    if (error.status === 401) {
      throw new Error('Clé API Claude invalide ou manquante');
    }

    if (error.status === 429) {
      throw new Error('Limite de requêtes API atteinte. Réessayez dans quelques instants.');
    }

    throw new Error(`Erreur de génération: ${error.message}`);
  }
}

async function modifyElectronApp(modification, currentCode, conversationHistory = []) {
  try {
    console.log('🔄 Modification avec Claude...');

    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `Modifie l'application Electron existante selon cette demande: ${modification}

CODE ACTUEL:
${JSON.stringify(currentCode.files, null, 2)}

Réponds UNIQUEMENT avec un objet JSON valide contenant "aiResponse" et "files" avec TOUS les fichiers (modifiés et non modifiés).`
      }
    ];

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    const rawContent = response.content[0].text;
    console.log('✅ Modification reçue');

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format de réponse invalide');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      aiResponse: parsed.aiResponse,
      code: parsed,
      files: parsed.files,
      tokensUsed: response.usage
    };

  } catch (error) {
    console.error('❌ Erreur modification:', error);
    throw new Error(`Erreur de modification: ${error.message}`);
  }
}

// Test connection to Claude API
async function testConnection() {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Réponds avec "OK"' }]
    });

    return response.content[0].text.includes('OK');
  } catch (error) {
    console.error('❌ Test connexion échoué:', error.message);
    return false;
  }
}

module.exports = {
  generateElectronApp,
  modifyElectronApp,
  testConnection
};
