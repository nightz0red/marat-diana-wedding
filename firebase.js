// firebase.js — type="module"
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCXzsu3vT4FuGyqfW25mpSDxWfjsDl1CXg",
  authDomain: "marat-diana-wedding.firebaseapp.com",
  projectId: "marat-diana-wedding",
  storageBucket: "marat-diana-wedding.firebasestorage.app",
  messagingSenderId: "24925248479",
  appId: "1:24925248479:web:958f8bca2149b29b4bc26a",
};

// 🔌 Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Элементы
const form = document.querySelector("form");
const msgBox = document.getElementById("rsvp-message");
const guestOutput = document.getElementById("guest-output");
const statsBox = document.getElementById("guest-stats");
const filterSelect = document.getElementById("filter-select");

// ✅ Обработка формы
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const attendance = form.attendance.value;
  const comment = form.comment.value.trim();

  if (!name) {
    showMessage("Пожалуйста, введите имя", "error");
    return;
  }

  try {
    await addDoc(collection(db, "rsvp"), {
      name,
      attendance,
      comment,
      timestamp: new Date(),
    });

    showMessage("Спасибо! Ваш ответ принят ✅");
    form.reset();
  } catch (err) {
    console.error("Ошибка при отправке:", err);
    showMessage("Что-то пошло не так 😢 Попробуйте ещё раз", "error");
  }
});

// ✅ Сообщение после отправки
function showMessage(text, type = "success") {
  msgBox.textContent = text;
  msgBox.className = "";
  msgBox.classList.add(type === "error" ? "error" : "success", "show");

  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    msgBox.classList.remove("show");
  }, 5000);
}

// ✅ Состояние
let guestData = [];

// ✅ Получение данных в реальном времени
const q = query(collection(db, "rsvp"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
  guestData = [];
  snapshot.forEach((doc) => {
    guestData.push(doc.data());
  });
  renderGuestList();
});

// ✅ Рендер гостей + фильтрация + счётчик
function renderGuestList() {
  const selectedFilter = filterSelect.value;
  guestOutput.innerHTML = "";

  let yesCount = 0;
  let maybeCount = 0;
  let noCount = 0;

  guestData.forEach((data, index) => {
    const { name, attendance, comment } = data;

    if (attendance === "yes") yesCount++;
    else if (attendance === "maybe") maybeCount++;
    else if (attendance === "no") noCount++;

    if (selectedFilter !== "all" && selectedFilter !== attendance) return;

    const card = document.createElement("div");
    card.classList.add("guest-card");
    card.style.animationDelay = `${Math.min(index * 50, 500)}ms`;

    const top = document.createElement("div");
    top.classList.add("guest-top");

    const nameBox = document.createElement("div");
    nameBox.classList.add("guest-name");
    nameBox.innerHTML = `<i class="fa-solid fa-user"></i> ${name}`;

    const statusBadge = document.createElement("div");
    statusBadge.classList.add(
      "guest-status-badge",
      `guest-status-${attendance}`
    );
    statusBadge.innerHTML = convertStatus(attendance, true);

    top.appendChild(nameBox);
    top.appendChild(statusBadge);
    card.appendChild(top);

    if (comment) {
      const commentBox = document.createElement("div");
      commentBox.classList.add("guest-comment");
      commentBox.textContent = comment;
      card.appendChild(commentBox);
    }

    guestOutput.appendChild(card);
  });

  const total = yesCount + maybeCount + noCount;
  statsBox.innerHTML = `
    <span><i class="fa-solid fa-users"></i> Всего: <strong>${total}</strong></span><br>
    <i class="fa-solid fa-circle-check" style="color:#28a745;"></i> ${yesCount} 
    <i class="fa-solid fa-circle-question" style="color:#ffc107;"></i> ${maybeCount} 
    <i class="fa-solid fa-circle-xmark" style="color:#dc3545;"></i> ${noCount}
  `;
}

// ✅ Отслеживаем изменения фильтра
filterSelect.addEventListener("change", renderGuestList);

function convertStatus(value, labelOnly = false) {
  const icons = {
    yes: "fa-circle-check",
    maybe: "fa-circle-question",
    no: "fa-circle-xmark",
  };
  const labels = {
    yes: "Придёт",
    maybe: "Возможно",
    no: "Не сможет",
  };

  const icon = `<i class="fa-solid ${icons[value]}"></i>`;
  return labelOnly ? `${icon} ${labels[value]}` : labels[value];
}
