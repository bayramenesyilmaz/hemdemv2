/**
 * Bellek içi (in-memory) sahte veritabanı. Gerçek bir Supabase projesi
 * bağlanana kadar `apps/web`'in uçtan uca test edilebilmesi için var —
 * `USE_MOCK_DATA=true` olduğunda `infrastructure/mockContainer.js`
 * bunun üzerinden çalışır. Süreç yeniden başlayınca sıfırlanır.
 *
 * Domain şekilleriyle (camelCase) birebir aynı obje yapısını kullanır,
 * bu yüzden Supabase repository'lerindeki gibi snake_case <-> camelCase
 * dönüşümüne gerek yoktur.
 *
 * Seed, ürünün asıl vaadini gösterecek şekilde kurulmuştur: testler bir
 * bilgi sınavı değil uyum aracıdır, bu yüzden cevaplar bilinçli olarak
 * farklı uyum yüzdeleri (tam uyum dahil) üretecek şekilde dağıtılmıştır.
 */

import { avatar, answers, daysAgo, question } from "./mockSeedHelpers.js";

function createProfile(id, name, initials, colors, overrides = {}) {
  return {
    id,
    createdAt: daysAgo(60),
    name,
    avatarUrl: avatar(initials, colors[0], colors[1]),
    bio: null,
    gender: null,
    country: "TR",
    interestedIn: "both",
    birthdate: null,
    language: "tr",
    role: "user",
    isBanned: false,
    gateTestId: null,
    gateTestThreshold: null,
    allowGuestLikes: false,
    socialLinks: {},
    ...overrides,
  };
}

function createSeededStore() {
  const profiles = new Map(
    [
      createProfile("demo-user-1", "Aslı Yıldız", "AY", ["#e11d48", "#7c3aed"], {
        bio: "Kitap okumayı, doğa yürüyüşlerini ve gece biten dizi maratonlarını severim.",
        gender: "female",
        interestedIn: "male",
        birthdate: "1998-05-12",
        gateTestId: "test-1",
        gateTestThreshold: 50,
        allowGuestLikes: true,
        socialLinks: { instagram: "https://instagram.com/asliyildiz" },
      }),
      createProfile("demo-user-2", "Mert Kaya", "MK", ["#0ea5e9", "#1e293b"], {
        bio: "Hafta sonları dağcılık, hafta içi yazılım. Bilim kurgu bağımlısı.",
        gender: "male",
        interestedIn: "female",
        birthdate: "1996-02-20",
      }),
      createProfile("demo-user-3", "Zeynep Demir", "ZD", ["#f59e0b", "#be123c"], {
        bio: "Berlin'de yaşıyorum. Polisiye kitaplar ve uzun tren yolculukları.",
        gender: "female",
        country: "DE",
        interestedIn: "both",
        birthdate: "1994-11-03",
        allowGuestLikes: true,
      }),
      createProfile("demo-user-4", "Can Öztürk", "CÖ", ["#10b981", "#065f46"], {
        bio: "Kedi babası, amatör aşçı, sinema kulübü müdavimi.",
        gender: "male",
        interestedIn: "female",
        birthdate: "1999-07-08",
      }),
      createProfile("demo-user-5", "Elif Şahin", "EŞ", ["#8b5cf6", "#312e81"], {
        bio: "Architecture student in New York. Coffee, jazz and long walks.",
        gender: "female",
        country: "US",
        interestedIn: "male",
        birthdate: "1997-09-30",
        language: "en",
      }),
      createProfile("demo-user-6", "Deniz Arslan", "DA", ["#ef4444", "#7f1d1d"], {
        bio: "Fotoğraf çekerim, plak toplarım. En sevdiğim tür: belgesel.",
        gender: "male",
        interestedIn: "female",
        birthdate: "1995-03-17",
      }),
      createProfile("demo-user-7", "Ece Yılmaz", "EY", ["#ec4899", "#831843"], {
        bio: "Psikoloji öğrencisi. Distopya romanları ve uzun sohbetler.",
        gender: "female",
        interestedIn: "male",
        birthdate: "2000-01-25",
        allowGuestLikes: true,
      }),
      createProfile("demo-user-8", "Burak Doğan", "BD", ["#14b8a6", "#134e4a"], {
        bio: "Koşu, kahve, tarih podcastleri. Sabah insanıyım.",
        gender: "male",
        interestedIn: "female",
        birthdate: "1993-06-11",
      }),
      createProfile("demo-user-9", "Selin Aydın", "SA", ["#f97316", "#7c2d12"], {
        bio: "İllüstratör. Ghibli filmleri ve ikinci el kitapçılar.",
        gender: "female",
        interestedIn: "both",
        birthdate: "1999-12-02",
      }),
      createProfile("demo-user-10", "Kaan Erdem", "KE", ["#3b82f6", "#1e3a8a"], {
        bio: "Amsterdam'da veri analisti. Bisiklet ve satranç.",
        gender: "male",
        country: "NL",
        interestedIn: "female",
        birthdate: "1997-04-19",
      }),
      createProfile("demo-user-11", "Melis Koç", "MKo", ["#a855f7", "#4c1d95"], {
        bio: "Tiyatro oyuncusu. Klasik roman okumaktan ve tartışmaktan keyif alırım.",
        gender: "female",
        interestedIn: "male",
        birthdate: "1998-08-23",
      }),
      createProfile("demo-user-12", "Emre Tunç", "ET", ["#64748b", "#0f172a"], {
        bio: "Müzisyen. Gece kuşu, vinil koleksiyoncusu, kahve fanatiği.",
        gender: "male",
        interestedIn: "female",
        birthdate: "1994-10-05",
      }),
      createProfile("admin-user-1", "Hemdem Admin", "H", ["#e11d48", "#1a1a1f"], {
        role: "admin",
      }),
    ].map((profile) => [profile.id, profile])
  );

  const tests = new Map(
    [
      {
        id: "test-1",
        createdAt: daysAgo(40),
        createdBy: "demo-user-1",
        title: "Hangi Diziyi İzlersin?",
        categoryId: 3,
        language: "tr",
        questions: [
          question("q1", "Bir dizi seçerken önceliğin ne?", [
            "Sürükleyici hikâye",
            "Derin karakterler",
            "Atmosfer ve görsellik",
            "Beni güldürmesi",
          ]),
          question("q2", "Hangi tür sana daha yakın?", [
            "Bilim kurgu",
            "Polisiye / gerilim",
            "Drama",
            "Komedi",
          ]),
          question("q3", "Bir diziyi nasıl izlersin?", [
            "Tek gecede bitiririm",
            "Haftada bir bölüm",
            "Ruh hâlime göre",
          ]),
          question("q4", "Final bölümünden beklentin?", [
            "Her şey açıklansın",
            "Biraz muamma kalsın",
            "Karakterler huzur bulsun",
          ]),
          question("q5", "Altyazı mı dublaj mı?", ["Altyazı", "Dublaj", "Fark etmez"]),
        ],
        point: 50,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-2",
        createdAt: daysAgo(35),
        createdBy: "demo-user-3",
        title: "Nasıl Bir Okursun?",
        categoryId: 2,
        language: "tr",
        questions: [
          question("q1", "Kitabı nerede okursun?", [
            "Yatakta, gece",
            "Kafede",
            "Toplu taşımada",
            "Sessiz bir odada",
          ]),
          question("q2", "Hangisi rafında mutlaka vardır?", [
            "Klasik roman",
            "Distopya",
            "Polisiye",
            "Deneme / felsefe",
          ]),
          question("q3", "Sevmediğin kitabı ne yaparsın?", [
            "Yarıda bırakırım",
            "İnat edip bitiririm",
          ]),
          question("q4", "Kitabın altını çizer misin?", [
            "Evet, not alırım",
            "Asla, tertemiz kalmalı",
          ]),
        ],
        point: 40,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-3",
        createdAt: daysAgo(30),
        createdBy: "demo-user-7",
        title: "İlişkide Ne Ararsın?",
        categoryId: 1,
        language: "tr",
        questions: [
          question("q1", "Sence ilişkinin temeli nedir?", [
            "Güven",
            "Aynı mizah anlayışı",
            "Ortak hedefler",
            "Tutku",
          ]),
          question("q2", "Tartışma çıktığında?", [
            "Hemen konuşup çözerim",
            "Sakinleşip sonra konuşurum",
            "Yazarak anlatmayı severim",
          ]),
          question("q3", "İdeal bir cumartesi akşamı?", [
            "Evde film ve battaniye",
            "Kalabalık bir buluşma",
            "Uzun bir yürüyüş ve sohbet",
          ]),
          question("q4", "Sevgini nasıl gösterirsin?", [
            "Zaman ayırarak",
            "Küçük sürprizlerle",
            "Sözle, açıkça söyleyerek",
          ]),
          question("q5", "Partnerinden en çok ne beklersin?", [
            "Beni olduğum gibi kabul etmesi",
            "Beni geliştirmesi",
            "Bana alan tanıması",
          ]),
        ],
        point: 60,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-4",
        createdAt: daysAgo(25),
        createdBy: "demo-user-4",
        title: "Hafta Sonu Planın",
        categoryId: 3,
        language: "tr",
        questions: [
          question("q1", "Cumartesi sabahı?", ["Erken kalkıp spor", "Öğlene kadar uyku"]),
          question("q2", "Plan yapmayı sever misin?", [
            "Her şey planlı olmalı",
            "Akışına bırakırım",
          ]),
          question("q3", "Tercihin?", ["Doğa", "Şehir", "Ev"]),
        ],
        point: 25,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-5",
        createdAt: daysAgo(20),
        createdBy: "demo-user-12",
        title: "Müzik Zevkin Ne Anlatıyor?",
        categoryId: 3,
        language: "tr",
        questions: [
          question("q1", "En çok ne dinlersin?", ["Rock", "Elektronik", "Caz / blues", "Rap"]),
          question("q2", "Konser mi festival mi?", ["Konser", "Festival"]),
          question("q3", "Çalışırken müzik?", ["Şart", "Sessizlik isterim"]),
          question("q4", "Plak mı dijital mi?", ["Plak", "Dijital", "İkisi de"]),
        ],
        point: 30,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-6",
        createdAt: daysAgo(15),
        createdBy: "demo-user-11",
        title: "Hayata Bakışın",
        categoryId: 2,
        language: "tr",
        questions: [
          question("q1", "Karar verirken?", ["Mantık", "Sezgi"]),
          question("q2", "Değişim senin için?", ["Heyecan verici", "Biraz ürkütücü"]),
          question("q3", "Kalabalık bir ortamda?", [
            "Enerjim yükselir",
            "Çabuk yorulurum",
            "Duruma göre değişir",
          ]),
          question("q4", "Gelecek planın?", [
            "Net bir hedefim var",
            "Kapıları açık tutarım",
          ]),
        ],
        point: 45,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-7",
        createdAt: daysAgo(10),
        createdBy: "demo-user-10",
        title: "Seyahat Tarzın",
        categoryId: 3,
        language: "tr",
        questions: [
          question("q1", "Valizin?", ["Minimal", "Her ihtimale karşı dolu"]),
          question("q2", "Rota?", ["Gün gün planlı", "Oraya gidince bakarız"]),
          question("q3", "Konaklama?", ["Otel", "Hostel", "Kiralık ev"]),
        ],
        point: 25,
        approved: true,
        isDeleted: false,
      },
      {
        id: "test-8",
        createdAt: daysAgo(5),
        createdBy: "demo-user-5",
        title: "Relationship Style Test",
        categoryId: 1,
        language: "en",
        questions: [
          question("q1", "How do you handle conflict?", [
            "Talk it out immediately",
            "Take space, then talk",
          ]),
          question("q2", "Your love language?", [
            "Quality time",
            "Words of affirmation",
            "Acts of service",
          ]),
          question("q3", "Weekend together?", ["Quiet at home", "Out and about"]),
        ],
        point: 40,
        approved: true,
        isDeleted: false,
      },
    ].map((test) => [test.id, test])
  );

  /**
   * Cevaplar bilinçli olarak farklı uyum yüzdeleri üretir:
   * - test-1'de demo-user-1 ile demo-user-7 tam uyumlu (%100) → doğrudan
   *   mesajlaşabilirler ve karşılıklı bildirim düşer.
   * - demo-user-2 ve demo-user-9 yüksek ama tam olmayan uyumda (%80).
   * - geri kalanlar düşük uyumda, liste tek renk görünmesin diye.
   */
  const answerSeed = [
    ["demo-user-1", "test-1", "abaaa"],
    ["demo-user-7", "test-1", "abaaa"],
    ["demo-user-2", "test-1", "abaab"],
    ["demo-user-9", "test-1", "abaca"],
    ["demo-user-4", "test-1", "dcbbc"],
    ["demo-user-6", "test-1", "cabab"],
    ["demo-user-11", "test-1", "bbacc"],

    ["demo-user-1", "test-2", "abaa"],
    ["demo-user-3", "test-2", "abaa"],
    ["demo-user-9", "test-2", "abab"],
    ["demo-user-11", "test-2", "acba"],
    ["demo-user-7", "test-2", "dbaa"],

    ["demo-user-2", "test-3", "aacaa"],
    ["demo-user-7", "test-3", "aacaa"],
    ["demo-user-1", "test-3", "abacb"],
    ["demo-user-4", "test-3", "cbbaa"],
    ["demo-user-8", "test-3", "acabb"],
    ["demo-user-11", "test-3", "abaca"],

    ["demo-user-4", "test-4", "bba"],
    ["demo-user-1", "test-4", "bba"],
    ["demo-user-8", "test-4", "aab"],
    ["demo-user-12", "test-4", "bbc"],

    ["demo-user-12", "test-5", "abab"],
    ["demo-user-6", "test-5", "abab"],
    ["demo-user-2", "test-5", "bbaa"],
    ["demo-user-9", "test-5", "cabc"],

    ["demo-user-11", "test-6", "abca"],
    ["demo-user-1", "test-6", "abcb"],
    ["demo-user-8", "test-6", "aaab"],
    ["demo-user-10", "test-6", "baca"],

    ["demo-user-10", "test-7", "abc"],
    ["demo-user-3", "test-7", "abc"],
    ["demo-user-2", "test-7", "aba"],

    ["demo-user-5", "test-8", "aba"],
    ["demo-user-3", "test-8", "abb"],
  ];

  const answersMap = new Map(
    answerSeed.map(([userId, testId, pattern], index) => [
      `${userId}:${testId}`,
      {
        id: `answer-${index + 1}`,
        createdAt: daysAgo(20 - (index % 18)),
        userId,
        testId,
        userAnswers: answers(pattern),
      },
    ])
  );

  const swipes = new Map(
    [
      ["demo-user-3", "demo-user-1", "like"],
      ["demo-user-7", "demo-user-1", "like"],
      ["demo-user-9", "demo-user-1", "like"],
      ["demo-user-1", "demo-user-2", "like"],
      ["demo-user-2", "demo-user-1", "like"],
      ["demo-user-6", "demo-user-11", "like"],
      ["demo-user-8", "demo-user-9", "dislike"],
    ].map(([fromUser, toUser, action], index) => [
      `${fromUser}:${toUser}`,
      { id: index + 1, createdAt: daysAgo(12 - index), fromUser, toUser, action },
    ])
  );

  const matches = new Map([
    ["demo-user-1:demo-user-2", { id: 1, createdAt: daysAgo(8), userA: "demo-user-1", userB: "demo-user-2" }],
  ]);

  const chats = new Map([
    [
      "demo-user-1:demo-user-2",
      {
        id: 1,
        createdAt: daysAgo(8),
        lastMessageAt: daysAgo(1),
        userA: "demo-user-1",
        userB: "demo-user-2",
        source: "match",
      },
    ],
    [
      "demo-user-1:demo-user-7",
      {
        id: 2,
        createdAt: daysAgo(3),
        lastMessageAt: daysAgo(2),
        userA: "demo-user-1",
        userB: "demo-user-7",
        source: "match",
      },
    ],
  ]);

  const messages = [
    {
      id: 1,
      createdAt: daysAgo(8),
      chatId: 1,
      senderId: "demo-user-2",
      content: "Selam! Hangi Diziyi İzlersin testinde %80 çıkmışız, fena değil :)",
    },
    {
      id: 2,
      createdAt: daysAgo(7),
      chatId: 1,
      senderId: "demo-user-1",
      content: "Selam Mert! Gördüm, sadece son soruda ayrılmışız sanırım.",
    },
    {
      id: 3,
      createdAt: daysAgo(1),
      chatId: 1,
      senderId: "demo-user-2",
      content: "Bu akşam yeni sezonu başlatıyorum, tavsiye ister misin?",
    },
    {
      id: 4,
      createdAt: daysAgo(3),
      chatId: 2,
      senderId: "demo-user-7",
      content: "Testte %100 çıktık, bu biraz ürkütücü ama güzel 😄",
    },
    {
      id: 5,
      createdAt: daysAgo(2),
      chatId: 2,
      senderId: "demo-user-1",
      content: "Aynen! Beş sorunun beşinde de aynı şıkkı seçmişiz.",
    },
  ];

  const posts = [
    {
      id: 1,
      createdAt: daysAgo(1),
      userId: "demo-user-7",
      content: "Bugün biriyle bir testte %100 uyum yakaladım. Bu uygulama fena değil cidden.",
      taggedTestId: "test-1",
    },
    {
      id: 2,
      createdAt: daysAgo(2),
      userId: "demo-user-3",
      content: "Berlin'den herkese merhaba! Polisiye öneren olursa çok sevinirim.",
      taggedTestId: "test-2",
    },
    {
      id: 3,
      createdAt: daysAgo(3),
      userId: "demo-user-12",
      content: "Yeni bir test oluşturdum: müzik zevkinizin ne anlattığını merak edenler buraya.",
      taggedTestId: "test-5",
    },
    {
      id: 4,
      createdAt: daysAgo(4),
      userId: "demo-user-4",
      content: "Hafta sonu planı testini çözenlerin çoğu 'akışına bırakırım' demiş. Beni rahatlattı.",
      taggedTestId: "test-4",
    },
    {
      id: 5,
      createdAt: daysAgo(6),
      userId: "demo-user-9",
      content: "İkinci el kitapçıda bulduğum çizimli baskıyı paylaşmadan duramadım.",
      taggedTestId: null,
    },
  ];

  const notes = new Map([
    [
      "demo-user-1",
      [
        {
          id: "note-1",
          createdAt: daysAgo(5),
          userId: "demo-user-1",
          text: "Ece ile test-1'de tam uyum çıktı, mutlaka yaz.",
        },
        {
          id: "note-2",
          createdAt: daysAgo(2),
          userId: "demo-user-1",
          text: "Zeynep'in önerdiği polisiyeyi listeye ekle.",
        },
      ],
    ],
  ]);

  const profileViews = [
    { id: 1, createdAt: daysAgo(4), viewerId: "demo-user-2", viewedId: "demo-user-1" },
    { id: 2, createdAt: daysAgo(3), viewerId: "demo-user-7", viewedId: "demo-user-1" },
    { id: 3, createdAt: daysAgo(2), viewerId: "demo-user-9", viewedId: "demo-user-1" },
    { id: 4, createdAt: daysAgo(1), viewerId: "demo-user-6", viewedId: "demo-user-1" },
  ];

  const notifications = [
    {
      id: 1,
      createdAt: daysAgo(1),
      userId: "demo-user-1",
      type: "test_similarity",
      actorId: "demo-user-7",
      testId: "test-1",
      similarity: 100,
      isRead: false,
    },
    {
      id: 2,
      createdAt: daysAgo(2),
      userId: "demo-user-1",
      type: "test_similarity",
      actorId: "demo-user-2",
      testId: "test-1",
      similarity: 80,
      isRead: false,
    },
    {
      id: 3,
      createdAt: daysAgo(3),
      userId: "demo-user-1",
      type: "test_similarity",
      actorId: "demo-user-3",
      testId: "test-2",
      similarity: 100,
      isRead: true,
    },
    {
      id: 4,
      createdAt: daysAgo(4),
      userId: "demo-user-1",
      type: "incoming_like",
      actorId: "demo-user-9",
      testId: null,
      similarity: null,
      isRead: true,
    },
  ];

  const coins = new Map([
    ["demo-user-1", 500],
    ["demo-user-2", 100],
    ["demo-user-3", 220],
    ["demo-user-7", 80],
  ]);

  const points = new Map([
    ["demo-user-1", 260],
    ["demo-user-7", 195],
    ["demo-user-11", 175],
    ["demo-user-2", 155],
    ["demo-user-3", 130],
    ["demo-user-9", 120],
    ["demo-user-4", 95],
    ["demo-user-12", 80],
    ["demo-user-8", 70],
    ["demo-user-10", 70],
    ["demo-user-6", 55],
    ["demo-user-5", 40],
  ]);

  const requests = [];

  // email -> { id, password } — Supabase Auth'un yerini tutan minimal eşleme.
  const authUsers = new Map([
    ["demo@hemdem.test", { id: "demo-user-1", password: "demo1234" }],
    ["admin@hemdem.test", { id: "admin-user-1", password: "admin1234" }],
  ]);

  return {
    profiles,
    tests,
    answers: answersMap,
    swipes,
    matches,
    chats,
    messages,
    posts,
    notes,
    profileViews,
    notifications,
    coins,
    points,
    requests,
    authUsers,
    nextId: {
      swipe: 8,
      match: 2,
      chat: 3,
      message: 6,
      post: 6,
      profileView: 5,
      request: 1,
      notification: 5,
    },
  };
}

/**
 * Seed cevaplarının ait oldukları testle tutarlı olduğunu doğrular:
 * her cevap, testin gerçekten sahip olduğu bir soruya ve o sorunun
 * gerçekten sahip olduğu bir şıkka işaret etmelidir.
 *
 * Bu kontrol olmadan, örneğin 2 şıklı bir soruya "o3" yazan bir seed
 * satırı sessizce kalıyor ve uyum yüzdelerini yanlış hesaplatıyordu.
 * Tutarsızlık geliştirme sırasında hemen görünsün diye hata fırlatır.
 */
function assertSeedIntegrity(store) {
  for (const answer of store.answers.values()) {
    const test = store.tests.get(answer.testId);
    if (!test) {
      throw new Error(`mock seed: bilinmeyen test "${answer.testId}"`);
    }
    if (answer.userAnswers.length !== test.questions.length) {
      throw new Error(
        `mock seed: ${answer.userId} / ${answer.testId} cevap sayısı soru sayısıyla uyuşmuyor`
      );
    }
    for (const { questionId, choiceId } of answer.userAnswers) {
      const question = test.questions.find((q) => q.id === questionId);
      if (!question) {
        throw new Error(`mock seed: ${answer.testId} içinde "${questionId}" sorusu yok`);
      }
      if (!question.options.some((option) => option.id === choiceId)) {
        throw new Error(
          `mock seed: ${answer.testId}/${questionId} sorusunda "${choiceId}" şıkkı yok`
        );
      }
    }
  }
}

let store;

export function getMockStore() {
  if (!store) {
    store = createSeededStore();
    assertSeedIntegrity(store);
  }
  return store;
}
