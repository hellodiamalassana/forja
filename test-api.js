/**
 * Script de test pour l'API Forja
 * Usage: node test-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Test de l\'API Forja\n');

  // Test 1: Health check
  console.log('1️⃣  Test Health Check...');
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status === 200) {
      console.log('   ✅ Serveur opérationnel');
      console.log(`   📊 ${JSON.stringify(health.data)}\n`);
    } else {
      console.log('   ❌ Échec health check\n');
    }
  } catch (e) {
    console.log(`   ❌ Serveur non disponible: ${e.message}\n`);
    console.log('   💡 Assurez-vous que le serveur tourne: npm start\n');
    return;
  }

  // Test 2: Generate app
  console.log('2️⃣  Test Génération d\'app...');
  try {
    const generate = await makeRequest('POST', '/api/generate', {
      description: 'Une simple calculatrice avec design moderne'
    });

    if (generate.status === 200) {
      console.log('   ✅ Génération réussie');
      console.log(`   🆔 Session: ${generate.data.sessionId}`);
      console.log(`   📝 Fichiers: ${Object.keys(generate.data.files || {}).join(', ')}\n`);

      // Test 3: Modify app
      console.log('3️⃣  Test Modification...');
      const modify = await makeRequest('POST', '/api/modify', {
        sessionId: generate.data.sessionId,
        modification: 'Ajouter un bouton pour réinitialiser'
      });

      if (modify.status === 200) {
        console.log('   ✅ Modification réussie\n');
      } else {
        console.log('   ❌ Échec modification\n');
      }

      // Test 4: Session info
      console.log('4️⃣  Test Info Session...');
      const session = await makeRequest('GET', `/api/session/${generate.data.sessionId}`);

      if (session.status === 200) {
        console.log('   ✅ Session trouvée');
        console.log(`   💬 Messages: ${session.data.messageCount}\n`);
      } else {
        console.log('   ❌ Session non trouvée\n');
      }

      // Test 5: Delete session
      console.log('5️⃣  Test Suppression Session...');
      const deleteSession = await makeRequest('DELETE', `/api/session/${generate.data.sessionId}`);

      if (deleteSession.status === 200) {
        console.log('   ✅ Session supprimée\n');
      } else {
        console.log('   ❌ Échec suppression\n');
      }

    } else if (generate.status === 401) {
      console.log('   ❌ Clé API Claude manquante ou invalide');
      console.log('   💡 Vérifiez votre fichier .env\n');
    } else if (generate.status === 429) {
      console.log('   ❌ Limite de requêtes API atteinte\n');
    } else {
      console.log(`   ❌ Échec: ${JSON.stringify(generate.data)}\n`);
    }
  } catch (e) {
    console.log(`   ❌ Erreur: ${e.message}\n`);
  }

  console.log('✨ Tests terminés!\n');
}

// Run tests
runTests().catch(console.error);
