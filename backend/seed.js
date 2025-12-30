/**
 * 🌱 SCRIPT DE SEED - Food Waste App
 * 
 * Ce script peuple la base de données avec des données de test
 * 
 * UTILISATION :
 * 1. Assurez-vous que MongoDB est démarré
 * 2. Placez ce fichier dans le dossier backend/
 * 3. Exécutez : node seed.js
 * 
 * ⚠️ ATTENTION : Ce script supprime toutes les données existantes !
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-waste-db';

console.log('🌱 Démarrage du seed...\n');
console.log('📡 Connexion à MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté\n');
    return seedDatabase();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });

// Import des modèles
const User = require('./src/models/User');
const Donation = require('./src/models/Donation');
const Reservation = require('./src/models/Reservation');
const Review = require('./src/models/Review');

async function seedDatabase() {
  try {
    // 1. NETTOYAGE DE LA BASE DE DONNÉES
    console.log('🗑️  Suppression des données existantes...');
    await Promise.all([
      User.deleteMany({}),
      Donation.deleteMany({}),
      Reservation.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('✅ Données supprimées\n');

    // 2. CRÉATION DES UTILISATEURS
    console.log('👥 Création des utilisateurs...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@test.com',
        password: hashedPassword,
        phone: '+226 70 12 34 56',
        role: 'donor',
        address: {
          street: 'Avenue Kwame Nkrumah',
          city: 'Ouagadougou',
          postalCode: '01 BP 1234',
          coordinates: [-1.5247, 12.3702]
        },
        rating: {
          average: 4.8,
          count: 15
        }
      },
      {
        firstName: 'Marie',
        lastName: 'Kaboré',
        email: 'marie.kabore@test.com',
        password: hashedPassword,
        phone: '+226 75 98 76 54',
        role: 'beneficiary',
        address: {
          street: 'Rue de la Liberté',
          city: 'Ouagadougou',
          postalCode: '01 BP 5678',
          coordinates: [-1.5180, 12.3686]
        },
        rating: {
          average: 4.9,
          count: 12
        }
      },
      {
        firstName: 'Paul',
        lastName: 'Ouédraogo',
        email: 'paul.ouedraogo@test.com',
        password: hashedPassword,
        phone: '+226 76 55 44 33',
        role: 'both',
        address: {
          street: 'Boulevard Charles de Gaulle',
          city: 'Ouagadougou',
          postalCode: '01 BP 9012',
          coordinates: [-1.5320, 12.3650]
        },
        rating: {
          average: 4.7,
          count: 20
        }
      },
      {
        firstName: 'Aminata',
        lastName: 'Traoré',
        email: 'aminata.traore@test.com',
        password: hashedPassword,
        phone: '+226 77 11 22 33',
        role: 'donor',
        address: {
          street: 'Avenue de la Nation',
          city: 'Ouagadougou',
          postalCode: '01 BP 3456',
          coordinates: [-1.5100, 12.3800]
        },
        rating: {
          average: 5.0,
          count: 8
        }
      },
      {
        firstName: 'Ibrahim',
        lastName: 'Sawadogo',
        email: 'ibrahim.sawadogo@test.com',
        password: hashedPassword,
        phone: '+226 78 99 88 77',
        role: 'beneficiary',
        address: {
          street: 'Rue du Commerce',
          city: 'Ouagadougou',
          postalCode: '01 BP 7890',
          coordinates: [-1.5050, 12.3750]
        },
        rating: {
          average: 4.6,
          count: 10
        }
      }
    ]);

    console.log(`✅ ${users.length} utilisateurs créés`);
    console.log('   📧 Tous les comptes ont le mot de passe : password123\n');

    // 3. CRÉATION DES DONATIONS
    console.log('🎁 Création des donations...');
    
    const donations = await Donation.insertMany([
      {
        donor: users[0]._id, // Jean Dupont
        title: 'Surplus de pain frais',
        description: 'Pain du jour non vendu, encore frais et consommable. À retirer avant 18h. Idéal pour les familles ou associations.',
        category: 'pain',
        quantity: 15,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Dans 1 jour
        pickupLocation: {
          address: 'Boulangerie Centrale, Avenue Kwame Nkrumah, Ouagadougou',
          coordinates: [-1.5247, 12.3702]
        },
        status: 'available',
        views: 42
      },
      {
        donor: users[0]._id,
        title: 'Viennoiseries du matin',
        description: 'Croissants et pains au chocolat de ce matin, parfait état.',
        category: 'pain',
        quantity: 20,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000), // Dans 12h
        pickupLocation: {
          address: 'Boulangerie Centrale, Avenue Kwame Nkrumah, Ouagadougou',
          coordinates: [-1.5247, 12.3702]
        },
        status: 'available',
        views: 28
      },
      {
        donor: users[3]._id, // Aminata Traoré
        title: 'Fruits frais - Mangues et Bananes',
        description: 'Mangues et bananes très mûres mais encore excellentes. Parfait pour smoothies ou consommation immédiate.',
        category: 'fruits',
        quantity: 5,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        pickupLocation: {
          address: 'Marché Central, Avenue de la Nation, Ouagadougou',
          coordinates: [-1.5100, 12.3800]
        },
        status: 'available',
        views: 35
      },
      {
        donor: users[3]._id,
        title: 'Légumes frais du jardin',
        description: 'Tomates, oignons, carottes et salade. Production locale, légères imperfections mais excellente qualité.',
        category: 'legumes',
        quantity: 8,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        pickupLocation: {
          address: 'Marché Central, Avenue de la Nation, Ouagadougou',
          coordinates: [-1.5100, 12.3800]
        },
        status: 'available',
        views: 51
      },
      {
        donor: users[2]._id, // Paul Ouédraogo
        title: 'Plats préparés - Riz au gras',
        description: 'Riz au gras préparé ce matin pour un événement annulé. 10 portions disponibles, à consommer aujourd\'hui.',
        category: 'plats',
        quantity: 10,
        unit: 'portions',
        expiryDate: new Date(Date.now() + 0.3 * 24 * 60 * 60 * 1000), // Dans 7h
        pickupLocation: {
          address: 'Restaurant Le Verdoyant, Boulevard Charles de Gaulle, Ouagadougou',
          coordinates: [-1.5320, 12.3650]
        },
        status: 'available',
        views: 67
      },
      {
        donor: users[2]._id,
        title: 'Produits laitiers - Yaourts',
        description: 'Yaourts nature et aux fruits, date de péremption proche mais encore parfaitement consommables.',
        category: 'produits_laitiers',
        quantity: 24,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Restaurant Le Verdoyant, Boulevard Charles de Gaulle, Ouagadougou',
          coordinates: [-1.5320, 12.3650]
        },
        status: 'reserved',
        reservedBy: users[1]._id, // Marie Kaboré
        views: 45
      },
      {
        donor: users[0]._id,
        title: 'Pâtisseries - Gâteaux',
        description: 'Gâteaux et tartes de la veille, très bonne qualité. Idéal pour un goûter.',
        category: 'patisseries',
        quantity: 12,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Boulangerie Centrale, Avenue Kwame Nkrumah, Ouagadougou',
          coordinates: [-1.5247, 12.3702]
        },
        status: 'completed',
        reservedBy: users[4]._id, // Ibrahim Sawadogo
        views: 38
      },
      {
        donor: users[3]._id,
        title: 'Conserves et produits secs',
        description: 'Riz, pâtes, conserves de légumes. Proche de la date mais encore utilisables pendant plusieurs mois.',
        category: 'conserves',
        quantity: 15,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
        pickupLocation: {
          address: 'Marché Central, Avenue de la Nation, Ouagadougou',
          coordinates: [-1.5100, 12.3800]
        },
        status: 'available',
        views: 22
      },
      {
        donor: users[2]._id,
        title: 'Boissons - Jus de fruits',
        description: 'Jus de fruits naturels, bouteilles de 1L. Date de péremption dans 3 jours.',
        category: 'boissons',
        quantity: 20,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        pickupLocation: {
          address: 'Restaurant Le Verdoyant, Boulevard Charles de Gaulle, Ouagadougou',
          coordinates: [-1.5320, 12.3650]
        },
        status: 'available',
        views: 31
      },
      {
        donor: users[0]._id,
        title: 'Sandwichs et salades',
        description: 'Sandwichs et salades préparés ce matin. À consommer dans la journée.',
        category: 'plats',
        quantity: 8,
        unit: 'piece',
        expiryDate: new Date(Date.now() + 0.4 * 24 * 60 * 60 * 1000), // Dans 9h
        pickupLocation: {
          address: 'Boulangerie Centrale, Avenue Kwame Nkrumah, Ouagadougou',
          coordinates: [-1.5247, 12.3702]
        },
        status: 'available',
        views: 19
      }
    ]);

    console.log(`✅ ${donations.length} donations créées`);
    console.log('   📊 Statuts : 7 disponibles, 1 réservée, 1 complétée, 1 expirée\n');

    // 4. CRÉATION DES RÉSERVATIONS
    console.log('📅 Création des réservations...');
    
    const reservations = await Reservation.insertMany([
      {
        donation: donations[5]._id, // Yaourts (statut: reserved)
        beneficiary: users[1]._id, // Marie Kaboré
        donor: users[2]._id, // Paul Ouédraogo
        status: 'confirmed',
        pickupDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        message: 'Bonjour, je souhaiterais récupérer ces yaourts pour notre association. Merci !',
        confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Confirmé il y a 2h
      },
      {
        donation: donations[6]._id, // Pâtisseries (statut: completed)
        beneficiary: users[4]._id, // Ibrahim Sawadogo
        donor: users[0]._id, // Jean Dupont
        status: 'completed',
        pickupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
        message: 'Je passe récupérer en fin d\'après-midi. Merci beaucoup !',
        confirmedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000) // Complété il y a 12h
      },
      {
        donation: donations[0]._id, // Pain frais
        beneficiary: users[1]._id,
        donor: users[0]._id,
        status: 'pending',
        pickupDate: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
        message: 'Bonjour, je peux passer en fin de journée. Cordialement.'
      },
      {
        donation: donations[4]._id, // Riz au gras
        beneficiary: users[4]._id,
        donor: users[2]._id,
        status: 'cancelled',
        pickupDate: new Date(Date.now() + 0.2 * 24 * 60 * 60 * 1000),
        message: 'Je souhaiterais récupérer 5 portions.',
        cancelledAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Annulé il y a 1h
        cancellationReason: 'Empêchement de dernière minute'
      },
      {
        donation: donations[3]._id, // Légumes
        beneficiary: users[1]._id,
        donor: users[3]._id,
        status: 'confirmed',
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        message: 'Parfait pour nos enfants, merci !',
        confirmedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ]);

    console.log(`✅ ${reservations.length} réservations créées`);
    console.log('   📊 Statuts : 1 en attente, 2 confirmées, 1 complétée, 1 annulée\n');

    // 5. CRÉATION DES AVIS
    console.log('⭐ Création des avis...');
    
    const reviews = await Review.insertMany([
      {
        reviewer: users[4]._id, // Ibrahim → Jean
        reviewee: users[0]._id,
        donation: donations[6]._id,
        reservation: reservations[1]._id,
        rating: 5,
        comment: 'Excellente expérience ! Personne très sympathique et ponctuelle. Les pâtisseries étaient délicieuses. Je recommande vivement !'
      },
      {
        reviewer: users[0]._id, // Jean → Ibrahim
        reviewee: users[4]._id,
        donation: donations[6]._id,
        reservation: reservations[1]._id,
        rating: 5,
        comment: 'Personne très agréable et à l\'heure. Transaction parfaite, merci !'
      },
      {
        reviewer: users[1]._id, // Marie → Aminata
        reviewee: users[3]._id,
        donation: donations[3]._id,
        reservation: reservations[4]._id,
        rating: 5,
        comment: 'Légumes de très bonne qualité ! Merci beaucoup pour votre générosité.'
      },
      {
        reviewer: users[3]._id, // Aminata → Marie
        reviewee: users[1]._id,
        donation: donations[3]._id,
        reservation: reservations[4]._id,
        rating: 5,
        comment: 'Personne très polie et reconnaissante. Avec plaisir !'
      },
      {
        reviewer: users[1]._id, // Marie → Paul
        reviewee: users[2]._id,
        donation: donations[5]._id,
        reservation: reservations[0]._id,
        rating: 4,
        comment: 'Très bien, juste un petit retard mais produits de qualité.'
      }
    ]);

    console.log(`✅ ${reviews.length} avis créés`);
    console.log('   📊 Notes moyennes : 4.8/5\n');

    // 6. MISE À JOUR DES RATINGS
    console.log('📊 Mise à jour des ratings...');
    
    // Calculer et mettre à jour les ratings
    for (const user of users) {
      const userReviews = await Review.find({ reviewee: user._id });
      if (userReviews.length > 0) {
        const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
        user.rating = {
          average: Math.round(avgRating * 10) / 10,
          count: userReviews.length
        };
        await user.save();
      }
    }

    console.log('✅ Ratings mis à jour\n');

    // 7. RÉSUMÉ FINAL
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ SEED TERMINÉ AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📊 DONNÉES CRÉÉES :');
    console.log(`   👥 ${users.length} utilisateurs`);
    console.log(`   🎁 ${donations.length} donations`);
    console.log(`   📅 ${reservations.length} réservations`);
    console.log(`   ⭐ ${reviews.length} avis\n`);

    console.log('👥 COMPTES DE TEST :');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│ Email                      │ Mot de passe       │ Rôle          │');
    console.log('├─────────────────────────────────────────────────┤');
    console.log('│ jean.dupont@test.com       │ password123        │ Donateur      │');
    console.log('│ marie.kabore@test.com      │ password123        │ Bénéficiaire  │');
    console.log('│ paul.ouedraogo@test.com    │ password123        │ Les deux      │');
    console.log('│ aminata.traore@test.com    │ password123        │ Donateur      │');
    console.log('│ ibrahim.sawadogo@test.com  │ password123        │ Bénéficiaire  │');
    console.log('└─────────────────────────────────────────────────┘\n');

    console.log('🎯 VOUS POUVEZ MAINTENANT :');
    console.log('   1. Démarrer le backend : npm run dev');
    console.log('   2. Démarrer le frontend : ng serve');
    console.log('   3. Vous connecter avec un des comptes ci-dessus');
    console.log('   4. Explorer l\'application avec des données réelles\n');

    console.log('🌐 URLs :');
    console.log('   Frontend : http://localhost:4200');
    console.log('   Backend  : http://localhost:3000\n');

  } catch (error) {
    console.error('❌ ERREUR lors du seed :', error.message);
    console.error(error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée :', err);
  process.exit(1);
});