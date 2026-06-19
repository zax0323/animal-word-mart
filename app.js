const gameAssets = {
  homeBackground: "assets/home/home-hero.jpg",
  gameBackground: "assets/backgrounds/game-scene.jpg",
  dialogueBubble: "assets/dialog-bubble.png"
};

const characters = [
  {
    id: "rabbit",
    name: "Rabbit",
    image: "assets/characters/rabbit.png",
    happyImage: "assets/characters/rabbit-happy.png",
    sadImage: "assets/characters/rabbit-sad.png",
    fallbackEmoji: "🐰",
    anchor: "left"
  },
  {
    id: "cat",
    name: "Cat",
    image: "assets/characters/cat.png",
    happyImage: "assets/characters/cat-happy.png",
    sadImage: "assets/characters/cat-sad.png",
    fallbackEmoji: "🐱",
    anchor: "left"
  },
  {
    id: "dog",
    name: "Dog",
    image: "assets/characters/dog.png",
    happyImage: "assets/characters/dog-happy.png",
    sadImage: "assets/characters/dog-sad.png",
    fallbackEmoji: "🐶",
    anchor: "left"
  }
];

const foods = [
  { id: "bread", word: "bread", zh: "面包", image: "assets/foods/bread.png" },
  { id: "cake", word: "cake", zh: "蛋糕", image: "assets/foods/cake.png" },
  { id: "candy", word: "candy", zh: "糖果", image: "assets/foods/candy.png" },
  { id: "cheese", word: "cheese", zh: "奶酪", image: "assets/foods/cheese.png" },
  { id: "cookie", word: "cookie", zh: "饼干", image: "assets/foods/cookie.png" },
  { id: "donut", word: "donut", zh: "甜甜�?, image: "assets/foods/donut.png" },
  { id: "egg", word: "egg", zh: "鸡蛋", image: "assets/foods/egg.png" },
  { id: "ice-cream", word: "ice cream", zh: "冰淇�?, image: "assets/foods/ice%20cream.png" },
  { id: "milk", word: "milk", zh: "牛奶", image: "assets/foods/milk.png" },
  { id: "pizza", word: "pizza", zh: "披萨", image: "assets/foods/pizza.png" }
];

const demandTemplates = [
  {
    id: "single_need",
    count: 1,
    buildText: (items) => `I want ${items[0].word}.`
  },
  {
    id: "double_need",
    count: 2,
    buildText: (items) => `I want ${items[0].word} and ${items[1].word}.`
  }
];

const state = {
  screen: "home",
  totalRounds: 6,
  round: 1,
  coins: 0,
  lastCharacterId: null,
  isPaused: false,
  selectedFoodIds: [],
  currentRound: null,
  timerSeconds: 14,
  timeLeft: 14,
  timerId: null,
  feedback: { type: "idle", text: "" }
};

const app = document.getElementById("app");

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickMany(list, count) {
  return shuffle(list).slice(0, count);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function runTimer() {
  stopTimer();
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      stopTimer();
      handleRoundTimeout();
      return;
    }
    render();
  }, 1000);
}

function startTimer() {
  state.timeLeft = state.timerSeconds;
  runTimer();
}

function resumeTimer() {
  if (state.timeLeft > 0) {
    runTimer();
  }
}

function getRoundProgressPercent() {
  return Math.max(0, Math.round((state.timeLeft / state.timerSeconds) * 100));
}

function buildRoundData() {
  const availableCharacters =
    characters.length > 1
      ? characters.filter((character) => character.id !== state.lastCharacterId)
      : characters;
  const character = { ...pickRandom(availableCharacters) };
  state.lastCharacterId = character.id;
  const template = pickRandom(demandTemplates);
  const requestedFoods = pickMany(foods, template.count);
  const options = shuffle([
    ...requestedFoods,
    ...pickMany(
      foods.filter((food) => !requestedFoods.some((item) => item.id === food.id)),
      Math.max(0, 8 - requestedFoods.length)
    )
  ]);

  return {
    character,
    requestedFoods,
    options: options.slice(0, 8),
    demandText: template.buildText(requestedFoods)
  };
}

function resetGame() {
  stopTimer();
  state.round = 1;
  state.coins = 0;
  state.lastCharacterId = null;
  state.isPaused = false;
  state.selectedFoodIds = [];
  state.feedback = { type: "idle", text: "" };
  state.currentRound = buildRoundData();
  startTimer();
}

function openGame() {
  state.screen = "game";
  resetGame();
  render();
}

function goHome() {
  stopTimer();
  state.isPaused = false;
  state.screen = "home";
  render();
}

function goSummary() {
  stopTimer();
  state.isPaused = false;
  state.screen = "summary";
  render();
}

function advanceRound() {
  if (state.round >= state.totalRounds) {
    goSummary();
    return;
  }

  state.round += 1;
  state.isPaused = false;
  state.selectedFoodIds = [];
  state.feedback = { type: "idle", text: "" };
  state.currentRound = buildRoundData();
  startTimer();
  render();
}

function handleRoundSuccess() {
  state.coins += 10;
  state.currentRound.character.image = state.currentRound.character.happyImage;
  state.feedback = { type: "success", text: "Correct! Coins +10." };
  render();
  window.setTimeout(advanceRound, 900);
}

function handleRoundFailure(message) {
  state.currentRound.character.image = state.currentRound.character.sadImage;
  state.feedback = { type: "error", text: message };
  render();
  window.setTimeout(advanceRound, 900);
}

function handleRoundTimeout() {
  handleRoundFailure("Time is up. Next round.");
}

function isSelectionMatch() {
  const selected = [...state.selectedFoodIds].sort();
  const expected = [...state.currentRound.requestedFoods.map((item) => item.id)].sort();
  return selected.length === expected.length && selected.every((id, index) => id === expected[index]);
}

function toggleFoodSelection(foodId) {
  if (state.isPaused) {
    return;
  }

  const alreadySelected = state.selectedFoodIds.includes(foodId);
  const needCount = state.currentRound.requestedFoods.length;

  if (alreadySelected) {
    state.selectedFoodIds = state.selectedFoodIds.filter((id) => id !== foodId);
    state.feedback = { type: "idle", text: "" };
    render();
    return;
  }

  if (state.selectedFoodIds.length >= needCount) {
    state.feedback = { type: "error", text: `This round only needs ${needCount} item(s).` };
    render();
    return;
  }

  state.selectedFoodIds = [...state.selectedFoodIds, foodId];
  state.feedback = { type: "idle", text: "" };
  render();

  if (state.selectedFoodIds.length === needCount) {
    stopTimer();
    if (isSelectionMatch()) {
      handleRoundSuccess();
    } else {
      state.timeLeft = Math.max(0, state.timeLeft - 3);
      handleRoundFailure("Wrong choice. Time -3 seconds.");
    }
  }
}

function togglePause() {
  if (state.screen !== "game" || !state.currentRound) {
    return;
  }

  state.isPaused = !state.isPaused;

  if (state.isPaused) {
    stopTimer();
  } else {
    resumeTimer();
  }

  render();
}

function renderImageOrPlaceholder({ src, alt, placeholder, className = "", emoji = "" }) {
  return `
    <img
      src="${src}"
      alt="${alt}"
      class="${className}"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
    />
    <div class="asset-missing hidden h-full w-full place-items-center rounded-[18px] p-3 text-center text-sm font-black text-cream-100">
      <div>
        ${emoji ? `<div class="mb-2 text-5xl">${emoji}</div>` : ""}
        ${placeholder}
      </div>
    </div>
  `;
}

function renderHome() {
  return `
    <section class="relative min-h-screen overflow-hidden bg-[#1f1730]">
      <img
        src="${gameAssets.homeBackground}"
        alt="Home background"
        class="absolute inset-0 h-full w-full object-cover"
        style="object-position: center 70%;"
      />
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative flex min-h-screen items-end justify-center px-6 pb-10 md:pb-14">
        <button
          type="button"
          data-action="start-game"
          class="pixel-button rounded-[22px] border-4 border-grape-900 bg-sunset-400 px-10 py-4 text-lg font-black text-white md:px-16 md:py-5 md:text-xl"
        >
          Start Game
        </button>
      </div>
    </section>
  `;
}

function renderSelectedFoods() {
  if (state.selectedFoodIds.length === 0) {
    return "";
  }

  const selectedFoods = foods.filter((food) => state.selectedFoodIds.includes(food.id));
  return `
    <div class="flex flex-wrap gap-2">
      ${selectedFoods
        .map(
          (food) => `
            <div class="rounded-[16px] bg-white/90 px-3 py-2 text-sm font-black text-grape-700 pixel-outline">
              ${food.word}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderGame() {
  const round = state.currentRound;
  const progress = getRoundProgressPercent();
  const hasFeedback = Boolean(state.feedback.text);
  return `
    <section class="relative min-h-screen overflow-hidden bg-[#2d2143]">
      <img
        src="${gameAssets.gameBackground}"
        alt="Game background"
        class="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-black/10"></div>

      <div class="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-3 py-3 md:px-5 md:py-4">
        <div class="rounded-[22px] bg-grape-700/88 px-3 py-2 text-white pixel-outline">
          <div class="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 md:gap-4">
            <div class="text-xs font-black md:text-sm">Round ${state.round}/${state.totalRounds}</div>
            <div class="h-4 overflow-hidden rounded-full border-4 border-grape-900 bg-[#6D55A0]">
              <div class="h-full bg-gradient-to-r from-[#F7C768] to-[#FFA024]" style="width:${progress}%"></div>
            </div>
            <div class="text-xs font-black md:text-sm">${state.timeLeft}s</div>
            <div class="text-xs font-black md:text-sm">Coins ${state.coins}</div>
            <button
              type="button"
              data-action="toggle-pause"
              class="pixel-button justify-self-end rounded-[16px] border-4 border-grape-900 bg-cream-100 px-3 py-1.5 text-[11px] font-black text-grape-700 md:text-xs"
            >
              ${state.isPaused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        <div class="relative flex-1 pt-4 pb-[88px] md:pb-[112px]">
          <div class="relative h-full min-h-[320px] md:min-h-[420px]">
            <div class="absolute left-[13%] bottom-[-31%] h-[55%] w-[32%] min-h-[330px] min-w-[228px] max-h-[564px] max-w-[420px] md:left-[15%] md:bottom-[-33%]">
              ${renderImageOrPlaceholder({
                src: round.character.image,
                alt: round.character.name,
                placeholder: "Character image",
                emoji: round.character.fallbackEmoji,
                className: "h-full w-full object-contain"
              })}
            </div>

            <div class="absolute left-[45%] top-[16%] w-[21.3%] min-w-[153px] max-w-[277px] -translate-x-1/2 md:left-[44%] md:top-[18%]">
              <div class="relative">
                <img
                  src="${gameAssets.dialogueBubble}"
                  alt="Dialogue bubble"
                  class="h-auto w-full object-contain"
                />
                <div class="absolute inset-x-[14%] top-[14%] bottom-[16%] flex flex-col text-grape-700">
                  <div class="ml-[10%] mt-4 flex-1 overflow-hidden px-1 text-center text-[15px] font-black leading-5 md:mt-5 md:text-[22px] md:leading-7">
                    ${round.demandText}
                  </div>
                </div>
              </div>
            </div>

            ${
              state.isPaused
                ? `
              <div class="absolute inset-0 z-20 grid place-items-center bg-black/28">
                <div class="rounded-[22px] bg-[#FFF1D8] px-6 py-5 text-center text-grape-700 pixel-panel">
                  <div class="text-lg font-black md:text-2xl">Paused</div>
                  <div class="mt-2 text-xs font-bold md:text-sm">Click pause again to continue</div>
                </div>
              </div>
            `
                : ""
            }
          </div>

          <div class="absolute inset-x-0 bottom-0">
            <div class="mx-auto mb-1.5 w-full max-w-[680px] min-h-[0] px-2">
              ${renderSelectedFoods()}
            </div>

            ${
              hasFeedback
                ? `
              <div class="mx-auto mb-1.5 w-full max-w-[680px] rounded-[18px] px-4 py-2 text-sm font-black ${
                state.feedback.type === "success"
                  ? "bg-[#DDF5D7] text-[#2D5F2A]"
                  : state.feedback.type === "error"
                    ? "bg-[#FFE0E0] text-[#8E3434]"
                    : "bg-white/85 text-grape-700"
              }">
                ${state.feedback.text}
              </div>
            `
                : ""
            }

            <div class="mx-auto w-fit rounded-[22px] border-4 border-grape-900 bg-[#f4b567]/95 px-2 py-1.5 md:px-3 md:py-2">
              <div class="grid grid-cols-4 gap-1 sm:grid-cols-8 md:gap-1.5">
                ${round.options
                  .map(
                    (food) => `
                      <button
                        type="button"
                        data-action="pick-food"
                        data-food-id="${food.id}"
                        class="pixel-button rounded-[18px] border-4 ${
                          state.selectedFoodIds.includes(food.id) ? "border-[#FFA024] bg-[#FFF2D8]" : "border-[#FFB84C] bg-white"
                        } mx-auto aspect-square w-full max-w-[54px] p-1 text-center text-grape-700 md:max-w-[62px] md:rounded-[16px]"
                      >
                        <div class="mx-auto h-full w-full overflow-hidden rounded-[10px] bg-cream-100">
                          ${renderImageOrPlaceholder({
                            src: food.image,
                            alt: food.word,
                            placeholder: food.word,
                            className: "h-full w-full object-contain"
                          })}
                        </div>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSummary() {
  return `
    <section class="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#4B356A_0%,#6B4E93_35%,#E27D68_100%)] px-4 py-10">
      <div class="w-full max-w-[760px] rounded-[34px] bg-[#FFF1D8] p-5 text-center text-grape-700 pixel-panel">
        <div class="text-3xl font-black">Game Complete</div>
        <div class="mt-4 text-lg font-bold">You collected ${state.coins} coins</div>
        <div class="mt-2 text-sm font-bold">Finished ${state.totalRounds} rounds</div>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            data-action="restart-game"
            class="pixel-button rounded-[22px] border-4 border-grape-900 bg-sunset-400 px-8 py-4 text-lg font-black text-white"
          >
            Play Again
          </button>
          <button
            type="button"
            data-action="go-home"
            class="pixel-button rounded-[22px] border-4 border-grape-900 bg-brick-300 px-8 py-4 text-lg font-black text-white"
          >
            Back Home
          </button>
        </div>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-action='start-game']").forEach((button) => {
    button.addEventListener("click", openGame);
  });

  document.querySelectorAll("[data-action='go-home']").forEach((button) => {
    button.addEventListener("click", goHome);
  });

  document.querySelectorAll("[data-action='restart-game']").forEach((button) => {
    button.addEventListener("click", openGame);
  });

  document.querySelectorAll("[data-action='pick-food']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleFoodSelection(button.getAttribute("data-food-id"));
    });
  });

  document.querySelectorAll("[data-action='toggle-pause']").forEach((button) => {
    button.addEventListener("click", togglePause);
  });
}

function render() {
  if (state.screen === "home") {
    app.innerHTML = renderHome();
  } else if (state.screen === "game") {
    app.innerHTML = renderGame();
  } else {
    app.innerHTML = renderSummary();
  }

  bindEvents();
}

render();
