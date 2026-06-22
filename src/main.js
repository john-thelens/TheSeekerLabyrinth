import './styles.css';
import {
  Box3,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Clock,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import openAiLogoUrl from '../assets/openai_logo.png';
import githubIconUrl from '../assets/github_icon.png';
import { AmbientSoundscape } from './audio.js';
import generatedLayout from './generated-layout.json';

const THREE = {
  Box3,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Clock,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
};

const CELL = 2.4;
const TILE_BASE = 0.34;
const LEVEL_HEIGHT = 0.58;
const MAX_HEIGHT = 10;
const PLAYER_MOVE_SPEED = 6.46;
const PLAYER_RUN_MULTIPLIER = 1.714;
const PLAYER_STEER_RESPONSE = 18;
const PLAYER_RUN_STEER_RESPONSE = 14;
const PLAYER_STOP_RESPONSE = 20;
const PLAYER_TURN_RESPONSE = 20;
const PLAYER_EPSILON = 0.018;
const STREET_VIEW_MOVE_MULTIPLIER = 0.76;
const STREET_VIEW_REVERSE_MULTIPLIER = 0.66;
const STREET_VIEW_LOOK_SENSITIVITY_X = 0.0046;
const STREET_VIEW_LOOK_SENSITIVITY_Y = 0.0034;
const STREET_VIEW_MAX_PITCH = 0.58;
const PLAYER_DUST_INTERVAL = 0.032;
const SEEKER_BASE_SPEED = 0.58;
const SEEKER_VISION_RANGE = CELL * 3.6;
const SEEKER_VISION_ANGLE = Math.PI * 0.48;
const SEEKER_VISION_SEGMENTS = 20;
const SEEKER_MEMORY_SECONDS = 5.5;
const SEEKER_GOAL_SECONDS = 3.2;
const SEEKER_ALERT_SPEED_MULTIPLIER = 0.72;
const SEEKER_SQUAD_MEMORY_SECONDS = 7.5;
const SEEKER_SEARCH_CLAIM_SECONDS = 5.8;
const SEEKER_PREDICTION_STEPS = 4;
const SEEKER_BLACKBOARD_INTERVAL = 8.5;
const SEEKER_BLACKBOARD_DURATION = 5.8;
const SEEKER_BLACKBOARD_RADIUS = 2;
const SEEKER_BLACKBOARD_SPEED_MULTIPLIER = 0.88;
const SEEKER_TRACKER_COOLDOWN = 7.2;
const SEEKER_TRACKER_LIFETIME = 26;
const SEEKER_TRACKER_MAX = 5;
const SEEKER_TRACKER_TRIGGER_DISTANCE = CELL * 0.42;
const SEEKER_TRACKER_TRIGGER_RADIUS = 1;
const SEEKER_TRACKER_FOCUS_SECONDS = 3;
const TRACKER_FLASH_SECONDS = 0.5;
const PLAYER_SIGNAL_INTERVAL = 6.5;
const PLAYER_SIGNAL_RADIUS = 3;
const ESCAPE_TRIGGER_DISTANCE = CELL * 0.46;
const ESCAPE_REVEAL_SECONDS = 3.15;
const ESCAPE_REVEAL_OUT_SECONDS = 1.15;
const ESCAPE_REVEAL_HOLD_SECONDS = 0.72;
const ESCAPE_TIME_PAR_SECONDS = 155;
const DIRECTIONS = {
  n: { dx: 0, dz: -1, opposite: 's' },
  e: { dx: 1, dz: 0, opposite: 'w' },
  s: { dx: 0, dz: 1, opposite: 'n' },
  w: { dx: -1, dz: 0, opposite: 'e' }
};
const DIRECTION_KEYS = ['n', 'e', 's', 'w'];
const STORAGE_KEY = 'seeker_labyrinth_three_layout_v1';
const CONTROL_STORAGE_KEY = 'seeker_labyrinth_controls_v1';
const TOUCH_CONTROLS_STORAGE_KEY = 'seeker_labyrinth_touch_controls_v1';
const EDITOR_POSITION_STORAGE_KEY = 'seeker_labyrinth_editor_toolbar_position_v1';
const AI_SETTINGS_STORAGE_KEY = 'seeker_labyrinth_optional_ai_v1';
const AI_RECOMMENDED_MODEL = 'gpt-5.4-nano';
const AI_TOOL_SCORE = {
  slow_seekers: -300,
  stun_seekers: -450,
  ease_game: -260,
  ramp_difficulty: 520,
  focus_seekers: 420,
  reveal_hint: -160,
  add_gem: -220,
  remove_gem: -260,
  add_seeker: 360,
  remove_seeker: -340,
  add_box: -140,
  remove_box: 180,
  boost_player: -240,
  slow_player: 260,
  speed_seekers: 330
};
const AI_TOOL_LIMITS = {
  gem: 12,
  seeker: 12,
  box: 10,
  speed: 5
};
const AI_ACTIONS = new Set(Object.keys(AI_TOOL_SCORE));
// Keep false for public builds; flip locally when reshaping the shipped map.
const DEVELOPER_TOOLS_ENABLED = false;
const CONTROL_DEFS = {
  up: { label: 'Up', defaultCode: 'KeyW', fallbackCodes: ['ArrowUp'] },
  down: { label: 'Down', defaultCode: 'KeyS', fallbackCodes: ['ArrowDown'] },
  left: { label: 'Left', defaultCode: 'KeyA', fallbackCodes: ['ArrowLeft'] },
  right: { label: 'Right', defaultCode: 'KeyD', fallbackCodes: ['ArrowRight'] },
  run: { label: 'Run', defaultCode: 'ShiftLeft', fallbackCodes: ['ShiftRight'] }
};
const DIFFICULTIES = {
  easy: { label: 'Easy', gems: 6, seekers: 2, speed: 2, world: 'atrium', scoreMultiplier: 0.85 },
  medium: { label: 'Medium', gems: 10, seekers: 4, speed: 3, world: 'atrium', scoreMultiplier: 1 },
  hard: { label: 'Hard', gems: 15, seekers: 8, speed: 4, world: 'atrium', scoreMultiplier: 1.2 },
  veryHard: { label: 'Very Hard', gems: 20, seekers: 14, speed: 5, world: 'atrium', scoreMultiplier: 1.45 }
};
const GEM_SPAWN_MINIMUM = 20;

const canvas = document.querySelector('#world');
const startScreen = document.querySelector('#startScreen');
const startButton = document.querySelector('#startButton');
const startSetup = document.querySelector('#startSetup');
const launchRunButton = document.querySelector('#launchRunButton');
const githubLogo = document.querySelector('#githubLogo');
const startOpenaiLogo = document.querySelector('#startOpenaiLogo');
const startWorldSelect = document.querySelector('#startWorldSelect');
const menuWorldSelect = document.querySelector('#menuWorldSelect');
const startGemGoalInput = document.querySelector('#startGemGoalInput');
const startGemGoalValue = document.querySelector('#startGemGoalValue');
const startSeekerCountInput = document.querySelector('#startSeekerCountInput');
const startSeekerCountValue = document.querySelector('#startSeekerCountValue');
const startSeekerSpeedInput = document.querySelector('#startSeekerSpeedInput');
const startSeekerSpeedValue = document.querySelector('#startSeekerSpeedValue');
const startSandboxModeInput = document.querySelector('#startSandboxModeInput');
const setupDevCategory = document.querySelector('.setup-dev-category');
const miniMap = document.querySelector('#miniMap');
const miniCtx = miniMap.getContext('2d');
const mapPanel = document.querySelector('.map-panel');
const expandMapButton = document.querySelector('#expandMapButton');
const mapEditorPanel = document.querySelector('#mapEditorPanel');
const expandedMap = document.querySelector('#expandedMap');
const expandedMapCtx = expandedMap.getContext('2d');
const closeMapEditorButton = document.querySelector('#closeMapEditorButton');
const mapEditorModeButton = document.querySelector('#mapEditorModeButton');
const mapEditorHead = mapEditorPanel.querySelector('.map-editor-head');
const mapViewControls = document.querySelector('.map-view-controls');
const mapCommandBar = document.querySelector('.map-command-bar');
const mapUndoButton = document.querySelector('#mapUndoButton');
const mapCopyButton = document.querySelector('#mapCopyButton');
const mapPasteButton = document.querySelector('#mapPasteButton');
const mapSelectButton = document.querySelector('#mapSelectButton');
const mapZoomButton = document.querySelector('#mapZoomButton');
const mapPanButton = document.querySelector('#mapPanButton');
const mapZoomValue = document.querySelector('#mapZoomValue');
const mapZoomStepButtons = [...document.querySelectorAll('[data-map-zoom-step]')];
const mapEditorHint = document.querySelector('#mapEditorHint');
const mapGemSpawnCount = document.querySelector('#mapGemSpawnCount');
const menuButton = document.querySelector('#menuButton');
const menuPanel = document.querySelector('#menuPanel');
const closeMenu = document.querySelector('#closeMenu');
const aiButton = document.querySelector('#aiButton');
const aiRailLogo = document.querySelector('#aiRailLogo');
const aiPanel = document.querySelector('#aiPanel');
const closeAiPanelButton = document.querySelector('#closeAiPanel');
const aiTabButtons = [...document.querySelectorAll('[data-ai-tab]')];
const aiTabPanels = [...document.querySelectorAll('.ai-tab-panel')];
const aiProvider = document.querySelector('#aiProvider');
const aiModel = document.querySelector('#aiModel');
const editAiModelButton = document.querySelector('#editAiModel');
const aiEndpoint = document.querySelector('#aiEndpoint');
const aiKey = document.querySelector('#aiKey');
const aiStatus = document.querySelector('#aiStatus');
const saveAiSettingsButton = document.querySelector('#saveAiSettings');
const clearAiSettingsButton = document.querySelector('#clearAiSettings');
const aiCompanionBox = document.querySelector('#aiCompanionBox');
const aiCompanionState = document.querySelector('#aiCompanionState');
const aiCompanionLog = document.querySelector('#aiCompanionLog');
const aiCommandForm = document.querySelector('#aiCommandForm');
const aiCommandInput = document.querySelector('#aiCommandInput');
const aiCommandButton = document.querySelector('#aiCommandButton');
const aiSuggestionButtons = [...document.querySelectorAll('[data-ai-suggestion]')];
const playerViewButton = document.querySelector('#playerViewButton');
const playerViewLabel = document.querySelector('#playerViewLabel');
const streetViewHint = document.querySelector('#streetViewHint');
const developerSection = document.querySelector('.developer-section');
const editorToolbar = document.querySelector('#editorToolbar');
const editorToggle = document.querySelector('#editorToggle');
const closeEditor = document.querySelector('#closeEditor');
const toolbarHead = editorToolbar.querySelector('.toolbar-head');
const modelPageTabs = document.querySelector('#modelPageTabs');
const modelTable = document.querySelector('#modelTable');
const gemStatus = document.querySelector('#gemStatus');
const gemGoalInput = document.querySelector('#gemGoalInput');
const gemGoalValue = document.querySelector('#gemGoalValue');
const seekerCountInput = document.querySelector('#seekerCountInput');
const seekerCountValue = document.querySelector('#seekerCountValue');
const seekerSpeedInput = document.querySelector('#seekerSpeedInput');
const seekerSpeedValue = document.querySelector('#seekerSpeedValue');
const newGameButton = document.querySelector('#newGameButton');
const pauseButton = document.querySelector('#pauseButton');
const backToStartButton = document.querySelector('#backToStartButton');
const resumeMenuButton = document.querySelector('#resumeMenuButton');
const saveLayoutButton = document.querySelector('#saveLayoutButton');
const editorSaveButton = document.querySelector('#editorSaveButton');
const rotateToolButton = document.querySelector('#rotateToolButton');
const toolHint = document.querySelector('#toolHint');
const pauseOverlay = document.querySelector('#pauseOverlay');
const pauseOverlayText = document.querySelector('#pauseOverlayText');
const toast = document.querySelector('#toast');
const seekerCountdown = document.querySelector('#seekerCountdown');
const seekerCountdownText = document.querySelector('#seekerCountdownText');
const agentPulse = document.querySelector('#agentPulse');
const agentPulseText = document.querySelector('#agentPulseText');
const screenFlash = document.querySelector('#screenFlash');
const seekerPanel = document.querySelector('#seekerPanel');
const seekerPanelToggle = document.querySelector('#seekerPanelToggle');
const seekerList = document.querySelector('#seekerList');
const mobileControls = document.querySelector('#mobileControls');
const mobileJoystick = document.querySelector('#mobileJoystick');
const mobileJoystickKnob = document.querySelector('#mobileJoystickKnob');
const mobileRunButton = document.querySelector('#mobileRunButton');
const roundPanel = document.querySelector('#roundPanel');
const roundTitle = document.querySelector('#roundTitle');
const roundText = document.querySelector('#roundText');
const roundScore = document.querySelector('#roundScore');
const playAgainButton = document.querySelector('#playAgainButton');
const controlBindButtons = [...document.querySelectorAll('[data-control]')];
const touchControlsToggle = document.querySelector('#touchControlsToggle');
const blockModeControls = document.querySelector('#blockModeControls');
const blockModeButtons = [...document.querySelectorAll('[data-block-mode]')];
const floorZoneControls = document.querySelector('#floorZoneControls');
const floorZoneButtons = [...document.querySelectorAll('[data-floor-zone]')];

startOpenaiLogo.src = openAiLogoUrl;
githubLogo.src = githubIconUrl;
if (aiRailLogo) aiRailLogo.src = openAiLogoUrl;

let controlBindings = loadControlBindings();
let pendingControl = null;
let lastTouchControlsPointerToggleAt = -Infinity;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'default' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000205);

const camera = new THREE.OrthographicCamera(-12, 12, 8, -8, 0.1, 200);
const streetCamera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200);
const cameraOffset = new THREE.Vector3(14, 14, 14);
const cameraFocus = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const streetCameraDesired = new THREE.Vector3();
const streetCameraLookAt = new THREE.Vector3();
const streetCameraForward = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const keys = new Set();
const soundscape = new AmbientSoundscape();
let modelLoaderPromise = null;
const modelCache = new Map();
const tempBox = new THREE.Box3();
const tempSize = new THREE.Vector3();
const tempCenter = new THREE.Vector3();

const world = new THREE.Group();
const dynamic = new THREE.Group();
const hoverGroup = new THREE.Group();
scene.add(world, dynamic, hoverGroup);

const hemi = new THREE.HemisphereLight(0xc9dcff, 0x18202d, 1.65);
const sun = new THREE.DirectionalLight(0xc9dcff, 1.45);
sun.position.set(8, 16, 9);
sun.castShadow = false;
scene.add(hemi, sun);

const openAiLogoTexture = new THREE.TextureLoader().load(openAiLogoUrl);
openAiLogoTexture.colorSpace = THREE.SRGBColorSpace;
openAiLogoTexture.anisotropy = 4;

const materials = {
  river: new THREE.MeshBasicMaterial({ color: 0x0f2940, transparent: true, opacity: 0.96, depthWrite: false }),
  tile: new THREE.MeshToonMaterial({ color: 0xf5f5ef }),
  tileSide: new THREE.MeshToonMaterial({ color: 0xe8ece8 }),
  rim: new THREE.MeshToonMaterial({ color: 0xfafaf7 }),
  block: new THREE.MeshToonMaterial({ color: 0xe7eeee }),
  tileAtrium: new THREE.MeshToonMaterial({ color: 0xf5f5ef }),
  tileGarden: new THREE.MeshToonMaterial({ color: 0xd8facb }),
  tileRose: new THREE.MeshToonMaterial({ color: 0xffdada }),
  tileWinter: new THREE.MeshToonMaterial({ color: 0xf4fbff }),
  tileSignal: new THREE.MeshToonMaterial({ color: 0xffdfbd }),
  tileDock: new THREE.MeshToonMaterial({ color: 0xcfecff }),
  tileArchive: new THREE.MeshToonMaterial({ color: 0xe9d7ff }),
  blockAtrium: new THREE.MeshToonMaterial({ color: 0xe7eeee }),
  blockGarden: new THREE.MeshToonMaterial({ color: 0xbdecb6 }),
  blockRose: new THREE.MeshToonMaterial({ color: 0xf1caca }),
  blockWinter: new THREE.MeshToonMaterial({ color: 0xe1edf5 }),
  blockSignal: new THREE.MeshToonMaterial({ color: 0xf2c99c }),
  blockDock: new THREE.MeshToonMaterial({ color: 0xb7dced }),
  blockArchive: new THREE.MeshToonMaterial({ color: 0xd8c2f4 }),
  stair: new THREE.MeshToonMaterial({ color: 0xe2e9e9 }),
  box: new THREE.MeshToonMaterial({ color: 0xa9774d }),
  boxDark: new THREE.MeshToonMaterial({ color: 0x6e482f }),
  player: new THREE.MeshToonMaterial({ color: 0x2496e8 }),
  seeker: new THREE.MeshToonMaterial({ color: 0xff675f }),
  seekerDark: new THREE.MeshToonMaterial({ color: 0x5f1616 }),
  seekerVision: new THREE.MeshBasicMaterial({
    color: 0xffdf8a,
    transparent: true,
    opacity: 0.27,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  seekerVisionCore: new THREE.MeshBasicMaterial({
    color: 0xfff3bc,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  seekerVisionEdge: new THREE.LineBasicMaterial({
    color: 0xffc44c,
    transparent: true,
    opacity: 0.52,
    depthWrite: false
  }),
  flashlightBody: new THREE.MeshToonMaterial({ color: 0x1d2024 }),
  flashlightLens: new THREE.MeshBasicMaterial({ color: 0xfff0a6 }),
  flashlightGlow: new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.85, depthWrite: false }),
  gem: new THREE.MeshStandardMaterial({
    color: 0x38bfff,
    roughness: 0.1,
    metalness: 0.12,
    emissive: 0x0a9df2,
    emissiveIntensity: 0.88
  }),
  gemDeep: new THREE.MeshStandardMaterial({
    color: 0x076cc7,
    roughness: 0.14,
    metalness: 0.12,
    emissive: 0x035da9,
    emissiveIntensity: 0.68
  }),
  gemGlow: new THREE.MeshBasicMaterial({
    color: 0x49dfff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  gemHighlight: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  entry: new THREE.MeshToonMaterial({ color: 0x22252a }),
  treeTrunk: new THREE.MeshToonMaterial({ color: 0x8a643f }),
  treeLeaf: new THREE.MeshToonMaterial({ color: 0x42c560 }),
  shrubA: new THREE.MeshToonMaterial({ color: 0x49bf6d }),
  shrubB: new THREE.MeshToonMaterial({ color: 0x3daa62 }),
  flowerStem: new THREE.MeshToonMaterial({ color: 0x2e9b53 }),
  flowerPink: new THREE.MeshToonMaterial({ color: 0xff6aa8 }),
  flowerPurple: new THREE.MeshToonMaterial({ color: 0xa66cff }),
  mushroomStem: new THREE.MeshToonMaterial({ color: 0xf5e4c8 }),
  mushroomCap: new THREE.MeshToonMaterial({ color: 0xe94f4a }),
  gardenRock: new THREE.MeshToonMaterial({ color: 0xaeb7b3 }),
  trafficCone: new THREE.MeshToonMaterial({ color: 0xff7518 }),
  trafficWhite: new THREE.MeshToonMaterial({ color: 0xfaf9ee }),
  roadBarrier: new THREE.MeshToonMaterial({ color: 0xf3e1b9 }),
  streetPaint: new THREE.MeshBasicMaterial({ color: 0xffd447, transparent: true, opacity: 0.88, depthWrite: false }),
  openaiMark: new THREE.MeshBasicMaterial({ color: 0x8d9294, transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide }),
  gemSpawn: new THREE.MeshBasicMaterial({ color: 0x27c7ef, transparent: true, opacity: 0.7, depthWrite: false }),
  stoplight: new THREE.MeshToonMaterial({ color: 0x25292b }),
  red: new THREE.MeshBasicMaterial({ color: 0xff3d38 }),
  yellow: new THREE.MeshBasicMaterial({ color: 0xffd447 }),
  green: new THREE.MeshBasicMaterial({ color: 0x32d46f }),
  escapePad: new THREE.MeshBasicMaterial({ color: 0xffd447, transparent: true, opacity: 0.72, depthWrite: false, side: THREE.DoubleSide }),
  escapeBeam: new THREE.MeshBasicMaterial({ color: 0xffe66d, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
  escapeGlow: new THREE.MeshBasicMaterial({ color: 0xfff1a6, transparent: true, opacity: 0.82, depthWrite: false }),
  escapeShip: new THREE.MeshToonMaterial({ color: 0xe4ebef }),
  escapeShipDark: new THREE.MeshToonMaterial({ color: 0x56616e }),
  escapeShipCanopy: new THREE.MeshBasicMaterial({ color: 0x78d9ff, transparent: true, opacity: 0.82 }),
  aiRoverBody: new THREE.MeshToonMaterial({ color: 0xfcfcf7 }),
  aiRoverTop: new THREE.MeshToonMaterial({ color: 0xffffff }),
  aiRoverDark: new THREE.MeshToonMaterial({ color: 0x2b2d30 }),
  aiRoverLight: new THREE.MeshBasicMaterial({ color: 0x7fdcff, transparent: true, opacity: 0.86 }),
  aiRoverGlow: new THREE.MeshBasicMaterial({ color: 0x55d8ff, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }),
  aiRoverLogo: new THREE.MeshBasicMaterial({
    map: openAiLogoTexture,
    color: 0x050505,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    side: THREE.DoubleSide
  }),
  aiShock: new THREE.MeshBasicMaterial({ color: 0x79ecff, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }),
  aiElectricBeam: new THREE.MeshBasicMaterial({ color: 0x8ef7ff, transparent: true, opacity: 0.72, depthWrite: false }),
  aiGreenBeam: new THREE.MeshBasicMaterial({ color: 0x72ff9a, transparent: true, opacity: 0.66, depthWrite: false }),
  aiAmberBeam: new THREE.MeshBasicMaterial({ color: 0xffd447, transparent: true, opacity: 0.72, depthWrite: false }),
  tracker: new THREE.MeshBasicMaterial({ color: 0xff1e1e, transparent: true, opacity: 0.82, depthWrite: false }),
  trackerGlow: new THREE.MeshBasicMaterial({ color: 0xff3d38, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })
};
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x050505 });
const softEdgeMaterial = new THREE.LineBasicMaterial({ color: 0x2a2b29 });
const riverLineMaterial = new THREE.LineBasicMaterial({ color: 0x5ca9c7, transparent: true, opacity: 0.54, depthWrite: false });
const riverCurrentMaterial = new THREE.MeshBasicMaterial({
  color: 0x2f88ad,
  transparent: true,
  opacity: 0.2,
  depthWrite: false,
  side: THREE.DoubleSide
});
const hoverMaterial = new THREE.MeshBasicMaterial({ color: 0x00a6ff, transparent: true, opacity: 0.28, depthWrite: false });
const alertCanvas = document.createElement('canvas');
alertCanvas.width = 128;
alertCanvas.height = 128;
const alertCtx = alertCanvas.getContext('2d');
alertCtx.clearRect(0, 0, 128, 128);
alertCtx.font = '900 112px Arial Black, Impact, sans-serif';
alertCtx.textAlign = 'center';
alertCtx.textBaseline = 'middle';
alertCtx.lineJoin = 'round';
alertCtx.strokeStyle = '#fffdf8';
alertCtx.lineWidth = 18;
alertCtx.strokeText('!', 64, 63);
alertCtx.strokeStyle = '#0b0d0f';
alertCtx.lineWidth = 8;
alertCtx.strokeText('!', 64, 63);
alertCtx.fillStyle = '#ee1616';
alertCtx.fillText('!', 64, 63);
const alertTexture = new THREE.CanvasTexture(alertCanvas);
alertTexture.colorSpace = THREE.SRGBColorSpace;
const alertMaterial = new THREE.SpriteMaterial({
  map: alertTexture,
  transparent: true,
  depthWrite: false
});
const dustCanvas = document.createElement('canvas');
dustCanvas.width = 64;
dustCanvas.height = 64;
const dustCtx = dustCanvas.getContext('2d');
const dustGradient = dustCtx.createRadialGradient(32, 32, 3, 32, 32, 31);
dustGradient.addColorStop(0, 'rgba(184, 174, 154, 0.94)');
dustGradient.addColorStop(0.52, 'rgba(202, 190, 166, 0.58)');
dustGradient.addColorStop(0.82, 'rgba(218, 207, 184, 0.22)');
dustGradient.addColorStop(1, 'rgba(214, 205, 188, 0)');
dustCtx.fillStyle = dustGradient;
dustCtx.fillRect(0, 0, 64, 64);
const dustTexture = new THREE.CanvasTexture(dustCanvas);
dustTexture.colorSpace = THREE.SRGBColorSpace;
const dustMaterial = new THREE.SpriteMaterial({
  map: dustTexture,
  transparent: true,
  opacity: 0.74,
  depthWrite: false
});
const ZONE_STYLES = {
  classic: { tile: 'tile', block: 'block', map: '#fafaf4' },
  atrium: { tile: 'tileAtrium', block: 'blockAtrium', map: '#fafaf4' },
  garden: { tile: 'tileGarden', block: 'blockGarden', map: '#d8facb' },
  rose: { tile: 'tileRose', block: 'blockRose', map: '#ffdada' },
  winter: { tile: 'tileWinter', block: 'blockWinter', map: '#eaf7ff' },
  signal: { tile: 'tileSignal', block: 'blockSignal', map: '#ffdfbd' },
  dock: { tile: 'tileDock', block: 'blockDock', map: '#cfecff' },
  archive: { tile: 'tileArchive', block: 'blockArchive', map: '#e9d7ff' }
};
const MODEL_PROPS = {
  bridgeLight: { url: new URL('../assets/home_models/traffic_light.glb', import.meta.url).href, fit: 0.62, rotation: Math.PI / 4, blocking: false },
  trafficLight: { url: new URL('../assets/home_models/traffic_light.glb', import.meta.url).href, fit: 0.76, rotation: Math.PI / 4, blocking: false },
  housePlant: { url: new URL('../assets/home_models/house_plant.glb', import.meta.url).href, fit: 1.05, rotation: -Math.PI / 6, blocking: false },
  floorLamp: { url: new URL('../assets/home_models/floor_lamp.glb', import.meta.url).href, fit: 0.72, rotation: Math.PI / 5, blocking: false },
  sideTable: { url: new URL('../assets/home_models/nightstand/ClassicNightstand_01_1k.gltf', import.meta.url).href, fit: 0.98, rotation: -Math.PI / 5, blocking: false },
  couch: { url: new URL('../assets/home_models/sofa/Sofa_01_1k.gltf', import.meta.url).href, fit: 1.26, rotation: Math.PI / 2, blocking: false },
  armchair: { url: new URL('../assets/home_models/armchair/ArmChair_01_1k.gltf', import.meta.url).href, fit: 1.02, rotation: -Math.PI / 4, blocking: false },
  bookshelf: { url: new URL('../assets/home_models/bookshelf/wooden_bookshelf_worn_1k.gltf', import.meta.url).href, fit: 1.38, rotation: Math.PI / 2, blocking: false },
  woodenTable: { url: new URL('../assets/home_models/wooden_table/wooden_table_02_1k.gltf', import.meta.url).href, fit: 1.2, rotation: 0, blocking: false },
  oilLamp: { url: new URL('../assets/home_models/oil_lamp/vintage_oil_lamp_1k.gltf', import.meta.url).href, fit: 0.78, rotation: 0, blocking: false },
  snowman: { url: new URL('../assets/home_models/seasonal/snowman.glb', import.meta.url).href, fit: 1.06, rotation: 0, blocking: false },
  winterTree: { url: new URL('../assets/home_models/seasonal/tree-decorated-snow.glb', import.meta.url).href, fit: 1.3, rotation: Math.PI / 5, blocking: false },
  present: { url: new URL('../assets/home_models/seasonal/present-a-cube.glb', import.meta.url).href, fit: 0.9, rotation: Math.PI / 4, blocking: false },
  reindeer: { url: new URL('../assets/home_models/seasonal/reindeer.glb', import.meta.url).href, fit: 1.25, rotation: -Math.PI / 2, blocking: false },
  sled: { url: new URL('../assets/home_models/seasonal/sled.glb', import.meta.url).href, fit: 1.28, rotation: Math.PI / 2, blocking: false },
  wreath: { url: new URL('../assets/home_models/seasonal/wreath-decorated.glb', import.meta.url).href, fit: 0.74, rotation: 0, blocking: false }
};
const EDITOR_PROP_TOOLS = new Set([
  'tree', 'trafficLight', 'bridgeLight', 'housePlant', 'snowman', 'winterTree', 'present',
  'floorLamp', 'sideTable', 'bookshelf', 'couch', 'armchair', 'woodenTable', 'oilLamp',
  'reindeer', 'sled', 'wreath', 'shrub', 'flowerPatch', 'mushrooms', 'gardenRocks',
  'trafficCone', 'roadBarrier', 'streetMarking', 'openaiFloorLogo'
]);
const MODEL_THUMBS = {
  tree: new URL('../assets/home_models/thumbs/tree.png', import.meta.url).href,
  housePlant: new URL('../assets/home_models/thumbs/house_plant.png', import.meta.url).href,
  trafficLight: new URL('../assets/home_models/thumbs/traffic_light.png', import.meta.url).href,
  bridgeLight: new URL('../assets/home_models/thumbs/bridge_light.png', import.meta.url).href,
  floorLamp: new URL('../assets/home_models/thumbs/floor_lamp.png', import.meta.url).href,
  armchair: new URL('../assets/home_models/thumbs/ArmChair_01.png', import.meta.url).href,
  sideTable: new URL('../assets/home_models/thumbs/ClassicNightstand_01.png', import.meta.url).href,
  shrub: new URL('../assets/home_models/thumbs/shrub.png', import.meta.url).href,
  flowerPatch: new URL('../assets/home_models/thumbs/flower_patch.png', import.meta.url).href,
  mushrooms: new URL('../assets/home_models/thumbs/mushrooms.png', import.meta.url).href,
  gardenRocks: new URL('../assets/home_models/thumbs/garden_rocks.png', import.meta.url).href,
  trafficCone: new URL('../assets/home_models/thumbs/traffic_cone.png', import.meta.url).href,
  roadBarrier: new URL('../assets/home_models/thumbs/road_barrier.png', import.meta.url).href,
  streetMarking: new URL('../assets/home_models/thumbs/street_marking.png', import.meta.url).href,
  openaiFloorLogo: new URL('../assets/home_models/thumbs/openai_floor_logo.png', import.meta.url).href,
  present: new URL('../assets/home_models/thumbs/present-a-cube.png', import.meta.url).href,
  reindeer: new URL('../assets/home_models/thumbs/reindeer.png', import.meta.url).href,
  sled: new URL('../assets/home_models/thumbs/sled.png', import.meta.url).href,
  snowman: new URL('../assets/home_models/thumbs/snowman.png', import.meta.url).href,
  couch: new URL('../assets/home_models/thumbs/Sofa_01.png', import.meta.url).href,
  winterTree: new URL('../assets/home_models/thumbs/tree-decorated-snow.png', import.meta.url).href,
  oilLamp: new URL('../assets/home_models/thumbs/vintage_oil_lamp.png', import.meta.url).href,
  bookshelf: new URL('../assets/home_models/thumbs/wooden_bookshelf_worn.png', import.meta.url).href,
  woodenTable: new URL('../assets/home_models/thumbs/wooden_table_02.png', import.meta.url).href,
  wreath: new URL('../assets/home_models/thumbs/wreath-decorated.png', import.meta.url).href
};
const MODEL_CATALOG = [
  { tool: 'tree', label: 'Tree', pages: ['general', 'garden'] },
  { tool: 'housePlant', label: 'Plant', pages: ['general', 'atrium', 'garden'] },
  { tool: 'shrub', label: 'Shrub', pages: ['garden'] },
  { tool: 'flowerPatch', label: 'Flowers', pages: ['garden'] },
  { tool: 'mushrooms', label: 'Mushrooms', pages: ['garden'] },
  { tool: 'gardenRocks', label: 'Rocks', pages: ['garden'] },
  { tool: 'trafficCone', label: 'Traffic cone', pages: ['general', 'atrium', 'signal'] },
  { tool: 'roadBarrier', label: 'Street barrier', pages: ['general', 'atrium', 'signal'] },
  { tool: 'streetMarking', label: 'Street mark', pages: ['atrium', 'signal'] },
  { tool: 'openaiFloorLogo', label: 'OpenAI mark', pages: ['atrium', 'archive'] },
  { tool: 'trafficLight', label: 'Traffic light', pages: ['general', 'signal'] },
  { tool: 'bridgeLight', label: 'Bridge signal', pages: ['general', 'signal', 'dock'] },
  { tool: 'floorLamp', label: 'Floor lamp', pages: ['general', 'atrium', 'signal'] },
  { tool: 'sideTable', label: 'Nightstand', pages: ['general', 'atrium', 'archive'] },
  { tool: 'woodenTable', label: 'Wood table', pages: ['general', 'atrium', 'dock'] },
  { tool: 'armchair', label: 'Armchair', pages: ['general', 'atrium', 'archive'] },
  { tool: 'couch', label: 'Sofa', pages: ['general', 'atrium'] },
  { tool: 'bookshelf', label: 'Bookshelf', pages: ['general', 'archive'] },
  { tool: 'oilLamp', label: 'Oil lamp', pages: ['general', 'archive', 'dock'] },
  { tool: 'snowman', label: 'Snowman', pages: ['winter'] },
  { tool: 'winterTree', label: 'Snow tree', pages: ['winter', 'garden'] },
  { tool: 'present', label: 'Present', pages: ['winter', 'garden'] },
  { tool: 'reindeer', label: 'Reindeer', pages: ['winter'] },
  { tool: 'sled', label: 'Sled', pages: ['winter'] },
  { tool: 'wreath', label: 'Wreath', pages: ['winter', 'archive'] }
];
const MODEL_PAGES = [
  { key: 'all', label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'atrium', label: 'Center' },
  { key: 'garden', label: 'Garden' },
  { key: 'signal', label: 'Signal' },
  { key: 'winter', label: 'Winter' },
  { key: 'archive', label: 'Archive' },
  { key: 'dock', label: 'Dock' }
];
let activeModelPage = 'all';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const gemTopGeometry = new THREE.CylinderGeometry(0.44, 0.82, 0.32, 6, 1, false);
const gemBottomGeometry = new THREE.ConeGeometry(0.82, 0.76, 6, 1);
const gemGlowSphereGeometry = new THREE.SphereGeometry(0.9, 20, 12);
const gemFloorGlowGeometry = new THREE.RingGeometry(0.46, 0.96, 38);
const gemGlintGeometry = new THREE.PlaneGeometry(0.3, 0.052);
const gemSpawnRingGeometry = new THREE.TorusGeometry(0.52, 0.035, 8, 28);
const gemSpawnCoreGeometry = new THREE.OctahedronGeometry(0.16, 0);
const trackerRingGeometry = new THREE.TorusGeometry(0.54, 0.035, 8, 32);
const trackerGlowGeometry = new THREE.RingGeometry(0.34, 0.72, 32);
const escapePadGeometry = new THREE.TorusGeometry(0.82, 0.075, 10, 36);
const escapeGlowGeometry = new THREE.RingGeometry(0.48, 1.22, 40);
const escapeBeamGeometry = new THREE.ConeGeometry(0.86, 3.8, 32, 1, true);
const aiRoverBodyGeometry = new THREE.CylinderGeometry(0.62, 0.76, 0.26, 36);
const aiRoverGlowGeometry = new THREE.RingGeometry(0.58, 1.08, 42);
const aiRoverLogoGeometry = new THREE.PlaneGeometry(0.86, 0.86);
const aiShockGeometry = new THREE.RingGeometry(0.68, 0.76, 48);
const aiBeamGeometry = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
const sphereGeometry = new THREE.SphereGeometry(0.26, 18, 14);
const smallSphereGeometry = new THREE.SphereGeometry(0.1, 12, 8);
const cylinderGeometry = new THREE.CylinderGeometry(0.16, 0.16, 1, 16);
const coneGeometry = new THREE.ConeGeometry(0.78, 1.15, 6);
const shrubGeometry = new THREE.DodecahedronGeometry(0.48, 0);
const rockGeometry = new THREE.DodecahedronGeometry(0.36, 0);
const flowerBloomGeometry = new THREE.DodecahedronGeometry(0.18, 0);
const mushroomCapGeometry = new THREE.SphereGeometry(0.34, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
const openAiLoopGeometry = new THREE.TorusGeometry(0.19, 0.028, 8, 26);
const seekerVisionGeometry = createVisionFanGeometry(SEEKER_VISION_RANGE, SEEKER_VISION_ANGLE, SEEKER_VISION_SEGMENTS);
const seekerVisionEdgeGeometry = createVisionFanEdgeGeometry(SEEKER_VISION_RANGE, SEEKER_VISION_ANGLE, SEEKER_VISION_SEGMENTS);
const seekerFlashlightCoreGeometry = createVisionFanGeometry(SEEKER_VISION_RANGE * 0.74, SEEKER_VISION_ANGLE * 0.34, SEEKER_VISION_SEGMENTS);
const playerParts = [];
const seekerParts = [];
const BOX_PUSH_DURATION = 0.22;
const BOX_PUSH_CHAIN_AFTER = 0.2;

const state = {
  level: null,
  worldPreset: 'atrium',
  difficulty: 'medium',
  customLayoutActive: false,
  sandboxMode: false,
  started: false,
  cells: [],
  boxes: [],
  gems: [],
  seekers: [],
  player: null,
  playerVelocity: new THREE.Vector3(),
  escapeCell: null,
  escapeGroup: null,
  escapeUnlocked: false,
  escapeReveal: null,
  cameraOverride: null,
  runStats: {
    elapsed: 0,
    traps: 0,
    sightings: 0,
    bestGemStreak: 0,
    allGemsCollected: false,
    escaped: false
  },
  selectedTool: 'block',
  blockMode: 'add',
  floorZone: 'atrium',
  selectedDir: 'n',
  editorOpen: false,
  hoveredCell: null,
  editorPaint: null,
  editorToolbarPosition: null,
  editorToolbarDrag: null,
  mapExpanded: false,
  mapEditorMode: false,
  mapSelectMode: false,
  mapSelectedCell: null,
  mapSelection: null,
  mapSelectDrag: null,
  mapClipboard: null,
  mapUndoStack: [],
  mapFullscreen: false,
  mapPanMode: false,
  mapPanDrag: null,
  mapPanX: 0,
  mapPanY: 0,
  mapZoomPercent: 100,
  mapPaint: null,
  mapPanelPosition: null,
  mapPanelDrag: null,
  mapExpandHold: null,
  mapZoomHold: null,
  editorWorldDirty: false,
  editorRebuildQueued: false,
  editorMapDrawQueued: false,
  mobileJoystick: {
    active: false,
    pointerId: null,
    screenX: 0,
    screenY: 0
  },
  mobileRunActive: false,
  mobileRunPointerId: null,
  touchControlsForced: localStorage.getItem(TOUCH_CONTROLS_STORAGE_KEY) === '1',
  tilePickMeshes: [],
  dustPuffs: [],
  playerDustTimer: 0,
  round: 'menu',
  collected: 0,
  releaseCountdown: 4.2,
  nextSeekerAt: 0,
  seekersSpawned: 0,
  nextSeekerId: 1,
  seekerTrackers: [],
  trackerCooldown: 2.6,
  screenFlashTimer: 0,
  caughtCueCooldown: 0,
  signalPingTimer: PLAYER_SIGNAL_INTERVAL,
  signalPingCell: null,
  signalPingArea: null,
  squad: {
    lastSeenCell: null,
    lastSeenTimer: 0,
    predictedCell: null,
    focusCell: null,
    focusArea: null,
    focusRadius: SEEKER_BLACKBOARD_RADIUS,
    focusTimer: 0,
    abilityCooldown: 0,
    abilityLabel: '',
    playerPreviousCell: null,
    playerMoveVector: { dx: 0, dz: 0 },
    searchClaims: {}
  },
  seekerPanelCollapsed: false,
  seekerPanelSignature: '',
  seekerPanelAutoCollapsed: false,
  menuPausedGame: false,
  aiPausedGame: false,
  playerViewMode: false,
  aiCompanionEnabled: false,
  aiCompanionGroup: null,
  aiCompanionBusy: false,
  aiCompanionMessages: [],
  aiChargeTimer: null,
  aiPlayerSpeedTimer: 0,
  aiPlayerSpeedMultiplier: 1,
  aiSeekerSlowTimer: 0,
  aiSeekerSlowMultiplier: 1,
  aiSeekerStunTimer: 0,
  aiDifficultyTimer: 0,
  aiDifficultyMultiplier: 1,
  aiShockwaves: [],
  aiBeams: [],
  streetLookPitch: 0,
  streetLookDrag: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0
  },
  streetViewHintTimer: 0,
  buildSerial: 0,
  toastTimer: 0,
  pauseOverlayTimer: 0,
  riverLines: [],
  riverCurrents: [],
  minimapDirty: true,
  minimapTimer: 0
};
const canExposeDebug = (
  new URLSearchParams(window.location.search).has('verify') &&
  (import.meta.env.DEV || ['localhost', '127.0.0.1'].includes(window.location.hostname))
);
if (canExposeDebug) {
  window.__seekerLabyrinthDebug = {
    state,
    entryReport: () => {
      const entries = seekerEntries();
      const entry = entries[0]?.cell || getCell(state.level?.entry?.x, state.level?.entry?.z);
      return {
        entry: entry ? { x: entry.x, z: entry.z, active: entry.active, height: entry.height, prop: entry.prop, stairs: entry.stairs } : null,
        entries: entries.map((item) => ({
          x: item.cell.x,
          z: item.cell.z,
          face: item.face || null,
          active: item.cell.active,
          height: item.cell.height,
          prop: item.cell.prop,
          stairs: item.cell.stairs
        })),
        exits: DIRECTION_KEYS.map((key) => {
          const cell = entry ? activeNeighbor(entry, key) : null;
          return cell ? {
            key,
            x: cell.x,
            z: cell.z,
            active: cell.active,
            height: cell.height,
            prop: cell.prop,
            stairs: cell.stairs,
            box: Boolean(boxAt(cell.x, cell.z)),
            open: isCellOpen(cell)
          } : null;
        }).filter(Boolean),
        seekersSpawned: state.seekersSpawned,
        signalPingArea: state.signalPingArea,
        signalPingCell: state.signalPingCell ? { x: state.signalPingCell.x, z: state.signalPingCell.z } : null,
        squad: {
          lastSeenCell: state.squad.lastSeenCell ? { x: state.squad.lastSeenCell.x, z: state.squad.lastSeenCell.z } : null,
          predictedCell: state.squad.predictedCell ? { x: state.squad.predictedCell.x, z: state.squad.predictedCell.z } : null,
          focusCell: state.squad.focusCell ? { x: state.squad.focusCell.x, z: state.squad.focusCell.z } : null,
          focusArea: state.squad.focusArea,
          focusTimer: state.squad.focusTimer,
          claims: state.squad.searchClaims
        },
        seekers: state.seekers.map((seeker) => ({
          id: seeker.id,
          role: seeker.role,
          x: seeker.cell.x,
          z: seeker.cell.z,
          spawn: seeker.spawn || null,
          moving: Boolean(seeker.moving),
          target: seeker.moving ? { x: seeker.moving.to.x, z: seeker.moving.to.z } : null
        }))
      };
    }
  };
}
const hoverMesh = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.96, 0.035, CELL * 0.96), hoverMaterial);
hoverMesh.visible = false;
hoverGroup.add(hoverMesh);

function cellIndex(x, z) {
  return z * state.level.width + x;
}

function getCell(x, z) {
  if (!state.level || x < 0 || z < 0 || x >= state.level.width || z >= state.level.height) return null;
  return state.cells[cellIndex(x, z)] || null;
}

function eachCell(callback) {
  for (const cell of state.cells) callback(cell);
}

function worldPosition(x, z, y = 0) {
  const ox = (x - state.level.width / 2 + 0.5) * CELL;
  const oz = (z - state.level.height / 2 + 0.5) * CELL;
  return new THREE.Vector3(ox, y, oz);
}

function cellFromWorldPosition(x, z) {
  if (!state.level) return null;
  return getCell(Math.floor(x / CELL + state.level.width / 2), Math.floor(z / CELL + state.level.height / 2));
}

function cellHeight(cell) {
  return Math.max(0, cell?.height || 0) * LEVEL_HEIGHT;
}

function stairHighNeighbor(cell) {
  if (!cell?.stairs) return null;
  const dir = DIRECTIONS[cell.stairs];
  return getCell(cell.x + dir.dx, cell.z + dir.dz);
}

function stairLowNeighbor(cell) {
  if (!cell?.stairs) return null;
  const dir = DIRECTIONS[DIRECTIONS[cell.stairs].opposite];
  return getCell(cell.x + dir.dx, cell.z + dir.dz);
}

function validStair(cell) {
  if (!cell?.stairs) return false;
  const high = stairHighNeighbor(cell);
  const low = stairLowNeighbor(cell);
  const base = cellHeight(cell);
  return Boolean(
    high?.active &&
    low?.active &&
    cellHeight(high) > base + 0.001 &&
    Math.abs(cellHeight(low) - base) <= LEVEL_HEIGHT + 0.001
  );
}

function walkHeight(cell) {
  if (!cell) return 0;
  if (validStair(cell)) {
    const high = stairHighNeighbor(cell);
    const base = cellHeight(cell);
    return base + Math.max(0, cellHeight(high) - base) * 0.52;
  }
  return cellHeight(cell);
}

function isSameCell(a, b) {
  return Boolean(a && b && a.x === b.x && a.z === b.z);
}

function boxAt(x, z) {
  return state.boxes.find((box) => box.x === x && box.z === z) || null;
}

function seekerAt(x, z) {
  return state.seekers.find((seeker) => seeker.cell.x === x && seeker.cell.z === z && !seeker.moving) || null;
}

function propBlocks(cell) {
  if (!cell?.prop) return false;
  if (cell.prop === 'tree' || cell.prop === 'stoplight') return false;
  if (cell.prop === 'roadBarrier') return true;
  return MODEL_PROPS[cell.prop]?.blocking ?? false;
}

function isCellOpen(cell) {
  return Boolean(cell?.active && !propBlocks(cell));
}

function activeNeighbor(cell, key) {
  const dir = DIRECTIONS[key];
  return getCell(cell.x + dir.dx, cell.z + dir.dz);
}

function entryRefs() {
  const refs = Array.isArray(state.level?.entries) && state.level.entries.length
    ? state.level.entries
    : (state.level?.entry ? [state.level.entry] : []);
  const seen = new Set();
  return refs.filter((entry) => {
    const key = `${entry.x},${entry.z}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function seekerEntries() {
  return entryRefs()
    .map((entry) => ({ ...entry, cell: getCell(entry.x, entry.z) }))
    .filter((entry) => entry.cell);
}

function isEntryRefCell(cell, entry) {
  return Boolean(cell && entry && cell.x === entry.x && cell.z === entry.z);
}

function entryExitDirections(entry) {
  if (entry?.face && DIRECTIONS[entry.face]) {
    return [entry.face, ...DIRECTION_KEYS.filter((key) => key !== entry.face)];
  }
  return entry?.x <= 1 ? ['e', 's', 'n', 'w'] : ['s', 'e', 'w', 'n'];
}

function clearOneSeekerEntryPath(entryRef, cleared) {
  const entry = getCell(entryRef.x, entryRef.z);
  if (!entry) return;

  entry.active = true;
  entry.stairs = null;
  entry.prop = null;

  cleared.add(`${entry.x},${entry.z}`);
  const orderedDirections = entryExitDirections(entryRef);
  const neighbors = orderedDirections
    .map((key) => activeNeighbor(entry, key))
    .filter(Boolean);
  let exit = neighbors.find((cell) => cell.active && !propBlocks(cell) && (
    connectsByStairs(entry, cell) ||
    Math.abs(walkHeight(entry) - walkHeight(cell)) < 0.04
  ));

  if (!exit) {
    exit = neighbors.find((cell) => cell.active) || neighbors[0];
    if (exit) exit.active = true;
  }

  if (exit) {
    exit.active = true;
    exit.prop = null;
    cleared.add(`${exit.x},${exit.z}`);
  }
}

function clearSeekerEntryPath() {
  const entries = seekerEntries();
  if (!entries.length) return;
  const cleared = new Set();
  entries.forEach((entry) => clearOneSeekerEntryPath(entry, cleared));

  state.boxes = state.boxes.filter((box) => !cleared.has(`${box.x},${box.z}`));
}

function connectsByStairs(a, b) {
  if (!a || !b) return false;
  for (const stairCell of [a, b]) {
    if (!validStair(stairCell)) continue;
    const high = stairHighNeighbor(stairCell);
    const low = stairLowNeighbor(stairCell);
    if ((isSameCell(a, stairCell) && (isSameCell(b, high) || isSameCell(b, low))) ||
        (isSameCell(b, stairCell) && (isSameCell(a, high) || isSameCell(a, low)))) {
      return true;
    }
  }
  return false;
}

function canWalkBetween(a, b, actor = 'player') {
  if (!isCellOpen(a) || !isCellOpen(b)) return false;
  if (actor !== 'seeker' && seekerAt(b.x, b.z)) return false;
  if (actor === 'seeker' && boxAt(b.x, b.z)) return false;
  const diff = Math.abs(walkHeight(a) - walkHeight(b));
  if (actor !== 'box' && boxAt(b.x, b.z)) return actor === 'player' && diff < 0.04;
  return diff < 0.04 || connectsByStairs(a, b);
}

function setToast(message, options = {}) {
  toast.textContent = message;
  toast.classList.toggle('urgent', Boolean(options.urgent));
  toast.classList.remove('hidden');
  state.toastTimer = options.duration ?? 2.2;
}

function readAiSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_SETTINGS_STORAGE_KEY) || 'null');
    return {
      provider: saved?.provider === 'openai-compatible' ? 'openai-compatible' : 'openai',
      endpoint: typeof saved?.endpoint === 'string' ? saved.endpoint : '',
      key: typeof saved?.key === 'string' ? saved.key : '',
      model: typeof saved?.model === 'string' && saved.model.trim() ? saved.model.trim() : AI_RECOMMENDED_MODEL
    };
  } catch {
    return { provider: 'openai', endpoint: '', key: '', model: AI_RECOMMENDED_MODEL };
  }
}

function aiHasKey() {
  return Boolean(readAiSettings().key);
}

function normalizeAiModelValue(value) {
  return String(value || '')
    .replace(/\s*\(recommended\)\s*$/i, '')
    .trim() || AI_RECOMMENDED_MODEL;
}

function formatAiModelValue(model) {
  const normalized = normalizeAiModelValue(model);
  return normalized === AI_RECOMMENDED_MODEL ? `${normalized} (recommended)` : normalized;
}

function setAiModelEditing(editing) {
  if (!aiModel) return;
  if (editing) {
    aiModel.removeAttribute('readonly');
    aiModel.setAttribute('aria-readonly', 'false');
    aiModel.value = normalizeAiModelValue(aiModel.value);
    editAiModelButton?.classList.add('active');
    editAiModelButton?.setAttribute('aria-label', 'Finish editing model');
    editAiModelButton?.setAttribute('title', 'Finish editing model');
    aiModel.focus();
    aiModel.select();
    return;
  }
  const model = normalizeAiModelValue(aiModel.value);
  aiModel.value = formatAiModelValue(model);
  aiModel.setAttribute('readonly', '');
  aiModel.setAttribute('aria-readonly', 'true');
  editAiModelButton?.classList.remove('active');
  editAiModelButton?.setAttribute('aria-label', 'Edit model');
  editAiModelButton?.setAttribute('title', 'Edit model');
}

function renderAiCompanionLog() {
  if (!aiCompanionLog) return;
  const messages = state.aiCompanionMessages.slice(-4);
  const fallback = state.aiCompanionEnabled
    ? 'Rover online. Pick an example below or type what you want changed.'
    : 'Save an API key to bring the rover online.';
  aiCompanionLog.innerHTML = messages.length
    ? messages.map((message) => `<p>${escapeHtml(message)}</p>`).join('')
    : `<p>${fallback}</p>`;
  aiCompanionLog.scrollTop = aiCompanionLog.scrollHeight;
}

function addAiCompanionMessage(message) {
  if (state.aiCompanionMessages[state.aiCompanionMessages.length - 1] === message) {
    renderAiCompanionLog();
    return;
  }
  state.aiCompanionMessages.push(message);
  if (state.aiCompanionMessages.length > 12) state.aiCompanionMessages.splice(0, state.aiCompanionMessages.length - 12);
  renderAiCompanionLog();
}

function syncAiCompanionAvailability() {
  const available = aiHasKey();
  state.aiCompanionEnabled = available;
  aiCompanionBox?.classList.toggle('unavailable', !available);
  if (aiCompanionState) {
    aiCompanionState.textContent = available
      ? 'Rover online. It follows you and can use bounded game tools.'
      : 'Save an API key to spawn the rover.';
  }
  if (aiCommandInput) aiCommandInput.disabled = !available || state.aiCompanionBusy;
  if (aiCommandButton) aiCommandButton.disabled = !available || state.aiCompanionBusy;
  aiSuggestionButtons.forEach((button) => {
    button.disabled = state.aiCompanionBusy;
  });
  if (available) ensureAiCompanion();
  else removeAiCompanion();
  renderAiCompanionLog();
}

function syncAiPanel() {
  if (!aiPanel) return;
  const settings = readAiSettings();
  if (aiProvider) aiProvider.value = settings.provider;
  if (aiEndpoint) aiEndpoint.value = settings.endpoint;
  if (aiModel) {
    aiModel.value = formatAiModelValue(settings.model);
    setAiModelEditing(false);
  }
  if (aiKey) aiKey.value = '';
  if (aiStatus) {
    aiStatus.textContent = settings.key
      ? 'Optional AI key saved in this browser. Rover companion available.'
      : 'Local seeker agents active. No AI key connected.';
  }
  syncAiCompanionAvailability();
}

function setAiPanelTab(tab = 'chat') {
  const active = tab === 'settings' ? 'settings' : 'chat';
  aiTabButtons.forEach((button) => {
    const selected = button.dataset.aiTab === active;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  aiTabPanels.forEach((panel) => {
    const selected = panel.id === (active === 'settings' ? 'aiSettingsPane' : 'aiChatPane');
    panel.classList.toggle('active', selected);
    panel.hidden = !selected;
  });
}

function stopAiChargeAnimation() {
  if (state.aiChargeTimer) {
    window.clearTimeout(state.aiChargeTimer);
    state.aiChargeTimer = null;
  }
  aiPanel?.classList.remove('ai-charging');
  saveAiSettingsButton?.classList.remove('charging');
  if (saveAiSettingsButton) {
    saveAiSettingsButton.disabled = false;
    saveAiSettingsButton.textContent = 'Save locally';
  }
}

function runAiChargeAnimation() {
  if (!aiPanel) return;
  stopAiChargeAnimation();
  aiPanel.classList.add('ai-charging');
  if (aiStatus) aiStatus.textContent = 'Charging rover tools...';
  if (saveAiSettingsButton) {
    saveAiSettingsButton.classList.add('charging');
    saveAiSettingsButton.disabled = true;
    saveAiSettingsButton.textContent = 'Charging tools...';
  }
  if (state.aiCompanionGroup?.parent) addAiShockwave(state.aiCompanionGroup.position);
  state.aiChargeTimer = window.setTimeout(() => {
    stopAiChargeAnimation();
    syncAiPanel();
    addAiCompanionMessage('Rover: tools charged. Tell me how to bend the difficulty.');
  }, 1250);
}

function saveAiSettings() {
  const existing = readAiSettings();
  const next = {
    provider: aiProvider?.value === 'openai-compatible' ? 'openai-compatible' : 'openai',
    endpoint: aiEndpoint?.value?.trim() || '',
    key: aiKey?.value?.trim() || existing.key || '',
    model: normalizeAiModelValue(aiModel?.value || existing.model)
  };
  try {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    setAiModelEditing(false);
    syncAiPanel();
    if (next.key) runAiChargeAnimation();
    setToast(next.key ? 'Rover companion online.' : 'Optional AI settings saved locally.');
  } catch {
    setToast('Could not save AI settings in this browser.', { urgent: true });
  }
}

function clearAiSettings() {
  try {
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
  } catch {
    // Nothing else to do; the UI will still reset.
  }
  stopAiChargeAnimation();
  syncAiPanel();
  setToast('Optional AI settings cleared.');
}

function showPauseOverlay(message, { persist = false } = {}) {
  toast.classList.add('hidden');
  toast.classList.remove('urgent');
  state.toastTimer = 0;
  pauseOverlayText.textContent = message;
  pauseOverlay.classList.remove('hidden');
  state.pauseOverlayTimer = persist ? -1 : 0.9;
}

function hidePauseOverlay() {
  pauseOverlay.classList.add('hidden');
  state.pauseOverlayTimer = 0;
}

function loadEditorToolbarPosition() {
  if (state.editorToolbarPosition) return state.editorToolbarPosition;
  try {
    const saved = JSON.parse(localStorage.getItem(EDITOR_POSITION_STORAGE_KEY) || 'null');
    if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) {
      state.editorToolbarPosition = { left: saved.left, top: saved.top };
    }
  } catch {
    state.editorToolbarPosition = null;
  }
  return state.editorToolbarPosition;
}

function clampEditorToolbarPosition(left, top) {
  const width = editorToolbar.offsetWidth || editorToolbar.getBoundingClientRect().width || 320;
  const height = editorToolbar.offsetHeight || editorToolbar.getBoundingClientRect().height || 240;
  const margin = 12;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);
  return {
    left: Math.min(Math.max(left, margin), maxLeft),
    top: Math.min(Math.max(top, margin), maxTop)
  };
}

function applyEditorToolbarPosition(position, persist = false) {
  if (!position) {
    editorToolbar.style.left = '';
    editorToolbar.style.top = '';
    editorToolbar.style.transform = '';
    return;
  }
  const next = clampEditorToolbarPosition(position.left, position.top);
  state.editorToolbarPosition = next;
  editorToolbar.style.left = `${next.left}px`;
  editorToolbar.style.top = `${next.top}px`;
  editorToolbar.style.transform = 'none';
  if (persist) localStorage.setItem(EDITOR_POSITION_STORAGE_KEY, JSON.stringify(next));
}

function clampEditorToolbarToViewport() {
  if (!state.editorToolbarPosition) return;
  applyEditorToolbarPosition(state.editorToolbarPosition, true);
}

function beginEditorToolbarDrag(event) {
  if (event.button !== 0 || !state.editorOpen || event.target.closest('button')) return;
  const rect = editorToolbar.getBoundingClientRect();
  state.editorToolbarDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  editorToolbar.classList.add('dragging');
  applyEditorToolbarPosition({ left: rect.left, top: rect.top });
  toolbarHead.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function dragEditorToolbar(event) {
  const drag = state.editorToolbarDrag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  applyEditorToolbarPosition({
    left: event.clientX - drag.offsetX,
    top: event.clientY - drag.offsetY
  });
  event.preventDefault();
}

function endEditorToolbarDrag(event) {
  const drag = state.editorToolbarDrag;
  if (!drag || (event.pointerId !== undefined && drag.pointerId !== event.pointerId)) return;
  editorToolbar.classList.remove('dragging');
  if (toolbarHead.hasPointerCapture?.(drag.pointerId)) toolbarHead.releasePointerCapture(drag.pointerId);
  state.editorToolbarDrag = null;
  if (state.editorToolbarPosition) applyEditorToolbarPosition(state.editorToolbarPosition, true);
}

function clampMapPanelPosition(left, top) {
  const width = mapEditorPanel.offsetWidth || mapEditorPanel.getBoundingClientRect().width || 320;
  const height = mapEditorPanel.offsetHeight || mapEditorPanel.getBoundingClientRect().height || 240;
  const margin = 12;
  return {
    left: Math.min(Math.max(left, margin), Math.max(margin, window.innerWidth - width - margin)),
    top: Math.min(Math.max(top, margin), Math.max(margin, window.innerHeight - height - margin))
  };
}

function applyMapPanelPosition(position) {
  if (!position) return;
  const next = clampMapPanelPosition(position.left, position.top);
  state.mapPanelPosition = next;
  mapEditorPanel.style.left = `${next.left}px`;
  mapEditorPanel.style.top = `${next.top}px`;
  mapEditorPanel.style.right = 'auto';
}

function syncEditorWorkspaceClass() {
  editorToolbar.classList.toggle('map-workspace', state.editorOpen && state.mapExpanded);
}

function setMapFullscreen(force = !state.mapFullscreen) {
  state.mapFullscreen = force;
  if (force) state.mapExpanded = true;
  mapEditorPanel.classList.toggle('fullscreen', force);
  syncEditorWorkspaceClass();
  mapEditorPanel.classList.toggle('hidden', !state.mapExpanded);
  mapPanel?.classList.toggle('hidden', state.mapExpanded);
  if (!force && state.mapPanelPosition) applyMapPanelPosition(state.mapPanelPosition);
  updateMapEditorHint();
  state.minimapDirty = true;
  requestAnimationFrame(drawMiniMap);
}

function beginMapZoomHold(event, key, button) {
  if (event.button !== 0) return;
  const hold = {
    pointerId: event.pointerId,
    didHold: false,
    timer: window.setTimeout(() => {
      hold.didHold = true;
      setMapExpanded(true);
      setMapFullscreen(true);
    }, 360)
  };
  state[key] = hold;
  button.setPointerCapture?.(event.pointerId);
  button.classList.add('holding');
  event.preventDefault();
}

function endMapZoomHold(event, key, button, shortPressAction) {
  const hold = state[key];
  if (!hold || (event.pointerId !== undefined && event.pointerId !== hold.pointerId)) return;
  window.clearTimeout(hold.timer);
  button.classList.remove('holding');
  if (button.hasPointerCapture?.(hold.pointerId)) button.releasePointerCapture(hold.pointerId);
  state[key] = null;
  if (!hold.didHold) shortPressAction();
  button.dataset.skipClick = '1';
  window.setTimeout(() => {
    if (button.dataset.skipClick === '1') delete button.dataset.skipClick;
  }, 0);
  event.preventDefault();
}

function beginMapPanelDrag(event) {
  if (event.button !== 0 || event.target.closest('button')) return;
  const rect = mapEditorPanel.getBoundingClientRect();
  state.mapPanelDrag = {
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
  };
  mapEditorPanel.classList.add('dragging');
  applyMapPanelPosition({ left: rect.left, top: rect.top });
  mapEditorHead.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function dragMapPanel(event) {
  const drag = state.mapPanelDrag;
  if (!drag || drag.pointerId !== event.pointerId) return;
  applyMapPanelPosition({
    left: event.clientX - drag.offsetX,
    top: event.clientY - drag.offsetY
  });
  event.preventDefault();
}

function endMapPanelDrag(event) {
  const drag = state.mapPanelDrag;
  if (!drag || (event.pointerId !== undefined && drag.pointerId !== event.pointerId)) return;
  mapEditorPanel.classList.remove('dragging');
  if (mapEditorHead.hasPointerCapture?.(drag.pointerId)) mapEditorHead.releasePointerCapture(drag.pointerId);
  state.mapPanelDrag = null;
}

function makeLevelBuilder(width, height, theme = 'classic') {
  const cells = Array.from({ length: width * height }, (_, index) => ({
    x: index % width,
    z: Math.floor(index / width),
    active: false,
    height: 0,
    stairs: null,
    prop: null,
    propDir: null,
    gemSpawn: false,
    zone: null
  }));
  const cell = (x, z) => (x >= 0 && z >= 0 && x < width && z < height ? cells[z * width + x] : null);
  const carve = (x0, z0, x1, z1, zone = null) => {
    for (let z = z0; z <= z1; z += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const target = cell(x, z);
        if (target) {
          target.active = true;
          if (zone) target.zone = zone;
        }
      }
    }
  };
  const elevate = (x, z, heightValue = 1) => {
    const target = cell(x, z);
    if (!target) return;
    target.active = true;
    target.height = Math.min(MAX_HEIGHT, heightValue);
  };
  const stairs = (x, z, dir, heightValue = null) => {
    const target = cell(x, z);
    if (!target) return;
    target.active = true;
    target.stairs = dir;
    if (heightValue !== null) target.height = Math.min(MAX_HEIGHT, heightValue);
  };
  const prop = (x, z, value) => {
    const target = cell(x, z);
    if (!target) return;
    target.active = true;
    target.prop = value;
  };
  const gem = (x, z) => {
    const target = cell(x, z);
    if (!target) return;
    target.active = true;
    target.gemSpawn = true;
  };
  const boxes = [];
  const box = (x, z) => {
    const target = cell(x, z);
    if (!target) return;
    target.active = true;
    boxes.push({ x, z, homeX: x, homeZ: z });
  };
  const boxKey = (x, z) => `${x},${z}`;
  const validGemSpawn = (target, entries) => (
    target?.active &&
    !target.prop &&
    !target.stairs &&
    !boxes.some((item) => item.x === target.x && item.z === target.z) &&
    !entries.some((entry) => target.x === entry.x && target.z === entry.z)
  );
  const ensureGemSpawns = (minimum, entries) => {
    const blocked = new Set(boxes.map((item) => boxKey(item.x, item.z)));
    let count = cells.filter((target) => target.gemSpawn && validGemSpawn(target, entries)).length;
    if (count >= minimum) return;
    const candidates = cells
      .filter((target) => (
        target.active &&
        !target.gemSpawn &&
        !target.prop &&
        !target.stairs &&
        !blocked.has(boxKey(target.x, target.z)) &&
        !entries.some((entry) => target.x === entry.x && target.z === entry.z)
      ))
      .sort((a, b) => ((a.x * 17 + a.z * 31) % 53) - ((b.x * 17 + b.z * 31) % 53));
    for (const target of candidates) {
      target.gemSpawn = true;
      count += 1;
      if (count >= minimum) break;
    }
  };
  return {
    width,
    height,
    cells,
    cell,
    carve,
    elevate,
    stairs,
    prop,
    gem,
    box,
    done({ entry, entries = null, start, name }) {
      const entryList = entries?.length ? entries : (entry ? [entry] : []);
      ensureGemSpawns(GEM_SPAWN_MINIMUM, entryList);
      return { width, height, cells, entry: entry || entryList[0], entries: entryList, start, boxes, theme, name };
    }
  };
}

function createAtriumLevel() {
  const b = makeLevelBuilder(45, 45, 'classic');

  b.carve(17, 14, 27, 24, 'atrium');
  b.carve(2, 14, 10, 24, 'garden');
  b.carve(34, 14, 42, 24, 'signal');
  b.carve(17, 2, 27, 8, 'archive');

  b.carve(11, 18, 16, 20, 'atrium');
  b.carve(28, 18, 33, 20, 'atrium');
  b.carve(21, 9, 23, 13, 'atrium');
  b.carve(18, 30, 26, 36, 'dock');
  b.carve(21, 25, 23, 29, 'atrium');
  b.carve(21, 37, 23, 42, 'atrium');

  const raisedEntry = (entry, steps) => {
    b.elevate(entry.x, entry.z, 3);
    steps.forEach(([x, z, dir, height]) => b.stairs(x, z, dir, height));
  };
  raisedEntry({ x: 22, z: 2 }, [[22, 3, 'n', 2], [22, 4, 'n', 1], [22, 5, 'n', 0]]);
  raisedEntry({ x: 3, z: 19 }, [[4, 19, 'w', 2], [5, 19, 'w', 1], [6, 19, 'w', 0]]);
  raisedEntry({ x: 41, z: 19 }, [[40, 19, 'e', 2], [39, 19, 'e', 1], [38, 19, 'e', 0]]);
  raisedEntry({ x: 22, z: 42 }, [[22, 41, 's', 2], [22, 40, 's', 1], [22, 39, 's', 0]]);

  [
    [18, 3, 'bookshelf'], [20, 4, 'sideTable'], [25, 4, 'oilLamp'], [26, 3, 'floorLamp'],
    [18, 7, 'armchair'], [20, 7, 'couch'], [25, 7, 'wreath'],
    [4, 15, 'tree'], [7, 15, 'housePlant'], [9, 16, 'shrub'], [5, 18, 'flowerPatch'],
    [8, 18, 'mushrooms'], [3, 21, 'gardenRocks'], [10, 22, 'winterTree'], [5, 24, 'present'],
    [8, 23, 'shrub'],
    [37, 16, 'trafficLight'], [40, 16, 'bridgeLight'], [36, 18, 'trafficCone'], [34, 21, 'streetMarking'],
    [39, 21, 'floorLamp'], [42, 22, 'trafficLight'], [40, 24, 'bridgeLight'], [35, 23, 'trafficCone'],
    [21, 31, 'floorLamp'], [24, 31, 'woodenTable'], [18, 33, 'sled'], [26, 33, 'oilLamp'],
    [20, 34, 'reindeer'], [23, 35, 'snowman'], [19, 36, 'winterTree'], [24, 36, 'present'],
    [18, 16, 'trafficCone'], [21, 16, 'streetMarking'], [25, 16, 'trafficCone'], [23, 18, 'trafficLight'],
    [25, 22, 'openaiFloorLogo'], [18, 23, 'streetMarking'], [26, 23, 'bridgeLight'], [16, 19, 'trafficLight']
  ].forEach(([x, z, p]) => b.prop(x, z, p));

  [
    [18, 4], [21, 6], [24, 5], [27, 7],
    [3, 16], [7, 20], [9, 24], [4, 23],
    [35, 16], [38, 20], [41, 23], [36, 24],
    [19, 31], [23, 33], [25, 35], [21, 36],
    [13, 19], [31, 19], [22, 11], [22, 27]
  ].forEach(([x, z]) => b.gem(x, z));

  [[6, 22], [20, 18], [24, 21], [30, 19], [38, 22], [14, 20], [32, 21]]
    .forEach(([x, z]) => b.box(x, z));

  const entries = [
    { x: 22, z: 2, face: 's' },
    { x: 3, z: 19, face: 'e' },
    { x: 41, z: 19, face: 'w' },
    { x: 22, z: 42, face: 'n' }
  ];
  return b.done({ name: 'Five-Island Seeker Labyrinth', entry: entries[0], entries, start: { x: 22, z: 19 } });
}

function createPocketLevel() {
  const b = makeLevelBuilder(13, 10, 'classic');
  b.carve(2, 2, 9, 7);
  b.carve(0, 4, 2, 5);
  b.carve(9, 3, 12, 6);
  b.elevate(6, 3, 1);
  b.elevate(7, 3, 1);
  b.stairs(5, 3, 'e');
  b.stairs(8, 3, 'w');
  [[3, 2, 'tree'], [10, 5, 'stoplight'], [8, 7, 'tree']].forEach(([x, z, p]) => b.prop(x, z, p));
  [[3, 3], [5, 6], [7, 3], [9, 5], [11, 4], [4, 7], [8, 6], [6, 4]].forEach(([x, z]) => b.gem(x, z));
  [[4, 4], [8, 5]].forEach(([x, z]) => b.box(x, z));
  return b.done({ name: 'Pocket Gallery', entry: { x: 0, z: 4 }, start: { x: 4, z: 5 } });
}

function createWinterLevel() {
  const b = makeLevelBuilder(25, 18, 'winter');
  b.carve(4, 4, 14, 13);
  b.carve(0, 8, 4, 10);
  b.carve(14, 5, 22, 8);
  b.carve(14, 10, 24, 15);
  b.carve(6, 1, 11, 4);
  b.carve(2, 13, 7, 16);
  for (const point of [[9, 6, 1], [10, 6, 1], [11, 6, 2], [17, 7, 1], [18, 7, 2], [18, 12, 1], [19, 12, 2], [5, 14, 1]]) b.elevate(...point);
  b.carve(18, 9, 18, 9);
  for (const point of [[8, 6, 'e'], [11, 7, 'n'], [16, 7, 'e'], [18, 8, 'n'], [17, 12, 'e'], [19, 13, 'n'], [6, 14, 'w']]) b.stairs(...point);
  for (const point of [[6, 2, 'tree'], [9, 2, 'tree'], [21, 6, 'tree'], [23, 14, 'tree'], [4, 15, 'tree'], [15, 11, 'stoplight']]) b.prop(...point);
  for (const point of [[5, 5], [8, 8], [11, 6], [13, 11], [17, 7], [19, 12], [22, 6], [23, 13], [4, 16], [7, 14], [10, 3], [16, 14], [20, 15], [6, 10], [12, 13], [18, 10], [14, 6], [21, 11]]) b.gem(...point);
  for (const point of [[7, 8], [10, 10], [15, 7], [20, 11], [5, 12], [18, 14], [12, 5]]) b.box(...point);
  return b.done({ name: 'Winter Lock', entry: { x: 0, z: 9 }, start: { x: 7, z: 9 } });
}

function createStairworksLevel() {
  const b = makeLevelBuilder(24, 18, 'classic');
  b.carve(3, 4, 20, 13);
  b.carve(0, 8, 3, 10);
  b.carve(8, 1, 15, 4);
  b.carve(16, 13, 23, 16);
  const towers = [[8, 6, 1], [9, 6, 2], [10, 6, 3], [14, 8, 1], [15, 8, 2], [16, 8, 3], [8, 11, 1], [9, 11, 2], [18, 14, 1], [19, 14, 2], [20, 14, 3]];
  towers.forEach(([x, z, h]) => b.elevate(x, z, h));
  [[7, 6, 'e'], [9, 7, 'n'], [10, 7, 'n'], [13, 8, 'e'], [15, 9, 'n'], [16, 9, 'n'], [7, 11, 'e'], [9, 12, 'n'], [17, 14, 'e'], [19, 15, 'n'], [20, 15, 'n']]
    .forEach(([x, z, d]) => b.stairs(x, z, d));
  [[5, 5, 'stoplight'], [12, 3, 'tree'], [20, 5, 'tree'], [21, 15, 'stoplight'], [4, 12, 'tree']].forEach(([x, z, p]) => b.prop(x, z, p));
  [[5, 6], [8, 6], [10, 6], [12, 9], [14, 8], [16, 8], [9, 11], [18, 14], [20, 14], [22, 15], [11, 3], [15, 3], [6, 12], [18, 6], [20, 11], [4, 9], [13, 13], [7, 8], [16, 12], [21, 8]]
    .forEach(([x, z]) => b.gem(x, z));
  [[6, 8], [11, 8], [17, 10], [12, 12], [19, 6], [14, 14]].forEach(([x, z]) => b.box(x, z));
  return b.done({ name: 'Stairworks', entry: { x: 0, z: 9 }, start: { x: 6, z: 9 } });
}

function createMazeLevel() {
  const b = makeLevelBuilder(29, 19, 'classic');
  b.carve(0, 9, 28, 10);
  b.carve(3, 3, 5, 15);
  b.carve(8, 2, 10, 16);
  b.carve(13, 4, 15, 17);
  b.carve(18, 2, 20, 15);
  b.carve(23, 4, 25, 17);
  b.carve(5, 3, 23, 4);
  b.carve(5, 14, 25, 15);
  b.carve(10, 6, 18, 7);
  b.carve(15, 11, 23, 12);
  [[9, 3, 1], [14, 6, 1], [19, 9, 1], [24, 14, 2], [4, 14, 1], [18, 3, 2]].forEach(([x, z, h]) => b.elevate(x, z, h));
  [[8, 3, 'e'], [13, 6, 'e'], [18, 9, 'e'], [23, 14, 'e'], [5, 14, 'w'], [18, 4, 'n']].forEach(([x, z, d]) => b.stairs(x, z, d));
  [[4, 5, 'tree'], [9, 15, 'stoplight'], [14, 12, 'tree'], [19, 5, 'stoplight'], [24, 6, 'tree'], [24, 16, 'tree']].forEach(([x, z, p]) => b.prop(x, z, p));
  [[3, 3], [4, 15], [8, 2], [10, 16], [13, 4], [15, 17], [18, 2], [20, 15], [23, 4], [25, 17], [14, 6], [22, 12], [27, 9], [6, 9], [19, 9], [24, 14], [11, 4], [16, 15], [21, 3], [5, 14], [15, 11]]
    .forEach(([x, z]) => b.gem(x, z));
  [[7, 9], [12, 9], [17, 10], [22, 10], [9, 6], [18, 14], [24, 11]].forEach(([x, z]) => b.box(x, z));
  return b.done({ name: 'Long Maze', entry: { x: 0, z: 9 }, start: { x: 4, z: 9 } });
}

function createCrystalCourtsLevel() {
  const b = makeLevelBuilder(31, 21, 'classic');
  b.carve(6, 6, 18, 14);
  b.carve(0, 9, 6, 11);
  b.carve(18, 3, 28, 8);
  b.carve(18, 12, 30, 18);
  b.carve(8, 2, 14, 5);
  b.carve(4, 15, 12, 19);
  b.carve(12, 8, 24, 12);
  [[11, 7, 1], [12, 7, 2], [13, 7, 2], [20, 5, 1], [21, 5, 2], [22, 5, 3], [22, 15, 1], [23, 15, 2], [9, 17, 1], [10, 17, 2]]
    .forEach(([x, z, h]) => b.elevate(x, z, h));
  [[10, 7, 'e'], [12, 8, 'n'], [13, 8, 'n'], [19, 5, 'e'], [21, 6, 'n'], [22, 6, 'n'], [21, 15, 'e'], [23, 16, 'n'], [8, 17, 'e'], [10, 18, 'n']]
    .forEach(([x, z, d]) => b.stairs(x, z, d));
  [[8, 4, 'tree'], [14, 4, 'stoplight'], [26, 6, 'tree'], [28, 16, 'tree'], [6, 18, 'stoplight'], [16, 11, 'tree'], [23, 9, 'stoplight']]
    .forEach(([x, z, p]) => b.prop(x, z, p));
  [[8, 7], [10, 10], [12, 7], [15, 13], [20, 5], [22, 5], [27, 4], [28, 8], [20, 13], [23, 15], [29, 16], [5, 18], [10, 17], [13, 4], [7, 9], [17, 9], [24, 10], [26, 14], [11, 5], [4, 10], [18, 12], [13, 14], [21, 7], [9, 19]]
    .forEach(([x, z]) => b.gem(x, z));
  [[9, 9], [12, 11], [17, 10], [20, 8], [24, 14], [7, 16], [26, 16], [14, 12]].forEach(([x, z]) => b.box(x, z));
  return b.done({ name: 'Crystal Courts', entry: { x: 0, z: 10 }, start: { x: 8, z: 10 } });
}

function createDefaultLevel() {
  return createAtriumLevel();
}

const WORLD_PRESETS = {
  atrium: { label: 'Five-Island Seeker Labyrinth', create: createAtriumLevel },
  pocket: { label: 'Pocket Gallery', create: createPocketLevel },
  winter: { label: 'Winter Lock', create: createWinterLevel },
  stairworks: { label: 'Stairworks', create: createStairworksLevel },
  maze: { label: 'Long Maze', create: createMazeLevel },
  courts: { label: 'Crystal Courts', create: createCrystalCourtsLevel }
};

function applyTheme(theme = 'classic') {
  const winter = theme === 'winter';
  scene.background.set(0x000205);
  hemi.color.set(0xb4ccff);
  hemi.groundColor.set(0x050912);
  hemi.intensity = winter ? 1.42 : 1.3;
  sun.color.set(0xbfd2ff);
  sun.intensity = winter ? 1.26 : 1.12;

  materials.river.color.set(winter ? 0x12314b : 0x0f2940);
  materials.river.opacity = 0.96;
  riverLineMaterial.color.set(winter ? 0x74c3df : 0x5ca9c7);
  riverLineMaterial.opacity = winter ? 0.6 : 0.54;
  riverCurrentMaterial.color.set(winter ? 0x3fa2c8 : 0x2f88ad);
  riverCurrentMaterial.opacity = winter ? 0.24 : 0.2;

  materials.tile.color.set(winter ? 0xc5d8eb : 0xb7c7db);
  materials.tileAtrium.color.set(0xb7c7db);
  materials.tileGarden.color.set(0xa8c8bc);
  materials.tileRose.color.set(0xc9a7b8);
  materials.tileWinter.color.set(0xc8dcef);
  materials.tileSignal.color.set(0xc9b59a);
  materials.tileDock.color.set(0xa5c8dc);
  materials.tileArchive.color.set(0xbbaed6);
  materials.rim.color.set(winter ? 0xd8e8f6 : 0xc9d5e4);
  materials.block.color.set(winter ? 0xb5cadb : 0xa9bbcf);
  materials.blockAtrium.color.set(0xa9bbcf);
  materials.blockGarden.color.set(0x8fb6a4);
  materials.blockRose.color.set(0xb78f9f);
  materials.blockWinter.color.set(0xb4ccdd);
  materials.blockSignal.color.set(0xb79e7f);
  materials.blockDock.color.set(0x8cb6cc);
  materials.blockArchive.color.set(0xa794c7);
  materials.stair.color.set(winter ? 0xb3cadc : 0xaebfd2);
  materials.treeLeaf.color.set(winter ? 0xdff7ff : 0x3fb85d);
  materials.entry.color.set(0x151920);
  materials.seekerVision.color.set(0xffdf8a);
  materials.seekerVision.opacity = 0.27;
  materials.seekerVisionCore.color.set(0xfff3bc);
  materials.seekerVisionCore.opacity = 0.2;
  materials.seekerVisionEdge.color.set(0xffc44c);
  materials.seekerVisionEdge.opacity = 0.52;
  materials.gem.color.set(0x38bfff);
  materials.gem.emissive.set(0x0a9df2);
  materials.gem.emissiveIntensity = 0.98;
  materials.gemDeep.color.set(0x076cc7);
  materials.gemDeep.emissive.set(0x035da9);
  materials.gemDeep.emissiveIntensity = 0.76;
  materials.gemGlow.color.set(0x49dfff);
}

function applyLevel(level, presetKey = state.worldPreset) {
  const nextLevel = cloneLevel(level);
  state.worldPreset = presetKey;
  state.level = nextLevel;
  state.cells = nextLevel.cells;
  state.boxes = nextLevel.boxes || [];
  clearSeekerEntryPath();
  state.gems = [];
  state.seekers = [];
  state.escapeCell = null;
  state.escapeGroup = null;
  state.escapeUnlocked = false;
  state.escapeReveal = null;
  state.cameraOverride = null;
  clearSeekerTrackers();
  state.trackerCooldown = 2.6;
  state.screenFlashTimer = 0;
  state.caughtCueCooldown = 0;
  screenFlash?.classList.add('hidden');
  screenFlash?.classList.remove('active');
  state.playerVelocity.set(0, 0, 0);
  keys.clear();
  applyTheme(nextLevel.theme);
}

function applyPreset(presetKey, startRound = true) {
  const preset = WORLD_PRESETS[presetKey] || WORLD_PRESETS.atrium;
  state.customLayoutActive = false;
  applyLevel(preset.create(), presetKey);
  startWorldSelect.value = presetKey;
  menuWorldSelect.value = presetKey;
  if (startRound) startNewRound({ silent: true });
  else buildWorld();
  updateCamera(true);
  state.minimapDirty = true;
}

function cloneLevel(level) {
  return JSON.parse(JSON.stringify(level));
}

function currentEditorLayoutSnapshot() {
  if (!state.level) return null;
  return cloneLevel({
    ...state.level,
    presetKey: state.worldPreset,
    boxes: state.boxes.map((box) => ({
      x: box.homeX ?? box.x,
      z: box.homeZ ?? box.z,
      homeX: box.homeX ?? box.x,
      homeZ: box.homeZ ?? box.z
    }))
  });
}

function pushEditorUndo(label = 'Edit') {
  const snapshot = currentEditorLayoutSnapshot();
  if (!snapshot) return;
  state.mapUndoStack.push({ label, snapshot });
  if (state.mapUndoStack.length > 40) state.mapUndoStack.shift();
  syncMapEditorControls();
}

function restoreEditorLayoutSnapshot(snapshot) {
  if (!snapshot) return false;
  const previousPlayerCell = state.player?.cell ? { x: state.player.cell.x, z: state.player.cell.z } : null;
  const previousPlayerGroup = state.player?.group || null;
  applyLevel(snapshot, WORLD_PRESETS[snapshot.presetKey] ? snapshot.presetKey : state.worldPreset);
  state.customLayoutActive = true;
  if (previousPlayerGroup) {
    const nextCell = getCell(previousPlayerCell?.x, previousPlayerCell?.z) || getCell(state.level.start.x, state.level.start.z);
    state.player = { cell: nextCell, group: previousPlayerGroup };
  }
  roundPanel.classList.add('hidden');
  refreshEditorWorldNow();
  updateGemHud();
  drawMiniMap();
  return true;
}

function undoEditorChange() {
  const undo = state.mapUndoStack.pop();
  if (!undo) {
    updateMapEditorHint('Nothing to undo yet.');
    syncMapEditorControls();
    return;
  }
  restoreEditorLayoutSnapshot(undo.snapshot);
  updateMapEditorHint(`Undid ${undo.label}.`);
  syncMapEditorControls();
}

function isValidLayout(layout) {
  return Boolean(
    layout &&
    Number.isFinite(layout.width) &&
    Number.isFinite(layout.height) &&
    Array.isArray(layout.cells) &&
    layout.cells.length > 0 &&
    layout.start &&
    Number.isFinite(layout.start.x) &&
    Number.isFinite(layout.start.z)
  );
}

function readLocalLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidLayout(parsed)) return parsed;
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

function layoutSavedTime(layout) {
  const savedAt = Date.parse(layout?.savedAt || '');
  return Number.isFinite(savedAt) ? savedAt : 0;
}

function getPersistedLayout() {
  const localLayout = readLocalLayout();
  const fileLayout = isValidLayout(generatedLayout) ? generatedLayout : null;
  if (localLayout && fileLayout) {
    return layoutSavedTime(fileLayout) > layoutSavedTime(localLayout)
      ? { level: fileLayout, source: 'file' }
      : { level: localLayout, source: 'local' };
  }
  if (localLayout) return { level: localLayout, source: 'local' };
  if (fileLayout) return { level: fileLayout, source: 'file' };
  return null;
}

function applyPersistedLayout(startRound = true, { toast = false } = {}) {
  const persisted = getPersistedLayout();
  if (!persisted) return false;
  const presetKey = WORLD_PRESETS[persisted.level.presetKey] ? persisted.level.presetKey : state.worldPreset;
  applyLevel(persisted.level, presetKey);
  state.customLayoutActive = true;
  startWorldSelect.value = presetKey;
  menuWorldSelect.value = presetKey;
  if (startRound) startNewRound({ silent: true });
  else buildWorld();
  updateCamera(true);
  state.minimapDirty = true;
  if (toast) setToast(persisted.source === 'local' ? 'Layout loaded from this browser.' : 'Layout loaded from saved local file.');
  return true;
}

function createLineBox(mesh, material = edgeMaterial) {
  const edges = new THREE.EdgesGeometry(mesh.geometry);
  const lines = new THREE.LineSegments(edges, material);
  mesh.add(lines);
  return lines;
}

function zoneStyle(cell) {
  return ZONE_STYLES[cell?.zone] || ZONE_STYLES[state.level?.theme] || ZONE_STYLES.classic;
}

function tileMaterialFor(cell) {
  const style = zoneStyle(cell);
  return cell?.height ? materials[style.block] : materials[style.tile];
}

function getModelLoader() {
  if (!modelLoaderPromise) {
    modelLoaderPromise = import('three/examples/jsm/loaders/GLTFLoader.js').then(
      ({ GLTFLoader }) => new GLTFLoader()
    );
  }
  return modelLoaderPromise;
}

function loadModel(url) {
  if (!modelCache.has(url)) {
    modelCache.set(url, getModelLoader().then((loader) => loader.loadAsync(url)));
  }
  return modelCache.get(url);
}

function prepareModelScene(sceneObject, config) {
  const model = sceneObject.clone(true);
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = true;
      if (!child.userData.edgeAdded && child.geometry) {
        const lines = new THREE.LineSegments(new THREE.EdgesGeometry(child.geometry, 35), softEdgeMaterial);
        child.add(lines);
        child.userData.edgeAdded = true;
      }
    }
  });
  tempBox.setFromObject(model);
  if (tempBox.isEmpty()) return model;
  tempBox.getSize(tempSize);
  tempBox.getCenter(tempCenter);
  const footprint = Math.max(tempSize.x, tempSize.z, 0.001);
  const scale = (config.fit || 1) / footprint;
  model.scale.multiplyScalar(scale);
  tempBox.setFromObject(model);
  tempBox.getCenter(tempCenter);
  model.position.x -= tempCenter.x;
  model.position.z -= tempCenter.z;
  model.position.y -= tempBox.min.y;
  model.rotation.y = config.rotation || 0;
  return model;
}

async function makeModelProp(cell, type, serial) {
  const config = MODEL_PROPS[type];
  if (!config) return;
  const holder = new THREE.Group();
  holder.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(holder, cell, type);
  world.add(holder);
  try {
    const gltf = await loadModel(config.url);
    if (serial !== state.buildSerial || !holder.parent) return;
    holder.add(prepareModelScene(gltf.scene, config));
  } catch {
    if (serial !== state.buildSerial || !holder.parent) return;
    if (type === 'trafficLight' || type === 'bridgeLight') makeStoplight(cell);
    else makeTree(cell);
  }
}

function addBoxMesh(group, position, size, material, lineMaterial = edgeMaterial, userData = null) {
  const mesh = new THREE.Mesh(boxGeometry, material);
  mesh.scale.set(size.x, size.y, size.z);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (userData) mesh.userData = userData;
  createLineBox(mesh, lineMaterial);
  group.add(mesh);
  return mesh;
}

function clearGroup(group) {
  while (group.children.length) {
    group.remove(group.children[0]);
  }
}

function makeCurrentRibbonGeometry(points, ribbonWidth) {
  const vertices = [];
  const indices = [];
  for (let i = 0; i < points.length; i += 1) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const tz = next.z - prev.z;
    const length = Math.hypot(tx, tz) || 1;
    const nx = -tz / length;
    const nz = tx / length;
    const half = ribbonWidth * 0.5;
    vertices.push(points[i].x + nx * half, points[i].y, points[i].z + nz * half);
    vertices.push(points[i].x - nx * half, points[i].y, points[i].z - nz * half);
    if (i < points.length - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function drawRiverBackdrop() {
  if (!state.level) return;
  state.riverLines = [];
  state.riverCurrents = [];
  const width = (state.level.width + 8) * CELL;
  const depth = (state.level.height + 8) * CELL;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), materials.river);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.52;
  water.renderOrder = -30;
  world.add(water);

  const minX = -width / 2;
  const maxX = width / 2;
  const minZ = -depth / 2;
  const maxZ = depth / 2;
  let streamIndex = 0;
  for (let z = minZ + CELL * 0.7; z < maxZ; z += CELL * 1.38) {
    const points = [];
    const phase = streamIndex * 0.83;
    const segments = 42;
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const x = minX + t * width;
      const zDrift = Math.sin(t * Math.PI * 2.8 + phase) * CELL * 0.36 +
        Math.sin(t * Math.PI * 7.4 + phase * 0.7) * CELL * 0.12;
      points.push(new THREE.Vector3(x, -0.48 + (streamIndex % 5) * 0.006, z + zDrift));
    }
    const current = new THREE.Mesh(
      makeCurrentRibbonGeometry(points, CELL * (0.18 + (streamIndex % 3) * 0.035)),
      riverCurrentMaterial.clone()
    );
    current.userData.baseX = (streamIndex % 4) * CELL * 0.18;
    current.userData.phase = phase;
    current.userData.speed = 0.62 + (streamIndex % 6) * 0.055;
    current.renderOrder = -20 + (streamIndex % 5);
    state.riverCurrents.push(current);
    world.add(current);
    streamIndex += 1;
  }
}

function drawTile(cell) {
  if (!cell.active) return;
  const h = cellHeight(cell);
  const size = new THREE.Vector3(CELL * 0.96, TILE_BASE + h, CELL * 0.96);
  const pos = worldPosition(cell.x, cell.z, (h - TILE_BASE) * 0.5);
  const mesh = addBoxMesh(world, pos, size, tileMaterialFor(cell), edgeMaterial, { cell, pick: true });
  state.tilePickMeshes.push(mesh);

  for (const key of DIRECTION_KEYS) {
    const neighbor = activeNeighbor(cell, key);
    if (neighbor?.active) continue;
    const dir = DIRECTIONS[key];
    const rimSize = key === 'n' || key === 's'
      ? new THREE.Vector3(CELL * 0.98, 0.38, 0.18)
      : new THREE.Vector3(0.18, 0.38, CELL * 0.98);
    const rimPos = worldPosition(
      cell.x + dir.dx * 0.5,
      cell.z + dir.dz * 0.5,
      h + rimSize.y * 0.5
    );
    addBoxMesh(world, rimPos, rimSize, materials.rim, edgeMaterial);
  }
}

function drawStairs(cell) {
  if (!cell.active || !validStair(cell)) return;
  const high = stairHighNeighbor(cell);
  const baseH = cellHeight(cell);
  const targetH = Math.max(LEVEL_HEIGHT, cellHeight(high) - baseH);
  const dir = DIRECTIONS[cell.stairs];
  const steps = 5;
  const lateral = cell.stairs === 'n' || cell.stairs === 's'
    ? new THREE.Vector3(CELL * 0.82, 1, CELL / steps * 0.9)
    : new THREE.Vector3(CELL / steps * 0.9, 1, CELL * 0.82);

  for (let i = 0; i < steps; i += 1) {
    const t = (i + 1) / steps;
    const stepH = targetH * t;
    const offset = -0.5 + (i + 0.5) / steps;
    const x = cell.x + dir.dx * offset;
    const z = cell.z + dir.dz * offset;
    const pos = worldPosition(x, z, baseH + stepH * 0.5);
    addBoxMesh(world, pos, new THREE.Vector3(lateral.x, stepH, lateral.z), materials.stair, edgeMaterial);
  }
}

function drawBridgeArchFace(cell, key) {
  const h = cellHeight(cell);
  const dir = DIRECTIONS[key];
  const center = worldPosition(cell.x, cell.z, 0);
  const halfWidth = CELL * 0.35;
  const yBase = -TILE_BASE * 0.42;
  const ySpring = Math.max(0.36, h * 0.36);
  const yTop = h - 0.08;
  const edge = CELL * 0.49;
  const nudge = 0.025;
  const points = [];
  const point = (lateral, y) => (
    key === 'n' || key === 's'
      ? new THREE.Vector3(center.x + lateral, y, center.z + dir.dz * (edge + nudge))
      : new THREE.Vector3(center.x + dir.dx * (edge + nudge), y, center.z + lateral)
  );

  points.push(point(-halfWidth, yBase), point(-halfWidth, ySpring));
  points.push(point(halfWidth, yBase), point(halfWidth, ySpring));
  for (let i = 0; i < 10; i += 1) {
    const a = i / 10;
    const b = (i + 1) / 10;
    const archPoint = (t) => point(
      -halfWidth + halfWidth * 2 * t,
      ySpring + Math.sin(Math.PI * t) * Math.max(0.18, yTop - ySpring)
    );
    points.push(archPoint(a), archPoint(b));
  }

  const arch = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), edgeMaterial);
  world.add(arch);
}

function drawBridgeArches(cell) {
  if (!cell.active || cellHeight(cell) < LEVEL_HEIGHT * 3 - 0.001) return;
  for (const key of DIRECTION_KEYS) {
    const neighbor = activeNeighbor(cell, key);
    if (!neighbor?.active || cellHeight(neighbor) < cellHeight(cell) - LEVEL_HEIGHT * 1.5) {
      drawBridgeArchFace(cell, key);
    }
  }
}

function makeGemMesh(gem) {
  const cell = getCell(gem.x, gem.z);
  const group = new THREE.Group();

  const glow = new THREE.Mesh(gemGlowSphereGeometry, materials.gemGlow.clone());
  glow.userData.gemGlow = true;
  glow.scale.set(0.74, 0.58, 0.74);
  glow.position.y = -0.06;
  group.add(glow);

  const floorGlow = new THREE.Mesh(gemFloorGlowGeometry, materials.gemGlow.clone());
  floorGlow.userData.gemFloorGlow = true;
  floorGlow.rotation.x = Math.PI / 2;
  floorGlow.position.y = -0.58;
  floorGlow.material.opacity = 0.22;
  group.add(floorGlow);

  const top = new THREE.Mesh(gemTopGeometry, materials.gem);
  top.castShadow = true;
  top.rotation.y = Math.PI / 6;
  top.position.y = 0.14;
  createLineBox(top, edgeMaterial);
  group.add(top);

  const bottom = new THREE.Mesh(gemBottomGeometry, materials.gemDeep);
  bottom.castShadow = true;
  bottom.rotation.set(Math.PI, Math.PI / 6, 0);
  bottom.position.y = -0.35;
  createLineBox(bottom, edgeMaterial);
  group.add(bottom);

  const glint = new THREE.Mesh(gemGlintGeometry, materials.gemHighlight.clone());
  glint.userData.gemGlint = true;
  glint.position.set(-0.16, 0.31, 0.18);
  glint.rotation.set(-Math.PI / 3.2, Math.PI / 6, Math.PI / 6);
  group.add(glint);

  group.scale.setScalar(0.95);
  group.position.copy(worldPosition(gem.x, gem.z, walkHeight(cell) + 0.86));
  gem.group = group;
  dynamic.add(group);
}

function makeBoxObject(box) {
  const cell = getCell(box.x, box.z);
  const group = new THREE.Group();
  addBoxMesh(group, new THREE.Vector3(0, 0.54, 0), new THREE.Vector3(1.58, 1.08, 1.58), materials.box, edgeMaterial);
  addBoxMesh(group, new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(1.64, 0.12, 1.64), materials.boxDark, softEdgeMaterial);
  group.position.copy(worldPosition(box.x, box.z, walkHeight(cell)));
  box.group = group;
  dynamic.add(group);
}

function makeTree(cell) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.9, 8), materials.treeTrunk);
  trunk.position.y = 0.45;
  createLineBox(trunk, softEdgeMaterial);
  group.add(trunk);
  for (let i = 0; i < 3; i += 1) {
    const crown = new THREE.Mesh(coneGeometry, materials.treeLeaf);
    crown.position.y = 1.0 + i * 0.42;
    crown.scale.setScalar(1 - i * 0.16);
    crown.castShadow = true;
    createLineBox(crown, softEdgeMaterial);
    group.add(crown);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell, 'tree');
  world.add(group);
}

function makeShrub(cell) {
  const group = new THREE.Group();
  const pieces = [
    [-0.34, 0.34, 0.04, 0.78, materials.shrubA],
    [0.08, 0.42, -0.02, 0.96, materials.shrubB],
    [0.44, 0.34, 0.12, 0.72, materials.shrubA],
    [-0.06, 0.64, -0.18, 0.68, materials.treeLeaf]
  ];
  for (const [x, y, z, scale, mat] of pieces) {
    const mesh = new THREE.Mesh(shrubGeometry, mat);
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    createLineBox(mesh, softEdgeMaterial);
    group.add(mesh);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeFlowerPatch(cell) {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.9, 0.11, 20), materials.shrubA);
  base.position.y = 0.055;
  createLineBox(base, softEdgeMaterial);
  group.add(base);
  const blooms = [
    [-0.38, -0.12, 0.62, materials.flowerPink],
    [-0.12, 0.22, 0.76, materials.yellow],
    [0.2, -0.18, 0.66, materials.flowerPurple],
    [0.46, 0.16, 0.54, materials.flowerPink],
    [-0.02, -0.46, 0.58, materials.rim]
  ];
  for (const [x, z, height, mat] of blooms) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, height, 7), materials.flowerStem);
    stem.position.set(x, height * 0.5, z);
    group.add(stem);
    const bloom = new THREE.Mesh(flowerBloomGeometry, mat);
    bloom.position.set(x, height + 0.08, z);
    bloom.scale.set(1.3, 0.78, 1.3);
    createLineBox(bloom, softEdgeMaterial);
    group.add(bloom);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeMushrooms(cell) {
  const group = new THREE.Group();
  const items = [
    [-0.36, 0.78, 0.22, 1.04],
    [0.24, 0.98, -0.12, 1.22],
    [0.52, 0.6, 0.28, 0.82]
  ];
  for (const [x, height, z, scale] of items) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.15 * scale, height, 9), materials.mushroomStem);
    stem.position.set(x, height / 2, z);
    createLineBox(stem, softEdgeMaterial);
    group.add(stem);
    const cap = new THREE.Mesh(mushroomCapGeometry, materials.mushroomCap);
    cap.position.set(x, height + 0.02, z);
    cap.scale.set(scale * 1.24, scale * 0.5, scale * 1.24);
    createLineBox(cap, edgeMaterial);
    group.add(cap);
    const spot = new THREE.Mesh(smallSphereGeometry, materials.rim);
    spot.position.set(x - 0.08 * scale, height + 0.2, z - 0.08 * scale);
    spot.scale.setScalar(0.72 * scale);
    group.add(spot);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeGardenRocks(cell) {
  const group = new THREE.Group();
  const rocks = [
    [-0.3, 0.17, 0.04, 0.92],
    [0.16, 0.21, -0.04, 1.16],
    [0.52, 0.13, 0.12, 0.7]
  ];
  for (const [x, y, z, scale] of rocks) {
    const mesh = new THREE.Mesh(rockGeometry, materials.gardenRock);
    mesh.position.set(x, y, z);
    mesh.scale.set(scale, scale * 0.55, scale);
    createLineBox(mesh, softEdgeMaterial);
    group.add(mesh);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeTrafficCone(cell) {
  const group = new THREE.Group();
  addBoxMesh(group, new THREE.Vector3(0, 0.04, 0), new THREE.Vector3(0.88, 0.08, 0.88), materials.stoplight, softEdgeMaterial);
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.06, 18), materials.trafficCone);
  body.position.y = 0.61;
  createLineBox(body, edgeMaterial);
  group.add(body);
  const stripeLow = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.1, 18), materials.trafficWhite);
  stripeLow.position.y = 0.46;
  createLineBox(stripeLow, softEdgeMaterial);
  const stripeHigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.08, 18), materials.trafficWhite);
  stripeHigh.position.y = 0.76;
  group.add(stripeLow, stripeHigh);
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeRoadBarrier(cell) {
  const group = new THREE.Group();
  addBoxMesh(group, new THREE.Vector3(-0.56, 0.46, 0), new THREE.Vector3(0.14, 0.92, 0.18), materials.stoplight, softEdgeMaterial);
  addBoxMesh(group, new THREE.Vector3(0.56, 0.46, 0), new THREE.Vector3(0.14, 0.92, 0.18), materials.stoplight, softEdgeMaterial);
  const board = addBoxMesh(group, new THREE.Vector3(0, 0.75, 0), new THREE.Vector3(1.76, 0.32, 0.16), materials.roadBarrier, edgeMaterial);
  for (const x of [-0.38, 0.38]) {
    const stripe = addBoxMesh(group, new THREE.Vector3(x, 0.75, -0.09), new THREE.Vector3(0.18, 0.36, 0.035), materials.trafficCone, softEdgeMaterial);
    stripe.rotation.z = -0.55;
  }
  board.castShadow = true;
  applyPropRotation(group, cell, 'roadBarrier');
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  world.add(group);
}

function makeStreetMarking(cell) {
  const group = new THREE.Group();
  for (let i = -1; i <= 1; i += 1) {
    const stripe = new THREE.Mesh(boxGeometry, materials.streetPaint);
    stripe.scale.set(0.18, 0.018, 1.46);
    stripe.position.set(i * 0.34, 0.035, 0);
    stripe.rotation.y = Math.PI / 4;
    group.add(stripe);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeOpenAiFloorLogo(cell) {
  const group = new THREE.Group();
  const radius = 0.42;
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6;
    const loop = new THREE.Mesh(openAiLoopGeometry, materials.openaiMark);
    loop.rotation.x = Math.PI / 2;
    loop.rotation.z = angle + Math.PI / 6;
    loop.position.set(Math.cos(angle) * radius * 0.5, 0.045, Math.sin(angle) * radius * 0.5);
    group.add(loop);
  }
  const center = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 24), materials.openaiMark);
  center.rotation.x = Math.PI / 2;
  center.position.y = 0.048;
  group.add(center);
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell);
  world.add(group);
}

function makeGemSpawnMarker(cell) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(gemSpawnRingGeometry, materials.gemSpawn);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.055;
  const core = new THREE.Mesh(gemSpawnCoreGeometry, materials.gemSpawn);
  core.position.y = 0.32;
  createLineBox(core, softEdgeMaterial);
  group.add(ring, core);
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell, 'stoplight');
  world.add(group);
}

function makeSeekerTrackerMesh(tracker) {
  const cell = getCell(tracker.x, tracker.z);
  if (!cell?.active) return null;
  const group = new THREE.Group();
  const glow = new THREE.Mesh(trackerGlowGeometry, materials.trackerGlow);
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.032;
  const ring = new THREE.Mesh(trackerRingGeometry, materials.tracker);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  const barA = new THREE.Mesh(boxGeometry, materials.tracker);
  barA.scale.set(0.88, 0.035, 0.08);
  barA.position.y = 0.09;
  const barB = new THREE.Mesh(boxGeometry, materials.tracker);
  barB.scale.set(0.08, 0.035, 0.88);
  barB.position.y = 0.095;
  group.add(glow, ring, barA, barB);
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  group.userData.tracker = tracker;
  tracker.group = group;
  dynamic.add(group);
  return group;
}

function removeSeekerTracker(tracker) {
  if (!tracker) return;
  if (tracker.group?.parent) tracker.group.parent.remove(tracker.group);
  state.seekerTrackers = state.seekerTrackers.filter((item) => item !== tracker);
  state.minimapDirty = true;
}

function clearSeekerTrackers() {
  for (const tracker of state.seekerTrackers) {
    if (tracker.group?.parent) tracker.group.parent.remove(tracker.group);
  }
  state.seekerTrackers = [];
  state.minimapDirty = true;
}

function trackerAtCell(cell) {
  return state.seekerTrackers.find((tracker) => tracker.x === cell?.x && tracker.z === cell?.z) || null;
}

function makeProceduralProp(cell) {
  if (cell.prop === 'shrub') makeShrub(cell);
  else if (cell.prop === 'flowerPatch') makeFlowerPatch(cell);
  else if (cell.prop === 'mushrooms') makeMushrooms(cell);
  else if (cell.prop === 'gardenRocks') makeGardenRocks(cell);
  else if (cell.prop === 'trafficCone') makeTrafficCone(cell);
  else if (cell.prop === 'roadBarrier') makeRoadBarrier(cell);
  else if (cell.prop === 'streetMarking') makeStreetMarking(cell);
  else if (cell.prop === 'openaiFloorLogo') makeOpenAiFloorLogo(cell);
}

function makeStoplight(cell) {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.75, 10), materials.stoplight);
  pole.position.y = 0.85;
  group.add(pole);
  const head = addBoxMesh(group, new THREE.Vector3(0, 1.72, 0), new THREE.Vector3(0.42, 0.78, 0.24), materials.stoplight, edgeMaterial);
  head.castShadow = true;
  const lights = [
    [materials.red, 1.94],
    [materials.yellow, 1.72],
    [materials.green, 1.5]
  ];
  for (const [mat, y] of lights) {
    const bulb = new THREE.Mesh(smallSphereGeometry, mat);
    bulb.position.set(0, y, -0.13);
    group.add(bulb);
  }
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
  applyPropRotation(group, cell, 'stoplight');
  world.add(group);
}

function makeEntryGate(entryRef = state.level.entry) {
  const entry = getCell(entryRef.x, entryRef.z);
  if (!entry?.active) return;
  const group = new THREE.Group();
  addBoxMesh(group, new THREE.Vector3(-0.62, 0.72, 0), new THREE.Vector3(0.18, 1.44, 0.26), materials.entry);
  addBoxMesh(group, new THREE.Vector3(0.62, 0.72, 0), new THREE.Vector3(0.18, 1.44, 0.26), materials.entry);
  addBoxMesh(group, new THREE.Vector3(0, 1.42, 0), new THREE.Vector3(1.46, 0.18, 0.26), materials.entry);
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24), materials.red);
  beacon.position.y = 0.06;
  group.add(beacon);
  group.position.copy(worldPosition(entry.x, entry.z, walkHeight(entry)));
  if (entryRef.face === 'e' || entryRef.face === 'w') group.rotation.y = Math.PI / 2;
  world.add(group);
}

function makeEscapeShip(offsetX, offsetZ) {
  const group = new THREE.Group();
  group.userData.escapeShip = true;
  group.position.set(offsetX, 0, offsetZ);
  group.rotation.y = -Math.PI / 4;

  const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.34, 1.72, 0.36, 20), materials.escapeShip);
  hull.position.y = 0.5;
  hull.scale.set(1.2, 1, 0.74);
  createLineBox(hull, edgeMaterial);
  group.add(hull);

  const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.28, 0.3, 20), materials.escapeShipDark);
  lower.position.y = 0.28;
  lower.scale.set(1.1, 1, 0.62);
  createLineBox(lower, softEdgeMaterial);
  group.add(lower);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.58, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), materials.escapeShipCanopy);
  canopy.position.y = 0.75;
  canopy.scale.set(1, 0.54, 0.72);
  createLineBox(canopy, softEdgeMaterial);
  group.add(canopy);

  for (const [x, z, yaw] of [[-1.1, 0, 0], [1.1, 0, 0], [0, 0.82, Math.PI / 2], [0, -0.82, Math.PI / 2]]) {
    const fin = addBoxMesh(
      group,
      new THREE.Vector3(x, 0.34, z),
      new THREE.Vector3(0.92, 0.12, 0.28),
      materials.escapeShipDark,
      softEdgeMaterial
    );
    fin.rotation.y = yaw;
  }

  const glow = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.32, 32), materials.escapeBeam.clone());
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.035;
  glow.material.opacity = 0.16;
  group.add(glow);
  group.scale.setScalar(1.18);
  return group;
}

function makeEscapeBeacon() {
  const cell = resolveEscapeCell();
  state.escapeCell = cell;
  state.escapeGroup = null;
  if (!cell) return;

  const group = new THREE.Group();
  group.userData.escape = true;
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));

  const inactiveMaterial = materials.escapePad.clone();
  inactiveMaterial.color.set(0x617180);
  inactiveMaterial.opacity = 0.28;
  const inactiveRing = new THREE.Mesh(escapePadGeometry, inactiveMaterial);
  inactiveRing.userData.escapeInactiveOnly = true;
  inactiveRing.rotation.x = Math.PI / 2;
  inactiveRing.position.y = 0.06;

  const pad = new THREE.Mesh(escapePadGeometry, materials.escapePad.clone());
  pad.userData.escapeActiveOnly = true;
  pad.rotation.x = Math.PI / 2;
  pad.position.y = 0.075;

  const glow = new THREE.Mesh(escapeGlowGeometry, materials.escapePad.clone());
  glow.userData.escapeActiveOnly = true;
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.055;
  glow.material.opacity = 0.26;

  const beam = new THREE.Mesh(escapeBeamGeometry, materials.escapeBeam.clone());
  beam.userData.escapeActiveOnly = true;
  beam.position.y = 1.9;
  beam.renderOrder = 5;

  const core = new THREE.Mesh(sphereGeometry, materials.escapeGlow.clone());
  core.userData.escapeActiveOnly = true;
  core.position.y = 0.36;
  core.scale.setScalar(1.22);

  group.add(inactiveRing, glow, pad, beam, core);
  group.add(makeEscapeShip(-CELL * 1.35, CELL * 1.25));
  state.escapeGroup = group;
  world.add(group);
  setEscapeVisualActive(state.escapeUnlocked);
}

function makeCharacter(material, accentMaterial = null) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 6, 12), material);
  body.position.y = 0.62;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), material);
  head.position.y = 1.13;
  group.add(body, head);

  const limbGeometry = new THREE.CylinderGeometry(0.055, 0.055, 0.48, 8);
  const positions = [
    [-0.22, 0.63, 0.02, 'armL'],
    [0.22, 0.63, 0.02, 'armR'],
    [-0.11, 0.23, 0.03, 'legL'],
    [0.11, 0.23, 0.03, 'legR']
  ];
  for (const [x, y, z, name] of positions) {
    const limb = new THREE.Mesh(limbGeometry, material);
    limb.position.set(x, y, z);
    limb.rotation.z = name.startsWith('arm') ? 0.2 * Math.sign(x) : 0;
    limb.userData.name = name;
    group.add(limb);
  }

  if (accentMaterial) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.035), accentMaterial);
    eye.position.set(0, 1.18, -0.21);
    group.add(eye);
  }
  group.scale.setScalar(1.26);
  group.userData.baseScale = group.scale.x;
  return group;
}

function makeFlashlightRig() {
  const group = new THREE.Group();
  group.userData.flashlight = true;
  addBoxMesh(
    group,
    new THREE.Vector3(0, 0.83, 0.36),
    new THREE.Vector3(0.11, 0.1, 0.38),
    materials.flashlightBody,
    softEdgeMaterial
  );
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.055, 18), materials.flashlightLens);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 0.83, 0.58);
  group.add(lens);

  const glow = new THREE.Mesh(smallSphereGeometry, materials.flashlightGlow.clone());
  glow.userData.flashlightGlow = true;
  glow.position.set(0, 0.83, 0.64);
  glow.scale.set(1.35, 1.35, 0.82);
  group.add(glow);
  return group;
}

function makeSeekerCharacter() {
  const group = makeCharacter(materials.seeker);
  const inverseScale = 1 / group.scale.x;
  const fan = new THREE.Mesh(seekerVisionGeometry, materials.seekerVision.clone());
  fan.userData.flashlightBeam = true;
  fan.scale.setScalar(inverseScale);
  fan.renderOrder = 1;
  const core = new THREE.Mesh(seekerFlashlightCoreGeometry, materials.seekerVisionCore.clone());
  core.userData.flashlightCore = true;
  core.scale.setScalar(inverseScale);
  core.renderOrder = 2;
  const edge = new THREE.LineSegments(seekerVisionEdgeGeometry, materials.seekerVisionEdge.clone());
  edge.userData.flashlightEdge = true;
  edge.scale.setScalar(inverseScale);
  edge.renderOrder = 3;
  const alert = new THREE.Sprite(alertMaterial);
  alert.userData.alert = true;
  alert.userData.baseScale = 0.72;
  alert.userData.baseY = 2.02;
  alert.visible = false;
  alert.position.set(0, alert.userData.baseY, 0);
  alert.scale.setScalar(alert.userData.baseScale);
  group.add(makeFlashlightRig(), fan, core, edge, alert);
  return group;
}

function makeAiCompanionRover() {
  const group = new THREE.Group();
  group.userData.aiCompanion = true;

  const glow = new THREE.Mesh(aiRoverGlowGeometry, materials.aiRoverGlow.clone());
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.055;
  glow.scale.setScalar(1.08);
  glow.renderOrder = 2;
  glow.userData.roverGlow = true;
  group.add(glow);

  const body = new THREE.Mesh(aiRoverBodyGeometry, materials.aiRoverBody);
  body.position.y = 0.23;
  body.scale.set(1.1, 0.74, 1.1);
  createLineBox(body, edgeMaterial);
  group.add(body);

  const base = new THREE.Mesh(aiRoverBodyGeometry, materials.aiRoverDark);
  base.position.y = 0.09;
  base.scale.set(1.05, 0.18, 1.05);
  createLineBox(base, softEdgeMaterial);
  group.add(base);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.045, 8, 52), materials.aiRoverDark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.335;
  group.add(rim);

  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.66, 0.045, 40), materials.aiRoverTop);
  topPlate.position.y = 0.365;
  createLineBox(topPlate, softEdgeMaterial);
  group.add(topPlate);

  const logo = new THREE.Mesh(aiRoverLogoGeometry, materials.aiRoverLogo);
  logo.rotation.x = -Math.PI / 2;
  logo.position.y = 0.397;
  logo.renderOrder = 9;
  group.add(logo);

  const light = new THREE.Mesh(smallSphereGeometry, materials.aiRoverLight.clone());
  light.position.set(0, 0.43, -0.54);
  light.scale.set(1.28, 0.3, 0.62);
  group.add(light);

  group.scale.setScalar(1.24);
  return group;
}

function ensureAiCompanion() {
  if (!state.aiCompanionEnabled || !state.player?.group) return;
  if (!state.aiCompanionGroup) state.aiCompanionGroup = makeAiCompanionRover();
  if (!state.aiCompanionGroup.parent) dynamic.add(state.aiCompanionGroup);
  if (!state.aiCompanionGroup.userData.initialized) {
    const p = state.player.group.position;
    state.aiCompanionGroup.position.set(p.x - CELL * 0.62, p.y + 0.08, p.z + CELL * 0.46);
    state.aiCompanionGroup.userData.initialized = true;
  }
}

function removeAiCompanion() {
  if (state.aiCompanionGroup?.parent) state.aiCompanionGroup.parent.remove(state.aiCompanionGroup);
}

function addAiShockwave(origin = state.aiCompanionGroup?.position) {
  if (!origin) return;
  const ring = new THREE.Mesh(aiShockGeometry, materials.aiShock.clone());
  ring.rotation.x = Math.PI / 2;
  ring.position.set(origin.x, origin.y + 0.08, origin.z);
  ring.renderOrder = 6;
  ring.userData.aiShock = { age: 0, life: 1.08, intensity: 1.45 };
  dynamic.add(ring);
  state.aiShockwaves.push(ring);
}

function aiBeamMaterial(kind) {
  if (kind === 'green') return materials.aiGreenBeam;
  if (kind === 'amber') return materials.aiAmberBeam;
  return materials.aiElectricBeam;
}

function addAiBeam(targetPosition, kind = 'electric', options = {}) {
  if (!targetPosition || !state.aiCompanionGroup?.parent) return;
  const start = state.aiCompanionGroup.position.clone();
  start.y += options.startYOffset ?? 0.46;
  const end = targetPosition.clone();
  end.y += options.targetYOffset ?? 0.62;
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length < 0.08) return;

  const material = aiBeamMaterial(kind).clone();
  const beam = new THREE.Mesh(aiBeamGeometry, material);
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  const width = options.width ?? 1;
  beam.scale.set(width, length, width);
  beam.renderOrder = 12;
  beam.userData.aiBeam = {
    age: 0,
    life: options.life ?? 0.56,
    baseOpacity: material.opacity ?? 0.7,
    pulse: Math.random() * Math.PI * 2
  };
  dynamic.add(beam);
  state.aiBeams.push(beam);
}

function addAiBeamToCell(cell, kind = 'electric', options = {}) {
  if (!cell) return;
  addAiBeam(worldPosition(cell.x, cell.z, walkHeight(cell)), kind, options);
}

function addAiBeamToSeeker(seeker, kind = 'electric', options = {}) {
  if (!seeker?.group) return;
  addAiBeam(seeker.group.position, kind, { targetYOffset: 1.0, ...options });
}

function clearAiVisualEffects() {
  state.aiShockwaves.forEach((ring) => {
    if (ring.parent) ring.parent.remove(ring);
    ring.material?.dispose?.();
  });
  state.aiShockwaves = [];
  state.aiBeams.forEach((beam) => {
    if (beam.parent) beam.parent.remove(beam);
    beam.material?.dispose?.();
  });
  state.aiBeams = [];
  for (const seeker of state.seekers) {
    if (!seeker.group) continue;
    seeker.group.userData.aiBoostTimer = 0;
    seeker.group.scale.setScalar(seeker.group.userData.baseScale || 1.26);
  }
}

function updateAiCompanion(delta) {
  state.aiSeekerSlowTimer = Math.max(0, state.aiSeekerSlowTimer - delta);
  state.aiSeekerStunTimer = Math.max(0, state.aiSeekerStunTimer - delta);
  state.aiDifficultyTimer = Math.max(0, state.aiDifficultyTimer - delta);
  state.aiPlayerSpeedTimer = Math.max(0, state.aiPlayerSpeedTimer - delta);
  if (state.aiSeekerSlowTimer <= 0) state.aiSeekerSlowMultiplier = 1;
  if (state.aiDifficultyTimer <= 0) state.aiDifficultyMultiplier = 1;
  if (state.aiPlayerSpeedTimer <= 0) state.aiPlayerSpeedMultiplier = 1;

  if (!state.aiCompanionEnabled) return;
  ensureAiCompanion();
  if (!state.aiCompanionGroup?.parent || !state.player?.group) return;
  const velocity = state.playerVelocity;
  const speed = Math.hypot(velocity.x, velocity.z);
  const nx = speed > 0.1 ? velocity.x / speed : Math.sin(state.player.group.rotation.y);
  const nz = speed > 0.1 ? velocity.z / speed : Math.cos(state.player.group.rotation.y);
  const side = 0.46;
  const target = new THREE.Vector3(
    state.player.group.position.x - nx * CELL * 0.58 - nz * side,
    state.player.group.position.y + 0.08 + Math.sin(clock.elapsedTime * 4.4) * 0.035,
    state.player.group.position.z - nz * CELL * 0.58 + nx * side
  );
  state.aiCompanionGroup.position.lerp(target, 1 - Math.exp(-7.5 * delta));
  state.aiCompanionGroup.rotation.y = lerpAngle(
    state.aiCompanionGroup.rotation.y,
    yawForDirection(nx, nz),
    1 - Math.exp(-8 * delta)
  );
  state.aiCompanionGroup.traverse((child) => {
    if (child.userData?.roverGlow && child.material?.opacity !== undefined) {
      child.material.opacity = 0.14 + Math.sin(clock.elapsedTime * 5.2) * 0.06;
    }
  });
}

function updateAiSeekerBoosts(delta) {
  for (const seeker of state.seekers) {
    if (!seeker.group) continue;
    const base = seeker.group.userData.baseScale || 1.26;
    const timer = Math.max(0, (seeker.group.userData.aiBoostTimer || 0) - delta);
    seeker.group.userData.aiBoostTimer = timer;
    if (timer > 0) {
      const pulse = 1.08 + Math.sin(clock.elapsedTime * 14) * 0.035;
      seeker.group.scale.setScalar(base * pulse);
    } else if (Math.abs(seeker.group.scale.x - base) > 0.001) {
      seeker.group.scale.setScalar(base);
    }
  }
}

function updateAiShockwaves(delta) {
  for (let i = state.aiShockwaves.length - 1; i >= 0; i -= 1) {
    const ring = state.aiShockwaves[i];
    const data = ring.userData.aiShock;
    data.age += delta;
    const t = data.age / data.life;
    if (t >= 1) {
      if (ring.parent) ring.parent.remove(ring);
      ring.material?.dispose?.();
      state.aiShockwaves.splice(i, 1);
      continue;
    }
    const intensity = data.intensity || 1;
    const scale = 1 + t * 6.6 * intensity;
    ring.scale.setScalar(scale);
    ring.material.opacity = (1 - t) * 0.62 * intensity;
  }
}

function updateAiBeams(delta) {
  for (let i = state.aiBeams.length - 1; i >= 0; i -= 1) {
    const beam = state.aiBeams[i];
    const data = beam.userData.aiBeam;
    data.age += delta;
    const t = data.age / data.life;
    if (t >= 1) {
      if (beam.parent) beam.parent.remove(beam);
      beam.material?.dispose?.();
      state.aiBeams.splice(i, 1);
      continue;
    }
    const flicker = 0.82 + Math.sin(clock.elapsedTime * 46 + data.pulse) * 0.3;
    beam.material.opacity = data.baseOpacity * (1 - t) * flicker;
    const width = 1.12 + Math.sin(clock.elapsedTime * 30 + data.pulse) * 0.34;
    beam.scale.x = width;
    beam.scale.z = width;
  }
}

function buildWorld() {
  state.buildSerial += 1;
  const serial = state.buildSerial;
  clearGroup(world);
  clearGroup(dynamic);
  state.dustPuffs.forEach((puff) => puff.material?.dispose?.());
  state.dustPuffs = [];
  clearAiVisualEffects();
  state.playerDustTimer = 0;
  hoverMesh.visible = false;
  state.tilePickMeshes = [];

  drawRiverBackdrop();
  eachCell(drawTile);
  eachCell(drawStairs);
  eachCell(drawBridgeArches);
  eachCell((cell) => {
    if (cell.prop === 'tree') makeTree(cell);
    else if (cell.prop === 'stoplight') makeStoplight(cell);
    else if ([
      'shrub', 'flowerPatch', 'mushrooms', 'gardenRocks',
      'trafficCone', 'roadBarrier', 'streetMarking', 'openaiFloorLogo'
    ].includes(cell.prop)) makeProceduralProp(cell);
    else if (cell.prop && MODEL_PROPS[cell.prop]) makeModelProp(cell, cell.prop, serial);
  });
  if (state.editorOpen || state.sandboxMode) {
    eachCell((cell) => {
      if (cell.active && cell.gemSpawn) makeGemSpawnMarker(cell);
    });
  }
  seekerEntries().forEach((entry) => makeEntryGate(entry));
  makeEscapeBeacon();

  for (const box of state.boxes) makeBoxObject(box);
  for (const gem of state.gems) makeGemMesh(gem);
  for (const tracker of state.seekerTrackers) makeSeekerTrackerMesh(tracker);

  if (!state.player) {
    state.player = { cell: getCell(state.level.start.x, state.level.start.z), group: makeCharacter(materials.player) };
  }
  if (!state.player.group.parent) dynamic.add(state.player.group);
  placeGroupOnCell(state.player.group, state.player.cell);

  for (const seeker of state.seekers) {
    seeker.group = makeSeekerCharacter();
    dynamic.add(seeker.group);
    placeGroupOnCell(seeker.group, seeker.cell);
  }

  ensureAiCompanion();

  state.minimapDirty = true;
  drawMiniMap();
}

function placeGroupOnCell(group, cell) {
  group.position.copy(worldPosition(cell.x, cell.z, walkHeight(cell)));
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function yawForDirection(dx, dz) {
  if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? Math.PI / 2 : -Math.PI / 2;
  return dz < 0 ? Math.PI : 0;
}

function rotationForDirection(dir = 's') {
  if (dir === 'n') return Math.PI;
  if (dir === 'e') return Math.PI / 2;
  if (dir === 'w') return -Math.PI / 2;
  return 0;
}

function rotationForProp(cell, type = cell?.prop) {
  const dir = cell?.propDir || 's';
  if (type === 'roadBarrier') return (dir === 'n' || dir === 's') ? Math.PI / 2 : 0;
  return rotationForDirection(dir);
}

function applyPropRotation(group, cell, type = cell?.prop) {
  group.rotation.y += rotationForProp(cell, type);
}

function lerpAngle(from, to, amount) {
  const turn = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + turn * amount;
}

function createVisionFanGeometry(range, angle, segments) {
  const vertices = [0, 0.045, 0];
  const indices = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = -angle / 2 + (angle * i) / segments;
    vertices.push(Math.sin(t) * range, 0.045, Math.cos(t) * range);
    if (i > 0) indices.push(0, i, i + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createVisionFanEdgeGeometry(range, angle, segments) {
  const points = [];
  const left = -angle / 2;
  const right = angle / 2;
  points.push(new THREE.Vector3(0, 0.055, 0), new THREE.Vector3(Math.sin(left) * range, 0.055, Math.cos(left) * range));
  for (let i = 0; i < segments; i += 1) {
    const a = left + (angle * i) / segments;
    const b = left + (angle * (i + 1)) / segments;
    points.push(
      new THREE.Vector3(Math.sin(a) * range, 0.055, Math.cos(a) * range),
      new THREE.Vector3(Math.sin(b) * range, 0.055, Math.cos(b) * range)
    );
  }
  points.push(new THREE.Vector3(Math.sin(right) * range, 0.055, Math.cos(right) * range), new THREE.Vector3(0, 0.055, 0));
  return new THREE.BufferGeometry().setFromPoints(points);
}

function passableGemCell(cell) {
  return cell?.active && !propBlocks(cell) && !boxAt(cell.x, cell.z) && !isEntryCell(cell);
}

function canPlaceGemSpawn(cell) {
  return Boolean(cell && !propBlocks(cell) && !boxAt(cell.x, cell.z) && !isEntryCell(cell));
}

function usableGemSpawnCells() {
  return state.cells.filter((cell) => cell.gemSpawn && passableGemCell(cell));
}

function resetRunStats() {
  state.runStats = {
    elapsed: 0,
    traps: 0,
    sightings: 0,
    bestGemStreak: 0,
    allGemsCollected: false,
    escaped: false,
    aiModifier: 0,
    aiActions: 0
  };
}

function resolveEscapeCell() {
  const explicit = state.level?.escape ? getCell(state.level.escape.x, state.level.escape.z) : null;
  if (explicit?.active) return explicit;
  const candidates = state.cells
    .filter((cell) => (
      cell.active &&
      !cell.stairs &&
      !boxAt(cell.x, cell.z) &&
      !propBlocks(cell) &&
      !isEntryCell(cell)
    ))
    .sort((a, b) => {
      const scoreA = a.z * 1.8 - a.x + Math.abs(a.x - (state.level?.start?.x ?? a.x)) * 0.08;
      const scoreB = b.z * 1.8 - b.x + Math.abs(b.x - (state.level?.start?.x ?? b.x)) * 0.08;
      return scoreB - scoreA;
    });
  return candidates[0] || getCell(state.level?.start?.x, state.level?.start?.z) || null;
}

function escapeTargetPosition(cell = state.escapeCell) {
  if (!cell) return null;
  return worldPosition(cell.x, cell.z, walkHeight(cell));
}

function setEscapeVisualActive(active) {
  if (!state.escapeGroup) return;
  state.escapeGroup.userData.active = active;
  for (const child of state.escapeGroup.children) {
    if (child.userData?.escapeActiveOnly) child.visible = active;
    if (child.userData?.escapeInactiveOnly) child.visible = !active;
  }
}

function escapeHuntTarget() {
  if (!state.escapeUnlocked || state.runStats.escaped || state.round === 'won' || state.round === 'lost') return null;
  return state.player?.cell || null;
}

function updateEscapeHuntSignal(message = null) {
  const target = escapeHuntTarget();
  if (!target || !seekerWalkable(target)) return;
  state.squad.lastSeenCell = target;
  state.squad.lastSeenTimer = Math.max(state.squad.lastSeenTimer || 0, 1.4);
  state.squad.predictedCell = target;
  state.squad.focusCell = target;
  state.squad.focusArea = areaAroundCell(target, 0);
  state.squad.focusRadius = 0;
  state.squad.focusTimer = Math.max(state.squad.focusTimer || 0, 1.4);
  state.squad.abilityLabel = 'Escape alert: exact location shared';
  state.squad.searchClaims = {};
  for (const seeker of state.seekers) {
    seeker.lastSeen = target;
    seeker.memoryTimer = Math.max(seeker.memoryTimer || 0, 1.4);
    seeker.goal = target;
    seeker.goalTimer = Math.max(seeker.goalTimer || 0, 0.6);
    seeker.coordinationTimer = Math.max(seeker.coordinationTimer || 0, 1.4);
    if (message) setSeekerMessage(seeker, message, 3.4);
  }
}

function cleanInvalidGemSpawns() {
  let removed = 0;
  for (const cell of state.cells) {
    if (!cell.gemSpawn) continue;
    if (!passableGemCell(cell)) {
      cell.gemSpawn = false;
      removed += 1;
    }
  }
  const spawns = state.cells.filter((cell) => cell.gemSpawn);
  if (spawns.length > GEM_SPAWN_MINIMUM) {
    for (const cell of spawns.slice(GEM_SPAWN_MINIMUM)) {
      cell.gemSpawn = false;
      removed += 1;
    }
  }
  return removed;
}

function spawnGems() {
  const spawns = usableGemSpawnCells();
  const fallback = state.cells.filter((cell) => passableGemCell(cell) && !cell.stairs);
  const pool = (spawns.length ? spawns : fallback).slice();
  state.gems = [];
  const count = Math.min(Number(gemGoalInput.value), pool.length);
  for (let i = 0; i < count; i += 1) {
    const cell = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    state.gems.push({ x: cell.x, z: cell.z, collected: false });
  }
}

function resetBoxesToHome() {
  for (const box of state.boxes) {
    box.x = box.homeX ?? box.x;
    box.z = box.homeZ ?? box.z;
    box.anim = null;
  }
}

function startNewRound(options = {}) {
  state.round = 'playing';
  state.collected = 0;
  resetRunStats();
  state.escapeUnlocked = false;
  state.escapeReveal = null;
  state.cameraOverride = null;
  state.releaseCountdown = 4.2;
  state.nextSeekerAt = 0;
  state.seekersSpawned = 0;
  state.nextSeekerId = 1;
  state.signalPingTimer = PLAYER_SIGNAL_INTERVAL;
  state.signalPingCell = null;
  state.signalPingArea = null;
  state.seekers = [];
  clearSeekerTrackers();
  state.trackerCooldown = 2.6;
  state.caughtCueCooldown = 0;
  state.aiPlayerSpeedTimer = 0;
  state.aiPlayerSpeedMultiplier = 1;
  state.aiSeekerSlowTimer = 0;
  state.aiSeekerSlowMultiplier = 1;
  state.aiSeekerStunTimer = 0;
  state.aiDifficultyTimer = 0;
  state.aiDifficultyMultiplier = 1;
  clearAiVisualEffects();
  state.playerVelocity.set(0, 0, 0);
  keys.clear();
  if (pauseButton) pauseButton.textContent = 'Pause';
  resetBoxesToHome();
  spawnGems();
  state.player = { cell: getCell(state.level.start.x, state.level.start.z), group: state.player?.group || makeCharacter(materials.player) };
  resetSquadBlackboard();
  roundPanel.classList.remove('won');
  roundScore?.classList.add('hidden');
  if (roundScore) roundScore.innerHTML = '';
  state.screenFlashTimer = 0;
  screenFlash?.classList.remove('active');
  screenFlash?.classList.add('hidden');
  agentPulse?.classList.add('hidden');
  hidePauseOverlay();
  if (!state.player.group.parent) dynamic.add(state.player.group);
  roundPanel.classList.add('hidden');
  buildWorld();
  updateGemHud();
  if (!options.silent) setToast(state.sandboxMode ? 'Sandbox mode: seekers disabled while you edit.' : 'New round. Seekers enter soon.');
}

function populateWorldSelects() {
  const html = Object.entries(WORLD_PRESETS)
    .map(([key, preset]) => `<option value="${key}">${preset.label}</option>`)
    .join('');
  startWorldSelect.innerHTML = html;
  menuWorldSelect.innerHTML = html;
}

function syncRange(primary, mirror, primaryOut, mirrorOut, value) {
  const next = clampInputValue(primary, value);
  primary.value = String(next);
  mirror.value = String(next);
  primaryOut.textContent = String(next);
  mirrorOut.textContent = String(next);
}

function setGameSettings({ gems, seekers, speed, world }) {
  syncRange(startGemGoalInput, gemGoalInput, startGemGoalValue, gemGoalValue, gems);
  syncRange(startSeekerCountInput, seekerCountInput, startSeekerCountValue, seekerCountValue, seekers);
  syncRange(startSeekerSpeedInput, seekerSpeedInput, startSeekerSpeedValue, seekerSpeedValue, speed);
  if (world && WORLD_PRESETS[world]) {
    state.worldPreset = world;
    startWorldSelect.value = world;
    menuWorldSelect.value = world;
  }
}

function setDifficultyActive(key) {
  state.difficulty = key;
  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.classList.toggle('active', button.dataset.difficulty === key);
  });
}

function applyDifficulty(key) {
  setDifficultyActive(key);
  setGameSettings(DIFFICULTIES[key] || DIFFICULTIES.medium);
}

function inferDifficultyFromSettings() {
  const settings = {
    gems: Number(startGemGoalInput.value),
    seekers: Number(startSeekerCountInput.value),
    speed: Number(startSeekerSpeedInput.value)
  };
  let bestKey = state.difficulty;
  let bestScore = Infinity;
  for (const [key, preset] of Object.entries(DIFFICULTIES)) {
    const gemScore = (settings.gems - preset.gems) / 5;
    const seekerScore = (settings.seekers - preset.seekers) / 2;
    const speedScore = settings.speed - preset.speed;
    const score = gemScore * gemScore + seekerScore * seekerScore + speedScore * speedScore;
    if (score < bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  setDifficultyActive(bestKey);
}

function clampInputValue(input, value = input.value) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 99);
  return Math.max(min, Math.min(max, Number(value || min)));
}

function syncSettingFrom(input, mirror, output, mirrorOutput) {
  const next = clampInputValue(input);
  input.value = String(next);
  mirror.value = String(next);
  output.textContent = String(next);
  mirrorOutput.textContent = String(next);
  inferDifficultyFromSettings();
}

function stepValue(input, delta) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 99);
  const current = Number(input.value || min);
  const next = Math.max(min, Math.min(max, current + delta));
  input.value = String(next);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function seekerStepDuration(seeker = null) {
  const speed = Number(seekerSpeedInput.value) || 3;
  const base = Math.max(0.24, SEEKER_BASE_SPEED - (speed - 3) * 0.045);
  let multiplier = seekerAlertActive(seeker) ? SEEKER_ALERT_SPEED_MULTIPLIER : 1;
  if ((seeker?.coordinationTimer || 0) > 0) multiplier *= SEEKER_BLACKBOARD_SPEED_MULTIPLIER;
  if (state.aiSeekerSlowTimer > 0) multiplier *= state.aiSeekerSlowMultiplier;
  if (state.aiDifficultyTimer > 0) multiplier *= state.aiDifficultyMultiplier;
  return Math.max(0.16, base * multiplier);
}

function launchGame() {
  void soundscape.start();
  state.started = true;
  state.sandboxMode = DEVELOPER_TOOLS_ENABLED && Boolean(startSandboxModeInput?.checked);
  syncDeveloperSection();
  startScreen.classList.add('hidden');
  startScreen.classList.remove('setup-open');
  closeMenuPanel({ resume: false, notify: false });
  if (pauseButton) pauseButton.textContent = 'Pause';
  toggleEditor(false);
  const requestedPreset = startWorldSelect.value || state.worldPreset;
  if (state.customLayoutActive && requestedPreset === state.worldPreset) {
    startNewRound({ silent: true });
    updateCamera(true);
    state.minimapDirty = true;
  } else {
    state.customLayoutActive = false;
    applyPreset(requestedPreset, true);
  }
  state.round = 'playing';
  hidePauseOverlay();
  if (state.sandboxMode) toggleEditor(true);
  updateGemHud();
  setToast(state.sandboxMode ? 'Sandbox mode: seekers disabled while you reshape the map.' : 'Find the gems before the seekers enter.');
}

function returnToStart() {
  state.started = false;
  state.round = 'menu';
  state.sandboxMode = false;
  syncDeveloperSection();
  startScreen.classList.remove('hidden');
  startScreen.classList.remove('setup-open');
  startSetup.classList.add('hidden');
  closeMenuPanel({ resume: false, notify: false });
  closeAiPanel({ resume: false, notify: false });
  roundPanel.classList.add('hidden');
  toggleEditor(false);
  hidePauseOverlay();
  setToast('Back at the start menu.');
}

function openMenuPanel() {
  if (!menuPanel.classList.contains('hidden')) return;
  closeAiPanel({ resume: false, notify: false });
  syncDeveloperSection();
  menuPanel.classList.remove('hidden');
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close menu');
  if (state.started && state.round === 'playing') {
    state.round = 'paused';
    state.menuPausedGame = true;
    showPauseOverlay('Paused.', { persist: true });
  }
  syncMobileControls();
}

function closeMenuPanel(options = {}) {
  const { resume = true, notify = true } = options;
  if (menuPanel.classList.contains('hidden')) {
    state.menuPausedGame = false;
    return;
  }
  menuPanel.classList.add('hidden');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  if (resume && state.menuPausedGame && state.started && state.round === 'paused') {
    state.round = 'playing';
    if (pauseButton) pauseButton.textContent = 'Pause';
    if (notify) showPauseOverlay('Resumed.');
    else hidePauseOverlay();
  }
  state.menuPausedGame = false;
  syncMobileControls();
}

function resumeFromMenu() {
  closeMenuPanel({ resume: false, notify: false });
  if (state.started && state.round === 'paused') {
    state.round = 'playing';
    if (pauseButton) pauseButton.textContent = 'Pause';
    showPauseOverlay('Resumed.');
  }
  syncMobileControls();
}

function toggleMenuPanel() {
  if (menuPanel.classList.contains('hidden')) openMenuPanel();
  else closeMenuPanel();
}

function openAiPanel() {
  if (!aiPanel || !aiPanel.classList.contains('hidden')) return;
  closeMenuPanel({ resume: false, notify: false });
  syncAiPanel();
  setAiPanelTab(aiHasKey() ? 'chat' : 'settings');
  aiPanel.classList.remove('hidden');
  aiButton?.setAttribute('aria-expanded', 'true');
  if (state.started && state.round === 'playing') {
    state.round = 'paused';
    state.aiPausedGame = true;
    showPauseOverlay('Paused.', { persist: true });
  } else {
    state.aiPausedGame = false;
  }
  syncMobileControls();
}

function closeAiPanel(options = {}) {
  const { resume = true, notify = true } = options;
  if (!aiPanel || aiPanel.classList.contains('hidden')) {
    state.aiPausedGame = false;
    return;
  }
  aiPanel.classList.add('hidden');
  aiButton?.setAttribute('aria-expanded', 'false');
  if (resume && state.aiPausedGame && state.started && state.round === 'paused') {
    state.round = 'playing';
    if (pauseButton) pauseButton.textContent = 'Pause';
    if (notify) showPauseOverlay('Resumed.');
    else hidePauseOverlay();
  }
  state.aiPausedGame = false;
  syncMobileControls();
}

function toggleAiPanel() {
  if (!aiPanel) return;
  if (aiPanel.classList.contains('hidden')) openAiPanel();
  else closeAiPanel();
}

function resetStreetViewLook(pointerId = null) {
  const drag = state.streetLookDrag;
  if (!drag.active) return;
  if (pointerId !== null && drag.pointerId !== pointerId) return;
  if (drag.pointerId !== null && canvas?.hasPointerCapture?.(drag.pointerId)) {
    try {
      canvas.releasePointerCapture(drag.pointerId);
    } catch {
      // Pointer capture may already be gone after browser cleanup.
    }
  }
  drag.active = false;
  drag.pointerId = null;
  drag.lastX = 0;
  drag.lastY = 0;
  canvas?.classList.remove('street-view-dragging');
}

function beginStreetViewLook(event) {
  if (!state.playerViewMode || state.editorOpen || state.round !== 'playing' || !state.player?.group) return false;
  if (event.pointerType === 'mouse' && event.button !== 0) return false;
  resetStreetViewLook();
  state.streetLookDrag.active = true;
  state.streetLookDrag.pointerId = event.pointerId;
  state.streetLookDrag.lastX = event.clientX;
  state.streetLookDrag.lastY = event.clientY;
  canvas?.setPointerCapture?.(event.pointerId);
  canvas?.classList.add('street-view-dragging');
  event.preventDefault();
  return true;
}

function dragStreetViewLook(event) {
  const drag = state.streetLookDrag;
  if (!drag.active || drag.pointerId !== event.pointerId || !state.player?.group) return false;
  const dx = event.clientX - drag.lastX;
  const dy = event.clientY - drag.lastY;
  drag.lastX = event.clientX;
  drag.lastY = event.clientY;
  state.player.group.rotation.y -= dx * STREET_VIEW_LOOK_SENSITIVITY_X;
  state.streetLookPitch = Math.max(
    -STREET_VIEW_MAX_PITCH,
    Math.min(STREET_VIEW_MAX_PITCH, state.streetLookPitch - dy * STREET_VIEW_LOOK_SENSITIVITY_Y)
  );
  updateCamera(true);
  event.preventDefault();
  return true;
}

function showStreetViewHint() {
  if (!streetViewHint) return;
  streetViewHint.classList.remove('hidden');
  state.streetViewHintTimer = 3.6;
}

function hideStreetViewHint() {
  if (!streetViewHint) return;
  streetViewHint.classList.add('hidden');
  state.streetViewHintTimer = 0;
}

function syncPlayerViewButton() {
  if (!playerViewButton) return;
  const label = state.playerViewMode ? 'Exit Street View' : 'Open Street View';
  playerViewButton.classList.toggle('active', state.playerViewMode);
  canvas?.classList.toggle('street-view-active', state.playerViewMode);
  if (!state.playerViewMode) resetStreetViewLook();
  playerViewButton.setAttribute('aria-pressed', String(state.playerViewMode));
  playerViewButton.setAttribute('aria-label', label);
  playerViewButton.setAttribute('title', label);
  if (playerViewLabel) playerViewLabel.textContent = label;
}

function setPlayerViewMode(force = !state.playerViewMode) {
  const nextMode = Boolean(force);
  if (nextMode && !state.playerViewMode) state.streetLookPitch = 0;
  if (!nextMode) {
    resetStreetViewLook();
    hideStreetViewHint();
  }
  state.playerViewMode = nextMode;
  syncPlayerViewButton();
  updateCameraProjection();
  updateCamera(true);
  if (state.playerViewMode) showStreetViewHint();
  setToast(state.playerViewMode ? 'Street view on.' : 'Map view on.', { duration: 1.2 });
}

function syncDeveloperSection() {
  const sandboxAvailable = DEVELOPER_TOOLS_ENABLED && state.sandboxMode;
  if (!DEVELOPER_TOOLS_ENABLED) {
    state.sandboxMode = false;
    state.editorOpen = false;
    state.mapEditorMode = false;
    state.mapSelectMode = false;
    if (startSandboxModeInput) {
      startSandboxModeInput.checked = false;
      startSandboxModeInput.disabled = true;
    }
  }
  setElementHidden(setupDevCategory, !DEVELOPER_TOOLS_ENABLED);
  setElementHidden(developerSection, !sandboxAvailable);
  setElementHidden(editorToolbar, !state.editorOpen || !DEVELOPER_TOOLS_ENABLED);
  setElementHidden(mapEditorModeButton, !DEVELOPER_TOOLS_ENABLED);
  setElementHidden(mapViewControls, !DEVELOPER_TOOLS_ENABLED);
  setElementHidden(mapCommandBar, !DEVELOPER_TOOLS_ENABLED);
  syncMapEditorControls();
}

function setElementHidden(element, hidden) {
  if (!element) return;
  element.hidden = hidden;
  element.classList.toggle('hidden', hidden);
}

function togglePause() {
  if (!state.started) return;
  if (state.round === 'playing') {
    state.round = 'paused';
    if (pauseButton) pauseButton.textContent = 'Resume';
    showPauseOverlay('Paused.', { persist: true });
    syncMobileControls();
  } else if (state.round === 'paused') {
    state.round = 'playing';
    if (pauseButton) pauseButton.textContent = 'Pause';
    showPauseOverlay('Resumed.');
    syncMobileControls();
  }
}

function initialize() {
  populateWorldSelects();
  applyDifficulty('medium');
  if (!applyPersistedLayout(true)) applyPreset(state.worldPreset, true);
  updateControlBindingLabels();
  syncDeveloperSection();
  syncAiPanel();
  syncPlayerViewButton();
  syncTouchControlsToggle();
  syncMobileControls();
  syncResponsiveHud();
  renderModelBrowser();
  updateMapEditorHint();
  state.round = 'menu';
  updateCameraProjection();
  updateCamera(true);
}

function loadControlBindings() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTROL_STORAGE_KEY) || '{}');
    return Object.fromEntries(Object.entries(CONTROL_DEFS).map(([key, def]) => [key, saved[key] || def.defaultCode]));
  } catch {
    return Object.fromEntries(Object.entries(CONTROL_DEFS).map(([key, def]) => [key, def.defaultCode]));
  }
}

function saveControlBindings() {
  localStorage.setItem(CONTROL_STORAGE_KEY, JSON.stringify(controlBindings));
}

function controlCodes(action) {
  const def = CONTROL_DEFS[action];
  return [controlBindings[action] || def.defaultCode, ...def.fallbackCodes];
}

function controlActive(action) {
  if (action === 'run' && state.mobileRunActive) return true;
  return controlCodes(action).some((code) => keys.has(code));
}

function prefersTouchControls() {
  return Boolean(
    window.matchMedia?.('(hover: none), (pointer: coarse), (max-width: 760px)').matches
  );
}

function syncTouchControlsToggle() {
  if (!touchControlsToggle) return;
  touchControlsToggle.setAttribute('aria-pressed', String(state.touchControlsForced));
  touchControlsToggle.classList.toggle('active', state.touchControlsForced);
  const label = touchControlsToggle.querySelector('b');
  if (label) label.textContent = state.touchControlsForced ? 'Hide' : 'Show';
}

function setTouchControlsForced(force) {
  state.touchControlsForced = force;
  localStorage.setItem(TOUCH_CONTROLS_STORAGE_KEY, force ? '1' : '0');
  syncTouchControlsToggle();
  syncMobileControls();
}

function toggleTouchControlsFromEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  const now = performance.now();
  if (event.type === 'click' && now - lastTouchControlsPointerToggleAt < 350) return;
  if (event.type === 'pointerdown') lastTouchControlsPointerToggleAt = now;
  setTouchControlsForced(!state.touchControlsForced);
}

function codeLabel(code) {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ArrowUp') return '↑';
  if (code === 'ArrowDown') return '↓';
  if (code === 'ArrowLeft') return '←';
  if (code === 'ArrowRight') return '→';
  if (code === 'Space') return 'Space';
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'Shift';
  return code.replace(/Left|Right/g, '').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function controlLabel(action) {
  const def = CONTROL_DEFS[action];
  const labels = [controlBindings[action] || def.defaultCode, ...def.fallbackCodes]
    .map(codeLabel)
    .filter((label, index, list) => list.indexOf(label) === index);
  return labels.join(' / ');
}

function updateControlBindingLabels() {
  for (const button of controlBindButtons) {
    const action = button.dataset.control;
    const output = button.querySelector('kbd');
    if (output) output.textContent = controlLabel(action);
    button.classList.toggle('listening', pendingControl === action);
  }
}

function setPendingControl(action) {
  pendingControl = action;
  updateControlBindingLabels();
  setToast(`Press a key for ${CONTROL_DEFS[action].label}.`);
}

function isControlCode(code) {
  return Object.keys(CONTROL_DEFS).some((action) => controlCodes(action).includes(code));
}

function directionFromInput() {
  let screenX = 0;
  let screenY = 0;
  if (controlActive('up')) screenY -= 1;
  if (controlActive('down')) screenY += 1;
  if (controlActive('left')) screenX -= 1;
  if (controlActive('right')) screenX += 1;
  if (state.mobileJoystick.active || Math.hypot(state.mobileJoystick.screenX, state.mobileJoystick.screenY) > 0.04) {
    screenX += state.mobileJoystick.screenX;
    screenY += state.mobileJoystick.screenY;
  }

  if (state.playerViewMode && state.player?.group) {
    const forwardInput = Math.max(-1, Math.min(1, -screenY));
    const strafeInput = Math.max(-1, Math.min(1, -screenX));
    const moveAmount = Math.min(1, Math.hypot(forwardInput, strafeInput));
    if (moveAmount < 0.05) return null;
    const yaw = state.player.group.rotation.y;
    const dx = Math.sin(yaw) * forwardInput + Math.cos(yaw) * strafeInput;
    const dz = Math.cos(yaw) * forwardInput - Math.sin(yaw) * strafeInput;
    const length = Math.max(1, Math.hypot(dx, dz));
    return {
      dx: dx / length,
      dz: dz / length,
      facing: null,
      street: true,
      moveAmount,
      forwardInput,
      strafeInput
    };
  }

  if (Math.hypot(screenX, screenY) < 0.05) return null;
  let dx = screenX + screenY;
  let dz = screenY - screenX;
  const length = Math.hypot(dx, dz);
  dx /= length;
  dz /= length;
  const facing = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
  return { dx, dz, facing };
}

function setMobileJoystickFromPointer(event) {
  if (!mobileJoystick || !mobileJoystickKnob) return;
  const rect = mobileJoystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxTravel = Math.max(24, rect.width * 0.32);
  const rawX = event.clientX - centerX;
  const rawY = event.clientY - centerY;
  const distance = Math.hypot(rawX, rawY);
  const travel = Math.min(maxTravel, distance);
  const unitX = distance > 0 ? rawX / distance : 0;
  const unitY = distance > 0 ? rawY / distance : 0;

  state.mobileJoystick.screenX = (unitX * travel) / maxTravel;
  state.mobileJoystick.screenY = (unitY * travel) / maxTravel;
  mobileJoystickKnob.style.transform = `translate(${unitX * travel}px, ${unitY * travel}px)`;
}

function resetMobileJoystick() {
  const pointerId = state.mobileJoystick.pointerId;
  if (pointerId !== null && mobileJoystick?.hasPointerCapture?.(pointerId)) {
    try {
      mobileJoystick.releasePointerCapture(pointerId);
    } catch {
      // The browser may already have released capture during pointer cleanup.
    }
  }
  state.mobileJoystick.active = false;
  state.mobileJoystick.pointerId = null;
  state.mobileJoystick.screenX = 0;
  state.mobileJoystick.screenY = 0;
  if (mobileJoystickKnob) mobileJoystickKnob.style.transform = 'translate(0, 0)';
}

function resetMobileRun() {
  const pointerId = state.mobileRunPointerId;
  if (pointerId !== null && mobileRunButton?.hasPointerCapture?.(pointerId)) {
    try {
      mobileRunButton.releasePointerCapture(pointerId);
    } catch {
      // The browser may already have released capture during pointer cleanup.
    }
  }
  state.mobileRunActive = false;
  state.mobileRunPointerId = null;
  mobileRunButton?.classList.remove('active');
}

function syncMobileControls() {
  if (!mobileControls) return;
  const enabled = state.touchControlsForced || prefersTouchControls();
  const shouldHide = (
    !enabled ||
    state.round !== 'playing' ||
    state.editorOpen ||
    !startScreen.classList.contains('hidden') ||
    !roundPanel.classList.contains('hidden')
  );
  mobileControls.classList.toggle('spawned', enabled && !shouldHide);
  mobileControls.classList.toggle('disabled', shouldHide);
  if (shouldHide) {
    resetMobileJoystick();
    resetMobileRun();
  }
}

function canReachBoxForPush(fromCell, boxCell) {
  if (!fromCell || !boxCell) return false;
  if (canWalkBetween(fromCell, boxCell, 'player')) return true;
  const adjacent = Math.abs(fromCell.x - boxCell.x) + Math.abs(fromCell.z - boxCell.z) === 1;
  return adjacent && (
    connectsByStairs(fromCell, boxCell) ||
    Math.abs(walkHeight(fromCell) - walkHeight(boxCell)) <= LEVEL_HEIGHT * 0.75
  );
}

function canBoxMoveBetween(fromCell, toCell) {
  if (!fromCell || !toCell?.active || propBlocks(toCell)) return false;
  if (seekerAt(toCell.x, toCell.z)) return false;
  return canWalkBetween(fromCell, toCell, 'box');
}

function boxCanChainPush(box, dx, dz) {
  if (!box.anim) return true;
  return box.anim.dx === dx && box.anim.dz === dz && box.anim.t >= BOX_PUSH_CHAIN_AFTER;
}

function boxVisualPosition(box, fallback) {
  return box.group?.position ? box.group.position.clone() : fallback;
}

function tryPushBox(fromCell, box, dx, dz) {
  if (!boxCanChainPush(box, dx, dz)) return false;
  const boxCell = getCell(box.x, box.z);
  if (!canReachBoxForPush(fromCell, boxCell)) return false;

  const chain = [box];
  let cursor = box;
  while (chain.length < 4) {
    const nextBox = boxAt(cursor.x + dx, cursor.z + dz);
    if (!nextBox) break;
    if (!boxCanChainPush(nextBox, dx, dz)) return false;
    chain.push(nextBox);
    cursor = nextBox;
  }

  const finalDest = getCell(cursor.x + dx, cursor.z + dz);
  if (!finalDest?.active || boxAt(finalDest.x, finalDest.z) || propBlocks(finalDest)) return false;
  if (seekerAt(finalDest.x, finalDest.z)) return false;

  const planned = [];
  for (const item of chain) {
    const currentCell = getCell(item.x, item.z);
    const dest = getCell(item.x + dx, item.z + dz);
    if (!canBoxMoveBetween(currentCell, dest)) return false;
    planned.push({
      box: item,
      dest,
      from: boxVisualPosition(item, worldPosition(item.x, item.z, walkHeight(currentCell))),
      to: worldPosition(dest.x, dest.z, walkHeight(dest))
    });
  }

  for (let i = planned.length - 1; i >= 0; i -= 1) {
    const move = planned[i];
    move.box.anim = { from: move.from, to: move.to, t: 0, duration: BOX_PUSH_DURATION, dx, dz };
    move.box.x = move.dest.x;
    move.box.z = move.dest.z;
  }
  return true;
}

function canEnterCell(fromCell, toCell) {
  if (!toCell?.active || propBlocks(toCell)) return false;
  if (isSameCell(fromCell, toCell)) return true;
  const dx = Math.sign(toCell.x - fromCell.x);
  const dz = Math.sign(toCell.z - fromCell.z);
  if (Math.abs(dx) + Math.abs(dz) > 1) return false;
  const blockingBox = boxAt(toCell.x, toCell.z);
  if (blockingBox) return tryPushBox(fromCell, blockingBox, dx, dz);
  return canWalkBetween(fromCell, toCell, 'player');
}

function tryApplyPlayerAxis(dxWorld, dzWorld, delta) {
  if (!dxWorld && !dzWorld) return true;
  const current = state.player.group.position;
  const fromCell = state.player.cell;
  const toCell = cellFromWorldPosition(current.x + dxWorld, current.z + dzWorld);
  if (!canEnterCell(fromCell, toCell)) return false;

  current.x += dxWorld;
  current.z += dzWorld;
  if (!isSameCell(fromCell, toCell)) {
    rememberPlayerMovement(fromCell, toCell);
    state.player.cell = toCell;
    state.minimapDirty = true;
  }
  const targetY = walkHeight(toCell);
  current.y += (targetY - current.y) * Math.min(1, 18 * delta);
  return true;
}

function updatePlayer(delta) {
  const velocity = state.playerVelocity;
  const direction = directionFromInput();
  let running = false;
  if (direction && state.round === 'playing' && !state.editorOpen) {
    if (direction.street) {
      const moveAmount = Math.max(0, Math.min(1, direction.moveAmount || 0));
      const movingStreet = moveAmount > 0.05;
      running = movingStreet && controlActive('run');
      const reverseMultiplier = direction.forwardInput < -0.05 ? STREET_VIEW_REVERSE_MULTIPLIER : 1;
      const speedCap = PLAYER_MOVE_SPEED * state.aiPlayerSpeedMultiplier * STREET_VIEW_MOVE_MULTIPLIER * reverseMultiplier * (running ? PLAYER_RUN_MULTIPLIER : 1);
      const targetX = movingStreet ? direction.dx * moveAmount * speedCap : 0;
      const targetZ = movingStreet ? direction.dz * moveAmount * speedCap : 0;
      const steer = 1 - Math.exp(-(running ? PLAYER_RUN_STEER_RESPONSE : PLAYER_STEER_RESPONSE) * delta);
      velocity.x += (targetX - velocity.x) * steer;
      velocity.z += (targetZ - velocity.z) * steer;
      const speed = Math.hypot(velocity.x, velocity.z);
      const maxSpeed = speedCap * Math.abs(moveAmount);
      if (speed > Math.max(PLAYER_EPSILON, maxSpeed)) {
        velocity.x = maxSpeed > 0 ? (velocity.x / speed) * maxSpeed : 0;
        velocity.z = maxSpeed > 0 ? (velocity.z / speed) * maxSpeed : 0;
      }
    } else {
      running = controlActive('run');
      const speedCap = PLAYER_MOVE_SPEED * state.aiPlayerSpeedMultiplier * (running ? PLAYER_RUN_MULTIPLIER : 1);
      const steer = 1 - Math.exp(-(running ? PLAYER_RUN_STEER_RESPONSE : PLAYER_STEER_RESPONSE) * delta);
      velocity.x += (direction.dx * speedCap - velocity.x) * steer;
      velocity.z += (direction.dz * speedCap - velocity.z) * steer;
      const speed = Math.hypot(velocity.x, velocity.z);
      if (speed > speedCap) {
        velocity.x = (velocity.x / speed) * speedCap;
        velocity.z = (velocity.z / speed) * speedCap;
      }
      state.player.group.rotation.y = lerpAngle(
        state.player.group.rotation.y,
        yawForDirection(direction.dx, direction.dz),
        1 - Math.exp(-PLAYER_TURN_RESPONSE * delta)
      );
    }
  } else {
    velocity.multiplyScalar(Math.exp(-PLAYER_STOP_RESPONSE * delta));
    if (velocity.lengthSq() < PLAYER_EPSILON * PLAYER_EPSILON) velocity.set(0, 0, 0);
  }

  let moved = false;
  if (Math.abs(velocity.x) > PLAYER_EPSILON) {
    const ok = tryApplyPlayerAxis(velocity.x * delta, 0, delta);
    if (!ok) velocity.x = 0;
    moved ||= ok;
  }
  if (Math.abs(velocity.z) > PLAYER_EPSILON) {
    const ok = tryApplyPlayerAxis(0, velocity.z * delta, delta);
    if (!ok) velocity.z = 0;
    moved ||= ok;
  }

  const cell = cellFromWorldPosition(state.player.group.position.x, state.player.group.position.z);
  if (cell?.active) {
    state.player.cell = cell;
    state.player.group.position.y += (walkHeight(cell) - state.player.group.position.y) * Math.min(1, 14 * delta);
  }
  collectNearbyGem();
  checkEscapeAtPlayer();
  animateCharacter(state.player.group, moved && velocity.lengthSq() > 0.01 ? clock.elapsedTime * 9 : 0);
  const runningMovement = running && moved && velocity.lengthSq() > PLAYER_MOVE_SPEED * PLAYER_MOVE_SPEED * 0.42;
  soundscape.setRunLoop(runningMovement);
  updatePlayerDustTrail(delta, runningMovement);
}

function animateCharacter(group, phase) {
  for (const part of group.children) {
    const name = part.userData.name;
    if (!name || (!name.startsWith('arm') && !name.startsWith('leg'))) continue;
    const sign = name.endsWith('L') ? 1 : -1;
    part.rotation.x = Math.sin(phase) * 0.42 * sign;
  }
}

function spawnDustPuff() {
  if (!state.player?.group) return;
  const velocity = state.playerVelocity;
  const speed = Math.hypot(velocity.x, velocity.z);
  if (speed < PLAYER_MOVE_SPEED * 0.35) return;
  const nx = velocity.x / speed;
  const nz = velocity.z / speed;
  const side = (Math.random() - 0.5) * 0.54;
  const puff = new THREE.Sprite(dustMaterial.clone());
  const p = state.player.group.position;
  puff.position.set(
    p.x - nx * 0.48 - nz * side,
    p.y + 0.12,
    p.z - nz * 0.48 + nx * side
  );
  const scale = 0.46 + Math.random() * 0.24;
  puff.scale.set(scale, scale * 0.72, 1);
  puff.renderOrder = 3;
  puff.userData.dust = {
    age: 0,
    life: 0.52 + Math.random() * 0.18,
    scale,
    vx: -nx * (0.2 + Math.random() * 0.12) + (Math.random() - 0.5) * 0.1,
    vz: -nz * (0.2 + Math.random() * 0.12) + (Math.random() - 0.5) * 0.1,
    vy: 0.12 + Math.random() * 0.06
  };
  dynamic.add(puff);
  state.dustPuffs.push(puff);
}

function updatePlayerDustTrail(delta, shouldEmit) {
  if (shouldEmit) {
    state.playerDustTimer -= delta;
    while (state.playerDustTimer <= 0) {
      spawnDustPuff();
      state.playerDustTimer += PLAYER_DUST_INTERVAL;
    }
  } else {
    state.playerDustTimer = 0;
  }
}

function updateDustPuffs(delta) {
  for (let i = state.dustPuffs.length - 1; i >= 0; i -= 1) {
    const puff = state.dustPuffs[i];
    const data = puff.userData.dust;
    data.age += delta;
    const t = data.age / data.life;
    if (t >= 1) {
      dynamic.remove(puff);
      puff.material.dispose();
      state.dustPuffs.splice(i, 1);
      continue;
    }
    puff.position.x += data.vx * delta;
    puff.position.y += data.vy * delta;
    puff.position.z += data.vz * delta;
    const scale = data.scale * (1 + t * 2.25);
    puff.scale.set(scale, scale * 0.72, 1);
    puff.material.opacity = 0.74 * (1 - t) * (1 - t * 0.18);
  }
}

function updateBoxes(delta) {
  for (const box of state.boxes) {
    if (!box.group) continue;
    if (box.anim) {
      box.anim.t = Math.min(1, box.anim.t + delta / (box.anim.duration || BOX_PUSH_DURATION));
      const eased = box.anim.t * box.anim.t * (3 - 2 * box.anim.t);
      box.group.position.lerpVectors(box.anim.from, box.anim.to, eased);
      if (box.anim.t >= 1) {
        const cell = getCell(box.x, box.z);
        box.group.position.copy(worldPosition(box.x, box.z, walkHeight(cell)));
        box.anim = null;
        state.minimapDirty = true;
      }
    }
  }
}

function collectGemAt(cell) {
  if (!cell) return;
  const gem = state.gems.find((item) => !item.collected && item.x === cell.x && item.z === cell.z);
  if (!gem) return;
  gem.collected = true;
  state.collected += 1;
  state.runStats.bestGemStreak = Math.max(state.runStats.bestGemStreak || 0, state.collected);
  if (gem.group) gem.group.visible = false;
  soundscape.chime();
  state.minimapDirty = true;
  updateGemHud();
  if (state.collected >= state.gems.length) unlockEscapeRoute();
}

function collectNearbyGem() {
  const playerPosition = state.player.group.position;
  for (const gem of state.gems) {
    if (gem.collected) continue;
    const gemCell = getCell(gem.x, gem.z);
    const gemPosition = worldPosition(gem.x, gem.z, walkHeight(gemCell));
    const dx = gemPosition.x - playerPosition.x;
    const dz = gemPosition.z - playerPosition.z;
    const dy = Math.abs(walkHeight(gemCell) - walkHeight(state.player.cell));
    if (dy < 0.72 && Math.hypot(dx, dz) < CELL * 0.36) {
      collectGemAt(gemCell);
      return;
    }
  }
}

function unlockEscapeRoute() {
  if (state.escapeUnlocked || state.round !== 'playing') return;
  state.escapeUnlocked = true;
  state.runStats.allGemsCollected = true;
  setEscapeVisualActive(true);
  state.releaseCountdown = 0;
  state.nextSeekerAt = 0;
  updateEscapeHuntSignal('All gems gone. Converging.');
  updateGemHud();
  state.minimapDirty = true;
  state.playerVelocity.set(0, 0, 0);
  keys.clear();
  const target = escapeTargetPosition();
  if (target) {
    state.round = 'escapeReveal';
    state.escapeReveal = {
      elapsed: 0,
      target: target.clone()
    };
    state.cameraOverride = target.clone();
    setToast('Seekers now know your exact location', { urgent: true, duration: 3.1 });
  } else {
    setToast('Seekers now know your exact location', { urgent: true, duration: 3.1 });
  }
}

function checkEscapeAtPlayer() {
  if (!state.escapeUnlocked || state.round !== 'playing' || !state.escapeCell || !state.player?.group) return;
  const target = escapeTargetPosition();
  if (!target) return;
  const p = state.player.group.position;
  const sameCell = isSameCell(state.player.cell, state.escapeCell);
  if (sameCell || Math.hypot(p.x - target.x, p.z - target.z) <= ESCAPE_TRIGGER_DISTANCE) {
    state.runStats.escaped = true;
    finishRound(true);
  }
}

function yawForEntry(entry) {
  const dir = DIRECTIONS[entry?.face] || null;
  if (dir) return yawForDirection(dir.dx, dir.dz);
  const start = state.level?.start;
  return start ? yawForDirection(start.x - entry.cell.x, start.z - entry.cell.z) : 0;
}

function spawnSeeker() {
  clearSeekerEntryPath();
  const entries = seekerEntries();
  const spawnEntry = entries[state.seekersSpawned % Math.max(1, entries.length)];
  const entry = spawnEntry?.cell;
  if (!entry?.active) return;
  const seeker = {
    id: state.nextSeekerId++,
    cell: entry,
    role: 'searcher',
    target: null,
    moving: null,
    lastSeen: null,
    memoryTimer: 0,
    goal: null,
    goalTimer: 0,
    coordinationTimer: 0,
    blockedTimer: 0,
    blockedDir: null,
    message: 'Scanning entry route.',
    messageTimer: 0,
    spawn: { x: spawnEntry.x, z: spawnEntry.z, face: spawnEntry.face || null },
    group: makeSeekerCharacter()
  };
  seeker.group.rotation.y = yawForEntry(spawnEntry);
  dynamic.add(seeker.group);
  placeGroupOnCell(seeker.group, entry);
  state.seekers.push(seeker);
  state.seekersSpawned += 1;
  if (escapeHuntTarget()) {
    seeker.message = 'Escape alert. Joining the chase.';
    seeker.messageTimer = 3.4;
    updateEscapeHuntSignal();
  }
  state.minimapDirty = true;
}

function lineOfSight(seeker, to) {
  if (!seeker?.group || !state.player?.group) return false;
  const fromPosition = seeker.group.position;
  const targetPosition = state.player.group.position;
  const from = cellFromWorldPosition(fromPosition.x, fromPosition.z) || seeker.cell;
  const targetCell = cellFromWorldPosition(targetPosition.x, targetPosition.z) || to || state.player.cell;
  if (!from || !targetCell) return false;
  const dx = targetPosition.x - fromPosition.x;
  const dz = targetPosition.z - fromPosition.z;
  const distance = Math.hypot(dx, dz);
  if (distance > SEEKER_VISION_RANGE * 1.03 || distance < 0.001) return false;

  const forwardX = Math.sin(seeker.group.rotation.y);
  const forwardZ = Math.cos(seeker.group.rotation.y);
  const dot = (dx / distance) * forwardX + (dz / distance) * forwardZ;
  if (dot < Math.cos((SEEKER_VISION_ANGLE * 1.08) / 2)) return false;

  const steps = Math.max(2, Math.ceil(distance / (CELL * 0.32)));
  const fromKey = `${from.x},${from.z}`;
  const toKey = `${targetCell.x},${targetCell.z}`;
  const fromEye = walkHeight(from) + 0.9;
  const targetEye = walkHeight(targetCell) + 0.7;
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const cell = cellFromWorldPosition(
      fromPosition.x + dx * t,
      fromPosition.z + dz * t
    );
    const key = cell ? `${cell.x},${cell.z}` : '';
    if (key === fromKey || key === toKey) continue;
    if (!cell?.active || boxAt(cell.x, cell.z) || propBlocks(cell)) return false;
    const sightHeight = fromEye + (targetEye - fromEye) * t;
    if (walkHeight(cell) > sightHeight + LEVEL_HEIGHT * 0.55) return false;
  }
  return true;
}

function seekerAlertActive(seeker) {
  return Boolean(
    seeker &&
    (escapeHuntTarget() ||
      (seeker.memoryTimer || 0) > 0 ||
      seeker.lastSeen ||
      (state.squad.lastSeenCell && ['chaser', 'flanker'].includes(seeker.role)))
  );
}

function setSeekerAlert(seeker, visible) {
  const alert = seeker?.group?.children.find((child) => child.userData?.alert);
  const pulse = 1 + Math.sin(clock.elapsedTime * (visible ? 10 : 4) + (seeker?.id || 0)) * (visible ? 0.16 : 0.06);
  const beam = seeker?.group?.children.find((child) => child.userData?.flashlightBeam);
  const core = seeker?.group?.children.find((child) => child.userData?.flashlightCore);
  const edge = seeker?.group?.children.find((child) => child.userData?.flashlightEdge);
  const lamp = seeker?.group?.children.find((child) => child.userData?.flashlight);
  if (beam?.material) beam.material.opacity = (visible ? 0.36 : 0.24) * pulse;
  if (core?.material) core.material.opacity = (visible ? 0.32 : 0.18) * pulse;
  if (edge?.material) edge.material.opacity = (visible ? 0.74 : 0.5) * pulse;
  const glow = lamp?.children.find((child) => child.userData?.flashlightGlow);
  if (glow?.material) glow.material.opacity = Math.min(1, (visible ? 0.98 : 0.78) * pulse);
  if (alert) {
    alert.visible = visible;
    const baseScale = alert.userData.baseScale || 0.72;
    const baseY = alert.userData.baseY || 2.02;
    alert.scale.setScalar(baseScale * pulse);
    alert.position.y = baseY + Math.abs(Math.sin(clock.elapsedTime * 10 + seeker.id)) * 0.12;
  }
}

function cellKey(cell) {
  return `${cell.x},${cell.z}`;
}

function gridDistance(a, b) {
  if (!a || !b) return Infinity;
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

function resetSquadBlackboard() {
  state.squad = {
    lastSeenCell: null,
    lastSeenTimer: 0,
    predictedCell: null,
    focusCell: null,
    focusArea: null,
    focusRadius: SEEKER_BLACKBOARD_RADIUS,
    focusTimer: 0,
    abilityCooldown: 0,
    abilityLabel: '',
    playerPreviousCell: state.player?.cell || null,
    playerMoveVector: { dx: 0, dz: 0 },
    searchClaims: {}
  };
}

function rememberPlayerMovement(fromCell, toCell) {
  if (!fromCell || !toCell || isSameCell(fromCell, toCell)) return;
  state.squad.playerPreviousCell = fromCell;
  state.squad.playerMoveVector = {
    dx: Math.sign(toCell.x - fromCell.x),
    dz: Math.sign(toCell.z - fromCell.z)
  };
}

function seekerWalkable(cell) {
  return Boolean(cell?.active && !boxAt(cell.x, cell.z) && !propBlocks(cell));
}

function boxBetweenCells(from, to) {
  if (!from || !to) return null;
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  if (Math.abs(dx) === 2 && dz === 0) return boxAt(from.x + Math.sign(dx), from.z);
  if (Math.abs(dz) === 2 && dx === 0) return boxAt(from.x, from.z + Math.sign(dz));
  return null;
}

function isSeekerVaultStep(from, to) {
  return Boolean(boxBetweenCells(from, to));
}

function seekerVaultThreshold(seeker) {
  if (!seeker.vaultThreshold) seeker.vaultThreshold = 5 + Math.random() * 2;
  return seeker.vaultThreshold;
}

function canSeekerVaultBox(seeker, from, key) {
  if (!seeker || !from) return null;
  const dir = DIRECTIONS[key];
  const blocked = getCell(from.x + dir.dx, from.z + dir.dz);
  const landing = getCell(from.x + dir.dx * 2, from.z + dir.dz * 2);
  if (!blocked || !landing) return null;
  if (!boxAt(blocked.x, blocked.z)) return null;
  if (isEntryCell(landing) && !isEntryCell(from)) return null;
  if (!landing.active || boxAt(landing.x, landing.z) || propBlocks(landing) || seekerAt(landing.x, landing.z)) return null;
  if (Math.abs(walkHeight(from) - walkHeight(landing)) > 0.04) return null;
  if (isSameCell(from, seeker.cell) && (seeker.blockedTimer || 0) < seekerVaultThreshold(seeker)) return null;
  return landing;
}

function boxBlockDirectionTowardGoal(seeker, goal) {
  if (!seeker?.cell || !goal) return null;
  const ranked = DIRECTION_KEYS
    .map((key) => {
      const dir = DIRECTIONS[key];
      const blocked = getCell(seeker.cell.x + dir.dx, seeker.cell.z + dir.dz);
      const distanceGain = gridDistance(seeker.cell, goal) - gridDistance(blocked, goal);
      return { key, blocked, distanceGain };
    })
    .filter((item) => item.blocked && boxAt(item.blocked.x, item.blocked.z))
    .sort((a, b) => b.distanceGain - a.distanceGain);
  return ranked.find((item) => item.distanceGain >= 0)?.key || null;
}

function updateSeekerBlockedState(seeker, goal, delta) {
  const key = boxBlockDirectionTowardGoal(seeker, goal);
  if (!key) {
    seeker.blockedTimer = Math.max(0, (seeker.blockedTimer || 0) - delta * 1.5);
    if (seeker.blockedTimer <= 0) seeker.blockedDir = null;
    return;
  }
  if (seeker.blockedDir !== key) {
    seeker.blockedDir = key;
    seeker.blockedTimer = 0;
    seeker.vaultThreshold = 5 + Math.random() * 2;
  }
  seeker.blockedTimer += delta;
}

function isEntryCell(cell) {
  return Boolean(cell && entryRefs().some((entry) => isEntryRefCell(cell, entry)));
}

function seekerNeighbors(cell, seeker = null) {
  const out = [];
  for (const key of DIRECTION_KEYS) {
    const dir = DIRECTIONS[key];
    const next = getCell(cell.x + dir.dx, cell.z + dir.dz);
    if (isEntryCell(next) && !isEntryCell(cell)) continue;
    if (next?.active && !boxAt(next.x, next.z) && !propBlocks(next) && canWalkBetween(cell, next, 'seeker')) out.push(next);
    const vault = seeker && isSameCell(cell, seeker.cell) ? canSeekerVaultBox(seeker, cell, key) : null;
    if (vault) out.push(vault);
  }
  return out;
}

function seekerMoveCost(from, to, goal) {
  let cost = 1;
  if (isSeekerVaultStep(from, to)) cost += 0.7;
  if (to.stairs) cost += 0.12;
  if (to.height > 0) cost += 0.08 * to.height;
  if (seekerAt(to.x, to.z) && !isSameCell(to, goal)) cost += 2.6;
  const zoneA = zoneStyle(from).map;
  const zoneB = zoneStyle(to).map;
  if (zoneA !== zoneB) cost += 0.18;
  return cost;
}

function predictPlayerCell(sourceCell = state.squad.lastSeenCell || state.signalPingCell || state.player?.cell) {
  if (!sourceCell) return null;
  const move = state.squad.playerMoveVector || { dx: 0, dz: 0 };
  if (!move.dx && !move.dz) return sourceCell;
  let current = sourceCell;
  let best = sourceCell;
  for (let i = 0; i < SEEKER_PREDICTION_STEPS; i += 1) {
    const next = getCell(current.x + move.dx, current.z + move.dz);
    if (!seekerWalkable(next) || !canWalkBetween(current, next, 'seeker')) break;
    best = next;
    current = next;
  }
  return best;
}

function areaAroundCell(cell, radius = SEEKER_BLACKBOARD_RADIUS) {
  if (!cell || !state.level) return null;
  return {
    x0: Math.max(0, cell.x - radius),
    z0: Math.max(0, cell.z - radius),
    x1: Math.min(state.level.width - 1, cell.x + radius),
    z1: Math.min(state.level.height - 1, cell.z + radius)
  };
}

function focusAreaCells() {
  const area = state.squad.focusArea;
  if (!area) return [];
  const cells = [];
  for (let z = area.z0; z <= area.z1; z += 1) {
    for (let x = area.x0; x <= area.x1; x += 1) {
      const cell = getCell(x, z);
      if (seekerWalkable(cell) && !isEntryCell(cell)) cells.push(cell);
    }
  }
  return cells;
}

function setAgentPulse(message) {
  state.squad.abilityLabel = message;
  if (agentPulseText) agentPulseText.textContent = message;
}

function playCaughtCue() {
  if ((state.caughtCueCooldown || 0) > 0) return;
  soundscape.caught();
  state.caughtCueCooldown = 1.15;
}

function getAiGameState() {
  return {
    difficulty: state.difficulty,
    gemsCollected: state.collected,
    gemTotal: state.gems.length,
    boxCount: state.boxes.length,
    seekerCount: state.seekers.length,
    seekersTarget: Number(seekerCountInput.value || 0),
    seekerSpeed: Number(seekerSpeedInput.value || 0),
    playerSpeedMultiplier: Number(state.aiPlayerSpeedMultiplier || 1),
    escapeUnlocked: state.escapeUnlocked,
    playerCell: state.player?.cell ? { x: state.player.cell.x, z: state.player.cell.z } : null,
    activeEffects: {
      slowSeekers: Math.ceil(state.aiSeekerSlowTimer),
      stunSeekers: Math.ceil(state.aiSeekerStunTimer),
      difficultyBoost: Math.ceil(state.aiDifficultyTimer),
      playerSpeed: Math.ceil(state.aiPlayerSpeedTimer)
    }
  };
}

function clampAiAmount(value, max = 8, min = 1) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? Math.round(value) : min));
}

function aiIntensityFromText(text) {
  if (/\b(max|maximum|insane|extreme|super|way|massively|huge|tons?|a lot|lots|crazy)\b/.test(text)) return 5;
  if (/\b(very|really|much|significantly|greatly|fast fast|hard hard)\b/.test(text)) return 4;
  if (/\b(more|harder|faster|slower|easier|hard|easy)\b/.test(text)) return 2;
  if (/\b(tiny|slight|slightly|little|a bit|tad|small)\b/.test(text)) return 1;
  return 1;
}

function aiNumberFromText(text, fallback = null) {
  const digit = text.match(/\b(\d{1,2})\b/);
  if (digit) return Number(digit[1]);
  const words = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    dozen: 12
  };
  for (const [word, value] of Object.entries(words)) {
    if (new RegExp(`\\b${word}\\b`).test(text)) return value;
  }
  return fallback;
}

function aiAmountForPrompt(text, max, fallback = 1) {
  return clampAiAmount(aiNumberFromText(text, null) ?? aiIntensityFromText(text) ?? fallback, max);
}

function inferLocalAiAction(prompt) {
  const text = prompt.toLowerCase();
  if (/\b(i|me|my|myself|player|runner|avatar)\b.*\b(slow|slower|reduce|decrease|less speed|too fast)\b|\b(slow|reduce|decrease).*\b(me|my speed|player|runner|avatar)\b/.test(text)) {
    return { action: 'slow_player', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Player speed dampened for a moment.' };
  }
  if (/\b(i|me|my|myself|player|runner|avatar)\b.*\b(fast|faster|speed|boost|haste|quick|quicker)\b|\b(make|speed up|boost|increase).*\b(me|my speed|player|runner|avatar)\b/.test(text)) {
    return { action: 'boost_player', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Player speed boosted.' };
  }
  if (/(remove|delete|despawn|less|fewer|take away).*(seekers?|agents?)/.test(text)) {
    return { action: 'remove_seeker', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.seeker), message: 'Seeker pressure reduced.' };
  }
  if (/(more|extra|add|spawn|send|summon).*(seekers?|agents?)/.test(text)) {
    return { action: 'add_seeker', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.seeker), message: 'Extra seekers entering. Risk reward raised.' };
  }
  if (/(remove|delete|despawn|less|fewer|take away).*(gems?|objectives?)/.test(text)) {
    return { action: 'remove_gem', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.gem), message: 'Objective count reduced. Score adjusted for rover help.' };
  }
  if (/(more|extra|add|spawn|another|new).*(gems?|objectives?)/.test(text)) {
    return { action: 'add_gem', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.gem), message: 'Bonus objectives deployed. Score adjusted for rover help.' };
  }
  if (/(remove|delete|clear|despawn).*(boxes?|crates?)/.test(text)) {
    return { action: 'remove_box', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.box), message: 'A few boxes were cleared from the route.' };
  }
  if (/(more|extra|add|spawn|place).*(boxes?|crates?)/.test(text)) {
    return { action: 'add_box', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.box), message: 'New push boxes deployed.' };
  }
  if (/(seekers?|agents?).*(very|really|much|way|super|maximum|max|faster|fast)|make (the )?(seekers?|agents?).*(fast|faster)|speed up (the )?(seekers?|agents?)/.test(text)) {
    return { action: 'speed_seekers', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Seekers accelerated.' };
  }
  if (/(seekers?|agents?).*(slow|slower|calm|less speed)|slow (down )?(the )?(seekers?|agents?)/.test(text)) {
    return { action: 'slow_seekers', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Electric slowdown fired. Seekers are moving slower.' };
  }
  if (/stun|shock|zap|freeze/.test(text)) {
    return { action: 'stun_seekers', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Shock burst ready. Seekers are stunned for a moment.' };
  }
  if (/hard|ramp|harder|challenge|difficulty up|more difficult|more intense/.test(text)) {
    return { action: 'ramp_difficulty', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Difficulty ramped. Seekers will move with more urgency.' };
  }
  if (/easy|easier|slow|calm|less difficult|help/.test(text)) {
    return { action: 'ease_game', amount: aiAmountForPrompt(text, AI_TOOL_LIMITS.speed, 2), message: 'Pressure softened and the route was made safer.' };
  }
  if (/where|hint|gem|exit|gate/.test(text)) {
    return { action: 'reveal_hint', amount: 1, message: 'Hint pulse sent toward the nearest objective.' };
  }
  return { action: 'ease_game', amount: 1, message: 'The rover softened the pressure for a few seconds.' };
}

async function requestAiAgentAction(prompt) {
  const settings = readAiSettings();
  if (!settings.key) return inferLocalAiAction(prompt);
  try {
    const response = await fetch('/api/agent-brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        provider: settings.provider,
        endpoint: settings.endpoint,
        apiKey: settings.key,
        model: settings.model || AI_RECOMMENDED_MODEL,
        gameState: getAiGameState()
      })
    });
    if (!response.ok) throw new Error(`AI route failed: ${response.status}`);
    const data = await response.json();
    if (!data || typeof data.action !== 'string') throw new Error('AI route returned no action');
    return data;
  } catch {
    return inferLocalAiAction(prompt);
  }
}

function nearestUncollectedGemCell() {
  if (!state.player?.cell) return null;
  let best = null;
  let bestDistance = Infinity;
  for (const gem of state.gems) {
    if (gem.collected) continue;
    const cell = getCell(gem.x, gem.z);
    const distance = cell ? gridDistance(state.player.cell, cell) : Infinity;
    if (distance < bestDistance) {
      best = cell;
      bestDistance = distance;
    }
  }
  return best || state.escapeCell || null;
}

function spawnAiBonusGem() {
  if (state.escapeUnlocked) return null;
  const occupied = new Set(state.gems.filter((gem) => !gem.collected).map((gem) => `${gem.x},${gem.z}`));
  const fallback = state.cells.filter((cell) => passableGemCell(cell) && !cell.stairs);
  const candidates = [...usableGemSpawnCells(), ...fallback]
    .filter((cell, index, list) => (
      cell &&
      list.findIndex((item) => item?.x === cell.x && item?.z === cell.z) === index &&
      !occupied.has(`${cell.x},${cell.z}`) &&
      (!state.player?.cell || gridDistance(state.player.cell, cell) >= 3)
    ));
  const pool = candidates.length
    ? candidates
    : fallback.filter((cell) => !occupied.has(`${cell.x},${cell.z}`));
  if (!pool.length) return null;
  const cell = pool[Math.floor(Math.random() * pool.length)];
  const gem = { x: cell.x, z: cell.z, collected: false, bonus: true };
  state.gems.push(gem);
  makeGemMesh(gem);
  updateGemHud();
  state.minimapDirty = true;
  return cell;
}

function removeAiObjectiveGem(count = 1) {
  if (state.escapeUnlocked) return 0;
  const candidates = state.gems
    .filter((gem) => !gem.collected)
    .map((gem) => {
      const cell = getCell(gem.x, gem.z);
      const distance = state.player?.cell && cell ? gridDistance(state.player.cell, cell) : 0;
      return { gem, distance };
    })
    .sort((a, b) => b.distance - a.distance);
  let removed = 0;
  while (removed < count && candidates.length && state.gems.length - state.collected > 1) {
    const { gem } = candidates.shift();
    if (gem.group?.parent) gem.group.parent.remove(gem.group);
    const index = state.gems.indexOf(gem);
    if (index >= 0) {
      state.gems.splice(index, 1);
      removed += 1;
    }
  }
  if (removed) {
    updateGemHud();
    state.minimapDirty = true;
    if (state.collected >= state.gems.length) unlockEscapeRoute();
  }
  return removed;
}

function addAiSeekerTarget(count = 1) {
  const current = Number(seekerCountInput.value || 0);
  const next = Math.min(30, current + count);
  syncRange(startSeekerCountInput, seekerCountInput, startSeekerCountValue, seekerCountValue, next);
  let spawned = 0;
  while (!state.sandboxMode && state.seekersSpawned < next && spawned < count) {
    const beforeSpawn = state.seekers.length;
    spawnSeeker();
    if (state.seekers.length <= beforeSpawn) break;
    spawned += 1;
  }
  assignSeekerRoles();
  updateSeekerPanel(true);
  return { next, spawned };
}

function aiToolLimitForAction(action) {
  if (action.includes('gem')) return AI_TOOL_LIMITS.gem;
  if (action.includes('seeker')) return AI_TOOL_LIMITS.seeker;
  if (action.includes('box')) return AI_TOOL_LIMITS.box;
  return AI_TOOL_LIMITS.speed;
}

function promptHasExplicitAiToolIntent(prompt = '') {
  const text = String(prompt).toLowerCase();
  const hasTarget = /\b(seekers?|agents?|guards?|chasers?|gems?|diamonds?|boxes?|crates?|player|runner|me|my|avatar|speed|difficulty)\b/.test(text);
  const hasChange = /\b(add|spawn|more|increase|remove|delete|less|fewer|slow|slower|fast|faster|speed|boost|harder|easier|easy|hard|very|super|extreme|maximum)\b/.test(text);
  return hasTarget && hasChange;
}

function normalizeAiCompanionAction(result, sourcePrompt = '') {
  const fallback = inferLocalAiAction(sourcePrompt);
  let action = AI_ACTIONS.has(result?.action) ? result.action : fallback.action;
  const fallbackIsSpecific = fallback.action !== 'ease_game' && fallback.action !== 'reveal_hint';
  const promptHasToolIntent = promptHasExplicitAiToolIntent(sourcePrompt);
  if (fallbackIsSpecific && action === 'reveal_hint') action = fallback.action;
  if (fallbackIsSpecific && promptHasToolIntent) {
    action = fallback.action;
  }
  const explicitAmount = aiNumberFromText(sourcePrompt.toLowerCase(), null);
  const requestedAmount = Number.isFinite(explicitAmount)
    ? explicitAmount
    : Number(result?.amount ?? fallback.amount ?? 1);
  const amount = clampAiAmount(requestedAmount, aiToolLimitForAction(action));
  const message = String(
    fallbackIsSpecific && promptHasToolIntent
      ? fallback.message
      : result?.message || fallback.message || 'Rover action complete.'
  ).slice(0, 140);
  return { action, amount, message };
}

function setSeekerSpeedByDelta(delta = 0) {
  const current = Number(seekerSpeedInput.value || startSeekerSpeedInput.value || 3);
  const next = clampInputValue(seekerSpeedInput, current + delta);
  syncRange(startSeekerSpeedInput, seekerSpeedInput, startSeekerSpeedValue, seekerSpeedValue, next);
  inferDifficultyFromSettings();
  return next - current;
}

function setPlayerSpeedEffect(amount = 1, faster = true) {
  const strength = clampAiAmount(amount, AI_TOOL_LIMITS.speed);
  state.aiPlayerSpeedTimer = Math.max(state.aiPlayerSpeedTimer, 9 + strength * 2.5);
  state.aiPlayerSpeedMultiplier = faster
    ? Math.max(1.22, 1 + strength * 0.16)
    : Math.max(0.48, 1 - strength * 0.1);
  if (state.player?.group) {
    addAiBeam(state.player.group.position, faster ? 'green' : 'amber', {
      targetYOffset: 0.9,
      life: 0.85,
      width: 1.34 + strength * 0.08
    });
  }
  addAiShockwave();
}

function aiBoxPlacementCandidates() {
  const occupiedGems = new Set(state.gems.filter((gem) => !gem.collected).map((gem) => `${gem.x},${gem.z}`));
  const entryKeys = new Set(entryRefs().map((entry) => `${entry.x},${entry.z}`));
  const playerCell = state.player?.cell || null;
  return state.cells
    .filter((cell) => (
      cell.active &&
      !cell.stairs &&
      !cell.prop &&
      !boxAt(cell.x, cell.z) &&
      !seekerAt(cell.x, cell.z) &&
      !occupiedGems.has(`${cell.x},${cell.z}`) &&
      !entryKeys.has(`${cell.x},${cell.z}`) &&
      (!playerCell || gridDistance(playerCell, cell) >= 2)
    ))
    .sort((a, b) => {
      if (!playerCell) return 0;
      return Math.abs(gridDistance(playerCell, a) - 4) - Math.abs(gridDistance(playerCell, b) - 4);
    });
}

function addAiBoxes(count = 1) {
  const candidates = aiBoxPlacementCandidates();
  let added = 0;
  while (added < count && candidates.length) {
    const cell = candidates.shift();
    const box = { x: cell.x, z: cell.z, homeX: cell.x, homeZ: cell.z };
    state.boxes.push(box);
    makeBoxObject(box);
    addAiBeamToCell(cell, 'amber', { targetYOffset: 0.95, life: 0.72, width: 1.1 });
    added += 1;
  }
  if (added) state.minimapDirty = true;
  return added;
}

function removeAiBoxes(count = 1) {
  const playerCell = state.player?.cell || null;
  const candidates = state.boxes
    .map((box) => {
      const cell = getCell(Math.round(box.x), Math.round(box.z));
      const distance = playerCell && cell ? gridDistance(playerCell, cell) : 0;
      return { box, distance };
    })
    .sort((a, b) => a.distance - b.distance);
  let removed = 0;
  while (removed < count && candidates.length) {
    const { box } = candidates.shift();
    if (box.group?.parent) box.group.parent.remove(box.group);
    state.boxes = state.boxes.filter((item) => item !== box);
    removed += 1;
  }
  if (removed) {
    addAiShockwave();
    state.minimapDirty = true;
  }
  return removed;
}

function removeAiSeekers(count = 1) {
  const playerCell = state.player?.cell || null;
  const candidates = state.seekers
    .map((seeker) => ({ seeker, distance: playerCell ? gridDistance(playerCell, seeker.cell) : 0 }))
    .sort((a, b) => b.distance - a.distance);
  let removed = 0;
  while (removed < count && candidates.length) {
    const { seeker } = candidates.shift();
    if (seeker.group?.parent) seeker.group.parent.remove(seeker.group);
    state.seekers = state.seekers.filter((item) => item !== seeker);
    removed += 1;
  }
  if (removed) {
    const current = Number(seekerCountInput.value || 0);
    const min = Number(seekerCountInput.min || 0);
    const next = Math.max(min, current - removed);
    syncRange(startSeekerCountInput, seekerCountInput, startSeekerCountValue, seekerCountValue, next);
    state.seekersSpawned = Math.min(state.seekersSpawned, next);
    assignSeekerRoles();
    updateSeekerPanel(true);
    state.minimapDirty = true;
  }
  return removed;
}

function recordAiScore(action, amount = 1) {
  const modifier = AI_TOOL_SCORE[action] || 0;
  state.runStats.aiModifier = (state.runStats.aiModifier || 0) + modifier * Math.max(1, amount);
  state.runStats.aiActions = (state.runStats.aiActions || 0) + 1;
}

function applyAiCompanionAction(result, sourcePrompt = '') {
  const normalized = normalizeAiCompanionAction(result, sourcePrompt);
  const { action, amount } = normalized;
  let message = normalized.message;
  recordAiScore(action, amount);
  ensureAiCompanion();

  if (action === 'slow_seekers') {
    setSeekerSpeedByDelta(-Math.max(1, Math.floor(amount / 2)));
    state.aiSeekerSlowTimer = Math.max(state.aiSeekerSlowTimer, 8 + amount * 2);
    state.aiSeekerSlowMultiplier = 1.55 + amount * 0.16;
    state.seekers.forEach((seeker) => addAiBeamToSeeker(seeker, 'electric', { life: 0.9, width: 1.48 + amount * 0.08 }));
    addAiShockwave();
    message = amount >= 4 ? 'Heavy electric slowdown fired. Seekers are moving much slower.' : message;
  } else if (action === 'stun_seekers') {
    state.aiSeekerStunTimer = Math.max(state.aiSeekerStunTimer, 1.6 + amount * 0.55);
    state.seekers.forEach((seeker) => addAiBeamToSeeker(seeker, 'electric', { life: 0.92, width: 1.56 + amount * 0.08 }));
    addAiShockwave();
    message = amount >= 4 ? 'High-voltage stun burst fired.' : message;
  } else if (action === 'ramp_difficulty' || action === 'speed_seekers') {
    setSeekerSpeedByDelta(amount);
    state.aiDifficultyTimer = Math.max(state.aiDifficultyTimer, 8 + amount * 2);
    state.aiDifficultyMultiplier = Math.max(0.34, 0.86 - amount * 0.08);
    state.seekers.forEach((seeker) => {
      seeker.group.userData.aiBoostTimer = Math.max(seeker.group.userData.aiBoostTimer || 0, 1.6 + amount * 0.25);
      addAiBeamToSeeker(seeker, 'green', { life: 0.82, width: 1.32 + amount * 0.06 });
    });
    triggerAgentBlackboard('sighting', state.player?.cell);
    setSquadMessages(amount >= 4 ? 'Rover surge accepted. Full pursuit speed.' : 'Rover raised the stakes. Converging faster.', 3.2);
    message = amount >= 4 ? 'Seekers are now much faster.' : message;
  } else if (action === 'focus_seekers') {
    if (state.player?.group) addAiBeam(state.player.group.position, 'amber', { targetYOffset: 0.85, life: 0.65, width: 1.28 });
    triggerAgentBlackboard('sighting', state.player?.cell);
    setSquadMessages('Rover broadcast a clean challenge ping.', 3.2);
  } else if (action === 'reveal_hint') {
    const cell = nearestUncollectedGemCell();
    if (cell) {
      state.signalPingCell = cell;
      state.signalPingArea = areaAroundCell(cell, 0);
      state.signalPingTimer = PLAYER_SIGNAL_INTERVAL;
      state.minimapDirty = true;
      addAiBeamToCell(cell, 'electric', { targetYOffset: 1.1, life: 0.72, width: 1.18 });
    }
  } else if (action === 'add_gem') {
    let added = 0;
    for (let i = 0; i < amount; i += 1) {
      const cell = spawnAiBonusGem();
      if (!cell) break;
      addAiBeamToCell(cell, 'electric', { targetYOffset: 1.12, life: 0.8, width: 1.32 });
      added += 1;
    }
    if (added) {
      message = `${added} bonus gem${added === 1 ? '' : 's'} deployed.`;
    } else {
      message = 'No safe bonus gem spot is available right now.';
    }
  } else if (action === 'remove_gem') {
    const removed = removeAiObjectiveGem(amount);
    if (removed) {
      addAiShockwave();
      message = `${removed} unclaimed gem${removed === 1 ? '' : 's'} removed.`;
    } else {
      message = 'No removable gem is available right now.';
    }
  } else if (action === 'add_seeker') {
    const before = state.seekers.length;
    const { spawned, next } = addAiSeekerTarget(amount);
    state.seekers.slice(before).forEach((seeker) => addAiBeamToSeeker(seeker, 'amber', { life: 0.82, width: 1.34 }));
    message = spawned
      ? `${spawned} extra seeker${spawned === 1 ? '' : 's'} entering.`
      : `Seeker target raised to ${next}.`;
  } else if (action === 'remove_seeker') {
    const removed = removeAiSeekers(amount);
    message = removed
      ? `${removed} seeker${removed === 1 ? '' : 's'} recalled.`
      : 'No active seeker can be recalled right now.';
  } else if (action === 'add_box') {
    const added = addAiBoxes(amount);
    message = added
      ? `${added} push box${added === 1 ? '' : 'es'} deployed.`
      : 'No safe box placement is available right now.';
  } else if (action === 'remove_box') {
    const removed = removeAiBoxes(amount);
    message = removed
      ? `${removed} push box${removed === 1 ? '' : 'es'} cleared.`
      : 'No removable box is available right now.';
  } else if (action === 'boost_player') {
    setPlayerSpeedEffect(amount, true);
    message = amount >= 4 ? 'Strong player speed boost online.' : message;
  } else if (action === 'slow_player') {
    setPlayerSpeedEffect(amount, false);
    message = amount >= 4 ? 'Player speed heavily dampened.' : message;
  } else {
    state.aiSeekerSlowTimer = Math.max(state.aiSeekerSlowTimer, 5 + amount);
    state.aiSeekerSlowMultiplier = 1.35 + amount * 0.08;
    setPlayerSpeedEffect(Math.min(amount, 3), true);
    state.seekers.slice(0, 4).forEach((seeker) => addAiBeamToSeeker(seeker, 'electric', { life: 0.72, width: 1.2 }));
    message = message || 'Pressure eased briefly.';
  }

  addAiCompanionMessage(`Rover: ${message}`);
  setToast(message, { duration: 2.8 });
}

async function handleAiCommand(event) {
  event.preventDefault();
  const prompt = aiCommandInput?.value?.trim();
  if (!prompt || state.aiCompanionBusy) return;
  if (!aiHasKey()) {
    addAiCompanionMessage('Rover offline: save an API key first.');
    setToast('Save an API key to spawn the rover companion.', { urgent: true });
    syncAiCompanionAvailability();
    return;
  }
  if (!aiCanUseGameTools()) {
    addAiCompanionMessage('Rover: start a run once, then I can help whenever you open this panel.');
    setToast('Start a run once to activate rover tools.');
    return;
  }
  state.aiCompanionBusy = true;
  syncAiCompanionAvailability();
  addAiCompanionMessage(`You: ${prompt}`);
  aiCommandInput.value = '';
  const result = await requestAiAgentAction(prompt);
  applyAiCompanionAction(result, prompt);
  state.aiCompanionBusy = false;
  syncAiCompanionAvailability();
}

function sendAiSuggestion(prompt) {
  if (!aiCommandInput || !prompt) return;
  aiCommandInput.value = prompt;
  aiCommandInput.focus();
  if (aiHasKey() && aiCanUseGameTools() && !state.aiCompanionBusy) {
    aiCommandForm?.requestSubmit();
  }
}

function aiCanUseGameTools() {
  return Boolean(state.started && state.player?.group && (state.round === 'playing' || state.round === 'paused'));
}

function triggerAgentBlackboard(reason = 'signal', anchorCell = null, sourceSeeker = null) {
  if (state.round !== 'playing' || state.sandboxMode || !state.seekers.length) return false;

  const predicted = predictPlayerCell(anchorCell || state.squad.predictedCell || state.signalPingCell || state.player?.cell);
  const focus = predicted || anchorCell || state.player?.cell;
  if (!focus || !seekerWalkable(focus)) return false;
  if (state.squad.abilityCooldown > 0) {
    const sameFocus = state.squad.focusCell && gridDistance(state.squad.focusCell, focus) <= 1;
    if (reason !== 'tracker' && (reason !== 'sighting' || sameFocus)) return false;
  }

  const focusDuration = reason === 'tracker' ? SEEKER_TRACKER_FOCUS_SECONDS : SEEKER_BLACKBOARD_DURATION;
  const focusRadius = reason === 'tracker' ? 0 : SEEKER_BLACKBOARD_RADIUS;
  state.squad.focusCell = focus;
  state.squad.focusArea = areaAroundCell(focus, focusRadius);
  state.squad.focusRadius = focusRadius;
  state.squad.focusTimer = focusDuration;
  state.squad.abilityCooldown = SEEKER_BLACKBOARD_INTERVAL;
  state.squad.searchClaims = {};
  if (!state.squad.predictedCell) state.squad.predictedCell = focus;

  assignSeekerRoles();
  const focusCells = focusAreaCells();
  state.seekers.forEach((seeker, index) => {
    seeker.coordinationTimer = focusDuration + index * 0.08;
    const focusCandidate = focusCells.length ? focusCells[(index * 3) % focusCells.length] : focus;
    seeker.goal = roleGoalForSeeker(seeker) || focusCandidate;
    if (!seeker.goal || isSameCell(seeker.goal, seeker.cell)) seeker.goal = focusCandidate;
    seeker.goalTimer = focusDuration + 0.8;
  });
  if (sourceSeeker) sourceSeeker.goal = focus;

  if (reason === 'tracker') setAgentPulse('Tracker tripped: exact location shared');
  state.minimapDirty = true;
  return true;
}

function broadcastSighting(seeker, playerCell) {
  state.squad.lastSeenCell = playerCell;
  state.squad.lastSeenTimer = SEEKER_SQUAD_MEMORY_SECONDS;
  state.squad.predictedCell = predictPlayerCell(playerCell);
  state.squad.searchClaims = {};
  seeker.lastSeen = playerCell;
  seeker.memoryTimer = SEEKER_MEMORY_SECONDS;
  seeker.goal = null;
  seeker.goalTimer = 0;
  triggerAgentBlackboard('sighting', playerCell, seeker);
  setSquadMessages((ally) => (
    ally.id === seeker.id
      ? 'Visual contact. Pursuing.'
      : (ally.role === 'guard' ? 'Contact call. Holding exits.' : 'Contact call. Re-routing.')
  ), 3.2);
}

function updateSquadBlackboard(delta) {
  if (escapeHuntTarget()) {
    updateEscapeHuntSignal();
    return;
  }
  state.squad.lastSeenTimer = Math.max(0, state.squad.lastSeenTimer - delta);
  state.squad.focusTimer = Math.max(0, (state.squad.focusTimer || 0) - delta);
  state.squad.abilityCooldown = Math.max(0, (state.squad.abilityCooldown || 0) - delta);
  if (state.squad.lastSeenTimer <= 0) {
    state.squad.lastSeenCell = null;
    state.squad.predictedCell = null;
  } else if (state.squad.focusRadius === 0 && state.squad.focusTimer > 0) {
    state.squad.predictedCell = state.squad.lastSeenCell;
  } else {
    state.squad.predictedCell = predictPlayerCell(state.squad.lastSeenCell);
  }
  if (state.squad.focusTimer <= 0) {
    state.squad.focusCell = null;
    state.squad.focusArea = null;
    state.squad.focusRadius = SEEKER_BLACKBOARD_RADIUS;
    state.squad.abilityLabel = '';
  } else if (state.squad.lastSeenCell && state.squad.focusRadius !== 0) {
    const predicted = predictPlayerCell(state.squad.lastSeenCell);
    if (predicted) {
      state.squad.focusCell = predicted;
      state.squad.focusArea = areaAroundCell(predicted, state.squad.focusRadius ?? SEEKER_BLACKBOARD_RADIUS);
    }
  }
  for (const [id, claim] of Object.entries(state.squad.searchClaims)) {
    claim.ttl -= delta;
    if (claim.ttl <= 0) delete state.squad.searchClaims[id];
  }
  for (const seeker of state.seekers) {
    seeker.coordinationTimer = Math.max(0, (seeker.coordinationTimer || 0) - delta);
  }
}

function claimedByOther(seeker, cell) {
  return Object.entries(state.squad.searchClaims).some(([id, claim]) => (
    Number(id) !== seeker.id &&
    claim.x === cell.x &&
    claim.z === cell.z
  ));
}

function claimSearchTarget(seeker, cell) {
  if (!seeker?.id || !cell) return;
  state.squad.searchClaims[seeker.id] = {
    x: cell.x,
    z: cell.z,
    ttl: SEEKER_SEARCH_CLAIM_SECONDS
  };
}

function playerSignalCells() {
  if (!state.signalPingArea) return [];
  const cells = [];
  for (let z = state.signalPingArea.z0; z <= state.signalPingArea.z1; z += 1) {
    for (let x = state.signalPingArea.x0; x <= state.signalPingArea.x1; x += 1) {
      const cell = getCell(x, z);
      if (seekerWalkable(cell) && !isEntryCell(cell)) cells.push(cell);
    }
  }
  return cells;
}

function chokepointTargetNear(anchor, seeker) {
  const candidates = state.cells
    .filter((cell) => {
      if (!seekerWalkable(cell) || isEntryCell(cell)) return false;
      const degree = seekerNeighbors(cell).length;
      return degree <= 2 || Boolean(cell.stairs) || cell.height >= 3;
    })
    .map((cell) => ({
      cell,
      score: gridDistance(cell, anchor || state.player.cell) * 0.9 + gridDistance(cell, seeker.cell) * 0.35 - (cell.stairs ? 1.4 : 0) - (cell.height >= 3 ? 1.1 : 0)
    }))
    .sort((a, b) => a.score - b.score);
  return candidates[0]?.cell || null;
}

function zoneSearchTarget(seeker) {
  const anchor = state.squad.focusCell || state.squad.predictedCell || state.squad.lastSeenCell || state.signalPingCell;
  const candidates = [];
  for (const cell of focusAreaCells()) {
    if (!claimedByOther(seeker, cell)) candidates.push({ cell, weight: 20 - gridDistance(cell, state.squad.focusCell || cell) });
  }
  for (const cell of playerSignalCells()) {
    if (!claimedByOther(seeker, cell)) candidates.push({ cell, weight: 16 - gridDistance(cell, state.signalPingCell) });
  }
  for (const gem of state.gems) {
    if (gem.collected) continue;
    const cell = getCell(gem.x, gem.z);
    if (seekerWalkable(cell) && !claimedByOther(seeker, cell)) {
      candidates.push({ cell, weight: 9 - gridDistance(cell, anchor || state.player.cell) * 0.25 });
    }
  }
  for (const cell of state.cells) {
    if (!seekerWalkable(cell) || isEntryCell(cell) || claimedByOther(seeker, cell)) continue;
    const degree = seekerNeighbors(cell).length;
    const zoneBonus = cell.zone ? 1.2 : 0;
    const anchorBias = anchor ? Math.max(0, 14 - gridDistance(cell, anchor)) * 0.28 : 0;
    if (degree <= 3 || zoneBonus || anchorBias) candidates.push({ cell, weight: 2.4 + zoneBonus + anchorBias - degree * 0.12 });
  }
  if (!candidates.length) return patrolTarget(seeker);
  candidates.sort((a, b) => {
    const scoreA = gridDistance(seeker.cell, a.cell) * 0.65 - a.weight + Math.random() * 1.2;
    const scoreB = gridDistance(seeker.cell, b.cell) * 0.65 - b.weight + Math.random() * 1.2;
    return scoreA - scoreB;
  });
  claimSearchTarget(seeker, candidates[0].cell);
  return candidates[0].cell;
}

function assignSeekerRoles() {
  const anchor = state.squad.lastSeenCell || state.squad.focusCell || state.signalPingCell || null;
  const seekers = state.seekers.slice();
  if (!seekers.length) return;
  seekers.sort((a, b) => gridDistance(a.cell, anchor || state.player.cell) - gridDistance(b.cell, anchor || state.player.cell));
  const rolePattern = ['chaser', 'guard', 'trapSetter', 'flanker', 'searcher', 'looseCannon'];
  seekers.forEach((seeker, index) => {
    seeker.role = rolePattern[index % rolePattern.length];
  });
}

function roleGoalForSeeker(seeker) {
  const escapeTarget = escapeHuntTarget();
  if (escapeTarget) return escapeTarget;
  const role = seeker.role || 'searcher';
  if (role === 'chaser') return state.squad.lastSeenCell || state.squad.focusCell || state.signalPingCell || patrolTarget(seeker);
  if (role === 'flanker') return state.squad.predictedCell || state.squad.focusCell || predictPlayerCell(state.squad.lastSeenCell) || zoneSearchTarget(seeker);
  if (role === 'guard') return chokepointTargetNear(state.squad.focusCell || state.squad.predictedCell || state.squad.lastSeenCell || state.signalPingCell, seeker) || zoneSearchTarget(seeker);
  if (role === 'trapSetter') return chokepointTargetNear(state.squad.focusCell || state.squad.predictedCell || state.signalPingCell || state.player.cell, seeker) || zoneSearchTarget(seeker);
  if (role === 'looseCannon') return state.squad.predictedCell || patrolTarget(seeker);
  return zoneSearchTarget(seeker);
}

const ROLE_LABELS = {
  chaser: 'Chaser',
  guard: 'Guard',
  trapSetter: 'Trap Setter',
  flanker: 'Flanker',
  searcher: 'Zone Search',
  looseCannon: 'Loose Cannon'
};

function roleLabel(role) {
  return ROLE_LABELS[role] || 'Searcher';
}

function defaultSeekerMessage(seeker) {
  if (seekerAlertActive(seeker)) return 'Contact. Closing distance.';
  if ((seeker.coordinationTimer || 0) > 0) return 'Shared ping received.';
  if ((seeker.blockedTimer || 0) >= seekerVaultThreshold(seeker) * 0.72) return 'Obstacle read. Preparing vault.';
  if (seeker.role === 'chaser') return 'Pressuring the runner.';
  if (seeker.role === 'guard') return 'Holding a chokepoint.';
  if (seeker.role === 'trapSetter') return 'Looking for a tracker spot.';
  if (seeker.role === 'flanker') return 'Taking a side route.';
  if (seeker.role === 'looseCannon') return 'Sweeping noisy paths.';
  return 'Searching assigned zone.';
}

function setSeekerMessage(seeker, message, seconds = 3.2) {
  if (!seeker) return;
  seeker.message = message;
  seeker.messageTimer = seconds;
}

function setSquadMessages(messages, seconds = 3.8) {
  for (const seeker of state.seekers) {
    const message = typeof messages === 'function' ? messages(seeker) : messages;
    setSeekerMessage(seeker, message, seconds);
  }
}

function trackerPlacementScore(cell, seeker = null) {
  if (!seekerWalkable(cell) || isEntryCell(cell) || trackerAtCell(cell)) return -Infinity;
  let score = 0;
  const degree = seekerNeighbors(cell).length;
  if (degree <= 2) score += 5;
  else if (degree <= 3) score += 2.2;
  if (cell.stairs) score += 2.5;
  if (cell.height >= 3) score += 1.2;
  if (state.signalPingCell) score += Math.max(0, 4 - gridDistance(cell, state.signalPingCell) * 0.7);
  if (state.squad.focusCell) score += Math.max(0, 5 - gridDistance(cell, state.squad.focusCell) * 0.75);
  for (const gem of state.gems) {
    if (gem.collected) continue;
    score += Math.max(0, 2.6 - gridDistance(cell, getCell(gem.x, gem.z)) * 0.4);
  }
  if (seeker?.cell) score -= gridDistance(cell, seeker.cell) * 0.24;
  if (state.player?.cell) score -= Math.max(0, 1.8 - gridDistance(cell, state.player.cell)) * 0.9;
  return score;
}

function trackerCandidateForSeeker(seeker) {
  if (!seeker?.cell) return null;
  const candidates = state.cells
    .filter((cell) => seekerWalkable(cell) && !isEntryCell(cell) && !trackerAtCell(cell))
    .filter((cell) => gridDistance(cell, seeker.cell) <= 3)
    .map((cell) => ({ cell, score: trackerPlacementScore(cell, seeker) }))
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return best && best.score >= 3.4 ? best.cell : null;
}

function addSeekerTracker(cell, sourceSeeker = null) {
  if (!cell || trackerAtCell(cell) || state.seekerTrackers.length >= SEEKER_TRACKER_MAX) return null;
  const tracker = {
    x: cell.x,
    z: cell.z,
    ttl: SEEKER_TRACKER_LIFETIME,
    sourceId: sourceSeeker?.id || null,
    group: null
  };
  state.seekerTrackers.push(tracker);
  makeSeekerTrackerMesh(tracker);
  if (sourceSeeker) setSeekerMessage(sourceSeeker, 'Tracker armed on route.', 3.2);
  state.minimapDirty = true;
  return tracker;
}

function triggerSeekerTracker(tracker) {
  const cell = state.player?.cell || getCell(tracker.x, tracker.z);
  if (!cell) return;
  state.runStats.traps += 1;
  playCaughtCue();
  state.squad.lastSeenCell = cell;
  state.squad.lastSeenTimer = SEEKER_TRACKER_FOCUS_SECONDS;
  state.squad.predictedCell = cell;
  state.squad.searchClaims = {};
  triggerAgentBlackboard('tracker', cell);
  setAgentPulse('Tracker tripped: exact location shared');
  setSquadMessages((seeker) => {
    if (seeker.role === 'chaser') return 'Trap ping. Sprinting to exact tile.';
    if (seeker.role === 'guard') return 'Trap ping. Blocking exits.';
    if (seeker.role === 'trapSetter') return 'Tracker confirmed. Re-arming route.';
    if (seeker.role === 'flanker') return 'Trap ping. Cutting across.';
    return 'Trap ping. Redirecting now.';
  }, SEEKER_TRACKER_FOCUS_SECONDS);
  state.screenFlashTimer = TRACKER_FLASH_SECONDS;
  screenFlash?.classList.remove('hidden');
  screenFlash?.classList.add('active');
  setToast('Tracker tripped. Exact location shared for 3 seconds.');
  removeSeekerTracker(tracker);
}

function updateSeekerTrackers(delta) {
  if (state.round !== 'playing' || state.editorOpen || state.sandboxMode) return;
  for (const tracker of [...state.seekerTrackers]) {
    tracker.ttl -= delta;
    if (tracker.group) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 6 + tracker.x) * 0.08;
      tracker.group.scale.setScalar(pulse);
      tracker.group.rotation.y += delta * 1.6;
    }
    if (tracker.ttl <= 0) {
      removeSeekerTracker(tracker);
      continue;
    }
    const position = worldPosition(tracker.x, tracker.z, walkHeight(getCell(tracker.x, tracker.z)));
    const player = state.player?.group?.position;
    if (player && Math.hypot(player.x - position.x, player.z - position.z) < SEEKER_TRACKER_TRIGGER_DISTANCE) {
      triggerSeekerTracker(tracker);
    }
  }

  state.trackerCooldown = Math.max(0, state.trackerCooldown - delta);
  if (state.releaseCountdown > 0 || state.trackerCooldown > 0 || state.seekerTrackers.length >= SEEKER_TRACKER_MAX) return;
  const setter = state.seekers.find((seeker) => seeker.role === 'trapSetter' && !seeker.moving) ||
    state.seekers.find((seeker) => seeker.role !== 'chaser' && !seeker.moving);
  if (!setter) return;
  const target = trackerCandidateForSeeker(setter);
  if (target) addSeekerTracker(target, setter);
  state.trackerCooldown = target ? SEEKER_TRACKER_COOLDOWN + Math.random() * 2 : 1.6;
}

function nextPathStep(start, goal, seeker = null) {
  if (!start || !goal || isSameCell(start, goal)) return null;
  const open = [start];
  const cameFrom = new Map([[cellKey(start), null]]);
  const gScore = new Map([[cellKey(start), 0]]);
  const fScore = new Map([[cellKey(start), gridDistance(start, goal)]]);
  const closed = new Set();
  let found = null;
  let best = start;
  let bestDistance = gridDistance(start, goal);

  const scoreFor = (cell) => fScore.get(cellKey(cell)) ?? Infinity;
  while (open.length) {
    open.sort((a, b) => scoreFor(a) - scoreFor(b));
    const current = open.shift();
    const currentKey = cellKey(current);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    const currentDistance = gridDistance(current, goal);
    if (currentDistance < bestDistance) {
      best = current;
      bestDistance = currentDistance;
    }
    if (isSameCell(current, goal)) {
      found = current;
      break;
    }
    for (const next of seekerNeighbors(current, seeker)) {
      const nextKey = cellKey(next);
      if (closed.has(nextKey)) continue;
      const tentative = (gScore.get(currentKey) ?? Infinity) + seekerMoveCost(current, next, goal);
      if (tentative >= (gScore.get(nextKey) ?? Infinity)) continue;
      cameFrom.set(nextKey, current);
      gScore.set(nextKey, tentative);
      fScore.set(nextKey, tentative + gridDistance(next, goal) * 1.14);
      open.push(next);
    }
  }

  const destination = found || best;
  if (!destination || isSameCell(destination, start)) return null;
  let cursor = destination;
  let previous = cameFrom.get(cellKey(cursor));
  while (previous && !isSameCell(previous, start)) {
    cursor = previous;
    previous = cameFrom.get(cellKey(cursor));
  }
  return cursor;
}

function patrolTarget(seeker) {
  const candidates = [];
  if (state.signalPingCell && seekerWalkable(state.signalPingCell)) {
    candidates.push({ cell: state.signalPingCell, weight: 18 });
  }
  for (const gem of state.gems) {
    if (gem.collected) continue;
    const cell = getCell(gem.x, gem.z);
    if (seekerWalkable(cell)) {
      const playerBias = Math.max(0, 18 - gridDistance(cell, state.player.cell)) * 0.55;
      candidates.push({ cell, weight: 8 + playerBias });
    }
  }

  for (const cell of state.cells) {
    if (!seekerWalkable(cell)) continue;
    if (isEntryCell(cell)) continue;
    const degree = seekerNeighbors(cell).length;
    if (cell.height >= 3 || degree <= 2) {
      candidates.push({ cell, weight: cell.height >= 3 ? 5.5 : 3.4 });
    }
  }

  if (!candidates.length) return state.player.cell;
  candidates.sort((a, b) => {
    const scoreA = gridDistance(seeker.cell, a.cell) * 0.9 - a.weight + Math.random() * 1.4;
    const scoreB = gridDistance(seeker.cell, b.cell) * 0.9 - b.weight + Math.random() * 1.4;
    return scoreA - scoreB;
  });
  return candidates[0]?.cell || state.player.cell;
}

function updatePlayerSignal(delta) {
  if (!state.player?.cell) return;
  state.signalPingTimer -= delta;
  if (state.signalPingTimer > 0) return;

  const size = PLAYER_SIGNAL_RADIUS * 2;
  const x0 = Math.max(0, Math.min(state.level.width - size, state.player.cell.x - PLAYER_SIGNAL_RADIUS));
  const z0 = Math.max(0, Math.min(state.level.height - size, state.player.cell.z - PLAYER_SIGNAL_RADIUS));
  const area = { x0, z0, x1: x0 + size - 1, z1: z0 + size - 1 };
  const candidates = [];
  for (let z = area.z0; z <= area.z1; z += 1) {
    for (let x = area.x0; x <= area.x1; x += 1) {
      const cell = getCell(x, z);
      if (seekerWalkable(cell) && !isEntryCell(cell)) candidates.push(cell);
    }
  }

  state.signalPingArea = area;
  state.signalPingCell = candidates.length ? randomFrom(candidates) : state.player.cell;
  if (!state.squad.lastSeenCell) state.squad.predictedCell = predictPlayerCell(state.signalPingCell);
  state.signalPingTimer = PLAYER_SIGNAL_INTERVAL;
  state.minimapDirty = true;

  for (const seeker of state.seekers) {
    if (seeker.lastSeen) continue;
    seeker.goal = state.signalPingCell;
    seeker.goalTimer = PLAYER_SIGNAL_INTERVAL + Math.random() * 1.2;
  }
  setSquadMessages((seeker) => (
    seeker.role === 'trapSetter' ? 'Weak ping. Setting a route trap.' : 'Weak ping received.'
  ), 2.4);
}

function updateSeekers(delta) {
  if (state.round !== 'playing' || state.editorOpen || state.sandboxMode) return;
  const seekerTarget = Number(seekerCountInput.value) || 0;
  if (state.releaseCountdown > 0) {
    state.releaseCountdown -= delta;
  } else {
    updatePlayerSignal(delta);
    if (state.seekersSpawned < seekerTarget) {
      state.nextSeekerAt -= delta;
      if (state.nextSeekerAt <= 0) {
        spawnSeeker();
        state.nextSeekerAt = Math.max(0.38, 1.14 - Math.min(seekerTarget, 30) * 0.022);
      }
    }
  }

  updateSquadBlackboard(delta);
  assignSeekerRoles();

  if (state.aiSeekerStunTimer > 0) {
    for (const seeker of state.seekers) {
      seeker.moving = null;
      setSeekerMessage(seeker, 'Rover shock. Systems stunned.', 0.45);
      seeker.group.position.y = walkHeight(seeker.cell) + Math.abs(Math.sin(clock.elapsedTime * 20 + seeker.id)) * 0.1;
      animateCharacter(seeker.group, clock.elapsedTime * 16);
      setSeekerAlert(seeker, true);
    }
    soundscape.setDanger(0.25);
    return;
  }

  let nearest = Infinity;
  for (const seeker of state.seekers) {
    const seesPlayer = lineOfSight(seeker, state.player.cell);
    if (seesPlayer) {
      if (!seeker.seesPlayer) {
        state.runStats.sightings += 1;
        playCaughtCue();
      }
      broadcastSighting(seeker, state.player.cell);
      assignSeekerRoles();
      seeker.group.rotation.y = yawForDirection(
        state.player.group.position.x - seeker.group.position.x,
        state.player.group.position.z - seeker.group.position.z
      );
    }
    if (seeker.moving) {
      const alerted = seekerAlertActive(seeker);
      const coordinated = (seeker.coordinationTimer || 0) > 0;
      seeker.moving.t = Math.min(1, seeker.moving.t + delta / seekerStepDuration(seeker));
      const eased = seeker.moving.t * seeker.moving.t * (3 - 2 * seeker.moving.t);
      seeker.group.position.lerpVectors(seeker.moving.start, seeker.moving.end, eased);
      if (seeker.moving.vault) seeker.group.position.y += Math.sin(eased * Math.PI) * 0.82;
      if (alerted) seeker.group.position.y += Math.abs(Math.sin(clock.elapsedTime * 18 + seeker.id)) * 0.12;
      else if (coordinated) seeker.group.position.y += Math.abs(Math.sin(clock.elapsedTime * 14 + seeker.id)) * 0.06;
      animateCharacter(seeker.group, eased * Math.PI * 2 * (alerted ? 1.65 : (coordinated ? 1.3 : 1)));
      if (seeker.moving.t >= 1) {
        seeker.cell = seeker.moving.to;
        seeker.moving = null;
        placeGroupOnCell(seeker.group, seeker.cell);
        state.minimapDirty = true;
      }
    } else {
      seeker.memoryTimer = Math.max(0, (seeker.memoryTimer || 0) - delta);
      seeker.goalTimer = Math.max(0, (seeker.goalTimer || 0) - delta);
      if (!seesPlayer && seeker.memoryTimer <= 0) {
        seeker.lastSeen = null;
      }
      const tacticalGoal = (
        escapeHuntTarget() ||
        seeker.lastSeen ||
        (seeker.role === 'chaser' ? state.squad.lastSeenCell : null) ||
        (seeker.role === 'flanker' ? state.squad.predictedCell : null)
      );
      if (!tacticalGoal && (
        !seeker.goal ||
        seeker.goalTimer <= 0 ||
        isSameCell(seeker.cell, seeker.goal) ||
        !seekerWalkable(seeker.goal)
      )) {
        seeker.goal = roleGoalForSeeker(seeker);
        seeker.goalTimer = SEEKER_GOAL_SECONDS + Math.random() * 1.8;
      }
      const goal = tacticalGoal || seeker.goal || roleGoalForSeeker(seeker);
      updateSeekerBlockedState(seeker, goal, delta);
      const pathStep = nextPathStep(seeker.cell, goal, seeker);
      if (seeker.lastSeen && !pathStep) seeker.lastSeen = null;
      const next = pathStep || randomFrom(seekerNeighbors(seeker.cell, seeker));
      if (next) {
        const vault = isSeekerVaultStep(seeker.cell, next);
        seeker.moving = {
          to: next,
          vault,
          t: 0,
          start: worldPosition(seeker.cell.x, seeker.cell.z, walkHeight(seeker.cell)),
          end: worldPosition(next.x, next.z, walkHeight(next))
        };
        if (vault) {
          seeker.blockedTimer = 0;
          seeker.blockedDir = null;
          seeker.vaultThreshold = 5 + Math.random() * 2;
          setSeekerMessage(seeker, 'Vaulting the box route.', 2.4);
        }
        const dx = next.x - seeker.cell.x;
        const dz = next.z - seeker.cell.z;
        seeker.group.rotation.y = yawForDirection(dx, dz);
      }
      if (seeker.lastSeen && isSameCell(seeker.cell, seeker.lastSeen)) seeker.lastSeen = null;
    }

    setSeekerAlert(seeker, seekerAlertActive(seeker));

    const d = Math.abs(seeker.cell.x - state.player.cell.x) + Math.abs(seeker.cell.z - state.player.cell.z);
    nearest = Math.min(nearest, d);
    if (d === 0 || seeker.group.position.distanceTo(state.player.group.position) < 0.62) finishRound(false);
    seeker.seesPlayer = seesPlayer;
  }
  soundscape.setDanger(Math.max(0, 1 - nearest / 7));
}

function finishRound(won) {
  if (state.round !== 'playing') return;
  state.round = won ? 'won' : 'lost';
  roundTitle.textContent = won ? '🎉 Level Cleared 🎉' : 'Caught';
  roundText.textContent = won
    ? `You found all ${state.gems.length} gems and escaped through the gate.`
    : `You found ${state.collected} of ${state.gems.length} gems before a seeker found you.`;
  renderRoundScore(won);
  roundPanel.classList.toggle('won', won);
  roundPanel.classList.remove('hidden');
  if (!won) playCaughtCue();
}

function formatRunTime(seconds) {
  const safe = Math.max(0, seconds || 0);
  const minutes = Math.floor(safe / 60);
  const wholeSeconds = Math.floor(safe % 60);
  return `${minutes}:${String(wholeSeconds).padStart(2, '0')}`;
}

function calculateRunScore(won) {
  const elapsed = state.runStats.elapsed || 0;
  const difficulty = DIFFICULTIES[state.difficulty] || DIFFICULTIES.medium;
  const difficultyMultiplier = difficulty.scoreMultiplier || 1;
  const timeBonus = won ? Math.max(0, Math.round((ESCAPE_TIME_PAR_SECONDS - elapsed) * 18)) : 0;
  const noTrapBonus = won && state.runStats.traps === 0 ? 900 : 0;
  const noSightingBonus = won && state.runStats.sightings === 0 ? 1200 : 0;
  const allGemsStreak = (state.runStats.allGemsCollected ? state.gems.length : state.runStats.bestGemStreak) * 120;
  const escapeBonus = won ? 1200 : 0;
  const collectionScore = state.collected * 100;
  const baseTotal = collectionScore + timeBonus + noTrapBonus + noSightingBonus + allGemsStreak + escapeBonus;
  const difficultyAdjustment = Math.round(baseTotal * (difficultyMultiplier - 1));
  const aiModifier = Math.round(state.runStats.aiModifier || 0);
  const total = Math.max(0, baseTotal + difficultyAdjustment + aiModifier);
  let rank = 'Captured';
  if (won && noTrapBonus && noSightingBonus && timeBonus > 0) rank = 'Perfect Escape';
  else if (won && noTrapBonus && noSightingBonus) rank = 'Clean Escape';
  else if (won && total >= 4200) rank = 'Gold Escape';
  else if (won) rank = 'Escape';
  return {
    elapsed,
    collectionScore,
    timeBonus,
    noTrapBonus,
    noSightingBonus,
    allGemsStreak,
    escapeBonus,
    difficultyLabel: difficulty.label || 'Medium',
    difficultyMultiplier,
    difficultyAdjustment,
    aiModifier,
    total,
    rank
  };
}

function renderRoundScore(won) {
  if (!roundScore) return;
  const score = calculateRunScore(won);
  const rows = [
    ['Run time', formatRunTime(score.elapsed)],
    ['Difficulty', `${score.difficultyLabel} x${score.difficultyMultiplier.toFixed(2)}`],
    ['Gem score', `+${score.collectionScore}`],
    ['Time bonus', `+${score.timeBonus}`],
    ['No-trap bonus', `+${score.noTrapBonus}`],
    ['No-sighting bonus', `+${score.noSightingBonus}`],
    ['All-gems streak', `+${score.allGemsStreak}`]
  ];
  if (won) rows.push(['Escape bonus', `+${score.escapeBonus}`]);
  rows.push(['Difficulty adjustment', `${score.difficultyAdjustment >= 0 ? '+' : ''}${score.difficultyAdjustment}`]);
  rows.push(['AI rover modifier', `${score.aiModifier >= 0 ? '+' : ''}${score.aiModifier}`]);
  rows.push(['Rank', score.rank]);
  roundScore.innerHTML = `
    <dl class="score-breakdown">
      ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}
    </dl>
    <p class="score-total">Score ${score.total}</p>
  `;
  roundScore.classList.remove('hidden');
}

function updateGemHud() {
  const total = state.gems.length || Number(gemGoalInput.value);
  gemStatus.textContent = `${state.collected} / ${total}`;
}

function updateSeekerCountdown() {
  if (state.round !== 'playing' || state.editorOpen || state.sandboxMode || state.seekersSpawned >= Number(seekerCountInput.value || 0)) {
    seekerCountdown.classList.add('hidden');
    return;
  }
  seekerCountdown.classList.remove('hidden');
  if (state.releaseCountdown > 0) {
    seekerCountdownText.textContent = `Seekers in ${Math.max(1, Math.ceil(state.releaseCountdown))}`;
  } else {
    const remaining = Math.max(0, Number(seekerCountInput.value || 0) - state.seekersSpawned);
    seekerCountdownText.textContent = remaining > 1 ? `${remaining} seekers entering` : 'Seeker entering';
  }
}

function updateAgentPulseHud() {
  if (!agentPulse || state.round !== 'playing' || state.editorOpen || state.sandboxMode || state.squad.focusTimer <= 0 || !state.squad.abilityLabel) {
    agentPulse?.classList.add('hidden');
    return;
  }
  const label = state.squad.abilityLabel || 'Tracker alert';
  agentPulseText.textContent = label;
  agentPulse.classList.remove('hidden');
}

function updateScreenFlash(delta) {
  if (!screenFlash) return;
  state.screenFlashTimer = Math.max(0, (state.screenFlashTimer || 0) - delta);
  if (state.screenFlashTimer <= 0) {
    screenFlash.classList.remove('active');
    screenFlash.classList.add('hidden');
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function updateSeekerMessages(delta) {
  for (const seeker of state.seekers) {
    seeker.messageTimer = Math.max(0, (seeker.messageTimer || 0) - delta);
  }
}

function syncSeekerPanelCollapse() {
  if (!seekerPanel || !seekerPanelToggle) return;
  seekerPanel.classList.toggle('collapsed', state.seekerPanelCollapsed);
  seekerPanelToggle.textContent = state.seekerPanelCollapsed ? '+' : '-';
  seekerPanelToggle.setAttribute('aria-expanded', String(!state.seekerPanelCollapsed));
  seekerPanelToggle.setAttribute(
    'aria-label',
    state.seekerPanelCollapsed ? 'Expand seekers panel' : 'Collapse seekers panel'
  );
}

function setSeekerPanelCollapsed(force = !state.seekerPanelCollapsed) {
  state.seekerPanelCollapsed = force;
  state.seekerPanelAutoCollapsed = false;
  state.seekerPanelSignature = '';
  syncSeekerPanelCollapse();
}

function syncResponsiveHud() {
  if (state.seekerPanelAutoCollapsed) {
    state.seekerPanelCollapsed = false;
    state.seekerPanelAutoCollapsed = false;
    state.seekerPanelSignature = '';
  }
  syncSeekerPanelCollapse();
}

function seekerNetworkStatus() {
  if (state.squad.lastSeenCell) return 'Visual contact shared. Chasers converge while guards hold exits.';
  if (state.squad.focusCell) return 'Squad focus active. Agents split routes around the marked zone.';
  if (state.signalPingCell) return 'Weak ping shared. Searchers tighten the grid.';
  const activeRoles = new Set(state.seekers.map((seeker) => seeker.role || 'searcher'));
  if (activeRoles.size > 1) return `${activeRoles.size} roles online. Patrols are covering different lanes.`;
  return 'Agent network forming. Entry gate is still opening.';
}

function updateSeekerPanel() {
  if (!seekerPanel || !seekerList) return;
  syncResponsiveHud();
  if (!state.started || state.sandboxMode) {
    const message = state.sandboxMode ? 'Sandbox mode: seekers disabled.' : 'Seekers appear after the round starts.';
    const signature = `empty:${message}`;
    if (signature !== state.seekerPanelSignature) {
      seekerList.innerHTML = `<div class="seeker-empty">${message}</div>`;
      state.seekerPanelSignature = signature;
    }
    return;
  }
  if (!state.seekers.length) {
    const signature = 'empty:entry';
    if (signature !== state.seekerPanelSignature) {
      seekerList.innerHTML = '<div class="seeker-empty">Seeker agents enter from the gates soon.</div>';
      state.seekerPanelSignature = signature;
    }
    return;
  }
  const networkStatus = seekerNetworkStatus();
  const networkHtml = `<div class="seeker-network">
      <span class="network-pips" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>${escapeHtml(networkStatus)}</span>
    </div>`;
  const rows = state.seekers.map((seeker) => {
    const alerted = seekerAlertActive(seeker);
    const message = seeker.messageTimer > 0 ? seeker.message : defaultSeekerMessage(seeker);
    const role = seeker.role || 'searcher';
    return {
      signature: `${seeker.id}:${role}:${alerted ? 1 : 0}:${message}`,
      html: `<article class="seeker-card role-${role} ${alerted ? 'alerted' : ''}">
      <span class="seeker-avatar" aria-hidden="true"></span>
      <div class="seeker-card-body">
        <strong class="seeker-card-title">Seeker #${seeker.id}</strong>
        <span class="seeker-card-role">${escapeHtml(roleLabel(role))}</span>
        <span class="seeker-card-message">"${escapeHtml(message)}"</span>
      </div>
    </article>`
    };
  });
  const signature = `${networkStatus}|${rows.map((row) => row.signature).join('|')}`;
  if (signature === state.seekerPanelSignature) return;
  seekerList.innerHTML = networkHtml + rows.map((row) => row.html).join('');
  state.seekerPanelSignature = signature;
}

function paintMap(canvas, ctx, { editor = false } = {}) {
  if (!state.level || !state.player) return;
  const { width, height } = state.level;
  const expanded = canvas === expandedMap;
  const showDetails = editor || expanded;
  const s = canvas.width / Math.max(width, height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#dce9ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!expanded) {
    ctx.strokeStyle = 'rgba(108, 139, 151, 0.32)';
    ctx.lineWidth = 1;
    for (let y = s * 0.8; y < canvas.height; y += s * 2.2) {
      ctx.beginPath();
      ctx.moveTo(s * 0.6, y);
      ctx.lineTo(canvas.width - s * 0.6, y + Math.sin(y * 0.09) * s * 0.18);
      ctx.stroke();
    }
  }

  if (expanded) {
    clampMapPan();
    ctx.save();
    ctx.translate(state.mapPanX, state.mapPanY);
    ctx.scale(mapZoomScale(), mapZoomScale());
  }

  if (expanded) {
    ctx.save();
    const mapW = width * s;
    const mapH = height * s;
    ctx.fillStyle = editor ? 'rgba(255, 255, 250, 0.08)' : 'rgba(255, 255, 250, 0.035)';
    ctx.fillRect(0, 0, mapW, mapH);
    ctx.strokeStyle = editor ? 'rgba(38, 70, 79, 0.32)' : 'rgba(69, 119, 134, 0.24)';
    ctx.lineWidth = Math.max(1, s * (editor ? 0.03 : 0.02));
    for (let x = 0; x <= width; x += 1) {
      const px = x * s;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, mapH);
      ctx.stroke();
    }
    for (let z = 0; z <= height; z += 1) {
      const pz = z * s;
      ctx.beginPath();
      ctx.moveTo(0, pz);
      ctx.lineTo(mapW, pz);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const cell of state.cells) {
    if (!cell.active) continue;
    ctx.fillStyle = cell.height ? '#dfe9e9' : zoneStyle(cell).map;
    ctx.fillRect(cell.x * s, cell.z * s, s, s);
    ctx.strokeStyle = editor
      ? '#111'
      : (expanded ? 'rgba(13, 17, 18, 0.82)' : 'rgba(21, 24, 24, 0.62)');
    ctx.lineWidth = Math.max(1, s * (editor ? 0.07 : (expanded ? 0.052 : 0.04)));
    ctx.strokeRect(cell.x * s, cell.z * s, s, s);
    if (expanded) {
      ctx.strokeStyle = editor ? 'rgba(255, 255, 255, 0.52)' : 'rgba(255, 255, 255, 0.36)';
      ctx.lineWidth = Math.max(1, s * 0.012);
      ctx.strokeRect(cell.x * s + 1, cell.z * s + 1, Math.max(1, s - 2), Math.max(1, s - 2));
    }
    if (!showDetails) continue;
    if (cell.gemSpawn) {
      ctx.fillStyle = '#27b9ed';
      ctx.strokeStyle = '#0b0d0f';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.arc((cell.x + 0.5) * s, (cell.z + 0.5) * s, Math.max(2, s * 0.13), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    if (cell.stairs) {
      ctx.strokeStyle = '#727a7a';
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.beginPath();
      ctx.moveTo(cell.x * s + s * 0.2, cell.z * s + s * 0.75);
      ctx.lineTo(cell.x * s + s * 0.8, cell.z * s + s * 0.25);
      ctx.stroke();
    }
  }

  if (showDetails) {
    for (const box of state.boxes) {
      ctx.fillStyle = '#a9774d';
      ctx.strokeStyle = '#0b0d0f';
      ctx.lineWidth = Math.max(1, s * 0.045);
      ctx.fillRect((box.x + 0.22) * s, (box.z + 0.22) * s, s * 0.56, s * 0.56);
      ctx.strokeRect((box.x + 0.22) * s, (box.z + 0.22) * s, s * 0.56, s * 0.56);
    }

    for (const tracker of state.seekerTrackers) {
      const cx = (tracker.x + 0.5) * s;
      const cz = (tracker.z + 0.5) * s;
      const r = Math.max(3, s * 0.2);
      ctx.strokeStyle = '#e01818';
      ctx.fillStyle = 'rgba(255, 36, 36, 0.18)';
      ctx.lineWidth = Math.max(2, s * 0.06);
      ctx.beginPath();
      ctx.arc(cx, cz, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.72, cz);
      ctx.lineTo(cx + r * 0.72, cz);
      ctx.moveTo(cx, cz - r * 0.72);
      ctx.lineTo(cx, cz + r * 0.72);
      ctx.stroke();
    }

    for (const cell of state.cells) {
      if (!cell.active || !cell.prop) continue;
      const cx = (cell.x + 0.5) * s;
      const cz = (cell.z + 0.5) * s;
      const r = Math.max(2.5, s * 0.15);
      if (cell.prop === 'trafficLight' || cell.prop === 'bridgeLight' || cell.prop === 'stoplight') {
        ctx.fillStyle = '#1f2426';
        ctx.fillRect(cx - r * 0.55, cz - r * 1.05, r * 1.1, r * 2.1);
        ctx.fillStyle = '#ff3d38';
        ctx.beginPath();
        ctx.arc(cx, cz - r * 0.55, Math.max(1, r * 0.28), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd447';
        ctx.beginPath();
        ctx.arc(cx, cz, Math.max(1, r * 0.28), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#32d46f';
        ctx.beginPath();
        ctx.arc(cx, cz + r * 0.55, Math.max(1, r * 0.28), 0, Math.PI * 2);
        ctx.fill();
      } else if (cell.prop === 'roadBarrier') {
        ctx.fillStyle = '#262a2c';
        if (cell.propDir === 'e' || cell.propDir === 'w') ctx.fillRect(cx - r * 1.6, cz - r * 0.35, r * 3.2, r * 0.7);
        else ctx.fillRect(cx - r * 0.35, cz - r * 1.6, r * 0.7, r * 3.2);
      } else if (cell.prop === 'streetMarking') {
        ctx.strokeStyle = '#ffd447';
        ctx.lineWidth = Math.max(2, s * 0.08);
        ctx.beginPath();
        ctx.moveTo(cx - r * 1.45, cz + r * 1.45);
        ctx.lineTo(cx + r * 1.45, cz - r * 1.45);
        ctx.stroke();
      } else if (cell.prop === 'openaiFloorLogo') {
        ctx.strokeStyle = '#7d8588';
        ctx.lineWidth = Math.max(1, s * 0.045);
        ctx.beginPath();
        ctx.arc(cx, cz, r * 1.05, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = cell.prop === 'trafficCone' ? '#ff7518' : '#48bd68';
        ctx.strokeStyle = '#0b0d0f';
        ctx.lineWidth = Math.max(1, s * 0.035);
        ctx.beginPath();
        ctx.arc(cx, cz, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  if (!showDetails) {
    if (state.escapeCell && state.escapeUnlocked) {
      const cx = (state.escapeCell.x + 0.5) * s;
      const cz = (state.escapeCell.z + 0.5) * s;
      const r = Math.max(4, s * 0.24);
      ctx.fillStyle = '#ffd447';
      ctx.strokeStyle = '#0b0d0f';
      ctx.lineWidth = Math.max(1, s * 0.06);
      ctx.beginPath();
      ctx.arc(cx, cz, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    for (const gem of state.gems) {
      if (!gem.collected) continue;
      const cx = (gem.x + 0.5) * s;
      const cz = (gem.z + 0.5) * s;
      const size = Math.max(3, s * 0.2);
      ctx.save();
      ctx.translate(cx, cz);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#12aee6';
      ctx.strokeStyle = '#0b0d0f';
      ctx.lineWidth = Math.max(1, s * 0.05);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    }

    ctx.fillStyle = '#2496e8';
    ctx.strokeStyle = '#0b0d0f';
    ctx.lineWidth = Math.max(2, s * 0.09);
    ctx.beginPath();
    ctx.arc((state.player.cell.x + 0.5) * s, (state.player.cell.z + 0.5) * s, Math.max(4, s * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return;
  }
  ctx.fillStyle = '#ff5550';
  for (const entry of seekerEntries()) {
    ctx.fillRect((entry.cell.x + 0.24) * s, (entry.cell.z + 0.24) * s, s * 0.52, s * 0.52);
  }
  if (state.signalPingArea) {
    ctx.strokeStyle = 'rgba(219, 56, 48, 0.36)';
    ctx.lineWidth = Math.max(1, s * 0.08);
    const { x0, z0, x1, z1 } = state.signalPingArea;
    ctx.strokeRect(x0 * s, z0 * s, (x1 - x0 + 1) * s, (z1 - z0 + 1) * s);
  }
  if (state.squad.focusArea && state.squad.focusTimer > 0) {
    const { x0, z0, x1, z1 } = state.squad.focusArea;
    const alpha = 0.14 + Math.sin(clock.elapsedTime * 8) * 0.04;
    ctx.fillStyle = `rgba(255, 82, 72, ${alpha})`;
    ctx.strokeStyle = 'rgba(214, 26, 26, 0.72)';
    ctx.lineWidth = Math.max(2, s * 0.09);
    ctx.fillRect(x0 * s, z0 * s, (x1 - x0 + 1) * s, (z1 - z0 + 1) * s);
    ctx.strokeRect(x0 * s, z0 * s, (x1 - x0 + 1) * s, (z1 - z0 + 1) * s);
  }
  if (state.squad.focusCell && state.squad.focusTimer > 0) {
    const cx = (state.squad.focusCell.x + 0.5) * s;
    const cz = (state.squad.focusCell.z + 0.5) * s;
    const r = Math.max(3, s * (0.2 + Math.sin(clock.elapsedTime * 9) * 0.035));
    ctx.strokeStyle = '#d61a1a';
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.beginPath();
    ctx.arc(cx, cz, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 1.25, cz);
    ctx.lineTo(cx + r * 1.25, cz);
    ctx.moveTo(cx, cz - r * 1.25);
    ctx.lineTo(cx, cz + r * 1.25);
    ctx.stroke();
  }
  if (state.escapeCell && (showDetails || state.escapeUnlocked)) {
    const cx = (state.escapeCell.x + 0.5) * s;
    const cz = (state.escapeCell.z + 0.5) * s;
    const r = Math.max(3, s * 0.22);
    ctx.fillStyle = state.escapeUnlocked ? '#ffd447' : 'rgba(255, 212, 71, 0.38)';
    ctx.strokeStyle = '#0b0d0f';
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cz, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (state.escapeUnlocked) {
      ctx.strokeStyle = '#ffd447';
      ctx.lineWidth = Math.max(1, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx - r * 1.5, cz);
      ctx.lineTo(cx + r * 1.5, cz);
      ctx.moveTo(cx, cz - r * 1.5);
      ctx.lineTo(cx, cz + r * 1.5);
      ctx.stroke();
    }
  }
  for (const gem of state.gems) {
    if (gem.collected) continue;
    ctx.fillStyle = '#00a6df';
    ctx.beginPath();
    ctx.arc((gem.x + 0.5) * s, (gem.z + 0.5) * s, Math.max(2, s * 0.15), 0, Math.PI * 2);
    ctx.fill();
  }
  for (const seeker of state.seekers) {
    ctx.fillStyle = '#e4453f';
    ctx.beginPath();
    ctx.arc((seeker.cell.x + 0.5) * s, (seeker.cell.z + 0.5) * s, Math.max(2, s * 0.16), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc((state.player.cell.x + 0.5) * s, (state.player.cell.z + 0.5) * s, Math.max(3, s * 0.18), 0, Math.PI * 2);
  ctx.fill();

  if (editor && state.mapSelectMode && state.mapSelection) {
    if (['move', 'stretch'].includes(state.mapSelectDrag?.mode) && state.mapSelectDrag.sourceRange) {
      const source = state.mapSelectDrag.sourceRange;
      const sx = source.x0 * s + 1;
      const sy = source.z0 * s + 1;
      const sw = (source.x1 - source.x0 + 1) * s - 2;
      const sh = (source.z1 - source.z0 + 1) * s - 2;
      ctx.save();
      ctx.setLineDash([Math.max(4, s * 0.28), Math.max(3, s * 0.18)]);
      ctx.strokeStyle = 'rgba(20, 121, 209, 0.62)';
      ctx.lineWidth = Math.max(2, s * 0.1);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.restore();
    }
    const { x0, z0, x1, z1 } = state.mapSelection;
    const x = x0 * s + 1;
    const y = z0 * s + 1;
    const w = (x1 - x0 + 1) * s - 2;
    const h = (z1 - z0 + 1) * s - 2;
    ctx.fillStyle = 'rgba(20, 121, 209, 0.16)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#1479d1';
    ctx.lineWidth = Math.max(2, s * 0.14);
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = Math.max(1, s * 0.045);
    ctx.strokeRect(x + 2, y + 2, Math.max(1, w - 4), Math.max(1, h - 4));
    if (!state.mapSelectDrag || state.mapSelectDrag.mode !== 'lasso') {
      const handle = Math.max(6, Math.min(16, s * 0.42));
      const handles = [
        [x + w / 2, y, 'ns'],
        [x + w / 2, y + h, 'ns'],
        [x, y + h / 2, 'ew'],
        [x + w, y + h / 2, 'ew']
      ];
      ctx.save();
      ctx.fillStyle = '#f8fbff';
      ctx.strokeStyle = '#1479d1';
      ctx.lineWidth = Math.max(2, s * 0.09);
      for (const [hx, hy] of handles) {
        ctx.beginPath();
        ctx.rect(hx - handle / 2, hy - handle / 2, handle, handle);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  if (expanded) ctx.restore();
}

function drawMiniMap() {
  if (!state.level || !state.player) return;
  state.minimapDirty = false;
  syncMapCanvasSize(miniMap);
  paintMap(miniMap, miniCtx);
  if (state.mapExpanded) {
    syncMapCanvasSize(expandedMap);
    paintMap(expandedMap, expandedMapCtx, { editor: state.mapEditorMode });
  }
}

function syncMapCanvasSize(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = Math.max(64, Math.round(Math.min(rect.width, rect.height) * dpr));
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size;
    canvas.height = size;
    if (canvas === expandedMap) clampMapPan();
  }
}

function markEditorWorldDirty() {
  clearSeekerEntryPath();
  state.editorWorldDirty = true;
  state.minimapDirty = true;
}

function scheduleEditorMapDraw() {
  state.minimapDirty = true;
  if (state.editorMapDrawQueued) return;
  state.editorMapDrawQueued = true;
  requestAnimationFrame(() => {
    state.editorMapDrawQueued = false;
    drawMiniMap();
  });
}

function flushEditorWorld() {
  state.editorRebuildQueued = false;
  if (!state.editorWorldDirty || !state.level) return;
  state.editorWorldDirty = false;
  buildWorld();
  updateToolHint();
}

function scheduleEditorWorldRebuild() {
  markEditorWorldDirty();
  if (state.editorRebuildQueued) return;
  state.editorRebuildQueued = true;
  requestAnimationFrame(flushEditorWorld);
}

function refreshEditorWorldNow() {
  markEditorWorldDirty();
  flushEditorWorld();
}

function mapZoomScale() {
  return Math.max(1, state.mapZoomPercent / 100);
}

function clampMapPan() {
  if (!expandedMap.width) return;
  const zoom = mapZoomScale();
  if (zoom <= 1) {
    state.mapPanX = 0;
    state.mapPanY = 0;
    return;
  }
  const minX = expandedMap.width - expandedMap.width * zoom;
  const minY = expandedMap.height - expandedMap.height * zoom;
  state.mapPanX = Math.min(0, Math.max(minX, state.mapPanX));
  state.mapPanY = Math.min(0, Math.max(minY, state.mapPanY));
}

function syncMapViewControls() {
  clampMapPan();
  if (mapZoomValue) {
    mapZoomValue.value = `${state.mapZoomPercent}%`;
    mapZoomValue.textContent = `${state.mapZoomPercent}%`;
  }
  mapPanButton?.classList.toggle('active', state.mapPanMode);
  mapZoomStepButtons.forEach((button) => {
    const step = Number(button.dataset.mapZoomStep || 0);
    button.disabled = (step < 0 && state.mapZoomPercent <= 100) || (step > 0 && state.mapZoomPercent >= 250);
  });
  expandedMap?.classList.toggle('panning', state.mapPanMode);
  expandedMap?.classList.toggle('pan-dragging', Boolean(state.mapPanDrag));
}

function setMapZoomPercent(value) {
  state.mapZoomPercent = Math.min(250, Math.max(100, Math.round(value / 5) * 5));
  syncMapViewControls();
  state.minimapDirty = true;
  drawMiniMap();
}

function setMapPanMode(force = !state.mapPanMode) {
  state.mapPanMode = force;
  if (!force) state.mapPanDrag = null;
  syncMapViewControls();
  updateMapEditorHint();
}

function mapCanvasPointFromEvent(event) {
  const rect = expandedMap.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * expandedMap.width,
    y: ((event.clientY - rect.top) / rect.height) * expandedMap.height
  };
}

function normalizeMapSelection(anchor, focus = anchor) {
  if (!anchor || !focus) return null;
  return {
    x0: Math.min(anchor.x, focus.x),
    z0: Math.min(anchor.z, focus.z),
    x1: Math.max(anchor.x, focus.x),
    z1: Math.max(anchor.z, focus.z)
  };
}

function cloneMapSelection(range) {
  return range ? { x0: range.x0, z0: range.z0, x1: range.x1, z1: range.z1 } : null;
}

function mapSelectionContains(range, cell) {
  return Boolean(
    range &&
    cell &&
    cell.x >= range.x0 &&
    cell.x <= range.x1 &&
    cell.z >= range.z0 &&
    cell.z <= range.z1
  );
}

function offsetMapSelection(range, dx, dz) {
  if (!range || !state.level) return null;
  const width = range.x1 - range.x0;
  const height = range.z1 - range.z0;
  const x0 = Math.max(0, Math.min(state.level.width - width - 1, range.x0 + dx));
  const z0 = Math.max(0, Math.min(state.level.height - height - 1, range.z0 + dz));
  return { x0, z0, x1: x0 + width, z1: z0 + height };
}

function mapModulo(value, size) {
  return ((value % size) + size) % size;
}

function stretchMapSelectionRange(source, side, cell) {
  if (!source || !side || !cell || !state.level) return null;
  const next = cloneMapSelection(source);
  if (side === 'n') next.z0 = Math.max(0, Math.min(cell.z, source.z1));
  if (side === 's') next.z1 = Math.min(state.level.height - 1, Math.max(cell.z, source.z0));
  if (side === 'w') next.x0 = Math.max(0, Math.min(cell.x, source.x1));
  if (side === 'e') next.x1 = Math.min(state.level.width - 1, Math.max(cell.x, source.x0));
  return next;
}

function mapSelectionEdgeFromEvent(event) {
  const range = state.mapSelection;
  if (!state.level || !range || !expandedMap.width) return null;
  const point = mapCanvasPointFromEvent(event);
  const zoom = mapZoomScale();
  const baseX = (point.x - state.mapPanX) / zoom;
  const baseY = (point.y - state.mapPanY) / zoom;
  const s = expandedMap.width / Math.max(state.level.width, state.level.height);
  const left = range.x0 * s;
  const right = (range.x1 + 1) * s;
  const top = range.z0 * s;
  const bottom = (range.z1 + 1) * s;
  const centerX = (left + right) / 2;
  const centerY = (top + bottom) / 2;
  const threshold = Math.max(12, s * 0.58);
  const handleReach = Math.max(threshold, s * 0.72);
  const nearTopHandle = Math.abs(baseY - top) <= threshold && Math.abs(baseX - centerX) <= handleReach;
  const nearBottomHandle = Math.abs(baseY - bottom) <= threshold && Math.abs(baseX - centerX) <= handleReach;
  const nearLeftHandle = Math.abs(baseX - left) <= threshold && Math.abs(baseY - centerY) <= handleReach;
  const nearRightHandle = Math.abs(baseX - right) <= threshold && Math.abs(baseY - centerY) <= handleReach;
  if (nearBottomHandle && (!nearTopHandle || baseY >= centerY)) return 's';
  if (nearTopHandle) return 'n';
  if (nearRightHandle && (!nearLeftHandle || baseX >= centerX)) return 'e';
  if (nearLeftHandle) return 'w';

  const insideX = baseX >= left - threshold && baseX <= right + threshold;
  const insideY = baseY >= top - threshold && baseY <= bottom + threshold;
  if (!insideX || !insideY) return null;
  const distances = [
    { side: 'w', value: Math.abs(baseX - left) },
    { side: 'e', value: Math.abs(baseX - right) },
    { side: 'n', value: Math.abs(baseY - top) },
    { side: 's', value: Math.abs(baseY - bottom) }
  ].filter((item) => item.value <= threshold);
  if (!distances.length) return null;
  if (distances.some((item) => item.side === 'n' || item.side === 's')) {
    return baseY >= centerY ? 's' : 'n';
  }
  if (distances.some((item) => item.side === 'w' || item.side === 'e')) {
    return baseX >= centerX ? 'e' : 'w';
  }
  distances.sort((a, b) => a.value - b.value);
  return distances[0].side;
}

function mapRangeCells(range) {
  if (!range) return [];
  const cells = [];
  for (let z = range.z0; z <= range.z1; z += 1) {
    for (let x = range.x0; x <= range.x1; x += 1) {
      const cell = getCell(x, z);
      if (cell) cells.push(cell);
    }
  }
  return cells;
}

function selectedMapCells() {
  return mapRangeCells(state.mapSelection);
}

function selectedMapCellCount() {
  return selectedMapCells().length;
}

function setMapSelection(anchor, focus = anchor) {
  const range = normalizeMapSelection(anchor, focus);
  state.mapSelection = range;
  state.mapSelectedCell = range ? getCell(range.x0, range.z0) : null;
}

function clearMapSelection() {
  state.mapSelection = null;
  state.mapSelectedCell = null;
}

function mapSelectionLabel() {
  const range = state.mapSelection;
  if (!range) return '';
  const count = selectedMapCellCount();
  if (count === 1) return `${range.x0}, ${range.z0}`;
  return `${count} tiles (${range.x0}, ${range.z0}) to (${range.x1}, ${range.z1})`;
}

function updateMapEditorHint(message = null) {
  if (!mapEditorHint) return;
  if (message) {
    mapEditorHint.textContent = message;
    syncMapEditorControls();
    return;
  }
  if (!DEVELOPER_TOOLS_ENABLED) {
    mapEditorHint.textContent = 'Map view.';
    syncMapEditorControls();
    return;
  }
  if (!state.mapEditorMode) {
    mapEditorHint.textContent = state.mapPanMode
      ? 'Pan is on. Drag the map with the hand, or turn Pan off to edit/select tiles.'
      : 'Enter Map editor to paint cells from the expanded map.';
  } else if (!state.mapSelectMode) {
    mapEditorHint.textContent = state.mapPanMode
      ? 'Pan is on. Drag the map with the hand, or turn Pan off to paint tiles.'
      : 'Paint with the active editor tool. Drag across cells; right-click erases. Press Select for copy and paste.';
  } else if (state.mapSelection) {
    mapEditorHint.textContent = `Selected ${mapSelectionLabel()}. Drag inside to move; drag an edge handle to repeat/stretch.`;
  } else {
    mapEditorHint.textContent = state.mapPanMode
      ? 'Pan is on. Drag the map with the hand, or turn Pan off to lasso tiles.'
      : 'Click or drag a rectangle to select tiles. Ctrl+C copies; Ctrl+V pastes.';
  }
  syncMapEditorControls();
}

function syncMapEditorControls() {
  if (mapGemSpawnCount) {
    const total = gemSpawnCount();
    const usable = usableGemSpawnCells().length;
    mapGemSpawnCount.textContent = total === usable
      ? `Gem spawns: ${usable} / ${GEM_SPAWN_MINIMUM}`
      : `Gem spawns: ${usable} / ${GEM_SPAWN_MINIMUM} (${total - usable} blocked)`;
  }
  if (!DEVELOPER_TOOLS_ENABLED) {
    setElementHidden(expandMapButton, true);
    setElementHidden(mapEditorModeButton, true);
    setElementHidden(mapViewControls, true);
    setElementHidden(mapCommandBar, true);
    if (mapUndoButton) mapUndoButton.disabled = true;
    if (mapCopyButton) mapCopyButton.disabled = true;
    if (mapPasteButton) mapPasteButton.disabled = true;
    if (mapSelectButton) mapSelectButton.disabled = true;
    expandedMap?.classList.remove('selecting', 'moving-selection', 'stretching-selection', 'painting', 'panning', 'pan-dragging');
    return;
  }
  expandMapButton?.classList.toggle('hidden', !(state.editorOpen || state.sandboxMode));
  mapEditorModeButton?.classList.toggle('active', state.mapEditorMode);
  mapSelectButton?.classList.toggle('active', state.mapEditorMode && state.mapSelectMode);
  const hasSelection = Boolean(state.mapEditorMode && state.mapSelectMode && state.mapSelection);
  if (mapUndoButton) mapUndoButton.disabled = state.mapUndoStack.length === 0;
  if (mapCopyButton) mapCopyButton.disabled = !hasSelection;
  if (mapPasteButton) mapPasteButton.disabled = !(hasSelection && state.mapClipboard);
  expandedMap?.classList.toggle('selecting', state.mapEditorMode && state.mapSelectMode);
  expandedMap?.classList.toggle('moving-selection', state.mapSelectDrag?.mode === 'move');
  expandedMap?.classList.toggle('stretching-selection', state.mapSelectDrag?.mode === 'stretch');
  expandedMap?.classList.toggle('painting', state.mapEditorMode && !state.mapSelectMode);
  syncMapViewControls();
}

function setMapExpanded(force = !state.mapExpanded) {
  if (!force) flushEditorWorld();
  state.mapExpanded = force;
  mapEditorPanel.classList.toggle('hidden', !force);
  mapPanel?.classList.toggle('hidden', force);
  if (!force) {
    state.mapEditorMode = false;
    state.mapSelectMode = false;
    clearMapSelection();
    state.mapPaint = null;
    state.mapSelectDrag = null;
    state.mapPanMode = false;
    state.mapPanDrag = null;
    state.mapFullscreen = false;
    mapEditorPanel.classList.remove('fullscreen');
  }
  syncEditorWorkspaceClass();
  updateMapEditorHint();
  state.minimapDirty = true;
  drawMiniMap();
}

function setMapEditorMode(force = !state.mapEditorMode) {
  if (force && !DEVELOPER_TOOLS_ENABLED) {
    state.mapEditorMode = false;
    state.mapSelectMode = false;
    clearMapSelection();
    updateMapEditorHint('Map editor is unavailable in public mode.');
    return;
  }
  if (!force) flushEditorWorld();
  state.mapEditorMode = force;
  if (!force) {
    state.mapSelectMode = false;
    clearMapSelection();
    state.mapPaint = null;
    state.mapSelectDrag = null;
  }
  if (force && !state.editorOpen) toggleEditor(true);
  updateMapEditorHint();
  state.minimapDirty = true;
  drawMiniMap();
}

function setMapSelectMode(force = !state.mapSelectMode) {
  if (force && !DEVELOPER_TOOLS_ENABLED) {
    clearMapSelection();
    updateMapEditorHint('Map selection tools are unavailable in public mode.');
    return;
  }
  if (!state.mapEditorMode) setMapEditorMode(true);
  state.mapSelectMode = force;
  if (!force) clearMapSelection();
  state.mapPaint = null;
  state.mapSelectDrag = null;
  updateMapEditorHint();
  state.minimapDirty = true;
  drawMiniMap();
}

function mapCellFromEvent(event) {
  if (!state.level) return null;
  const point = mapCanvasPointFromEvent(event);
  const zoom = mapZoomScale();
  const baseX = (point.x - state.mapPanX) / zoom;
  const baseY = (point.y - state.mapPanY) / zoom;
  const xRatio = baseX / expandedMap.width;
  const zRatio = baseY / expandedMap.height;
  const scale = Math.max(state.level.width, state.level.height);
  return getCell(Math.floor(xRatio * scale), Math.floor(zRatio * scale));
}

function selectMapCell(cell) {
  if (!cell || !state.mapSelectMode) return;
  setMapSelection(cell);
  updateMapEditorHint();
  drawMiniMap();
}

function paintMapEditorCell(cell, erase = false) {
  if (!cell || !state.mapEditorMode || state.mapSelectMode) return false;
  const key = `${cell.x},${cell.z}`;
  if (state.mapPaint?.lastKey === key) return false;
  if (state.mapPaint && !state.mapPaint.undoCaptured) {
    pushEditorUndo(erase ? 'erase cells' : 'paint cells');
    state.mapPaint.undoCaptured = true;
  }
  state.mapPaint.lastKey = key;
  clearMapSelection();
  applyTool(cell, erase, { refresh: false });
  markEditorWorldDirty();
  scheduleEditorMapDraw();
  return true;
}

function beginMapPanDrag(event) {
  if (!state.mapPanMode || event.button !== 0) return false;
  const point = mapCanvasPointFromEvent(event);
  state.mapPanDrag = {
    pointerId: event.pointerId,
    lastX: point.x,
    lastY: point.y
  };
  expandedMap.setPointerCapture?.(event.pointerId);
  syncMapViewControls();
  event.preventDefault();
  return true;
}

function dragMapPan(event) {
  const drag = state.mapPanDrag;
  if (!drag || drag.pointerId !== event.pointerId) return false;
  const point = mapCanvasPointFromEvent(event);
  state.mapPanX += point.x - drag.lastX;
  state.mapPanY += point.y - drag.lastY;
  drag.lastX = point.x;
  drag.lastY = point.y;
  clampMapPan();
  syncMapViewControls();
  state.minimapDirty = true;
  drawMiniMap();
  event.preventDefault();
  return true;
}

function endMapPanDrag(event) {
  const drag = state.mapPanDrag;
  if (!drag || (event.pointerId !== undefined && drag.pointerId !== event.pointerId)) return false;
  if (expandedMap.hasPointerCapture?.(drag.pointerId)) expandedMap.releasePointerCapture(drag.pointerId);
  state.mapPanDrag = null;
  syncMapViewControls();
  event?.preventDefault?.();
  return true;
}

function beginMapCanvasPaint(event) {
  if (beginMapPanDrag(event)) return;
  if (!state.mapEditorMode || (event.button !== 0 && event.button !== 2)) return;
  const cell = mapCellFromEvent(event);
  if (state.mapSelectMode) {
    if (event.button === 0 && cell) {
      const sourceSelection = cloneMapSelection(state.mapSelection);
      const stretchSide = sourceSelection ? mapSelectionEdgeFromEvent(event) : null;
      const stretchExistingSelection = Boolean(sourceSelection && stretchSide);
      const moveExistingSelection = !stretchExistingSelection && mapSelectionContains(sourceSelection, cell);
      state.mapSelectDrag = {
        pointerId: event.pointerId,
        mode: stretchExistingSelection ? 'stretch' : (moveExistingSelection ? 'move' : 'lasso'),
        anchor: cell,
        side: stretchSide,
        sourceRange: sourceSelection,
        snapshot: (moveExistingSelection || stretchExistingSelection) ? snapshotMapRange(sourceSelection) : null
      };
      expandedMap.setPointerCapture?.(event.pointerId);
      if (!moveExistingSelection) setMapSelection(cell);
      if (stretchExistingSelection) {
        state.mapSelection = sourceSelection;
        updateMapEditorHint(`Stretching ${mapSelectionLabel()}. Drag outward to repeat the selected tiles.`);
      } else {
        updateMapEditorHint(moveExistingSelection ? `Moving ${mapSelectionLabel()}. Drag downward or across, then release.` : null);
      }
      drawMiniMap();
    }
    event.preventDefault();
    return;
  }
  state.mapPaint = {
    pointerId: event.pointerId,
    erase: event.button === 2,
    lastKey: null,
    undoCaptured: false
  };
  expandedMap.setPointerCapture?.(event.pointerId);
  paintMapEditorCell(cell, state.mapPaint.erase);
  updateMapEditorHint();
  event.preventDefault();
}

function dragMapCanvasPaint(event) {
  if (dragMapPan(event)) return;
  if (state.mapEditorMode && state.mapSelectMode && state.mapSelectDrag?.pointerId === event.pointerId) {
    const cell = mapCellFromEvent(event);
    if (cell) {
      if (state.mapSelectDrag.mode === 'move') {
        const dx = cell.x - state.mapSelectDrag.anchor.x;
        const dz = cell.z - state.mapSelectDrag.anchor.z;
        const nextSelection = offsetMapSelection(state.mapSelectDrag.sourceRange, dx, dz);
        if (nextSelection) {
          state.mapSelection = nextSelection;
          state.mapSelectedCell = getCell(nextSelection.x0, nextSelection.z0);
        }
        updateMapEditorHint(`Moving ${mapSelectionLabel()}. Release to place this selection.`);
      } else if (state.mapSelectDrag.mode === 'stretch') {
        const nextSelection = stretchMapSelectionRange(
          state.mapSelectDrag.sourceRange,
          state.mapSelectDrag.side,
          cell
        );
        if (nextSelection) {
          state.mapSelection = nextSelection;
          state.mapSelectedCell = getCell(nextSelection.x0, nextSelection.z0);
        }
        updateMapEditorHint(`Stretching to ${mapSelectionLabel()}. Release to repeat the selected pattern.`);
      } else {
        setMapSelection(state.mapSelectDrag.anchor, cell);
        updateMapEditorHint();
      }
      drawMiniMap();
    }
    event.preventDefault();
    return;
  }
  if (!state.mapEditorMode || !state.mapPaint || state.mapPaint.pointerId !== event.pointerId) return;
  paintMapEditorCell(mapCellFromEvent(event), state.mapPaint.erase);
  event.preventDefault();
}

function endMapCanvasPaint(event) {
  if (endMapPanDrag(event)) return;
  if (state.mapSelectDrag && (event.pointerId === undefined || state.mapSelectDrag.pointerId === event.pointerId)) {
    const drag = state.mapSelectDrag;
    if (expandedMap.hasPointerCapture?.(state.mapSelectDrag.pointerId)) expandedMap.releasePointerCapture(state.mapSelectDrag.pointerId);
    state.mapSelectDrag = null;
    if (drag.mode === 'move') {
      if (!moveMapSelection(drag)) updateMapEditorHint();
    } else if (drag.mode === 'stretch') {
      if (!stretchMapSelection(drag)) updateMapEditorHint();
    } else {
      updateMapEditorHint();
    }
    syncMapEditorControls();
    drawMiniMap();
    event?.preventDefault?.();
    return;
  }
  if (!state.mapPaint || (event.pointerId !== undefined && state.mapPaint.pointerId !== event.pointerId)) return;
  if (expandedMap.hasPointerCapture?.(state.mapPaint.pointerId)) expandedMap.releasePointerCapture(state.mapPaint.pointerId);
  state.mapPaint = null;
  flushEditorWorld();
  updateMapEditorHint();
  event?.preventDefault?.();
}

function snapshotMapCell(cell, origin) {
  const box = boxAt(cell.x, cell.z);
  return {
    dx: cell.x - origin.x,
    dz: cell.z - origin.z,
    active: cell.active,
    height: cell.height,
    stairs: cell.stairs,
    prop: cell.prop,
    propDir: cell.propDir || null,
    gemSpawn: cell.gemSpawn,
    zone: cell.zone,
    box: Boolean(box)
  };
}

function snapshotMapRange(range) {
  const origin = { x: range.x0, z: range.z0 };
  return {
    width: range.x1 - range.x0 + 1,
    height: range.z1 - range.z0 + 1,
    cells: mapRangeCells(range).map((cell) => snapshotMapCell(cell, origin))
  };
}

function gemSpawnCount() {
  return state.cells?.filter((cell) => cell.gemSpawn).length || 0;
}

function applyMapSnapshot(cell, copied) {
  if (!cell || isEntryCell(cell)) return false;
  state.boxes = state.boxes.filter((box) => !(box.x === cell.x && box.z === cell.z));
  cell.active = copied.active;
  cell.height = Math.min(MAX_HEIGHT, copied.height || 0);
  cell.stairs = copied.stairs || null;
  cell.prop = copied.prop || null;
  cell.propDir = copied.propDir || null;
  cell.gemSpawn = Boolean(copied.gemSpawn)
    && canPlaceGemSpawn(cell)
    && (cell.gemSpawn || gemSpawnCount() < GEM_SPAWN_MINIMUM);
  cell.zone = copied.zone || null;
  if (copied.box && cell.active) state.boxes.push({ x: cell.x, z: cell.z, homeX: cell.x, homeZ: cell.z });
  return true;
}

function applyRepeatedMapSnapshot(target, source, snapshot) {
  if (!target || !source || !snapshot) return 0;
  const byOffset = new Map(snapshot.cells.map((cell) => [`${cell.dx},${cell.dz}`, cell]));
  let changed = 0;
  for (let z = target.z0; z <= target.z1; z += 1) {
    for (let x = target.x0; x <= target.x1; x += 1) {
      const dx = mapModulo(x - source.x0, snapshot.width);
      const dz = mapModulo(z - source.z0, snapshot.height);
      const copied = byOffset.get(`${dx},${dz}`);
      if (!copied) continue;
      if (applyMapSnapshot(getCell(x, z), copied)) changed += 1;
    }
  }
  return changed;
}

function moveMapSelection(drag) {
  const source = drag?.sourceRange;
  const target = state.mapSelection;
  const snapshot = drag?.snapshot;
  if (!source || !target || !snapshot) return false;
  if (source.x0 === target.x0 && source.z0 === target.z0) return false;

  pushEditorUndo('move selection');

  const sourceCells = mapRangeCells(source);
  const targetKeys = new Set(mapRangeCells(target).map((cell) => `${cell.x},${cell.z}`));
  for (const cell of sourceCells) {
    if (targetKeys.has(`${cell.x},${cell.z}`) || isEntryCell(cell)) continue;
    eraseCellContents(cell);
    cell.active = false;
    cell.height = 0;
    cell.stairs = null;
    cell.zone = null;
  }

  let moved = 0;
  const targetOrigin = { x: target.x0, z: target.z0 };
  for (const copied of snapshot.cells) {
    const cell = getCell(targetOrigin.x + copied.dx, targetOrigin.z + copied.dz);
    if (applyMapSnapshot(cell, copied)) moved += 1;
  }
  refreshEditorWorldNow();
  updateMapEditorHint(`Moved ${moved} selected tile${moved === 1 ? '' : 's'} to (${target.x0}, ${target.z0}).`);
  return true;
}

function stretchMapSelection(drag) {
  const source = drag?.sourceRange;
  const target = state.mapSelection;
  const snapshot = drag?.snapshot;
  if (!source || !target || !snapshot) return false;
  const sameSize = source.x0 === target.x0 && source.x1 === target.x1 && source.z0 === target.z0 && source.z1 === target.z1;
  if (sameSize) return false;

  pushEditorUndo('stretch selection');
  const changed = applyRepeatedMapSnapshot(target, source, snapshot);
  refreshEditorWorldNow();
  updateMapEditorHint(`Repeated ${snapshot.width}x${snapshot.height} selection across ${changed} tile${changed === 1 ? '' : 's'}.`);
  return true;
}

function copyMapCell() {
  if (!state.mapSelectMode) {
    updateMapEditorHint('Press Select before copying a map cell.');
    return;
  }
  const cells = selectedMapCells();
  if (!cells.length) {
    updateMapEditorHint('Select one or more tiles before copying.');
    return;
  }
  const range = state.mapSelection;
  state.mapClipboard = snapshotMapRange(range);
  updateMapEditorHint(`Copied ${mapSelectionLabel()}. Select a destination and paste.`);
}

function pasteMapCell() {
  if (!state.mapSelectMode) {
    updateMapEditorHint('Press Select before pasting onto a map cell.');
    return;
  }
  if (!state.mapSelection || !state.mapClipboard) {
    updateMapEditorHint(!state.mapSelection ? 'Select a destination before pasting.' : 'Copy tiles before pasting.');
    return;
  }
  pushEditorUndo('paste selection');
  const target = { x: state.mapSelection.x0, z: state.mapSelection.z0 };
  let pasted = 0;
  for (const copied of state.mapClipboard.cells) {
    const cell = getCell(target.x + copied.dx, target.z + copied.dz);
    if (applyMapSnapshot(cell, copied)) pasted += 1;
  }
  refreshEditorWorldNow();
  updateMapEditorHint(`Pasted ${pasted} tile${pasted === 1 ? '' : 's'} from the copied selection.`);
}

function clearMapCell() {
  const cells = selectedMapCells();
  if (!cells.length) {
    updateMapEditorHint('Select one or more tiles before clearing.');
    return;
  }
  pushEditorUndo('clear selection');
  let cleared = 0;
  for (const cell of cells) {
    if (isEntryCell(cell)) continue;
    eraseCellContents(cell);
    cell.active = false;
    cleared += 1;
  }
  refreshEditorWorldNow();
  updateMapEditorHint(`Cleared ${cleared} tile${cleared === 1 ? '' : 's'}.`);
}

function updateHover() {
  const cell = state.hoveredCell;
  if (!cell || !state.editorOpen) {
    hoverMesh.visible = false;
    return;
  }
  const h = (cell.active ? walkHeight(cell) : 0) + 0.018;
  hoverMesh.position.copy(worldPosition(cell.x, cell.z, h));
  hoverMesh.visible = true;
}

function setPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
}

function pickCell(event) {
  setPointer(event);
  raycaster.setFromCamera(pointer, state.playerViewMode ? streetCamera : camera);
  const hits = raycaster.intersectObjects(state.tilePickMeshes, false);
  if (hits[0]?.object?.userData?.cell) return hits[0].object.userData.cell;
  const point = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(groundPlane, point)) return null;
  const x = Math.floor(point.x / CELL + state.level.width / 2);
  const z = Math.floor(point.z / CELL + state.level.height / 2);
  return getCell(x, z);
}

function paintEditorCell(cell, erase = false) {
  if (!cell) return false;
  const key = `${cell.x},${cell.z}`;
  if (state.editorPaint?.lastKey === key) return false;
  if (state.editorPaint && !state.editorPaint.undoCaptured) {
    pushEditorUndo(erase ? 'erase cells' : 'paint cells');
    state.editorPaint.undoCaptured = true;
  }
  state.editorPaint.lastKey = key;
  applyTool(cell, erase, { refresh: false });
  scheduleEditorWorldRebuild();
  return true;
}

function beginEditorPaint(event) {
  if (!state.editorOpen || (event.button !== 0 && event.button !== 2)) return;
  state.editorPaint = {
    pointerId: event.pointerId,
    erase: event.button === 2,
    lastKey: null,
    undoCaptured: false
  };
  canvas.setPointerCapture?.(event.pointerId);
  state.hoveredCell = pickCell(event);
  paintEditorCell(state.hoveredCell, state.editorPaint.erase);
  event.preventDefault();
}

function dragEditorPaint(event) {
  if (!state.editorOpen) return;
  state.hoveredCell = pickCell(event);
  if (!state.editorPaint || state.editorPaint.pointerId !== event.pointerId) return;
  paintEditorCell(state.hoveredCell, state.editorPaint.erase);
  event.preventDefault();
}

function endEditorPaint(event) {
  if (!state.editorPaint || (event.pointerId !== undefined && state.editorPaint.pointerId !== event.pointerId)) return;
  if (canvas.hasPointerCapture?.(state.editorPaint.pointerId)) canvas.releasePointerCapture(state.editorPaint.pointerId);
  state.editorPaint = null;
  flushEditorWorld();
  event?.preventDefault?.();
}

function autoStairDir(cell) {
  let best = null;
  const base = cellHeight(cell);
  let height = base;
  for (const key of DIRECTION_KEYS) {
    const next = activeNeighbor(cell, key);
    const h = cellHeight(next);
    if (next?.active && h > height + 0.001) {
      best = key;
      height = h;
    }
  }
  return best || state.selectedDir;
}

function eraseCellContents(cell) {
  const box = boxAt(cell.x, cell.z);
  if (box) state.boxes = state.boxes.filter((item) => item !== box);
  cell.height = 0;
  cell.stairs = null;
  cell.prop = null;
  cell.propDir = null;
  cell.gemSpawn = false;
}

function applyTool(cell, erase = false, { refresh = true } = {}) {
  if (!cell) return;
  if (erase || state.selectedTool === 'erase') {
    eraseCellContents(cell);
    if (!isEntryCell(cell) && cell.active) {
      const hasOnlyFloor = cell.height === 0 && !cell.stairs && !cell.prop && !cell.gemSpawn && !boxAt(cell.x, cell.z);
      if (hasOnlyFloor) cell.active = false;
    }
  } else if (state.selectedTool === 'floor') {
    cell.active = true;
    cell.zone = state.floorZone;
  } else if (state.selectedTool === 'block') {
    if (state.blockMode === 'remove') {
      if (!cell.active) return;
      cell.height = Math.max(0, cell.height - 1);
      if (cell.height === 0) cell.stairs = null;
    } else {
      cell.active = true;
      cell.stairs = null;
      cell.prop = null;
      cell.propDir = null;
      state.boxes = state.boxes.filter((box) => !(box.x === cell.x && box.z === cell.z));
      cell.height = Math.min(MAX_HEIGHT, cell.height + 1);
    }
  } else if (state.selectedTool === 'stairs') {
    cell.active = true;
    cell.prop = null;
    cell.propDir = null;
    state.boxes = state.boxes.filter((box) => !(box.x === cell.x && box.z === cell.z));
    cell.stairs = autoStairDir(cell);
  } else if (state.selectedTool === 'box') {
    cell.active = true;
    cell.prop = null;
    cell.propDir = null;
    cell.stairs = null;
    const existing = boxAt(cell.x, cell.z);
    if (existing) state.boxes = state.boxes.filter((box) => box !== existing);
    else state.boxes.push({ x: cell.x, z: cell.z, homeX: cell.x, homeZ: cell.z });
  } else if (state.selectedTool === 'gem') {
    if (cell.gemSpawn) {
      cell.gemSpawn = false;
    } else {
      if (gemSpawnCount() >= GEM_SPAWN_MINIMUM) {
        setToast(`Gem spawn limit is ${GEM_SPAWN_MINIMUM}.`);
        return;
      }
      if (!canPlaceGemSpawn(cell)) {
        setToast('Gem spawns need an open tile.');
        return;
      }
      cell.active = true;
      cell.gemSpawn = true;
    }
  } else if (state.selectedTool === 'entry') {
    cell.active = true;
    state.level.entry = { x: cell.x, z: cell.z, face: state.selectedDir || 's' };
    state.level.entries = [{ x: cell.x, z: cell.z, face: state.selectedDir || 's' }];
    clearSeekerEntryPath();
  } else if (state.selectedTool === 'stoplight' || EDITOR_PROP_TOOLS.has(state.selectedTool)) {
    cell.active = true;
    cell.stairs = null;
    state.boxes = state.boxes.filter((box) => !(box.x === cell.x && box.z === cell.z));
    if (cell.prop === state.selectedTool) {
      cell.prop = null;
      cell.propDir = null;
    } else {
      cell.prop = state.selectedTool;
      cell.propDir = state.selectedDir || 's';
    }
  }
  syncMapEditorControls();
  if (refresh) refreshEditorWorldNow();
}

async function saveLayout() {
  if (!DEVELOPER_TOOLS_ENABLED) {
    setToast('Layout editing is unavailable in public mode.');
    return;
  }
  if (!state.sandboxMode) {
    setToast('Sandbox mode is required to save layouts.');
    return;
  }
  const removedGemSpawns = cleanInvalidGemSpawns();
  if (removedGemSpawns) {
    syncMapEditorControls();
    refreshEditorWorldNow();
    state.minimapDirty = true;
  }
  const payload = cloneLevel({
    ...state.level,
    presetKey: state.worldPreset,
    savedAt: new Date().toISOString(),
    boxes: state.boxes.map((box) => ({ x: box.homeX ?? box.x, z: box.homeZ ?? box.z, homeX: box.homeX ?? box.x, homeZ: box.homeZ ?? box.z }))
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    state.customLayoutActive = true;
  } catch {
    setToast('Browser storage is full; layout could not be saved locally.');
    return;
  }
  try {
    const response = await fetch('/api/save-layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      setToast(removedGemSpawns
        ? `Layout saved. Removed ${removedGemSpawns} blocked gem spawn${removedGemSpawns === 1 ? '' : 's'}.`
        : 'Layout saved locally and to src/generated-layout.json.');
      return;
    }
  } catch {
    // Static builds cannot write source files; localStorage keeps the editor useful there.
  }
  setToast(removedGemSpawns
    ? `Layout saved locally. Removed ${removedGemSpawns} blocked gem spawn${removedGemSpawns === 1 ? '' : 's'}.`
    : 'Layout saved locally.');
}

function loadLayout() {
  if (!applyPersistedLayout(true, { toast: true })) {
    setToast('No saved layout yet.');
  }
}

function renderModelBrowser() {
  if (!modelPageTabs || !modelTable) return;
  modelPageTabs.innerHTML = MODEL_PAGES.map((page) => (
    `<button type="button" data-model-page="${page.key}" class="${activeModelPage === page.key ? 'active' : ''}" role="tab" aria-selected="${activeModelPage === page.key}">${page.label}</button>`
  )).join('');

  const items = activeModelPage === 'all'
    ? MODEL_CATALOG
    : MODEL_CATALOG.filter((item) => item.pages.includes(activeModelPage));
  modelTable.innerHTML = items.map((item) => {
    const thumb = MODEL_THUMBS[item.tool];
    const preview = `<span class="model-preview model-preview-${item.tool}" aria-hidden="true"><span></span></span>`;
    return `<button type="button" class="model-card ${state.selectedTool === item.tool ? 'active' : ''}" data-model-tool="${item.tool}">
      <span class="model-thumb">${thumb ? `<img src="${thumb}" alt="" />` : preview}</span>
      <span class="model-name">${item.label}</span>
    </button>`;
  }).join('');
}

function setTool(tool) {
  state.selectedTool = tool;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('active', button.dataset.tool === tool);
  });
  document.querySelectorAll('[data-model-tool]').forEach((button) => {
    button.classList.toggle('active', button.dataset.modelTool === tool);
  });
  const hints = {
    floor: 'Floor: choose a color, then click or drag to add or recolor walkable tiles.',
    erase: 'Erase: click tile contents, then an empty floor tile, to remove it.',
    block: `Block: use Add or Remove, then click or drag tiles. Blocks stack up to height ${MAX_HEIGHT}.`,
    stairs: `Stairs: place beside a higher tile. Stack blocks first to chain stairs up to height ${MAX_HEIGHT}.`,
    box: 'Box: place pushable boxes. Hold into a box to keep sliding it forward.',
    gem: 'Gem spawn: mark random spawn possibilities for the next round.',
    entry: 'Entry: set where seekers come through the gate.',
    tree: 'Tree: place a decorative low-poly tree.',
    shrub: 'Shrub: place a soft garden bush.',
    flowerPatch: 'Flowers: place a larger colorful flower patch.',
    mushrooms: 'Mushrooms: place a larger stylized mushroom cluster.',
    gardenRocks: 'Rocks: place decorative garden stones.',
    trafficCone: 'Traffic cone: place a Center street marker.',
    roadBarrier: 'Street barrier: place a blocking Center barrier. Rotate before placing for horizontal or vertical.',
    streetMarking: 'Street mark: paint flat crossing lines on the floor.',
    openaiFloorLogo: 'OpenAI mark: place a flat grey floor logo.',
    trafficLight: 'Traffic light: place a decorative GLB signal for themed crossings.',
    bridgeLight: 'Bridge light: place a non-blocking GLB signal on one-tile paths.',
    housePlant: 'Plant: place a decorative house plant.',
    floorLamp: 'Floor lamp: place a home-themed light model.',
    sideTable: 'Nightstand: place a small table model.',
    woodenTable: 'Wood table: place a table model.',
    armchair: 'Armchair: place a chair model.',
    couch: 'Sofa: place a sofa model.',
    bookshelf: 'Bookshelf: place a tall archive model.',
    oilLamp: 'Oil lamp: place a small vintage lamp.',
    snowman: 'Snowman: place a winter model.',
    winterTree: 'Snow tree: place a seasonal tree.',
    present: 'Present: place a seasonal gift.',
    reindeer: 'Reindeer: place a seasonal reindeer.',
    sled: 'Sled: place a winter sled.',
    wreath: 'Wreath: place a seasonal wreath.',
    stoplight: 'Stoplight: place a blocking stoplight marker.'
  };
  toolHint.textContent = hints[tool] || '';
  blockModeControls?.classList.toggle('hidden', tool !== 'block');
  floorZoneControls?.classList.toggle('hidden', tool !== 'floor');
  renderModelBrowser();
}

function setBlockMode(mode) {
  state.blockMode = mode === 'remove' ? 'remove' : 'add';
  blockModeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.blockMode === state.blockMode);
  });
  setTool('block');
}

function setFloorZone(zone) {
  state.floorZone = ZONE_STYLES[zone] ? zone : 'atrium';
  floorZoneButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.floorZone === state.floorZone);
  });
  setTool('floor');
}

function toggleEditor(force = !state.editorOpen) {
  if (force && (!DEVELOPER_TOOLS_ENABLED || !state.sandboxMode)) {
    state.editorOpen = false;
    setElementHidden(editorToolbar, true);
    syncMapEditorControls();
    setToast(DEVELOPER_TOOLS_ENABLED
      ? 'Sandbox mode is required for the level editor.'
      : 'Level editor is unavailable in public mode.');
    return;
  }
  state.editorOpen = force;
  if (force) {
    closeMenuPanel({ notify: false });
    applyEditorToolbarPosition(loadEditorToolbarPosition());
  }
  setElementHidden(editorToolbar, !force);
  if (force) applyEditorToolbarPosition(loadEditorToolbarPosition());
  else {
    editorToolbar.classList.remove('dragging');
    state.editorToolbarDrag = null;
  }
  if (editorToggle) editorToggle.textContent = force ? 'Exit editor' : 'Level editor';
  syncEditorWorkspaceClass();
  syncMapEditorControls();
  setToast(force ? 'Editor on. Click world tiles to place tools.' : 'Editor off.');
  if (state.level) buildWorld();
}

function updateCamera(immediate = false, delta = 1 / 60) {
  const p = state.player?.group?.position;
  if (state.cameraOverride) cameraTarget.copy(state.cameraOverride);
  else if (p) cameraTarget.set(p.x, 0, p.z);
  if (immediate) cameraFocus.copy(cameraTarget);
  else cameraFocus.lerp(cameraTarget, 1 - Math.exp(-delta * 8));
  camera.position.copy(cameraFocus).add(cameraOffset);
  camera.lookAt(cameraFocus);

  if (state.playerViewMode && state.player?.group) {
    const yaw = state.player.group.rotation.y;
    streetCameraForward.set(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
    streetCameraDesired.copy(p).addScaledVector(streetCameraForward, -CELL * 2.35);
    streetCameraDesired.y = p.y + 2.35;
    streetCameraLookAt.copy(p).addScaledVector(streetCameraForward, CELL * 2.4);
    streetCameraLookAt.y = p.y + 0.9 + state.streetLookPitch * CELL;
    if (immediate) streetCamera.position.copy(streetCameraDesired);
    else streetCamera.position.lerp(streetCameraDesired, 1 - Math.exp(-delta * 9));
    streetCamera.lookAt(streetCameraLookAt);
  }
}

function updateEscapeReveal(delta) {
  if (!state.escapeReveal) return;
  state.escapeReveal.elapsed += delta;
  const elapsed = state.escapeReveal.elapsed;
  if (elapsed < ESCAPE_REVEAL_OUT_SECONDS + ESCAPE_REVEAL_HOLD_SECONDS) {
    state.cameraOverride = state.escapeReveal.target.clone();
  } else {
    state.cameraOverride = null;
  }
  if (elapsed >= ESCAPE_REVEAL_SECONDS) {
    state.escapeReveal = null;
    state.cameraOverride = null;
    state.round = 'playing';
  }
}

function updateEscapeBeacon(time) {
  if (!state.escapeGroup) return;
  const active = Boolean(state.escapeGroup.userData.active);
  const pulse = 1 + Math.sin(time * 5.2) * 0.08;
  state.escapeGroup.traverse((child) => {
    if (child.userData?.escapeActiveOnly) {
      child.visible = active;
      if (active && child.material?.opacity !== undefined) {
        child.material.opacity = child.geometry === escapeBeamGeometry
          ? 0.24 + Math.sin(time * 4.3) * 0.055
          : Math.min(0.86, child.material.opacity);
      }
      if (active && child.isMesh && child.geometry !== escapeBeamGeometry) {
        child.scale.setScalar(pulse);
      }
    }
  });
  const ship = state.escapeGroup.children.find((child) => child.userData?.escapeShip);
  if (ship) ship.position.y = Math.sin(time * 1.7) * 0.06;
}

function updateCameraProjection() {
  const aspect = window.innerWidth / window.innerHeight;
  const shortLandscape = window.matchMedia('(orientation: landscape) and (max-height: 560px)').matches;
  const compactTouch = window.matchMedia('(max-width: 760px), (hover: none), (pointer: coarse)').matches;
  const baseView = shortLandscape ? 7 : (compactTouch ? 10.4 : 12);
  const view = baseView;
  camera.left = -view * aspect;
  camera.right = view * aspect;
  camera.top = view;
  camera.bottom = -view;
  camera.updateProjectionMatrix();
  streetCamera.aspect = aspect;
  streetCamera.fov = shortLandscape ? 54 : 58;
  streetCamera.updateProjectionMatrix();
}

function updateRiverWaves(time) {
  for (let i = 0; i < state.riverLines.length; i += 1) {
    const line = state.riverLines[i];
    const position = line.geometry.attributes.position;
    const values = position.array;
    const base = line.userData.basePositions;
    const phase = line.userData.phase;
    const speed = line.userData.speed;
    for (let j = 0; j < values.length; j += 3) {
      const seed = (j / 3) * 0.31 + i * 0.9;
      values[j] = base[j] + Math.sin(time * speed + seed + phase) * CELL * 0.18;
      values[j + 2] = base[j + 2] + Math.cos(time * (speed * 1.35) + seed + phase) * CELL * 0.24;
    }
    position.needsUpdate = true;
    line.position.x = Math.sin(time * (0.28 + i * 0.006) + line.userData.baseX) * CELL * 0.22;
    line.position.z = Math.cos(time * 0.34 + i) * CELL * 0.12;
    line.material.opacity = 0.34 + Math.sin(time * 0.9 + i) * 0.12;
  }
  for (let i = 0; i < state.riverCurrents.length; i += 1) {
    const current = state.riverCurrents[i];
    current.position.x = Math.sin(time * (0.22 + i * 0.005) + current.userData.baseX) * CELL * 0.2;
    current.position.z = Math.cos(time * (0.3 + i * 0.004) + current.userData.phase) * CELL * 0.16;
    current.material.opacity = 0.13 + Math.sin(time * current.userData.speed + i) * 0.045;
  }
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  state.caughtCueCooldown = Math.max(0, (state.caughtCueCooldown || 0) - delta);
  if (state.round === 'playing') {
    soundscape.setGameplayLoop(true);
    state.runStats.elapsed += delta;
    updatePlayer(delta);
    if (state.round === 'playing') {
      updateBoxes(delta);
      updateSeekers(delta);
      updateSeekerTrackers(delta);
    }
  } else if (state.round === 'escapeReveal') {
    soundscape.setGameplayLoop(false);
    soundscape.setRunLoop(false);
    updateEscapeReveal(delta);
  } else {
    soundscape.setGameplayLoop(false);
    soundscape.setRunLoop(false);
  }
  updateSeekerMessages(delta);
  updateAiCompanion(delta);
  updateAiSeekerBoosts(delta);
  updateAiShockwaves(delta);
  updateAiBeams(delta);
  updateDustPuffs(delta);
  for (const gem of state.gems) {
    if (gem.group && !gem.collected) {
      gem.group.rotation.y += delta * 1.6;
      const pulse = 0.88 + Math.sin(clock.elapsedTime * 4.2 + gem.x * 0.7) * 0.12;
      gem.group.position.y = walkHeight(getCell(gem.x, gem.z)) + 0.86 + Math.sin(clock.elapsedTime * 3 + gem.x) * 0.045;
      gem.group.traverse((child) => {
        if (child.userData?.gemGlow && child.material?.opacity !== undefined) child.material.opacity = 0.13 + pulse * 0.065;
        if (child.userData?.gemFloorGlow && child.material?.opacity !== undefined) child.material.opacity = 0.16 + pulse * 0.065;
        if (child.userData?.gemGlint) child.visible = Math.sin(clock.elapsedTime * 5.4 + gem.z) > -0.25;
      });
    }
  }
  updateRiverWaves(clock.elapsedTime);
  updateEscapeBeacon(clock.elapsedTime);
  updateSeekerCountdown();
  updateAgentPulseHud();
  updateScreenFlash(delta);
  updateSeekerPanel();
  syncMobileControls();
  if (state.toastTimer > 0) {
    state.toastTimer -= delta;
    if (state.toastTimer <= 0) toast.classList.add('hidden');
  }
  if (state.pauseOverlayTimer > 0) {
    state.pauseOverlayTimer -= delta;
    if (state.pauseOverlayTimer <= 0) hidePauseOverlay();
  }
  if (state.streetViewHintTimer > 0) {
    state.streetViewHintTimer -= delta;
    if (state.streetViewHintTimer <= 0) hideStreetViewHint();
  }
  state.minimapTimer -= delta;
  if (state.minimapDirty || state.minimapTimer <= 0) {
    drawMiniMap();
    state.minimapTimer = 0.12;
  }
  updateHover();
  updateCamera(false, delta);
  renderer.render(scene, state.playerViewMode ? streetCamera : camera);
  requestAnimationFrame(animate);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraProjection();
  updateCamera(true);
  syncResponsiveHud();
  clampEditorToolbarToViewport();
  if (state.mapPanelPosition) applyMapPanelPosition(state.mapPanelPosition);
  state.minimapDirty = true;
  drawMiniMap();
}

function bindEvents() {
  window.addEventListener('resize', resize);
  window.addEventListener('blur', () => {
    keys.clear();
    state.playerVelocity.set(0, 0, 0);
    resetMobileJoystick();
    resetMobileRun();
  });
  window.addEventListener('keydown', (event) => {
    if (pendingControl) {
      event.preventDefault();
      if (event.code === 'Escape') {
        pendingControl = null;
        updateControlBindingLabels();
        return;
      }
      controlBindings[pendingControl] = event.code;
      saveControlBindings();
      setToast(`${CONTROL_DEFS[pendingControl].label}: ${codeLabel(event.code)}`);
      pendingControl = null;
      updateControlBindingLabels();
      return;
    }
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) return;
    if (state.mapExpanded && state.mapEditorMode && (event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
      event.preventDefault();
      undoEditorChange();
      return;
    }
    if (state.mapExpanded && state.mapEditorMode && state.mapSelectMode && (event.ctrlKey || event.metaKey)) {
      if (event.code === 'KeyC') {
        event.preventDefault();
        copyMapCell();
        return;
      }
      if (event.code === 'KeyV') {
        event.preventDefault();
        pasteMapCell();
        return;
      }
      if (event.code === 'KeyX' || event.code === 'Backspace' || event.code === 'Delete') {
        event.preventDefault();
        clearMapCell();
        return;
      }
    }
    if (state.mapExpanded && state.mapEditorMode && state.mapSelectMode && (event.code === 'Backspace' || event.code === 'Delete')) {
      event.preventDefault();
      clearMapCell();
      return;
    }
    if (isControlCode(event.code)) event.preventDefault();
    keys.add(event.code);
    if (event.repeat) {
      if (event.code === 'Escape') {
        closeAiPanel();
        closeMenuPanel();
        if (state.editorOpen) toggleEditor(false);
      }
      return;
    }
    if (event.code === 'Escape') {
      closeAiPanel();
      closeMenuPanel();
      if (state.editorOpen) toggleEditor(false);
    }
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('pointermove', (event) => {
    if (dragStreetViewLook(event)) return;
    dragEditorPaint(event);
  });
  canvas.addEventListener('pointerdown', async (event) => {
    await soundscape.start();
    if (beginStreetViewLook(event)) return;
    beginEditorPaint(event);
  });
  canvas.addEventListener('pointerup', (event) => {
    resetStreetViewLook(event.pointerId);
    endEditorPaint(event);
  });
  canvas.addEventListener('pointercancel', (event) => {
    resetStreetViewLook(event.pointerId);
    endEditorPaint(event);
  });
  canvas.addEventListener('lostpointercapture', (event) => {
    resetStreetViewLook(event.pointerId);
    endEditorPaint(event);
  });

  menuButton.addEventListener('click', toggleMenuPanel);
  aiButton?.addEventListener('click', toggleAiPanel);
  closeAiPanelButton?.addEventListener('click', () => closeAiPanel());
  aiTabButtons.forEach((button) => {
    button.addEventListener('click', () => setAiPanelTab(button.dataset.aiTab));
  });
  editAiModelButton?.addEventListener('click', () => setAiModelEditing(aiModel?.hasAttribute('readonly')));
  aiModel?.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
      event.preventDefault();
      setAiModelEditing(false);
    }
  });
  saveAiSettingsButton?.addEventListener('click', saveAiSettings);
  clearAiSettingsButton?.addEventListener('click', clearAiSettings);
  aiCommandForm?.addEventListener('submit', handleAiCommand);
  aiSuggestionButtons.forEach((button) => {
    button.addEventListener('click', () => sendAiSuggestion(button.dataset.aiSuggestion || ''));
  });
  playerViewButton?.addEventListener('click', () => setPlayerViewMode());
  seekerPanelToggle?.addEventListener('click', () => setSeekerPanelCollapsed());
  closeMenu?.addEventListener('click', () => closeMenuPanel());
  controlBindButtons.forEach((button) => {
    button.addEventListener('click', () => setPendingControl(button.dataset.control));
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.target?.closest?.('#touchControlsToggle')) toggleTouchControlsFromEvent(event);
  }, true);
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#touchControlsToggle')) toggleTouchControlsFromEvent(event);
  }, true);
  touchControlsToggle?.addEventListener('pointerdown', toggleTouchControlsFromEvent);
  touchControlsToggle?.addEventListener('click', toggleTouchControlsFromEvent);
  touchControlsToggle?.addEventListener('keydown', (event) => {
    if (event.code === 'Enter' || event.code === 'Space') toggleTouchControlsFromEvent(event);
  });
  editorToggle.addEventListener('click', () => toggleEditor());
  closeEditor.addEventListener('click', () => toggleEditor(false));
  toolbarHead.addEventListener('pointerdown', beginEditorToolbarDrag);
  toolbarHead.addEventListener('pointermove', dragEditorToolbar);
  toolbarHead.addEventListener('pointerup', endEditorToolbarDrag);
  toolbarHead.addEventListener('pointercancel', endEditorToolbarDrag);
  toolbarHead.addEventListener('lostpointercapture', endEditorToolbarDrag);
  mapEditorHead.addEventListener('pointerdown', beginMapPanelDrag);
  mapEditorHead.addEventListener('pointermove', dragMapPanel);
  mapEditorHead.addEventListener('pointerup', endMapPanelDrag);
  mapEditorHead.addEventListener('pointercancel', endMapPanelDrag);
  mapEditorHead.addEventListener('lostpointercapture', endMapPanelDrag);
  mobileJoystick?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    state.mobileJoystick.active = true;
    state.mobileJoystick.pointerId = event.pointerId;
    mobileJoystick.setPointerCapture(event.pointerId);
    setMobileJoystickFromPointer(event);
  });
  mobileJoystick?.addEventListener('pointermove', (event) => {
    if (state.mobileJoystick.pointerId !== event.pointerId) return;
    event.preventDefault();
    setMobileJoystickFromPointer(event);
  });
  const endJoystickDrag = (event) => {
    if (state.mobileJoystick.pointerId !== null && event.pointerId !== state.mobileJoystick.pointerId) return;
    event.preventDefault();
    resetMobileJoystick();
  };
  mobileJoystick?.addEventListener('pointerup', endJoystickDrag);
  mobileJoystick?.addEventListener('pointercancel', endJoystickDrag);
  mobileJoystick?.addEventListener('lostpointercapture', resetMobileJoystick);
  mobileRunButton?.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    state.mobileRunActive = true;
    state.mobileRunPointerId = event.pointerId;
    mobileRunButton.classList.add('active');
    mobileRunButton.setPointerCapture(event.pointerId);
  });
  const endMobileRun = (event) => {
    if (state.mobileRunPointerId !== null && event.pointerId !== state.mobileRunPointerId) return;
    event.preventDefault();
    resetMobileRun();
  };
  mobileRunButton?.addEventListener('pointerup', endMobileRun);
  mobileRunButton?.addEventListener('pointercancel', endMobileRun);
  mobileRunButton?.addEventListener('lostpointercapture', resetMobileRun);
  expandMapButton.addEventListener('pointerdown', (event) => beginMapZoomHold(event, 'mapExpandHold', expandMapButton));
  expandMapButton.addEventListener('pointerup', (event) => endMapZoomHold(event, 'mapExpandHold', expandMapButton, () => setMapExpanded()));
  expandMapButton.addEventListener('pointercancel', (event) => endMapZoomHold(event, 'mapExpandHold', expandMapButton, () => {}));
  expandMapButton.addEventListener('lostpointercapture', (event) => endMapZoomHold(event, 'mapExpandHold', expandMapButton, () => {}));
  expandMapButton.addEventListener('click', () => {
    if (expandMapButton.dataset.skipClick) {
      delete expandMapButton.dataset.skipClick;
      return;
    }
    setMapExpanded();
  });
  mapZoomButton?.addEventListener('pointerdown', (event) => beginMapZoomHold(event, 'mapZoomHold', mapZoomButton));
  mapZoomButton?.addEventListener('pointerup', (event) => endMapZoomHold(event, 'mapZoomHold', mapZoomButton, () => setMapFullscreen()));
  mapZoomButton?.addEventListener('pointercancel', (event) => endMapZoomHold(event, 'mapZoomHold', mapZoomButton, () => {}));
  mapZoomButton?.addEventListener('lostpointercapture', (event) => endMapZoomHold(event, 'mapZoomHold', mapZoomButton, () => {}));
  mapZoomButton?.addEventListener('click', () => {
    if (mapZoomButton.dataset.skipClick) {
      delete mapZoomButton.dataset.skipClick;
      return;
    }
    setMapFullscreen();
  });
  mapPanButton?.addEventListener('click', () => setMapPanMode());
  mapZoomStepButtons.forEach((button) => {
    button.addEventListener('click', () => setMapZoomPercent(state.mapZoomPercent + Number(button.dataset.mapZoomStep || 0)));
  });
  closeMapEditorButton.addEventListener('click', () => setMapExpanded(false));
  mapEditorModeButton.addEventListener('click', () => setMapEditorMode());
  mapUndoButton?.addEventListener('click', undoEditorChange);
  mapCopyButton.addEventListener('click', copyMapCell);
  mapPasteButton.addEventListener('click', pasteMapCell);
  mapSelectButton.addEventListener('click', () => setMapSelectMode());
  expandedMap.addEventListener('contextmenu', (event) => event.preventDefault());
  expandedMap.addEventListener('pointerdown', beginMapCanvasPaint);
  expandedMap.addEventListener('pointermove', dragMapCanvasPaint);
  expandedMap.addEventListener('pointerup', endMapCanvasPaint);
  expandedMap.addEventListener('pointercancel', endMapCanvasPaint);
  expandedMap.addEventListener('lostpointercapture', endMapCanvasPaint);
  window.addEventListener('pointerup', endMapCanvasPaint);
  window.addEventListener('pointercancel', endMapCanvasPaint);
  window.addEventListener('mouseup', endMapCanvasPaint);
  window.addEventListener('touchend', endMapCanvasPaint, { passive: false });
  startButton.addEventListener('click', () => {
    const isOpen = startSetup.classList.toggle('hidden') === false;
    startScreen.classList.toggle('setup-open', isOpen);
  });
  launchRunButton.addEventListener('click', launchGame);
  pauseButton?.addEventListener('click', togglePause);
  backToStartButton.addEventListener('click', returnToStart);
  resumeMenuButton?.addEventListener('click', resumeFromMenu);
  newGameButton?.addEventListener('click', () => {
    void soundscape.start();
    state.started = true;
    startScreen.classList.add('hidden');
    startNewRound();
  });
  playAgainButton.addEventListener('click', () => {
    void soundscape.start();
    state.started = true;
    startScreen.classList.add('hidden');
    startNewRound();
  });
  saveLayoutButton.addEventListener('click', saveLayout);
  editorSaveButton.addEventListener('click', saveLayout);
  modelPageTabs?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-model-page]');
    if (!button) return;
    activeModelPage = button.dataset.modelPage;
    renderModelBrowser();
  });
  modelTable?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-model-tool]');
    if (!button) return;
    setTool(button.dataset.modelTool);
  });
  gemGoalInput.addEventListener('input', () => {
    syncSettingFrom(gemGoalInput, startGemGoalInput, gemGoalValue, startGemGoalValue);
  });
  seekerCountInput.addEventListener('input', () => {
    syncSettingFrom(seekerCountInput, startSeekerCountInput, seekerCountValue, startSeekerCountValue);
  });
  seekerSpeedInput.addEventListener('input', () => {
    syncSettingFrom(seekerSpeedInput, startSeekerSpeedInput, seekerSpeedValue, startSeekerSpeedValue);
  });
  startGemGoalInput.addEventListener('input', () => {
    syncSettingFrom(startGemGoalInput, gemGoalInput, startGemGoalValue, gemGoalValue);
  });
  startSeekerCountInput.addEventListener('input', () => {
    syncSettingFrom(startSeekerCountInput, seekerCountInput, startSeekerCountValue, seekerCountValue);
  });
  startSeekerSpeedInput.addEventListener('input', () => {
    syncSettingFrom(startSeekerSpeedInput, seekerSpeedInput, startSeekerSpeedValue, seekerSpeedValue);
  });
  document.querySelectorAll('[data-stepper-for]').forEach((stepper) => {
    stepper.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-step]');
      if (!button) return;
      const input = document.querySelector(`#${stepper.dataset.stepperFor}`);
      if (input) stepValue(input, Number(button.dataset.step));
    });
  });
  startWorldSelect.addEventListener('change', () => {
    state.worldPreset = startWorldSelect.value;
    menuWorldSelect.value = startWorldSelect.value;
    state.customLayoutActive = false;
    applyPreset(startWorldSelect.value, true);
    state.round = state.started ? 'playing' : 'menu';
  });
  menuWorldSelect.addEventListener('change', () => {
    state.worldPreset = menuWorldSelect.value;
    startWorldSelect.value = menuWorldSelect.value;
    state.customLayoutActive = false;
    applyPreset(menuWorldSelect.value, true);
    state.started = true;
    startScreen.classList.add('hidden');
  });
  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.addEventListener('click', () => {
      applyDifficulty(button.dataset.difficulty);
      if (state.customLayoutActive) {
        startNewRound({ silent: true });
        updateCamera(true);
        state.minimapDirty = true;
      } else {
        applyPreset(state.worldPreset, true);
      }
      state.round = state.started ? 'playing' : 'menu';
    });
  });
  rotateToolButton.addEventListener('click', () => {
    const index = DIRECTION_KEYS.indexOf(state.selectedDir);
    state.selectedDir = DIRECTION_KEYS[(index + 1) % DIRECTION_KEYS.length];
    setToast(`Placement direction: ${state.selectedDir.toUpperCase()}`);
  });
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => setTool(button.dataset.tool));
  });
  blockModeButtons.forEach((button) => {
    button.addEventListener('click', () => setBlockMode(button.dataset.blockMode));
  });
  floorZoneButtons.forEach((button) => {
    button.addEventListener('click', () => setFloorZone(button.dataset.floorZone));
  });
}

bindEvents();
setTool('block');
initialize();
animate();
