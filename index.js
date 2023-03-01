import { animate, generateCanvas } from "./helpers.js";
import { makeLander } from "./lander/lander.js";
import { makeToyLander } from "./lander/toylander.js";
import { makeStarfield } from "./starfield.js";
import { makeControls } from "./lander/controls.js";
import { makeTerrain } from "./terrain.js";
import { showStatsAndResetControl } from "./stats.js";
import { manageInstructions } from "./instructions.js";
import { makeAudioManager } from "./audio.js";
import { makeStateManager } from "./state.js";

const [CTX, canvasWidth, canvasHeight, canvasElement] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: ".game",
});

const appState = makeStateManager()
  .set("CTX", CTX)
  .set("canvasWidth", canvasWidth)
  .set("canvasHeight", canvasHeight)
  .set("canvasElement", canvasElement);

const audioManager = makeAudioManager();
const instructions = manageInstructions(onCloseInstructions);
const toyLander = makeToyLander(
  appState,
  () => instructions.setEngineDone(),
  () => instructions.setLeftRotationDone(),
  () => instructions.setRightRotationDone(),
  () => instructions.setEngineAndRotationDone()
);
const toyLanderControls = makeControls(appState, toyLander, audioManager);
const lander = makeLander(appState, onGameEnd, onResetXPos);
const landerControls = makeControls(appState, lander, audioManager);
const stars = makeStarfield(appState);
const terrain = makeTerrain(appState);

if (!instructions.hasClosedInstructions()) {
  instructions.show();
  toyLanderControls.attachEventListeners();
} else {
  landerControls.attachEventListeners();
}

const animationObject = animate((timeSinceStart) => {
  CTX.fillStyle = getComputedStyle(document.body).getPropertyValue(
    "--background-color"
  );
  CTX.fillRect(0, 0, canvasWidth, canvasHeight);
  stars.draw();
  terrain.draw();

  if (instructions.hasClosedInstructions()) {
    landerControls.drawTouchOverlay();
    lander.draw(timeSinceStart);
  } else {
    toyLander.draw();
  }
});

function onCloseInstructions() {
  toyLanderControls.detachEventListeners();
  landerControls.attachEventListeners();
}

function onGameEnd(data) {
  showStatsAndResetControl(
    lander,
    animationObject,
    data,
    landerControls.getHasKeyboard()
  );
}

function onResetXPos() {
  stars.reGenerate();
  terrain.reGenerate();
}

audioManager.playTheme();
