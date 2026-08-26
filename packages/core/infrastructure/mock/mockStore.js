/**
 * Bellek içi (in-memory) sahte veritabanı. Gerçek bir Supabase projesi
 * bağlanana kadar `apps/web`'in uçtan uca test edilebilmesi için var —
 * `USE_MOCK_DATA=true` olduğunda `infrastructure/mockContainer.js`
 * bunun üzerinden çalışır. Süreç yeniden başlayınca sıfırlanır.
 *
 * Domain şekilleriyle (camelCase) birebir aynı obje yapısını kullanır,
 * bu yüzden Supabase repository'lerindeki gibi snake_case <-> camelCase
 * dönüşümüne gerek yoktur.
 */

function createSeededStore() {
  const now = new Date().toISOString();

  const profiles = new Map([
    [
      "demo-user-1",
      {
        id: "demo-user-1",
        createdAt: now,
        name: "Aslı Yıldız",
        avatarUrl: null,
        bio: "Kitap okumayı, doğa yürüyüşlerini ve iyi bir tartışmayı severim.",
        gender: "female",
        country: "TR",
        interestedIn: "male",
        birthdate: "1998-05-12",
        language: "tr",
        role: "user",
        isBanned: false,
        gateTestId: "test-1",
        gateTestThreshold: 50,
        allowGuestLikes: true,
      },
    ],
    [
      "demo-user-2",
      {
        id: "demo-user-2",
        createdAt: now,
        name: "Mert Kaya",
        avatarUrl: null,
        bio: "Hafta sonları dağcılık, hafta içi yazılım.",
        gender: "male",
        country: "TR",
        interestedIn: "female",
        birthdate: "1996-02-20",
        language: "tr",
        role: "user",
        isBanned: false,
        gateTestId: null,
        gateTestThreshold: null,
        allowGuestLikes: false,
      },
    ],
    [
      "demo-user-3",
      {
        id: "demo-user-3",
        createdAt: now,
        name: "Zeynep Demir",
        avatarUrl: null,
        bio: "Berlin'de yaşıyorum, seyahat etmeyi çok seviyorum.",
        gender: "female",
        country: "DE",
        interestedIn: "both",
        birthdate: "1994-11-03",
        language: "tr",
        role: "user",
        isBanned: false,
        gateTestId: null,
        gateTestThreshold: null,
        allowGuestLikes: true,
      },
    ],
    [
      "demo-user-4",
      {
        id: "demo-user-4",
        createdAt: now,
        name: "Can Öztürk",
        avatarUrl: null,
        bio: "Kedi babası, amatör aşçı.",
        gender: "male",
        country: "TR",
        interestedIn: "female",
        birthdate: "1999-07-08",
        language: "tr",
        role: "user",
        isBanned: false,
        gateTestId: null,
        gateTestThreshold: null,
        allowGuestLikes: false,
      },
    ],
    [
      "demo-user-5",
      {
        id: "demo-user-5",
        createdAt: now,
        name: "Elif Şahin",
        avatarUrl: null,
        bio: "New York'ta mimarlık okuyorum.",
        gender: "female",
        country: "US",
        interestedIn: "male",
        birthdate: "1997-09-30",
        language: "en",
        role: "user",
        isBanned: false,
        gateTestId: null,
        gateTestThreshold: null,
        allowGuestLikes: false,
      },
    ],
  ]);

  const tests = new Map([
    [
      "test-1",
      {
        id: "test-1",
        createdAt: now,
        createdBy: "demo-user-1",
        title: "Aşk Dili Testi",
        categoryId: 1,
        language: "tr",
        questions: [
          {
            id: "q1",
            text: "Partnerinden en çok neyi duymak istersin?",
            options: [
              { id: "o1", text: "Seni seviyorum" },
              { id: "o2", text: "Seninle gurur duyuyorum" },
            ],
          },
          {
            id: "q2",
            text: "Sevgini nasıl gösterirsin?",
            options: [
              { id: "o1", text: "Küçük hediyelerle" },
              { id: "o2", text: "Zaman ayırarak" },
            ],
          },
        ],
        point: 50,
        approved: true,
        isDeleted: false,
      },
    ],
    [
      "test-2",
      {
        id: "test-2",
        createdAt: now,
        createdBy: "demo-user-2",
        title: "İçe mi Dışa mı Dönüksün?",
        categoryId: 2,
        language: "tr",
        questions: [
          {
            id: "q1",
            text: "Kalabalık bir partide kendini nasıl hissedersin?",
            options: [
              { id: "o1", text: "Enerjik ve mutlu" },
              { id: "o2", text: "Yorgun, eve gitmek isterim" },
            ],
          },
        ],
        point: 30,
        approved: true,
        isDeleted: false,
      },
    ],
    [
      "test-3",
      {
        id: "test-3",
        createdAt: now,
        createdBy: "demo-user-3",
        title: "Hangi Film Karakterisin?",
        categoryId: 3,
        language: "tr",
        questions: [
          {
            id: "q1",
            text: "Bir maceraya atılman gerekse ilk adımın ne olurdu?",
            options: [
              { id: "o1", text: "Hemen plansız yola çıkarım" },
              { id: "o2", text: "Önce detaylı plan yaparım" },
            ],
          },
        ],
        point: 20,
        approved: true,
        isDeleted: false,
      },
    ],
    [
      "test-4",
      {
        id: "test-4",
        createdAt: now,
        createdBy: "demo-user-5",
        title: "Relationship Style Test",
        categoryId: 1,
        language: "en",
        questions: [
          {
            id: "q1",
            text: "How do you handle conflict in a relationship?",
            options: [
              { id: "o1", text: "Talk it out immediately" },
              { id: "o2", text: "Take space, then talk" },
            ],
          },
        ],
        point: 40,
        approved: true,
        isDeleted: false,
      },
    ],
  ]);

  const answers = new Map([
    [
      "demo-user-2:test-1",
      {
        id: "answer-1",
        createdAt: now,
        userId: "demo-user-2",
        testId: "test-1",
        userAnswers: [
          { questionId: "q1", choiceId: "o1" },
          { questionId: "q2", choiceId: "o2" },
        ],
      },
    ],
    [
      "demo-user-1:test-1",
      {
        id: "answer-2",
        createdAt: now,
        userId: "demo-user-1",
        testId: "test-1",
        userAnswers: [
          { questionId: "q1", choiceId: "o1" },
          { questionId: "q2", choiceId: "o2" },
        ],
      },
    ],
    [
      "demo-user-4:test-1",
      {
        id: "answer-3",
        createdAt: now,
        userId: "demo-user-4",
        testId: "test-1",
        userAnswers: [
          { questionId: "q1", choiceId: "o2" },
          { questionId: "q2", choiceId: "o2" },
        ],
      },
    ],
  ]);

  const swipes = new Map([
    [
      "demo-user-3:demo-user-1",
      { id: 1, createdAt: now, fromUser: "demo-user-3", toUser: "demo-user-1", action: "like" },
    ],
  ]);

  const matches = new Map();
  const chats = new Map();
  const messages = [];

  const posts = [
    {
      id: 1,
      createdAt: now,
      userId: "demo-user-2",
      content: "Aşk Dili Testi'ni çözdüm, sonucum 'Zaman Ayırma' çıktı!",
      taggedTestId: "test-1",
    },
    {
      id: 2,
      createdAt: now,
      userId: "demo-user-3",
      content: "Berlin'den herkese merhaba! Yeni insanlarla tanışmaya açığım.",
      taggedTestId: null,
    },
  ];

  const notes = new Map([
    [
      "demo-user-1",
      [
        { id: "note-1", createdAt: now, userId: "demo-user-1", text: "Mert ile ortak yönlerimiz çok fazla." },
      ],
    ],
  ]);

  const profileViews = [{ id: 1, createdAt: now, viewerId: "demo-user-2", viewedId: "demo-user-1" }];

  const coins = new Map([
    ["demo-user-1", 500],
    ["demo-user-2", 100],
  ]);

  const points = new Map([
    ["demo-user-1", 120],
    ["demo-user-2", 80],
    ["demo-user-3", 40],
  ]);

  const requests = [];

  // email -> { id, password } — Supabase Auth'un yerini tutan minimal eşleme.
  const authUsers = new Map([["demo@hemdem.test", { id: "demo-user-1", password: "demo1234" }]]);

  return {
    profiles,
    tests,
    answers,
    swipes,
    matches,
    chats,
    messages,
    posts,
    notes,
    profileViews,
    coins,
    points,
    requests,
    authUsers,
    nextId: { swipe: 2, match: 1, chat: 1, message: 1, post: 3, profileView: 2, request: 1 },
  };
}

let store;

export function getMockStore() {
  if (!store) {
    store = createSeededStore();
  }
  return store;
}
