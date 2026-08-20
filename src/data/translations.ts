export type Language = 'en' | 'fr' | 'es' | 'pt' | 'fil' | 'nl' | 'id';

export const LANGUAGES = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'fr' as Language, name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'es' as Language, name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'pt' as Language, name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'fil' as Language, name: 'Filipino', flag: '🇵🇭', nativeName: 'Filipino' },
  { code: 'nl' as Language, name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
];

type TranslationKeys = {
  home: string;
  library: string;
  search: string;
  genres: string;
  rewards: string;
  coins: string;
  community: string;
  profile: string;
  settings: string;
  notifications: string;
  logout: string;
  login: string;
  signup: string;
  readNow: string;
  addToLibrary: string;
  continueReading: string;
  trending: string;
  featured: string;
  newReleases: string;
  completed: string;
  chapters: string;
  views: string;
  rating: string;
  subscribe: string;
  buyCoins: string;
  free: string;
  premium: string;
  unlock: string;
  previous: string;
  next: string;
  bookmark: string;
  font: string;
  dark: string;
  light: string;
  more: string;
  viewAll: string;
  recommended: string;
  latestUpdates: string;
  synopsis: string;
  reviews: string;
  comments: string;
  loading: string;
  error: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  adminDashboard: string;
  manageNovels: string;
  manageUsers: string;
  analytics: string;
  penNames: string;
  advertisements: string;
  subscriptionPlans: string;
  wallet: string;
  purchaseHistory: string;
  dailyRewards: string;
  referAFriend: string;
  emailAddress: string;
  password: string;
  forgotPassword: string;
  createAccount: string;
  welcomeBack: string;
  readingHistory: string;
  favorites: string;
  bookmarks: string;
  myLibrary: string;
};

export const TRANSLATIONS: Record<Language, TranslationKeys> = {
  en: {
    home: 'Home', library: 'Library', search: 'Search', genres: 'Genres', rewards: 'Rewards',
    coins: 'Coins', community: 'Community', profile: 'Profile', settings: 'Settings',
    notifications: 'Notifications', logout: 'Log Out', login: 'Log In', signup: 'Sign Up',
    readNow: 'Read Now', addToLibrary: 'Add to Library', continueReading: 'Continue Reading',
    trending: 'Trending Now', featured: 'Featured', newReleases: 'New Releases',
    completed: 'Completed', chapters: 'Chapters', views: 'Views', rating: 'Rating',
    subscribe: 'Subscribe', buyCoins: 'Buy Coins', free: 'Free', premium: 'Premium',
    unlock: 'Unlock', previous: 'Previous', next: 'Next', bookmark: 'Bookmark',
    font: 'Font', dark: 'Dark', light: 'Light', more: 'More', viewAll: 'View All',
    recommended: 'Recommended', latestUpdates: 'Latest Updates', synopsis: 'Synopsis',
    reviews: 'Reviews', comments: 'Comments', loading: 'Loading...', error: 'Error',
    cancel: 'Cancel', confirm: 'Confirm', save: 'Save', edit: 'Edit', delete: 'Delete',
    adminDashboard: 'Dashboard', manageNovels: 'Novels', manageUsers: 'Users',
    analytics: 'Analytics', penNames: 'Pen Names', advertisements: 'Advertisements',
    subscriptionPlans: 'Subscription Plans', wallet: 'Wallet', purchaseHistory: 'Purchase History',
    dailyRewards: 'Daily Rewards', referAFriend: 'Refer a Friend', emailAddress: 'Email Address',
    password: 'Password', forgotPassword: 'Forgot Password', createAccount: 'Create Account',
    welcomeBack: 'Welcome Back', readingHistory: 'History', favorites: 'Favorites',
    bookmarks: 'Bookmarks', myLibrary: 'My Library',
  },
  fr: {
    home: 'Accueil', library: 'Bibliothèque', search: 'Rechercher', genres: 'Genres', rewards: 'Récompenses',
    coins: 'Pièces', community: 'Communauté', profile: 'Profil', settings: 'Paramètres',
    notifications: 'Notifications', logout: 'Déconnexion', login: 'Connexion', signup: "S'inscrire",
    readNow: 'Lire maintenant', addToLibrary: 'Ajouter à la bibliothèque', continueReading: 'Continuer la lecture',
    trending: 'Tendances', featured: 'En vedette', newReleases: 'Nouvelles sorties',
    completed: 'Terminé', chapters: 'Chapitres', views: 'Vues', rating: 'Note',
    subscribe: "S'abonner", buyCoins: 'Acheter des pièces', free: 'Gratuit', premium: 'Premium',
    unlock: 'Déverrouiller', previous: 'Précédent', next: 'Suivant', bookmark: 'Signet',
    font: 'Police', dark: 'Sombre', light: 'Clair', more: 'Plus', viewAll: 'Tout voir',
    recommended: 'Recommandé', latestUpdates: 'Dernières mises à jour', synopsis: 'Synopsis',
    reviews: 'Avis', comments: 'Commentaires', loading: 'Chargement...', error: 'Erreur',
    cancel: 'Annuler', confirm: 'Confirmer', save: 'Enregistrer', edit: 'Modifier', delete: 'Supprimer',
    adminDashboard: 'Tableau de bord', manageNovels: 'Romans', manageUsers: 'Utilisateurs',
    analytics: 'Analytique', penNames: 'Pseudonymes', advertisements: 'Publicités',
    subscriptionPlans: "Plans d'abonnement", wallet: 'Portefeuille', purchaseHistory: "Historique d'achats",
    dailyRewards: 'Récompenses quotidiennes', referAFriend: 'Parrainer un ami', emailAddress: 'Adresse e-mail',
    password: 'Mot de passe', forgotPassword: 'Mot de passe oublié', createAccount: 'Créer un compte',
    welcomeBack: 'Bon retour', readingHistory: 'Historique', favorites: 'Favoris',
    bookmarks: 'Signets', myLibrary: 'Ma bibliothèque',
  },
  es: {
    home: 'Inicio', library: 'Biblioteca', search: 'Buscar', genres: 'Géneros', rewards: 'Recompensas',
    coins: 'Monedas', community: 'Comunidad', profile: 'Perfil', settings: 'Configuración',
    notifications: 'Notificaciones', logout: 'Cerrar sesión', login: 'Iniciar sesión', signup: 'Registrarse',
    readNow: 'Leer ahora', addToLibrary: 'Añadir a biblioteca', continueReading: 'Continuar leyendo',
    trending: 'Tendencias', featured: 'Destacado', newReleases: 'Nuevos lanzamientos',
    completed: 'Completado', chapters: 'Capítulos', views: 'Vistas', rating: 'Valoración',
    subscribe: 'Suscribirse', buyCoins: 'Comprar monedas', free: 'Gratis', premium: 'Premium',
    unlock: 'Desbloquear', previous: 'Anterior', next: 'Siguiente', bookmark: 'Marcador',
    font: 'Fuente', dark: 'Oscuro', light: 'Claro', more: 'Más', viewAll: 'Ver todo',
    recommended: 'Recomendado', latestUpdates: 'Últimas actualizaciones', synopsis: 'Sinopsis',
    reviews: 'Reseñas', comments: 'Comentarios', loading: 'Cargando...', error: 'Error',
    cancel: 'Cancelar', confirm: 'Confirmar', save: 'Guardar', edit: 'Editar', delete: 'Eliminar',
    adminDashboard: 'Panel', manageNovels: 'Novelas', manageUsers: 'Usuarios',
    analytics: 'Análisis', penNames: 'Seudónimos', advertisements: 'Anuncios',
    subscriptionPlans: 'Planes de suscripción', wallet: 'Cartera', purchaseHistory: 'Historial de compras',
    dailyRewards: 'Recompensas diarias', referAFriend: 'Referir amigo', emailAddress: 'Correo electrónico',
    password: 'Contraseña', forgotPassword: 'Olvidé mi contraseña', createAccount: 'Crear cuenta',
    welcomeBack: 'Bienvenido de vuelta', readingHistory: 'Historial', favorites: 'Favoritos',
    bookmarks: 'Marcadores', myLibrary: 'Mi biblioteca',
  },
  pt: {
    home: 'Início', library: 'Biblioteca', search: 'Pesquisar', genres: 'Gêneros', rewards: 'Recompensas',
    coins: 'Moedas', community: 'Comunidade', profile: 'Perfil', settings: 'Configurações',
    notifications: 'Notificações', logout: 'Sair', login: 'Entrar', signup: 'Cadastrar',
    readNow: 'Ler agora', addToLibrary: 'Adicionar à biblioteca', continueReading: 'Continuar lendo',
    trending: 'Em alta', featured: 'Destaque', newReleases: 'Novos lançamentos',
    completed: 'Concluído', chapters: 'Capítulos', views: 'Visualizações', rating: 'Avaliação',
    subscribe: 'Assinar', buyCoins: 'Comprar moedas', free: 'Grátis', premium: 'Premium',
    unlock: 'Desbloquear', previous: 'Anterior', next: 'Próximo', bookmark: 'Marcador',
    font: 'Fonte', dark: 'Escuro', light: 'Claro', more: 'Mais', viewAll: 'Ver tudo',
    recommended: 'Recomendado', latestUpdates: 'Últimas atualizações', synopsis: 'Sinopse',
    reviews: 'Avaliações', comments: 'Comentários', loading: 'Carregando...', error: 'Erro',
    cancel: 'Cancelar', confirm: 'Confirmar', save: 'Salvar', edit: 'Editar', delete: 'Excluir',
    adminDashboard: 'Painel', manageNovels: 'Novelas', manageUsers: 'Usuários',
    analytics: 'Análises', penNames: 'Pseudônimos', advertisements: 'Anúncios',
    subscriptionPlans: 'Planos de assinatura', wallet: 'Carteira', purchaseHistory: 'Histórico de compras',
    dailyRewards: 'Recompensas diárias', referAFriend: 'Indicar amigo', emailAddress: 'Endereço de e-mail',
    password: 'Senha', forgotPassword: 'Esqueci a senha', createAccount: 'Criar conta',
    welcomeBack: 'Bem-vindo de volta', readingHistory: 'Histórico', favorites: 'Favoritos',
    bookmarks: 'Favoritos', myLibrary: 'Minha biblioteca',
  },
  fil: {
    home: 'Tahanan', library: 'Aklatan', search: 'Maghanap', genres: 'Mga Genre', rewards: 'Mga Gantimpala',
    coins: 'Mga Barya', community: 'Komunidad', profile: 'Profile', settings: 'Mga Setting',
    notifications: 'Mga Abiso', logout: 'Mag-logout', login: 'Mag-login', signup: 'Mag-sign up',
    readNow: 'Basahin Ngayon', addToLibrary: 'Idagdag sa Aklatan', continueReading: 'Ipagpatuloy ang Pagbabasa',
    trending: 'Trending Ngayon', featured: 'Tampok', newReleases: 'Mga Bagong Labas',
    completed: 'Tapos Na', chapters: 'Mga Kabanata', views: 'Mga View', rating: 'Rating',
    subscribe: 'Mag-subscribe', buyCoins: 'Bumili ng Barya', free: 'Libre', premium: 'Premium',
    unlock: 'I-unlock', previous: 'Nakaraan', next: 'Susunod', bookmark: 'Bookmark',
    font: 'Font', dark: 'Madilim', light: 'Maliwanag', more: 'Higit Pa', viewAll: 'Tingnan Lahat',
    recommended: 'Inirerekomenda', latestUpdates: 'Pinakabagong Update', synopsis: 'Buod',
    reviews: 'Mga Review', comments: 'Mga Komento', loading: 'Naglo-load...', error: 'Error',
    cancel: 'Kanselahin', confirm: 'Kumpirmahin', save: 'I-save', edit: 'I-edit', delete: 'Burahin',
    adminDashboard: 'Dashboard', manageNovels: 'Mga Nobela', manageUsers: 'Mga User',
    analytics: 'Analytics', penNames: 'Mga Pen Name', advertisements: 'Mga Advertisement',
    subscriptionPlans: 'Mga Plano sa Subscription', wallet: 'Pitaka', purchaseHistory: 'Kasaysayan ng Pagbili',
    dailyRewards: 'Araw-araw na Gantimpala', referAFriend: 'Mag-refer ng Kaibigan', emailAddress: 'Email Address',
    password: 'Password', forgotPassword: 'Nakalimutan ang Password', createAccount: 'Lumikha ng Account',
    welcomeBack: 'Maligayang Pagbabalik', readingHistory: 'Kasaysayan', favorites: 'Mga Paborito',
    bookmarks: 'Mga Bookmark', myLibrary: 'Aking Aklatan',
  },
  nl: {
    home: 'Startpagina', library: 'Bibliotheek', search: 'Zoeken', genres: 'Genres', rewards: 'Beloningen',
    coins: 'Munten', community: 'Gemeenschap', profile: 'Profiel', settings: 'Instellingen',
    notifications: 'Meldingen', logout: 'Uitloggen', login: 'Inloggen', signup: 'Registreren',
    readNow: 'Nu lezen', addToLibrary: 'Toevoegen aan bibliotheek', continueReading: 'Doorgaan met lezen',
    trending: 'Trending nu', featured: 'Uitgelicht', newReleases: 'Nieuwe releases',
    completed: 'Voltooid', chapters: 'Hoofdstukken', views: 'Weergaven', rating: 'Beoordeling',
    subscribe: 'Abonneren', buyCoins: 'Munten kopen', free: 'Gratis', premium: 'Premium',
    unlock: 'Ontgrendelen', previous: 'Vorige', next: 'Volgende', bookmark: 'Bladwijzer',
    font: 'Lettertype', dark: 'Donker', light: 'Licht', more: 'Meer', viewAll: 'Alles bekijken',
    recommended: 'Aanbevolen', latestUpdates: 'Laatste updates', synopsis: 'Synopsis',
    reviews: 'Beoordelingen', comments: 'Reacties', loading: 'Laden...', error: 'Fout',
    cancel: 'Annuleren', confirm: 'Bevestigen', save: 'Opslaan', edit: 'Bewerken', delete: 'Verwijderen',
    adminDashboard: 'Dashboard', manageNovels: 'Romans', manageUsers: 'Gebruikers',
    analytics: 'Analyse', penNames: 'Pseudoniemen', advertisements: 'Advertenties',
    subscriptionPlans: 'Abonnementsplannen', wallet: 'Portemonnee', purchaseHistory: 'Aankoopgeschiedenis',
    dailyRewards: 'Dagelijkse beloningen', referAFriend: 'Vriend doorverwijzen', emailAddress: 'E-mailadres',
    password: 'Wachtwoord', forgotPassword: 'Wachtwoord vergeten', createAccount: 'Account aanmaken',
    welcomeBack: 'Welkom terug', readingHistory: 'Geschiedenis', favorites: 'Favorieten',
    bookmarks: 'Bladwijzers', myLibrary: 'Mijn bibliotheek',
  },
  id: {
    home: 'Beranda', library: 'Perpustakaan', search: 'Cari', genres: 'Genre', rewards: 'Hadiah',
    coins: 'Koin', community: 'Komunitas', profile: 'Profil', settings: 'Pengaturan',
    notifications: 'Notifikasi', logout: 'Keluar', login: 'Masuk', signup: 'Daftar',
    readNow: 'Baca Sekarang', addToLibrary: 'Tambah ke Perpustakaan', continueReading: 'Lanjutkan Membaca',
    trending: 'Sedang Tren', featured: 'Unggulan', newReleases: 'Rilis Terbaru',
    completed: 'Selesai', chapters: 'Bab', views: 'Tampilan', rating: 'Rating',
    subscribe: 'Berlangganan', buyCoins: 'Beli Koin', free: 'Gratis', premium: 'Premium',
    unlock: 'Buka', previous: 'Sebelumnya', next: 'Selanjutnya', bookmark: 'Tandai',
    font: 'Font', dark: 'Gelap', light: 'Terang', more: 'Lainnya', viewAll: 'Lihat Semua',
    recommended: 'Direkomendasikan', latestUpdates: 'Pembaruan Terbaru', synopsis: 'Sinopsis',
    reviews: 'Ulasan', comments: 'Komentar', loading: 'Memuat...', error: 'Kesalahan',
    cancel: 'Batal', confirm: 'Konfirmasi', save: 'Simpan', edit: 'Edit', delete: 'Hapus',
    adminDashboard: 'Dasbor', manageNovels: 'Novel', manageUsers: 'Pengguna',
    analytics: 'Analitik', penNames: 'Nama Pena', advertisements: 'Iklan',
    subscriptionPlans: 'Paket Langganan', wallet: 'Dompet', purchaseHistory: 'Riwayat Pembelian',
    dailyRewards: 'Hadiah Harian', referAFriend: 'Ajak Teman', emailAddress: 'Alamat Email',
    password: 'Kata Sandi', forgotPassword: 'Lupa Kata Sandi', createAccount: 'Buat Akun',
    welcomeBack: 'Selamat Datang Kembali', readingHistory: 'Riwayat', favorites: 'Favorit',
    bookmarks: 'Penanda', myLibrary: 'Perpustakaan Saya',
  },
};
