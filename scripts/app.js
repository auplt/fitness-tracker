"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

/* page */
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    habbitName: document.querySelector(".habbit__header .delete_icon"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  content: {
    content: document.querySelector(".content"),
    daysContainer: document.getElementById("days"),
    nextDay: document.querySelector(".habbit__day"),
  },
  popup: {
    index: document.getElementById("add-habbit-popup"),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
  cover: document.querySelector(".initial-cover"),
  logo: document.querySelector(".logo"),
};

/* utils */
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
  if (page.popup.index.classList.contains("cover_hidden")) {
    page.popup.index.classList.remove("cover_hidden");
  } else {
    page.popup.index.classList.add("cover_hidden");
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

/* render */
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function deleteHabbitFromMenu(habbitId) {
  const element = document.querySelector(`[menu-habbit-id="${habbitId}"]`);
  element.remove();
}

function showInitialCover() {
  page.cover.classList.remove("initial-cover_hidden");
  page.content.content.classList.add("content_hidden");
  page.logo.classList.remove("logo_50");
  // page.logo.setAttribute("style", `margin-bottom: 0`);
}

function hideInitialCover() {
  page.cover.classList.add("initial-cover_hidden");
  page.content.content.classList.remove("content_hidden");
  page.logo.classList.add("logo_50");
  // page.logo.setAttribute("style", ` margin-bottom: 50px`);
}

function renderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name;
  page.header.habbitName.setAttribute(
    "onclick",
    `deleteHabbit(${activeHabbit.id})`
  );
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function renderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = "";
  for (const index in activeHabbit.days) {
    const element = document.createElement("div");
    element.classList.add("habbit");
    element.innerHTML = `
                  <div class="habbit__day">День ${Number(index) + 1}</div>
              <div class="habbit__comment">${
                activeHabbit.days[index].comment
              }</div>

              <div class="habbit__delete">
                <button class="delete_icon" onclick="removeDay(${index})">
                <img src="./images/delete.svg" alt="Удалить день ${
                  Number(index) + 1
                }" />
              </button>
              </div>
`;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
  if (habbits.length === 0) {
    showInitialCover();
  } else {
    hideInitialCover();
  }
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  document.location.replace(document.location.pathname + "#" + activeHabbitId);
  rerenderMenu(activeHabbit);
  renderHead(activeHabbit);
  renderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ["comment"]);
  if (!data) {
    return;
  }
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }]),
      };
    }
    return habbit;
  });
  resetForm(event.target, ["comment"]);
  rerender(globalActiveHabbitId);
  saveData();
}

function removeDay(index) {
  habbits = habbits.map((habbit) => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1);
      return {
        ...habbit,
        days: habbit.days,
      };
    }
    return habbit;
  });
  rerender(globalActiveHabbitId);
  saveData();
}

/* working with habbits */
function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  activeIcon.classList.remove("icon_active");
  context.classList.add("icon_active");
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ["name", "icon", "target"]);
  if (!data) {
    return;
  }
  const maxId = habbits.reduce(
    (acc, habbit) => (acc > habbit.id ? acc : habbit.id),
    0
  );
  habbits.push({
    id: maxId + 1,
    icon: data.icon,
    name: data.name,
    target: data.target,
    days: [],
  });
  resetForm(event.target, ["name", "target"]);
  togglePopup();
  saveData();
  rerender(maxId + 1);
}

function deleteHabbit(habbitId) {
  let index = -1;
  for (const idx in habbits) {
    if (habbits[idx].id === habbitId) {
      index = idx;
    }
  }
  if (index != -1) {
    habbits.splice(index, 1);
    saveData();
    deleteHabbitFromMenu(habbitId);
    rerender(habbits.length > 0 ? habbits[0].id : -1);
  }
}

/* init */
(() => {
  loadData();
  const hashId = Number(document.location.hash.replace("#", ""));
  const urlHabbit = habbits.find((habbit) => habbit.id == hashId);
  if (habbits.length > 0) {
    if (urlHabbit) {
      rerender(urlHabbit.id);
    } else {
      rerender(habbits[0].id);
    }
  } else {
    rerender(-1);
  }
})();
