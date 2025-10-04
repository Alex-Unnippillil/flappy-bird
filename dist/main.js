/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/assets/atlas.png":
/*!******************************!*\
  !*** ./src/assets/atlas.png ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "3fa15f611241a3fbba7573a9b26102c2.png");

/***/ }),

/***/ "./src/assets/audio/die.ogg":
/*!**********************************!*\
  !*** ./src/assets/audio/die.ogg ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "fb85655698a54f8cde03153d61436a8e.ogg");

/***/ }),

/***/ "./src/assets/audio/hit.ogg":
/*!**********************************!*\
  !*** ./src/assets/audio/hit.ogg ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "53be63225a77062f0e0567615aaef471.ogg");

/***/ }),

/***/ "./src/assets/audio/point.ogg":
/*!************************************!*\
  !*** ./src/assets/audio/point.ogg ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "25b7658563967e60ca23fb51af9c084f.ogg");

/***/ }),

/***/ "./src/assets/audio/swooshing.ogg":
/*!****************************************!*\
  !*** ./src/assets/audio/swooshing.ogg ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "09f7e99dce7a2d12b43909f45bcff6f2.ogg");

/***/ }),

/***/ "./src/assets/audio/wing.ogg":
/*!***********************************!*\
  !*** ./src/assets/audio/wing.ogg ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "06f58df2486e5ade890cf491a58b4e35.ogg");

/***/ }),

/***/ "./src/assets/icon.png":
/*!*****************************!*\
  !*** ./src/assets/icon.png ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "1f82ae5350be3039bfb3fe84ce4c4f89.png");

/***/ }),

/***/ "./src/styles/main.scss":
/*!******************************!*\
  !*** ./src/styles/main.scss ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/abstracts/button-event-handler.ts":
/*!***********************************************!*\
  !*** ./src/abstracts/button-event-handler.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var ButtonEventHandler = (function () {
    function ButtonEventHandler() {
        this.coordinate = {
            x: 0,
            y: 0
        };
        this.calcCoord = {
            x: 0,
            y: 0
        };
        this.dimension = {
            width: 0,
            height: 0
        };
        this.canvasSize = {
            width: 0,
            height: 0
        };
        this.additionalTranslate = {
            x: 0,
            y: 0
        };
        this.touchStart = {
            x: 0,
            y: 0
        };
        this.active = false;
        this.img = void 0;
        this.hoverState = false;
        this.initialWidth = 0;
    }
    Object.defineProperty(ButtonEventHandler.prototype, "isHovered", {
        get: function () {
            return this.hoverState;
        },
        enumerable: false,
        configurable: true
    });
    ButtonEventHandler.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        if (this.img !== void 0) {
            this.dimension = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
                width: this.img.width,
                height: this.img.height
            }, { width: width * this.initialWidth });
        }
        this.canvasSize = { width: width, height: height };
    };
    ButtonEventHandler.prototype.Update = function () {
        this.calcCoord.x =
            this.canvasSize.width * this.coordinate.x + this.additionalTranslate.x;
        this.calcCoord.y =
            this.canvasSize.height * this.coordinate.y + this.additionalTranslate.y;
    };
    ButtonEventHandler.prototype.mouseEvent = function (state, _a) {
        var x = _a.x, y = _a.y;
        if (state === 'down') {
            this.onMouseDown({ x: x, y: y });
        }
        else if (state === 'up') {
            this.onMouseup({ x: x, y: y });
        }
    };
    ButtonEventHandler.prototype.reset = function () {
        this.move({ x: 0, y: 0 });
    };
    ButtonEventHandler.prototype.move = function (_a) {
        var x = _a.x, y = _a.y;
        this.additionalTranslate.x = this.canvasSize.width * x;
        this.additionalTranslate.y = this.canvasSize.height * y;
    };
    ButtonEventHandler.prototype.isInRange = function (_a) {
        var x = _a.x, y = _a.y;
        var xLoc = this.calcCoord.x;
        var yLoc = this.calcCoord.y;
        var xRad = this.dimension.width / 2;
        var yRad = this.dimension.height / 2;
        if (!(xLoc - xRad < x && xLoc + xRad > x))
            return false;
        if (!(yLoc - yRad < y && yLoc + yRad > y))
            return false;
        return true;
    };
    ButtonEventHandler.prototype.onMouseDown = function (coord) {
        if (!this.active)
            return;
        this.touchStart = coord;
        if (this.isInRange(coord)) {
            this.hoverState = true;
        }
    };
    ButtonEventHandler.prototype.onMouseup = function (coord) {
        if (!this.active)
            return;
        this.hoverState = false;
        if (this.isInRange(coord) && this.isInRange(this.touchStart)) {
            this.click();
        }
    };
    return ButtonEventHandler;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ButtonEventHandler);


/***/ }),

/***/ "./src/abstracts/parent-class.ts":
/*!***************************************!*\
  !*** ./src/abstracts/parent-class.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ParentObject = (function () {
    function ParentObject() {
        this.canvasSize = {
            width: 0,
            height: 0
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.coordinate = {
            x: 0,
            y: 0
        };
    }
    ParentObject.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        this.canvasSize = { width: width, height: height };
    };
    return ParentObject;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ParentObject);


/***/ }),

/***/ "./src/asset-preparation.ts":
/*!**********************************!*\
  !*** ./src/asset-preparation.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_asset_loader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/asset-loader */ "./src/lib/asset-loader/index.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _lib_web_sfx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lib/web-sfx */ "./src/lib/web-sfx/index.ts");
/* harmony import */ var _assets_atlas_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./assets/atlas.png */ "./src/assets/atlas.png");
/* harmony import */ var _assets_audio_die_ogg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./assets/audio/die.ogg */ "./src/assets/audio/die.ogg");
/* harmony import */ var _assets_audio_hit_ogg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./assets/audio/hit.ogg */ "./src/assets/audio/hit.ogg");
/* harmony import */ var _assets_audio_point_ogg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./assets/audio/point.ogg */ "./src/assets/audio/point.ogg");
/* harmony import */ var _assets_audio_swooshing_ogg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./assets/audio/swooshing.ogg */ "./src/assets/audio/swooshing.ogg");
/* harmony import */ var _assets_audio_wing_ogg__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./assets/audio/wing.ogg */ "./src/assets/audio/wing.ogg");









/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (callback) {
    var isLoaded = false;
    new _lib_asset_loader__WEBPACK_IMPORTED_MODULE_0__["default"]([_assets_atlas_png__WEBPACK_IMPORTED_MODULE_3__["default"]]).then(function () {
        var sd = new _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__["default"](_lib_asset_loader__WEBPACK_IMPORTED_MODULE_0__["default"].get(_assets_atlas_png__WEBPACK_IMPORTED_MODULE_3__["default"]));
        sd.cutOut('theme-day', 0, 0, 288, 512);
        sd.cutOut('theme-night', 292, 0, 288, 512);
        sd.cutOut('platform', 584, 0, 236, 112);
        sd.cutOut('pipe-red-top', 0, 646, 52, 320);
        sd.cutOut('pipe-red-bottom', 56, 646, 52, 320);
        sd.cutOut('pipe-green-bottom', 168, 646, 52, 320);
        sd.cutOut('pipe-green-top', 112, 646, 52, 320);
        sd.cutOut('score-board', 4, 516, 232, 123);
        sd.cutOut('coin-dull-metal', 224, 906, 44, 44);
        sd.cutOut('coin-dull-bronze', 224, 954, 44, 44);
        sd.cutOut('coin-shine-silver', 242, 516, 44, 44);
        sd.cutOut('coin-shine-gold', 242, 564, 44, 44);
        sd.cutOut('number-sm-0', 276, 646, 12, 14);
        sd.cutOut('number-sm-1', 282, 664, 6, 14);
        sd.cutOut('number-sm-2', 276, 698, 12, 14);
        sd.cutOut('number-sm-3', 276, 716, 12, 14);
        sd.cutOut('number-sm-4', 276, 750, 12, 14);
        sd.cutOut('number-sm-5', 276, 768, 12, 14);
        sd.cutOut('number-sm-6', 276, 802, 12, 14);
        sd.cutOut('number-sm-7', 276, 820, 12, 14);
        sd.cutOut('number.sm-8', 276, 854, 12, 14);
        sd.cutOut('number-sm-9', 276, 872, 12, 14);
        sd.cutOut('number-md-0', 274, 612, 14, 20);
        sd.cutOut('number-md-1', 278, 954, 10, 20);
        sd.cutOut('number-md-2', 274, 978, 14, 20);
        sd.cutOut('number-md-3', 262, 1002, 14, 20);
        sd.cutOut('number-md-4', 1004, 0, 14, 20);
        sd.cutOut('number-md-5', 1004, 24, 14, 20);
        sd.cutOut('number-md-6', 1010, 52, 14, 20);
        sd.cutOut('number-md-7', 1010, 84, 14, 20);
        sd.cutOut('number-md-8', 586, 484, 14, 20);
        sd.cutOut('number-md-9', 622, 412, 14, 20);
        sd.cutOut('number-lg-0', 992, 120, 24, 36);
        sd.cutOut('number-lg-1', 272, 910, 16, 36);
        sd.cutOut('number-lg-2', 584, 320, 24, 36);
        sd.cutOut('number-lg-3', 612, 320, 24, 36);
        sd.cutOut('number-lg-4', 640, 320, 24, 36);
        sd.cutOut('number-lg-5', 668, 320, 24, 36);
        sd.cutOut('number-lg-6', 584, 368, 24, 36);
        sd.cutOut('number-lg-7', 612, 368, 24, 36);
        sd.cutOut('number-lg-8', 640, 368, 24, 36);
        sd.cutOut('number-lg-9', 668, 368, 24, 36);
        sd.cutOut('toast-new', 224, 1002, 32, 14);
        sd.cutOut('btn-pause', 242, 612, 26, 28);
        sd.cutOut('btn-share', 584, 284, 80, 28);
        sd.cutOut('btn-play-icon', 668, 284, 26, 28);
        sd.cutOut('btn-play', 706, 236, 110, 64);
        sd.cutOut('btn-ranking', 826, 236, 110, 64);
        sd.cutOut('btn-menu', 924, 52, 80, 28);
        sd.cutOut('btn-ok', 924, 84, 80, 28);
        sd.cutOut('btn-rate', 926, 2, 70, 44);
        sd.cutOut('bird-yellow-up', 6, 982, 34, 24);
        sd.cutOut('bird-yellow-mid', 62, 982, 34, 24);
        sd.cutOut('bird-yellow-down', 118, 982, 34, 24);
        sd.cutOut('bird-blue-up', 174, 982, 34, 24);
        sd.cutOut('bird-blue-mid', 230, 658, 34, 24);
        sd.cutOut('bird-blue-down', 230, 710, 34, 24);
        sd.cutOut('bird-red-up', 230, 762, 34, 24);
        sd.cutOut('bird-red-mid', 230, 814, 34, 24);
        sd.cutOut('bird-red-down', 230, 866, 34, 24);
        sd.cutOut('spark-sm', 276, 682, 10, 10);
        sd.cutOut('spark-md', 276, 734, 10, 10);
        sd.cutOut('spark-lg', 276, 786, 10, 10);
        sd.cutOut('banner-game-ready', 586, 118, 192, 58);
        sd.cutOut('banner-game-over', 786, 118, 200, 52);
        sd.cutOut('banner-flappybird', 702, 182, 178, 52);
        sd.cutOut('banner-instruction', 584, 182, 114, 98);
        sd.cutOut('copyright', 886, 184, 122, 10);
        sd.cutOut('icon-plus', 992, 168, 10, 10);
        sd.cutOut('btn-mute', 816, 306, 90, 66);
        sd.cutOut('btn-speaker', 712, 306, 90, 66);
        var loadCallback = function () {
            if (isLoaded)
                callback();
            isLoaded = true;
        };
        void sd.then(loadCallback);
        new _lib_web_sfx__WEBPACK_IMPORTED_MODULE_2__["default"]({
            hit: _assets_audio_hit_ogg__WEBPACK_IMPORTED_MODULE_5__["default"],
            wing: _assets_audio_wing_ogg__WEBPACK_IMPORTED_MODULE_8__["default"],
            swoosh: _assets_audio_swooshing_ogg__WEBPACK_IMPORTED_MODULE_7__["default"],
            die: _assets_audio_die_ogg__WEBPACK_IMPORTED_MODULE_4__["default"],
            point: _assets_audio_point_ogg__WEBPACK_IMPORTED_MODULE_6__["default"]
        }, loadCallback);
    });
});


/***/ }),

/***/ "./src/constants.ts":
/*!**************************!*\
  !*** ./src/constants.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APP_VERSION: () => (/* binding */ APP_VERSION),
/* harmony export */   BG_SPEED: () => (/* binding */ BG_SPEED),
/* harmony export */   BIRD_HEIGHT: () => (/* binding */ BIRD_HEIGHT),
/* harmony export */   BIRD_INITIAL_DIMENSION: () => (/* binding */ BIRD_INITIAL_DIMENSION),
/* harmony export */   BIRD_JUMP_HEIGHT: () => (/* binding */ BIRD_JUMP_HEIGHT),
/* harmony export */   BIRD_MAX_DOWN_VELOCITY: () => (/* binding */ BIRD_MAX_DOWN_VELOCITY),
/* harmony export */   BIRD_MAX_ROTATION: () => (/* binding */ BIRD_MAX_ROTATION),
/* harmony export */   BIRD_MAX_UP_VELOCITY: () => (/* binding */ BIRD_MAX_UP_VELOCITY),
/* harmony export */   BIRD_MIN_ROTATION: () => (/* binding */ BIRD_MIN_ROTATION),
/* harmony export */   BIRD_WEIGHT: () => (/* binding */ BIRD_WEIGHT),
/* harmony export */   BIRD_X_POSITION: () => (/* binding */ BIRD_X_POSITION),
/* harmony export */   CANVAS_DIMENSION: () => (/* binding */ CANVAS_DIMENSION),
/* harmony export */   COUNT_COORDINATE: () => (/* binding */ COUNT_COORDINATE),
/* harmony export */   COUNT_DIMENSION: () => (/* binding */ COUNT_DIMENSION),
/* harmony export */   GAME_SPEED: () => (/* binding */ GAME_SPEED),
/* harmony export */   PIPE_DISTANCE: () => (/* binding */ PIPE_DISTANCE),
/* harmony export */   PIPE_HOLL_SIZE: () => (/* binding */ PIPE_HOLL_SIZE),
/* harmony export */   PIPE_INITIAL_DIMENSION: () => (/* binding */ PIPE_INITIAL_DIMENSION),
/* harmony export */   PIPE_MIN_GAP: () => (/* binding */ PIPE_MIN_GAP),
/* harmony export */   SFX_VOLUME: () => (/* binding */ SFX_VOLUME)
/* harmony export */ });
var GAME_SPEED = 0.0062;
var BG_SPEED = 0.0002;
var CANVAS_DIMENSION = {
    width: 288,
    height: 512
};
var SFX_VOLUME = 1;
var APP_VERSION = "0.5.5";
var BIRD_JUMP_HEIGHT = -0.009;
var BIRD_X_POSITION = 0.3;
var BIRD_MAX_ROTATION = 90;
var BIRD_MIN_ROTATION = -19;
var BIRD_HEIGHT = 0.024;
var BIRD_WEIGHT = 0.00047;
var BIRD_MAX_UP_VELOCITY = -0.3;
var BIRD_MAX_DOWN_VELOCITY = 0.0141;
var BIRD_INITIAL_DIMENSION = {
    width: 34,
    height: 24
};
var PIPE_DISTANCE = 0.392;
var PIPE_HOLL_SIZE = 0.184;
var PIPE_MIN_GAP = 0.194;
var PIPE_INITIAL_DIMENSION = {
    width: 100,
    height: 300
};
var COUNT_DIMENSION = {
    width: 24,
    height: 36
};
var COUNT_COORDINATE = {
    x: 0.5,
    y: 0.18
};


/***/ }),

/***/ "./src/events.ts":
/*!***********************!*\
  !*** ./src/events.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/web-sfx */ "./src/lib/web-sfx/index.ts");

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function (Game, canvas) {
    var clicked = false;
    var hasMouseDown = false;
    var hasMouseUp = true;
    var mouse = {
        down: false,
        position: {
            x: 0,
            y: 0
        }
    };
    var getBoundedPosition = function (_a) {
        var x = _a.x, y = _a.y;
        var _b = canvas.getBoundingClientRect(), left = _b.left, top = _b.top, width = _b.width, height = _b.height;
        var dx = ((x - left) / width) * canvas.width;
        var dy = ((y - top) / height) * canvas.height;
        return { x: dx, y: dy };
    };
    var likeClickedEvent = function () {
        if (clicked)
            return;
        Game.onClick(mouse.position);
        clicked = true;
    };
    var mouseMove = function (_a, evt) {
        var x = _a.x, y = _a.y;
        evt.preventDefault();
        mouse.position = getBoundedPosition({ x: x, y: y });
    };
    var mouseUP = function (_a, evt, isRetreive) {
        var x = _a.x, y = _a.y;
        if (hasMouseUp)
            return;
        hasMouseUp = true;
        hasMouseDown = false;
        void _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].init();
        evt.preventDefault();
        if (!isRetreive)
            mouse.position = getBoundedPosition({ x: x, y: y });
        Game.mouseUp(mouse.position);
        mouse.down = false;
        clicked = false;
    };
    var mouseDown = function (_a, evt) {
        var x = _a.x, y = _a.y;
        if (hasMouseDown)
            return;
        hasMouseUp = false;
        hasMouseDown = true;
        void _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].init();
        evt.preventDefault();
        mouse.position = getBoundedPosition({ x: x, y: y });
        Game.mouseDown(mouse.position);
        mouse.down = true;
        likeClickedEvent();
    };
    canvas.addEventListener('mousedown', function (evt) {
        mouseDown({ x: evt.clientX, y: evt.clientY }, evt);
    });
    canvas.addEventListener('mouseup', function (evt) {
        mouseUP({ x: evt.clientX, y: evt.clientY }, evt, false);
    });
    canvas.addEventListener('mousemove', function (evt) {
        mouseMove({ x: evt.clientX, y: evt.clientY }, evt);
    });
    canvas.addEventListener('touchstart', function (evt) {
        mouseDown({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt);
    });
    canvas.addEventListener('touchend', function (evt) {
        if (evt.touches.length < 1) {
            mouseUP(mouse.position, evt, true);
            return;
        }
        mouseUP({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt, false);
    });
    canvas.addEventListener('touchmove', function (evt) {
        mouseMove({ x: evt.touches[0].clientX, y: evt.touches[0].clientY }, evt);
    });
    document.addEventListener('keydown', function (evt) {
        var key = evt.key, keyCode = evt.keyCode, code = evt.code;
        if (key === ' ' ||
            keyCode === 32 ||
            code === 'Space' ||
            key === 'Enter' ||
            keyCode === 13 ||
            code === 'NumpadEnter' ||
            code === 'Enter') {
            Game.startAtKeyBoardEvent();
            mouseDown({
                x: canvas.width / 2,
                y: canvas.height / 2
            }, evt);
        }
    });
    document.addEventListener('keyup', function (evt) {
        var key = evt.key, keyCode = evt.keyCode, code = evt.code;
        if (key === ' ' ||
            keyCode === 32 ||
            code === 'Space' ||
            key === 'Enter' ||
            keyCode === 13 ||
            code === 'NumpadEnter' ||
            code === 'Enter') {
            mouseUP({
                x: canvas.width / 2,
                y: canvas.height / 2
            }, evt, false);
        }
    });
});


/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _model_background__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/background */ "./src/model/background.ts");
/* harmony import */ var _model_bird__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/bird */ "./src/model/bird.ts");
/* harmony import */ var _screens_gameplay__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./screens/gameplay */ "./src/screens/gameplay.ts");
/* harmony import */ var _screens_intro__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./screens/intro */ "./src/screens/intro.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _model_pipe_generator__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./model/pipe-generator */ "./src/model/pipe-generator.ts");
/* harmony import */ var _model_platform__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./model/platform */ "./src/model/platform.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _lib_screen_changer__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./lib/screen-changer */ "./src/lib/screen-changer/index.ts");
/* harmony import */ var _model_sfx__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./model/sfx */ "./src/model/sfx.ts");
/* harmony import */ var _lib_storage__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./lib/storage */ "./src/lib/storage/index.ts");
/* harmony import */ var _model_flash_screen__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./model/flash-screen */ "./src/model/flash-screen.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();












var Game = (function (_super) {
    __extends(Game, _super);
    function Game(canvas) {
        var _this = _super.call(this) || this;
        _this.screenChanger = new _lib_screen_changer__WEBPACK_IMPORTED_MODULE_8__["default"]();
        _this.background = new _model_background__WEBPACK_IMPORTED_MODULE_0__["default"]();
        _this.canvas = canvas;
        _this.context = _this.canvas.getContext('2d', {
            desynchronized: true,
            alpha: false
        });
        _this.platform = new _model_platform__WEBPACK_IMPORTED_MODULE_6__["default"]();
        _this.pipeGenerator = new _model_pipe_generator__WEBPACK_IMPORTED_MODULE_5__["default"]();
        _this.screenIntro = new _screens_intro__WEBPACK_IMPORTED_MODULE_3__["default"]();
        _this.gamePlay = new _screens_gameplay__WEBPACK_IMPORTED_MODULE_2__["default"](_this);
        _this.state = 'intro';
        _this.bgPause = false;
        _this.transition = new _model_flash_screen__WEBPACK_IMPORTED_MODULE_11__["default"]({
            interval: 700,
            strong: 1,
            style: 'black',
            easing: 'sineWaveHS'
        });
        _this.transition.setEvent([0.98, 1], function () {
            _this.state = 'game';
        });
        return _this;
    }
    Game.prototype.init = function () {
        new _lib_storage__WEBPACK_IMPORTED_MODULE_10__["default"]();
        this.background.init();
        this.platform.init();
        this.transition.init();
        void _model_sfx__WEBPACK_IMPORTED_MODULE_9__["default"].init();
        _model_sfx__WEBPACK_IMPORTED_MODULE_9__["default"].volume(_constants__WEBPACK_IMPORTED_MODULE_7__.SFX_VOLUME);
        this.screenIntro.init();
        this.gamePlay.init();
        this.setEvent();
        this.screenIntro.playButton.active = true;
        this.screenIntro.rankingButton.active = true;
        this.screenIntro.rateButton.active = true;
        this.screenChanger.register('intro', this.screenIntro);
        this.screenChanger.register('game', this.gamePlay);
    };
    Game.prototype.reset = function () {
        this.background.reset();
        this.platform.reset();
        this.Resize(this.canvasSize);
    };
    Game.prototype.Resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.background.resize(this.canvasSize);
        this.platform.resize(this.canvasSize);
        this.transition.resize(this.canvasSize);
        _model_bird__WEBPACK_IMPORTED_MODULE_1__["default"].platformHeight = this.platform.platformSize.height;
        this.pipeGenerator.resize({
            max: height - this.platform.platformSize.height,
            width: width,
            height: height
        });
        this.screenIntro.resize(this.canvasSize);
        this.gamePlay.resize(this.canvasSize);
        this.canvas.width = width;
        this.canvas.height = height;
    };
    Game.prototype.Update = function () {
        this.transition.Update();
        this.screenChanger.setState(this.state);
        if (!this.bgPause) {
            this.background.Update();
            this.platform.Update();
        }
        this.screenChanger.Update();
    };
    Game.prototype.Display = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.imageSmoothingEnabled = false;
        this.context.imageSmoothingQuality = 'high';
        this.screenChanger.setState(this.state);
        this.background.Display(this.context);
        for (var _i = 0, _a = this.pipeGenerator.pipes; _i < _a.length; _i++) {
            var pipe = _a[_i];
            pipe.Display(this.context);
        }
        this.platform.Display(this.context);
        this.screenChanger.Display(this.context);
        this.transition.Display(this.context);
    };
    Game.prototype.setEvent = function () {
        var _this = this;
        this.screenIntro.playButton.onClick(function () {
            if (_this.state !== 'intro')
                return;
            _this.screenIntro.playButton.active = false;
            _this.screenIntro.rankingButton.active = false;
            _this.screenIntro.rateButton.active = false;
            _this.screenIntro.toggleSpeakerButton.active = false;
            _this.transition.reset();
            _this.transition.start();
        });
    };
    Game.prototype.onClick = function (_a) {
        var x = _a.x, y = _a.y;
        if (this.state === 'game') {
            this.gamePlay.click({ x: x, y: y });
        }
    };
    Game.prototype.mouseDown = function (_a) {
        var x = _a.x, y = _a.y;
        this.screenIntro.mouseDown({ x: x, y: y });
        this.gamePlay.mouseDown({ x: x, y: y });
    };
    Game.prototype.mouseUp = function (_a) {
        var x = _a.x, y = _a.y;
        this.screenIntro.mouseUp({ x: x, y: y });
        this.gamePlay.mouseUp({ x: x, y: y });
    };
    Game.prototype.startAtKeyBoardEvent = function () {
        if (this.state === 'intro')
            this.screenIntro.startAtKeyBoardEvent();
        else
            this.gamePlay.startAtKeyBoardEvent();
    };
    Object.defineProperty(Game.prototype, "currentState", {
        get: function () {
            return this.state;
        },
        enumerable: false,
        configurable: true
    });
    return Game;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_4__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_main_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/main.scss */ "./src/styles/main.scss");
/* harmony import */ var _assets_icon_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/icon.png */ "./src/assets/icon.png");
/* harmony import */ var _total_typescript_ts_reset__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @total-typescript/ts-reset */ "./node_modules/@total-typescript/ts-reset/dist/recommended.mjs");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/utils/index.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./constants */ "./src/constants.ts");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./events */ "./src/events.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./game */ "./src/game.ts");
/* harmony import */ var _asset_preparation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./asset-preparation */ "./src/asset-preparation.ts");
/* harmony import */ var _solid_primitives_raf__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @solid-primitives/raf */ "./node_modules/@solid-primitives/raf/dist/index.js");
/* harmony import */ var _lib_workbox_work_offline__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./lib/workbox-work-offline */ "./src/lib/workbox-work-offline/index.ts");










if (false) {}
var virtualCanvas = document.createElement('canvas');
var gameIcon = document.createElement('img');
var canvas = document.querySelector('#main-canvas');
var physicalContext = canvas.getContext('2d');
var loadingScreen = document.querySelector('#loading-modal');
var Game = new _game__WEBPACK_IMPORTED_MODULE_6__["default"](virtualCanvas);
var fps = new _utils__WEBPACK_IMPORTED_MODULE_3__.framer(Game.context);
var isLoaded = false;
gameIcon.src = _assets_icon_png__WEBPACK_IMPORTED_MODULE_1__["default"];
fps.text({ x: 50, y: 50 }, '', ' Cycle');
fps.container({ x: 10, y: 10 }, { x: 230, y: 70 });
var GameUpdate = function () {
    physicalContext.drawImage(virtualCanvas, 0, 0);
    Game.Update();
    Game.Display();
    if (true)
        fps.mark();
};
var ScreenResize = function () {
    var sizeResult = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.rescaleDim)(_constants__WEBPACK_IMPORTED_MODULE_4__.CANVAS_DIMENSION, {
        height: window.innerHeight * 2 - 50
    });
    canvas.style.maxWidth = String(sizeResult.width / 2) + 'px';
    canvas.style.maxHeight = String(sizeResult.height / 2) + 'px';
    canvas.height = sizeResult.height;
    canvas.width = sizeResult.width;
    virtualCanvas.height = sizeResult.height;
    virtualCanvas.width = sizeResult.width;
    console.log("Canvas Size: ".concat(sizeResult.width, "x").concat(sizeResult.height));
    Game.Resize(sizeResult);
};
var removeLoadingScreen = function () {
    (0,_events__WEBPACK_IMPORTED_MODULE_5__["default"])(Game, canvas);
    loadingScreen.style.display = 'none';
    document.body.style.backgroundColor = 'rgba(28, 28, 30, 1)';
};
var _a = (0,_solid_primitives_raf__WEBPACK_IMPORTED_MODULE_9__["default"])((0,_solid_primitives_raf__WEBPACK_IMPORTED_MODULE_9__.targetFPS)(GameUpdate, 60)), game_running = _a[0], game_start = _a[1];
window.addEventListener('DOMContentLoaded', function () {
    loadingScreen.insertBefore(gameIcon, loadingScreen.childNodes[0]);
    (0,_asset_preparation__WEBPACK_IMPORTED_MODULE_7__["default"])(function () {
        isLoaded = true;
        Game.init();
        ScreenResize();
        if (!game_running())
            game_start();
        if (true)
            removeLoadingScreen();
        else
            {}
    });
});
window.addEventListener('resize', function () {
    if (!isLoaded)
        return;
    ScreenResize();
});


/***/ }),

/***/ "./src/lib/animation/abstracts/default-properties.ts":
/*!***********************************************************!*\
  !*** ./src/lib/animation/abstracts/default-properties.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var DefaultProperties = (function () {
    function DefaultProperties() {
        this.isComplete = false;
        this.isRunning = false;
        this.startTime = 0;
    }
    Object.defineProperty(DefaultProperties.prototype, "time", {
        get: function () {
            return performance.now();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DefaultProperties.prototype, "timeDiff", {
        get: function () {
            if (!this.isRunning)
                return 0;
            return this.time - this.startTime;
        },
        enumerable: false,
        configurable: true
    });
    DefaultProperties.prototype.stop = function () {
        this.isComplete = true;
        this.isRunning = false;
    };
    DefaultProperties.prototype.start = function () {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.isComplete = false;
        this.startTime = this.time;
    };
    DefaultProperties.prototype.reset = function () {
        this.isComplete = false;
        this.isRunning = false;
    };
    return DefaultProperties;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DefaultProperties);


/***/ }),

/***/ "./src/lib/animation/abstracts/fading.ts":
/*!***********************************************!*\
  !*** ./src/lib/animation/abstracts/fading.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _default_properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./default-properties */ "./src/lib/animation/abstracts/default-properties.ts");
/* harmony import */ var _easing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../easing */ "./src/lib/animation/easing.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var Fading = (function (_super) {
    __extends(Fading, _super);
    function Fading(options) {
        var _this = _super.call(this) || this;
        _this.options = {
            duration: 500,
            transition: 'swing'
        };
        Object.assign(_this.options, options !== null && options !== void 0 ? options : {});
        return _this;
    }
    Object.defineProperty(Fading.prototype, "status", {
        get: function () {
            return {
                running: this.isRunning,
                complete: this.isComplete
            };
        },
        enumerable: false,
        configurable: true
    });
    Fading.prototype.inUseTransition = function (num) {
        return _easing__WEBPACK_IMPORTED_MODULE_1__[this.options.transition](num);
    };
    return Fading;
}(_default_properties__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fading);


/***/ }),

/***/ "./src/lib/animation/abstracts/flying.ts":
/*!***********************************************!*\
  !*** ./src/lib/animation/abstracts/flying.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _default_properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./default-properties */ "./src/lib/animation/abstracts/default-properties.ts");
/* harmony import */ var _easing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../easing */ "./src/lib/animation/easing.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var Flying = (function (_super) {
    __extends(Flying, _super);
    function Flying(options) {
        var _this = _super.call(this) || this;
        _this.options = {
            duration: 500,
            from: {
                x: 0,
                y: 0
            },
            to: {
                x: 0,
                y: 0
            },
            transition: 'cubicBezier'
        };
        Object.assign(_this.options, options);
        return _this;
    }
    Object.defineProperty(Flying.prototype, "status", {
        get: function () {
            return {
                running: this.isRunning,
                complete: this.isComplete
            };
        },
        enumerable: false,
        configurable: true
    });
    Flying.prototype.inUseTransition = function (num) {
        return _easing__WEBPACK_IMPORTED_MODULE_1__[this.options.transition](num);
    };
    return Flying;
}(_default_properties__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Flying);


/***/ }),

/***/ "./src/lib/animation/anims/bounce-in.ts":
/*!**********************************************!*\
  !*** ./src/lib/animation/anims/bounce-in.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BounceIn: () => (/* binding */ BounceIn)
/* harmony export */ });
/* harmony import */ var _abstracts_default_properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/default-properties */ "./src/lib/animation/abstracts/default-properties.ts");
/* harmony import */ var _easing__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../easing */ "./src/lib/animation/easing.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var BounceIn = (function (_super) {
    __extends(BounceIn, _super);
    function BounceIn(options) {
        var _this = _super.call(this) || this;
        _this.options = {
            durations: {
                fading: 400,
                bounce: 1000
            }
        };
        Object.assign(_this.options, options);
        return _this;
    }
    Object.defineProperty(BounceIn.prototype, "status", {
        get: function () {
            return {
                running: this.isRunning,
                complete: this.isComplete
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BounceIn.prototype, "value", {
        get: function () {
            if (!this.isRunning) {
                return {
                    opacity: this.isComplete ? 1 : 0,
                    value: 0
                };
            }
            var _a = this.options.durations, fading = _a.fading, bounce = _a.bounce;
            var timeDiff = this.timeDiff;
            var opacity = _easing__WEBPACK_IMPORTED_MODULE_1__.swing(timeDiff / fading);
            var value = -_easing__WEBPACK_IMPORTED_MODULE_1__.sineWaveHS(timeDiff / bounce);
            if (timeDiff >= Math.max(fading, bounce)) {
                this.stop();
                return {
                    opacity: 1,
                    value: 0
                };
            }
            if (timeDiff >= fading) {
                opacity = 1;
            }
            if (timeDiff >= bounce) {
                value = 0;
            }
            return { opacity: opacity, value: value };
        },
        enumerable: false,
        configurable: true
    });
    return BounceIn;
}(_abstracts_default_properties__WEBPACK_IMPORTED_MODULE_0__["default"]));



/***/ }),

/***/ "./src/lib/animation/anims/fade-out-in.ts":
/*!************************************************!*\
  !*** ./src/lib/animation/anims/fade-out-in.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FadeOutIn: () => (/* binding */ FadeOutIn)
/* harmony export */ });
/* harmony import */ var _abstracts_fading__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/fading */ "./src/lib/animation/abstracts/fading.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var FadeOutIn = (function (_super) {
    __extends(FadeOutIn, _super);
    function FadeOutIn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FadeOutIn.prototype, "value", {
        get: function () {
            if (this.isComplete && !this.isRunning)
                return 1;
            var stime = this.startTime;
            var value = (this.time - stime) / this.options.duration;
            if (value >= 2)
                this.stop();
            return this.inUseTransition(1 - value);
        },
        enumerable: false,
        configurable: true
    });
    return FadeOutIn;
}(_abstracts_fading__WEBPACK_IMPORTED_MODULE_0__["default"]));



/***/ }),

/***/ "./src/lib/animation/anims/fade-out.ts":
/*!*********************************************!*\
  !*** ./src/lib/animation/anims/fade-out.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FadeOut: () => (/* binding */ FadeOut)
/* harmony export */ });
/* harmony import */ var _abstracts_fading__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/fading */ "./src/lib/animation/abstracts/fading.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils */ "./src/utils/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var FadeOut = (function (_super) {
    __extends(FadeOut, _super);
    function FadeOut() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FadeOut.prototype, "value", {
        get: function () {
            if (this.isComplete || !this.isRunning)
                return 0;
            var value = this.timeDiff / this.options.duration;
            if (value >= 1) {
                this.stop();
                return 0;
            }
            return this.inUseTransition((0,_utils__WEBPACK_IMPORTED_MODULE_1__.flipRange)(0, 1, value));
        },
        enumerable: false,
        configurable: true
    });
    return FadeOut;
}(_abstracts_fading__WEBPACK_IMPORTED_MODULE_0__["default"]));



/***/ }),

/***/ "./src/lib/animation/anims/flying.ts":
/*!*******************************************!*\
  !*** ./src/lib/animation/anims/flying.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Fly: () => (/* binding */ Fly)
/* harmony export */ });
/* harmony import */ var _abstracts_flying__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/flying */ "./src/lib/animation/abstracts/flying.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils */ "./src/utils/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var Fly = (function (_super) {
    __extends(Fly, _super);
    function Fly() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Fly.prototype, "value", {
        get: function () {
            if (!this.isRunning) {
                return this.isComplete ? this.options.to : this.options.from;
            }
            var f = this.options.from;
            var t = this.options.to;
            var diff = this.timeDiff / this.options.duration;
            if (diff >= 1) {
                this.stop();
                return this.options.to;
            }
            return {
                x: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.lerp)(f.x, t.x, this.inUseTransition(diff)),
                y: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.lerp)(f.y, t.y, this.inUseTransition(diff))
            };
        },
        enumerable: false,
        configurable: true
    });
    return Fly;
}(_abstracts_flying__WEBPACK_IMPORTED_MODULE_0__["default"]));



/***/ }),

/***/ "./src/lib/animation/anims/timing-event.ts":
/*!*************************************************!*\
  !*** ./src/lib/animation/anims/timing-event.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimingEvent: () => (/* binding */ TimingEvent)
/* harmony export */ });
/* harmony import */ var _abstracts_default_properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/default-properties */ "./src/lib/animation/abstracts/default-properties.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var TimingEvent = (function (_super) {
    __extends(TimingEvent, _super);
    function TimingEvent(options) {
        var _this = _super.call(this) || this;
        _this.options = {
            diff: 100
        };
        Object.assign(_this.options, options);
        return _this;
    }
    Object.defineProperty(TimingEvent.prototype, "status", {
        get: function () {
            return {
                running: this.isRunning,
                complete: this.isComplete
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimingEvent.prototype, "value", {
        get: function () {
            var td = this.timeDiff;
            if (td >= this.options.diff) {
                this.startTime = this.time;
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    return TimingEvent;
}(_abstracts_default_properties__WEBPACK_IMPORTED_MODULE_0__["default"]));



/***/ }),

/***/ "./src/lib/animation/easing.ts":
/*!*************************************!*\
  !*** ./src/lib/animation/easing.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cubicBezier: () => (/* binding */ cubicBezier),
/* harmony export */   easeOut: () => (/* binding */ easeOut),
/* harmony export */   easeOutCirc: () => (/* binding */ easeOutCirc),
/* harmony export */   easeOutExpo: () => (/* binding */ easeOutExpo),
/* harmony export */   linear: () => (/* binding */ linear),
/* harmony export */   quadratic: () => (/* binding */ quadratic),
/* harmony export */   sineWaveHS: () => (/* binding */ sineWaveHS),
/* harmony export */   swing: () => (/* binding */ swing)
/* harmony export */ });
var swing = function (t) {
    return 0.5 - Math.cos(t * Math.PI) / 2;
};
var linear = function (t) {
    return t;
};
var quadratic = function (t) {
    return Math.pow(t, 2);
};
var cubicBezier = function (t) {
    return t <= 0.5 ? 2 * Math.pow(t, 3) : 1 - 2 * Math.pow(t, 3);
};
var easeOut = function (t) {
    return 0.5 - Math.cos(t * Math.PI) / 2;
};
var sineWaveHS = function (t) {
    return Math.sin((t * 2 * Math.PI) / 2);
};
var easeOutCirc = function (t) {
    return Math.sqrt(1 - Math.pow(t - 1, 2));
};
var easeOutExpo = function (t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};


/***/ }),

/***/ "./src/lib/animation/index.ts":
/*!************************************!*\
  !*** ./src/lib/animation/index.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BounceIn: () => (/* reexport safe */ _anims_bounce_in__WEBPACK_IMPORTED_MODULE_3__.BounceIn),
/* harmony export */   FadeOut: () => (/* reexport safe */ _anims_fade_out__WEBPACK_IMPORTED_MODULE_0__.FadeOut),
/* harmony export */   FadeOutIn: () => (/* reexport safe */ _anims_fade_out_in__WEBPACK_IMPORTED_MODULE_1__.FadeOutIn),
/* harmony export */   Fly: () => (/* reexport safe */ _anims_flying__WEBPACK_IMPORTED_MODULE_2__.Fly),
/* harmony export */   TimingEvent: () => (/* reexport safe */ _anims_timing_event__WEBPACK_IMPORTED_MODULE_4__.TimingEvent)
/* harmony export */ });
/* harmony import */ var _anims_fade_out__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./anims/fade-out */ "./src/lib/animation/anims/fade-out.ts");
/* harmony import */ var _anims_fade_out_in__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./anims/fade-out-in */ "./src/lib/animation/anims/fade-out-in.ts");
/* harmony import */ var _anims_flying__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./anims/flying */ "./src/lib/animation/anims/flying.ts");
/* harmony import */ var _anims_bounce_in__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./anims/bounce-in */ "./src/lib/animation/anims/bounce-in.ts");
/* harmony import */ var _anims_timing_event__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./anims/timing-event */ "./src/lib/animation/anims/timing-event.ts");







/***/ }),

/***/ "./src/lib/asset-loader/abstraction.ts":
/*!*********************************************!*\
  !*** ./src/lib/asset-loader/abstraction.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractLoader: () => (/* binding */ Loader)
/* harmony export */ });
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ParentLoader = (function () {
    function ParentLoader(source) {
        this.__source = source;
        this.ready = 0;
    }
    ParentLoader.prototype.eventTracking = function (resolve, object) {
        this.ready--;
        if (this.ready < 1) {
            resolve({
                source: this.source,
                object: object
            });
        }
    };
    Object.defineProperty(ParentLoader.prototype, "source", {
        get: function () {
            return this.__source;
        },
        enumerable: false,
        configurable: true
    });
    return ParentLoader;
}());
var Loader = (function (_super) {
    __extends(Loader, _super);
    function Loader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Loader;
}(ParentLoader));



/***/ }),

/***/ "./src/lib/asset-loader/index.ts":
/*!***************************************!*\
  !*** ./src/lib/asset-loader/index.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _loaders_audio__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loaders/audio */ "./src/lib/asset-loader/loaders/audio.ts");
/* harmony import */ var _loaders_image__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./loaders/image */ "./src/lib/asset-loader/loaders/image.ts");


var AssetsLoader = (function () {
    function AssetsLoader(sources) {
        var _this = this;
        var InitializeLoad = sources.map(function (source) {
            for (var _i = 0, _a = AssetsLoader.loaders; _i < _a.length; _i++) {
                var loader = _a[_i];
                var instance = new loader(source);
                if (instance.test()) {
                    return instance.load();
                }
            }
            throw new Error('No available driver for file: ' + source);
        });
        Promise.all(InitializeLoad)
            .then(function (resolveArray) {
            var _a;
            resolveArray.forEach(function (resolve) {
                AssetsLoader.assets.set(resolve.source, resolve.object);
            });
            (_a = _this.callback) === null || _a === void 0 ? void 0 : _a.call(_this);
        })
            .catch(function (err) {
            console.error(err);
        });
    }
    AssetsLoader.prototype.then = function (callback) {
        this.callback = callback;
    };
    AssetsLoader.get = function (source) {
        return AssetsLoader.assets.get(source);
    };
    AssetsLoader.assets = new Map();
    AssetsLoader.loaders = [_loaders_audio__WEBPACK_IMPORTED_MODULE_0__["default"], _loaders_image__WEBPACK_IMPORTED_MODULE_1__["default"]];
    return AssetsLoader;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AssetsLoader);


/***/ }),

/***/ "./src/lib/asset-loader/loaders/audio.ts":
/*!***********************************************!*\
  !*** ./src/lib/asset-loader/loaders/audio.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstraction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstraction */ "./src/lib/asset-loader/abstraction.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var AudioLoader = (function (_super) {
    __extends(AudioLoader, _super);
    function AudioLoader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AudioLoader.prototype.test = function () {
        return AudioLoader.regexp.test(this.source);
    };
    AudioLoader.prototype.load = function () {
        var _this = this;
        this.ready = 2;
        return new Promise(function (resolve, reject) {
            var audio = new Audio();
            audio.addEventListener('load', function () {
                _this.eventTracking(resolve, audio);
            });
            audio.addEventListener('canplay', function () {
                _this.eventTracking(resolve, audio);
            });
            audio.addEventListener('canplaythrough', function () {
                _this.eventTracking(resolve, audio);
            });
            audio.addEventListener('error', reject);
            audio.src = _this.source;
        });
    };
    AudioLoader.regexp = /\.(mp3|wav|ogg|aac)/i;
    return AudioLoader;
}(_abstraction__WEBPACK_IMPORTED_MODULE_0__.AbstractLoader));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (AudioLoader);


/***/ }),

/***/ "./src/lib/asset-loader/loaders/image.ts":
/*!***********************************************!*\
  !*** ./src/lib/asset-loader/loaders/image.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstraction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstraction */ "./src/lib/asset-loader/abstraction.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

var ImageLoader = (function (_super) {
    __extends(ImageLoader, _super);
    function ImageLoader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageLoader.prototype.test = function () {
        return ImageLoader.regexp.test(this.source);
    };
    ImageLoader.prototype.load = function () {
        var _this = this;
        this.ready = 1;
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.addEventListener('load', function () {
                _this.eventTracking(resolve, img);
            });
            img.addEventListener('error', reject);
            img.src = _this.source;
        });
    };
    ImageLoader.regexp = /\.(jpe?g|png|svg|bmp|webp|webm|gif)/i;
    return ImageLoader;
}(_abstraction__WEBPACK_IMPORTED_MODULE_0__.AbstractLoader));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ImageLoader);


/***/ }),

/***/ "./src/lib/screen-changer/index.ts":
/*!*****************************************!*\
  !*** ./src/lib/screen-changer/index.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var ScreenChanger = (function () {
    function ScreenChanger() {
        this.objects = new Map();
        this.currentState = '';
    }
    ScreenChanger.prototype.setState = function (state) {
        this.currentState = state;
    };
    ScreenChanger.prototype.register = function (name, classObject) {
        this.objects.set(name, classObject);
    };
    ScreenChanger.prototype.Update = function () {
        var classObject = this.objects.get(this.currentState);
        if (classObject === void 0) {
            throw new TypeError("State ".concat(this.currentState, " does not exists"));
        }
        classObject.Update();
    };
    ScreenChanger.prototype.Display = function (context) {
        var classObject = this.objects.get(this.currentState);
        if (classObject === void 0) {
            throw new TypeError("State ".concat(this.currentState, " does not exists"));
        }
        classObject.Display(context);
    };
    return ScreenChanger;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ScreenChanger);


/***/ }),

/***/ "./src/lib/sprite-destructor/index.ts":
/*!********************************************!*\
  !*** ./src/lib/sprite-destructor/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var SpriteDestructor = (function () {
    function SpriteDestructor(sprite) {
        this.sprite = sprite;
        this.Canvas = document.createElement('canvas');
        this.ctx = this.Canvas.getContext('2d');
        this.loading = [];
        this.then_called = false;
    }
    SpriteDestructor.prototype.then = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.then_called)
                            return [2];
                        this.then_called = true;
                        return [4, Promise.allSettled(this.loading).then(function (resolved) {
                                var error_count = 0;
                                for (var _i = 0, resolved_1 = resolved; _i < resolved_1.length; _i++) {
                                    var result = resolved_1[_i];
                                    if (result.status === 'fulfilled' && 'value' in result) {
                                        SpriteDestructor.cached.set(result.value.name, result.value.img);
                                        continue;
                                    }
                                    ++error_count;
                                }
                                console.warn("Error count: ".concat(error_count));
                                callback();
                            })];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    SpriteDestructor.asset = function (key) {
        if (SpriteDestructor.cached.has(key))
            return SpriteDestructor.cached.get(key);
        throw new TypeError("Key: ".concat(key, " does not defined on SpriteDestructor"));
    };
    SpriteDestructor.prototype.cutOut = function (name, sx, sy, dx, dy) {
        this.Canvas.width = dx;
        this.Canvas.height = dy;
        this.ctx.clearRect(0, 0, dx, dy);
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.sprite, sx, sy, dx, dy, 0, 0, dx, dy);
        this.feedImage(name);
    };
    SpriteDestructor.prototype.feedImage = function (name) {
        var _this = this;
        this.loading.push(new Promise(function (resolve, reject) {
            var img = new Image();
            img.src = _this.Canvas.toDataURL();
            img.addEventListener('load', function () { return resolve({ name: name, img: img }); });
            img.addEventListener('error', function (err) { return reject(err); });
        }));
    };
    SpriteDestructor.cached = new Map();
    return SpriteDestructor;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SpriteDestructor);


/***/ }),

/***/ "./src/lib/stats/index.ts":
/*!********************************!*\
  !*** ./src/lib/stats/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Stats = (function () {
    function Stats(context) {
        this.fps = 0;
        this.timeArray = [];
        this.context = context;
        this.containerOpacity = 0.4;
        this.textProps = {
            position: { x: 0, y: 0 },
            preText: '',
            postText: ''
        };
        this.containerProps = {
            startingPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 0
            }
        };
    }
    Stats.prototype.text = function (pos, preText, postText) {
        this.textProps.position = pos;
        this.textProps.preText = preText;
        this.textProps.postText = postText;
    };
    Stats.prototype.container = function (aPoint, bPoint) {
        this.containerProps = {
            startingPoint: aPoint,
            endPoint: bPoint
        };
    };
    Stats.prototype.mark = function () {
        var now = performance.now();
        while (this.timeArray.length > 0 && this.timeArray[0] <= now - 1000) {
            this.timeArray.shift();
        }
        this.timeArray.push(now);
        this.fps = this.timeArray.length;
        this.drawContainer();
        this.drawText(String(this.fps));
    };
    Stats.prototype.drawContainer = function () {
        var ctx = this.context;
        var _a = this.containerProps, startingPoint = _a.startingPoint, endPoint = _a.endPoint;
        ctx.beginPath();
        ctx.globalAlpha = this.containerOpacity;
        ctx.fillStyle = '#1e1e20';
        ctx.fillRect(startingPoint.x, startingPoint.y, endPoint.x, endPoint.y);
        ctx.fill();
        ctx.closePath();
    };
    Stats.prototype.drawText = function (text) {
        var ctx = this.context;
        var _a = this.textProps, preText = _a.preText, postText = _a.postText, position = _a.position;
        var out = "".concat(preText).concat(text).concat(postText);
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.font = '30px monospace';
        ctx.fillStyle = '#58d130';
        ctx.textAlign = 'left';
        ctx.fillText(out, position.x, position.y);
        ctx.closePath();
    };
    return Stats;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Stats);


/***/ }),

/***/ "./src/lib/storage/index.ts":
/*!**********************************!*\
  !*** ./src/lib/storage/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var Storage = (function () {
    function Storage() {
        var _a;
        if (((_a = Storage.sk) !== null && _a !== void 0 ? _a : []).length < 1)
            Storage.sk = ['brrrrrrrrrrr'];
        Storage.sk = Storage.utoa(Storage.sk[0]);
        Storage.isAvailable = false;
        try {
            if ('localStorage' in window && typeof window.localStorage === 'object') {
                Storage.isAvailable = true;
            }
        }
        catch (err) {
            Storage.isAvailable = false;
        }
    }
    Storage.utoa = function (data) {
        return btoa(encodeURIComponent(data));
    };
    Storage.atou = function (b64) {
        return decodeURIComponent(atob(b64));
    };
    Storage.save = function (key, value) {
        if (!Storage.isAvailable) {
            console.warn('Storage is not available');
            return;
        }
        var mode = typeof value;
        if (typeof value !== 'string') {
            value = String(value);
        }
        window.localStorage.setItem("__".concat(Storage.sk, "_").concat(key, "__"), Storage.utoa(JSON.stringify({ mode: mode, value: value })));
    };
    Storage.get = function (key) {
        if (!Storage.isAvailable) {
            console.warn('Storage is not available');
            return void 0;
        }
        try {
            var read_item = window.localStorage.getItem("__".concat(Storage.sk, "_").concat(key, "__"));
            if (!read_item)
                return void 0;
            var obj = JSON.parse(Storage.atou(read_item));
            var return_value = void 0;
            switch (obj.type) {
                case 'string':
                    return_value = String(obj.value);
                    break;
                case 'number':
                    return_value = Number(obj.value);
                    break;
                case 'boolean':
                    return_value = obj.value === 'true' ? true : false;
                    break;
            }
            return return_value;
        }
        catch (err) {
            console.error('Failed to fetch highscore');
            return void 0;
        }
    };
    Storage.sk = window.location.href
        .toString()
        .match(/([a-zA-Z-]+\.github\.io\/[a-zA-Z\-.]+\/)/i);
    return Storage;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Storage);


/***/ }),

/***/ "./src/lib/web-sfx/index.ts":
/*!**********************************!*\
  !*** ./src/lib/web-sfx/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var WebSfx = (function () {
    function WebSfx(files, callback) {
        WebSfx.audioContext = new (AudioContext || webkitAudioContext)();
        WebSfx.audioContext.addEventListener('statechange', function () {
            WebSfx.isReady = WebSfx.audioContext.state === 'running';
        });
        WebSfx.load(files, callback);
    }
    WebSfx.play = function (key, endedcb) {
        if (typeof WebSfx.Cached[key] === void 0) {
            throw new TypeError("Key ".concat(key, " does not load or not exists."));
        }
        if (WebSfx.gainContext === void 0) {
            console.warn('WebSfx.play cannot execute. AudioContext is not started or resumed');
            return;
        }
        if (!WebSfx.isReady)
            return;
        try {
            var context = WebSfx.audioContext;
            var bufferSource = context.createBufferSource();
            bufferSource.buffer = WebSfx.Cached[key];
            bufferSource.addEventListener('ended', function () { return endedcb === null || endedcb === void 0 ? void 0 : endedcb(); });
            bufferSource.connect(WebSfx.gainContext);
            bufferSource.start();
        }
        catch (err) {
            throw new Error("Failed to play audio: ".concat(key, ". Error: ").concat(err));
        }
    };
    WebSfx.volume = function (num) {
        if (WebSfx.gainContext === void 0) {
            console.warn('WebSfx.volume cannot set volume. AudioContext is not started or resumed');
            return;
        }
        try {
            WebSfx.gainContext.gain.value = num;
        }
        catch (err) { }
    };
    WebSfx.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (WebSfx.isReady && WebSfx.gainContext !== void 0)
                            return [2];
                        return [4, WebSfx.audioContext.resume()];
                    case 1:
                        _a.sent();
                        gain = WebSfx.audioContext.createGain();
                        gain.connect(WebSfx.audioContext.destination);
                        WebSfx.gainContext = gain;
                        return [2];
                }
            });
        });
    };
    WebSfx.load = function (files, complete, level) {
        if (level === void 0) { level = 0; }
        var loading = [];
        var entries = Object.entries(files);
        for (var i = level * WebSfx.concurrentDownload; i < Math.min(entries.length, WebSfx.concurrentDownload); i++) {
            if (!/\.(wav|ogg|mp3)$/i.test(entries[i][1])) {
                throw new TypeError("WebSfx.contructor accepts 'wav|ogg|mp3' type of files");
            }
            loading.push(WebSfx.load_requests(entries[i][0], entries[i][1]));
        }
        Promise.allSettled(loading).then(function (results) {
            results.forEach(function (result) {
                if (result.status === 'fulfilled') {
                    WebSfx.Cached[result.value.name] = result.value.content;
                    WebSfx.Cached[result.value.path] = WebSfx.Cached[result.value.name];
                }
                else {
                }
            });
            if (entries.length > (level + 1) * WebSfx.concurrentDownload) {
                WebSfx.load(files, complete, level + 1);
            }
            else {
                complete(WebSfx.Cached);
            }
        });
    };
    WebSfx.load_requests = function (name, path) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, buffer, content, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4, fetch(path, { method: 'GET', mode: 'no-cors' })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new TypeError("Erro while fetching '".concat(path));
                        return [4, response.arrayBuffer()];
                    case 2:
                        buffer = _a.sent();
                        return [4, WebSfx.audioContext.decodeAudioData(buffer)];
                    case 3:
                        content = _a.sent();
                        resolve({ content: content, path: path, name: name });
                        return [3, 5];
                    case 4:
                        err_1 = _a.sent();
                        reject();
                        return [3, 5];
                    case 5: return [2];
                }
            });
        }); });
    };
    WebSfx.Cached = {};
    WebSfx.concurrentDownload = 5;
    WebSfx.isReady = false;
    return WebSfx;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WebSfx);


/***/ }),

/***/ "./src/lib/workbox-work-offline/index.ts":
/*!***********************************************!*\
  !*** ./src/lib/workbox-work-offline/index.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker
                .register('./service-worker.js')
                .then(function () {
                console.log('SW registered');
            })
                .catch(function () {
                console.log('SW registration failed');
            });
        });
    }
});


/***/ }),

/***/ "./src/model/background.ts":
/*!*********************************!*\
  !*** ./src/model/background.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _scene_generator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scene-generator */ "./src/model/scene-generator.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();





var Background = (function (_super) {
    __extends(Background, _super);
    function Background() {
        var _this = _super.call(this) || this;
        _this.images = new Map();
        _this.theme = 'day';
        _this.velocity.x = _constants__WEBPACK_IMPORTED_MODULE_0__.BG_SPEED;
        _this.backgroundSize = {
            width: 0,
            height: 0
        };
        return _this;
    }
    Background.prototype.init = function () {
        this.images.set('day', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('theme-day'));
        this.images.set('night', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('theme-night'));
        Object.assign(_scene_generator__WEBPACK_IMPORTED_MODULE_4__["default"].bgThemeList, ['day', 'night']);
        this.use(_scene_generator__WEBPACK_IMPORTED_MODULE_4__["default"].background);
    };
    Background.prototype.reset = function () {
        this.coordinate = { x: 0, y: 0 };
        this.resize(this.canvasSize);
        this.use(_scene_generator__WEBPACK_IMPORTED_MODULE_4__["default"].background);
    };
    Background.prototype.use = function (select) {
        this.theme = select;
    };
    Background.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.backgroundSize = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)({
            width: this.images.get(this.theme).width,
            height: this.images.get(this.theme).height
        }, { height: height });
    };
    Background.prototype.Update = function () {
        this.coordinate.x += this.canvasSize.width * this.velocity.x;
        this.coordinate.y += this.velocity.y;
    };
    Background.prototype.Display = function (context) {
        var _a = this.backgroundSize, width = _a.width, height = _a.height;
        var _b = this.coordinate, x = _b.x, y = _b.y;
        var sequence = Math.ceil(this.canvasSize.width / width) + 1;
        var offset = x % width;
        for (var i = 0; i < sequence; i++) {
            context.drawImage(this.images.get(this.theme), i * (width - i) - offset, y, width, height);
        }
    };
    return Background;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Background);


/***/ }),

/***/ "./src/model/banner-instruction.ts":
/*!*****************************************!*\
  !*** ./src/model/banner-instruction.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _lib_animation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/animation */ "./src/lib/animation/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var BANNER_INSTRUCTION = {
    fadeOutDuration: 1,
    positions: {
        instructImage: {
            x: 0.5,
            y: 0.515
        },
        getReadyImage: {
            x: 0.5,
            y: 0.328
        }
    }
};
var BannerInstruction = (function (_super) {
    __extends(BannerInstruction, _super);
    function BannerInstruction() {
        var _this = _super.call(this) || this;
        _this.instructImage = {
            size: 0.4,
            position: {
                x: 0,
                y: 0
            },
            image: void 0,
            scaled: {
                width: 0,
                height: 0
            }
        };
        _this.getReadyImage = {
            size: 0.65,
            position: {
                x: 0,
                y: 0
            },
            image: void 0,
            scaled: {
                width: 0,
                height: 0
            }
        };
        _this.fadeOut = new _lib_animation__WEBPACK_IMPORTED_MODULE_1__.FadeOut({
            transition: 'linear'
        });
        _this.opacity = 1;
        _this.isComplete = false;
        _this.doesTap = false;
        return _this;
    }
    BannerInstruction.prototype.init = function () {
        this.instructImage.image = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('banner-instruction');
        this.getReadyImage.image = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('banner-game-ready');
    };
    BannerInstruction.prototype.reset = function () {
        this.opacity = 1;
        this.isComplete = false;
        this.doesTap = false;
    };
    BannerInstruction.prototype.tap = function () {
        if (this.isComplete)
            return;
        this.fadeOut.start();
        this.isComplete = true;
        this.doesTap = true;
    };
    BannerInstruction.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.instructImage.scaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.instructImage.image.width,
            height: this.instructImage.image.height
        }, { width: width * this.instructImage.size });
        this.getReadyImage.scaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.getReadyImage.image.width,
            height: this.getReadyImage.image.height
        }, { width: width * this.getReadyImage.size });
        var instructImagePos = BANNER_INSTRUCTION.positions.instructImage;
        var getReadyImagePos = BANNER_INSTRUCTION.positions.getReadyImage;
        this.instructImage.position.x =
            width * instructImagePos.x - this.instructImage.scaled.width / 2;
        this.instructImage.position.y =
            height * instructImagePos.y - this.instructImage.scaled.height / 2;
        this.getReadyImage.position.x =
            width * getReadyImagePos.x - this.getReadyImage.scaled.width / 2;
        this.getReadyImage.position.y =
            height * getReadyImagePos.y - this.getReadyImage.scaled.height / 2;
    };
    BannerInstruction.prototype.Update = function () {
        if (!this.doesTap) {
            this.opacity = 1;
            return;
        }
        this.opacity = this.fadeOut.value;
    };
    BannerInstruction.prototype.Display = function (context) {
        if (this.opacity <= 0)
            return;
        context.globalAlpha = this.opacity;
        context.drawImage(this.getReadyImage.image, this.getReadyImage.position.x, this.getReadyImage.position.y, this.getReadyImage.scaled.width, this.getReadyImage.scaled.height);
        context.drawImage(this.instructImage.image, this.instructImage.position.x, this.instructImage.position.y, this.instructImage.scaled.width, this.instructImage.scaled.height);
        context.globalAlpha = 1;
    };
    return BannerInstruction;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BannerInstruction);


/***/ }),

/***/ "./src/model/bird.ts":
/*!***************************!*\
  !*** ./src/model/bird.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _pipe__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pipe */ "./src/model/pipe.ts");
/* harmony import */ var _sfx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sfx */ "./src/model/sfx.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _scene_generator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./scene-generator */ "./src/model/scene-generator.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();







var Bird = (function (_super) {
    __extends(Bird, _super);
    function Bird() {
        var _this = _super.call(this) || this;
        _this.color = 'yellow';
        _this.images = new Map();
        _this.force = 0;
        _this.scaled = {
            width: 0,
            height: 0
        };
        _this.max_fall_velocity = 0;
        _this.max_lift_velocity = 0;
        _this.score = 0;
        _this.rotation = 0;
        _this.causeOfDeath = 0;
        _this.flags = 1;
        _this.lastCoord = 0;
        _this.wingState = 1;
        return _this;
    }
    Bird.prototype.init = function () {
        this.images.set('yellow.0', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-yellow-up'));
        this.images.set('yellow.1', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-yellow-mid'));
        this.images.set('yellow.2', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-yellow-down'));
        this.images.set('blue.0', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-blue-up'));
        this.images.set('blue.1', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-blue-mid'));
        this.images.set('blue.2', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-blue-down'));
        this.images.set('red.0', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-red-up'));
        this.images.set('red.1', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-red-mid'));
        this.images.set('red.2', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_5__["default"].asset('bird-red-down'));
        Object.assign(_scene_generator__WEBPACK_IMPORTED_MODULE_6__["default"].birdColorList, ['yellow', 'red', 'blue']);
        this.use(_scene_generator__WEBPACK_IMPORTED_MODULE_6__["default"].bird);
    };
    Bird.prototype.variableReset = function () {
        this.score = 0;
        this.rotation = 0;
        this.causeOfDeath = 0;
        this.flags = 1;
        this.lastCoord = 0;
        this.wingState = 1;
    };
    Bird.prototype.reset = function () {
        this.variableReset();
        this.resize(this.canvasSize);
        this.use(_scene_generator__WEBPACK_IMPORTED_MODULE_6__["default"].bird);
    };
    Object.defineProperty(Bird.prototype, "alive", {
        get: function () {
            return (this.flags & Bird.FLAG_IS_ALIVE) !== 0;
        },
        enumerable: false,
        configurable: true
    });
    Bird.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.coordinate.y = Bird.platformHeight * 0.5;
        this.coordinate.x = width * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_X_POSITION;
        this.force = height * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_JUMP_HEIGHT;
        this.scaled = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)(_constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_INITIAL_DIMENSION, {
            height: height * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_HEIGHT
        });
        this.max_fall_velocity = this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MAX_DOWN_VELOCITY;
        this.max_lift_velocity = this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MAX_UP_VELOCITY;
    };
    Bird.prototype.doWave = function (_a, frequency, amplitude) {
        var x = _a.x, y = _a.y;
        this.flapWing(3);
        y += (0,_utils__WEBPACK_IMPORTED_MODULE_1__.sine)(frequency, amplitude);
        this.coordinate = { x: x, y: y };
    };
    Bird.prototype.flapWing = function (speed) {
        this.wingState = (1 + (0,_utils__WEBPACK_IMPORTED_MODULE_1__.sine)(speed, 2)) | 0;
        if (this.rotation > 70) {
            this.wingState = 1;
        }
    };
    Bird.prototype.flap = function () {
        if (this.coordinate.y < 0 || (this.flags & Bird.FLAG_IS_ALIVE) === 0) {
            return;
        }
        _sfx__WEBPACK_IMPORTED_MODULE_4__["default"].wing();
        this.velocity.y = this.force;
        this.lastCoord = this.coordinate.y;
    };
    Bird.prototype.doesHitTheFloor = function () {
        return (this.coordinate.y + this.rotatedDimension().height >
            Math.abs(this.canvasSize.height - Bird.platformHeight));
    };
    Bird.prototype.isDead = function (pipes) {
        if (this.doesHitTheFloor()) {
            this.flags &= ~Bird.FLAG_IS_ALIVE;
            this.causeOfDeath = 1;
            return (this.flags & Bird.FLAG_IS_ALIVE) === 0;
        }
        var newDim = this.rotatedDimension();
        var boundary = newDim.width - newDim.height / 2;
        for (var _i = 0, pipes_1 = pipes; _i < pipes_1.length; _i++) {
            var pipe = pipes_1[_i];
            try {
                var hcx = pipe.coordinate.x;
                var hcy = pipe.coordinate.y;
                var radius = pipe.hollSize / 2;
                var width = _pipe__WEBPACK_IMPORTED_MODULE_3__["default"].pipeSize.width / 2;
                if (hcx + width < this.coordinate.x - boundary)
                    continue;
                if (Math.abs(hcx - width) <= this.coordinate.x + boundary) {
                    if (hcx < this.coordinate.x && !pipe.isPassed) {
                        this.score++;
                        _sfx__WEBPACK_IMPORTED_MODULE_4__["default"].point();
                        pipe.isPassed = true;
                    }
                    if (Math.abs(hcy - radius) >= this.coordinate.y - newDim.height ||
                        hcy + radius <= this.coordinate.y + newDim.height) {
                        this.flags &= ~Bird.FLAG_IS_ALIVE;
                        this.causeOfDeath = 2;
                        break;
                    }
                }
                break;
            }
            catch (err) { }
        }
        return (this.flags & Bird.FLAG_IS_ALIVE) === 0;
    };
    Bird.prototype.rotatedDimension = function () {
        var rad = (this.rotation * Math.PI) / 180;
        var w = this.scaled.width / 2;
        var h = this.scaled.height / 2;
        var sTheta = Math.sin(rad);
        var cTheta = Math.cos(rad);
        return {
            width: 2 * Math.sqrt(Math.pow(w * cTheta, 2) + Math.pow(h * sTheta, 2)),
            height: 2 * Math.sqrt(Math.pow(w * sTheta, 2) + Math.pow(h * cTheta, 2))
        };
    };
    Bird.prototype.playDead = function () {
        if ((this.flags & Bird.FLAG_DIED) !== 0)
            return;
        this.flags |= Bird.FLAG_DIED;
        if (this.causeOfDeath === 2)
            _sfx__WEBPACK_IMPORTED_MODULE_4__["default"].die();
    };
    Bird.prototype.use = function (color) {
        this.color = color;
    };
    Bird.prototype.handleRotation = function () {
        this.rotation += this.coordinate.y < this.lastCoord ? -7.2 : 6.5;
        this.rotation = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.clamp)(_constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MIN_ROTATION, _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MAX_ROTATION, this.rotation);
        if ((this.flags & Bird.FLAG_IS_ALIVE) === 0) {
            this.wingState = 1;
            return;
        }
        var birdMinRot = Math.abs(_constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MIN_ROTATION);
        var f = 4 + ((this.rotation + birdMinRot) / (birdMinRot + _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_MAX_ROTATION)) * 3.2;
        this.flapWing((0,_utils__WEBPACK_IMPORTED_MODULE_1__.flipRange)(4, 8.2, f));
    };
    Bird.prototype.Update = function () {
        if (this.doesHitTheFloor() || (this.flags & Bird.FLAG_DOES_LANDED) !== 0) {
            this.flags |= Bird.FLAG_DOES_LANDED;
            this.coordinate.y =
                this.canvasSize.height - Bird.platformHeight - this.rotatedDimension().height;
            this.handleRotation();
            return;
        }
        this.coordinate.y += (0,_utils__WEBPACK_IMPORTED_MODULE_1__.clamp)(this.max_lift_velocity, this.max_fall_velocity, this.velocity.y);
        this.velocity.y += this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.BIRD_WEIGHT;
        this.handleRotation();
    };
    Bird.prototype.Display = function (context) {
        var birdKeyString = "".concat(this.color, ".").concat(this.wingState);
        context.save();
        context.translate(this.coordinate.x, this.coordinate.y);
        context.rotate((this.rotation * Math.PI) / 180);
        context.drawImage(this.images.get(birdKeyString), -this.scaled.width, -this.scaled.height, this.scaled.width * 2, this.scaled.height * 2);
        context.restore();
    };
    Bird.FLAG_IS_ALIVE = 1;
    Bird.FLAG_DIED = 2;
    Bird.FLAG_DOES_LANDED = 4;
    Bird.platformHeight = 0;
    return Bird;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Bird);


/***/ }),

/***/ "./src/model/btn-play.ts":
/*!*******************************!*\
  !*** ./src/model/btn-play.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstracts_button_event_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/button-event-handler */ "./src/abstracts/button-event-handler.ts");
/* harmony import */ var _sfx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sfx */ "./src/model/sfx.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var PlayButton = (function (_super) {
    __extends(PlayButton, _super);
    function PlayButton() {
        var _this = _super.call(this) || this;
        _this.initialWidth = 0.38;
        _this.coordinate = {
            x: 0.259,
            y: 0.6998
        };
        _this.active = true;
        return _this;
    }
    PlayButton.prototype.click = function () {
        var _a;
        _sfx__WEBPACK_IMPORTED_MODULE_1__["default"].swoosh();
        (_a = this.callback) === null || _a === void 0 ? void 0 : _a.call(this);
    };
    PlayButton.prototype.onClick = function (callback) {
        this.callback = callback;
    };
    PlayButton.prototype.init = function () {
        this.img = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__["default"].asset('btn-play');
    };
    PlayButton.prototype.Update = function () {
        this.reset();
        if (this.isHovered) {
            this.move({
                x: 0,
                y: 0.004
            });
        }
        _super.prototype.Update.call(this);
    };
    PlayButton.prototype.Display = function (context) {
        var xLoc = this.calcCoord.x;
        var yLoc = this.calcCoord.y;
        var xRad = this.dimension.width / 2;
        var yRad = this.dimension.height / 2;
        context.drawImage(this.img, xLoc - xRad, yLoc - yRad, xRad * 2, yRad * 2);
    };
    return PlayButton;
}(_abstracts_button_event_handler__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PlayButton);


/***/ }),

/***/ "./src/model/btn-ranking.ts":
/*!**********************************!*\
  !*** ./src/model/btn-ranking.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _btn_play__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./btn-play */ "./src/model/btn-play.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var RankingButton = (function (_super) {
    __extends(RankingButton, _super);
    function RankingButton() {
        var _this = _super.call(this) || this;
        _this.coordinate.x = 0.741;
        return _this;
    }
    RankingButton.prototype.init = function () {
        this.img = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__["default"].asset('btn-ranking');
    };
    return RankingButton;
}(_btn_play__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RankingButton);


/***/ }),

/***/ "./src/model/btn-rate.ts":
/*!*******************************!*\
  !*** ./src/model/btn-rate.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _btn_play__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./btn-play */ "./src/model/btn-play.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var RateNutton = (function (_super) {
    __extends(RateNutton, _super);
    function RateNutton() {
        var _this = _super.call(this) || this;
        _this.initialWidth = 0.24;
        _this.coordinate.x = 0.5;
        _this.coordinate.y = 0.53;
        return _this;
    }
    RateNutton.prototype.init = function () {
        this.img = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__["default"].asset('btn-rate');
    };
    RateNutton.prototype.click = function () {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__.openInNewTab)('https://github.com/jxmked/Flappybird');
    };
    return RateNutton;
}(_btn_play__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (RateNutton);


/***/ }),

/***/ "./src/model/btn-toggle-speaker.ts":
/*!*****************************************!*\
  !*** ./src/model/btn-toggle-speaker.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstracts_button_event_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/button-event-handler */ "./src/abstracts/button-event-handler.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _sfx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sfx */ "./src/model/sfx.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var ToggleSpeakerBtn = (function (_super) {
    __extends(ToggleSpeakerBtn, _super);
    function ToggleSpeakerBtn() {
        var _this = _super.call(this) || this;
        _this.initialWidth = 0.1;
        _this.assets = new Map();
        _this.is_mute = false;
        _this.coordinate.x = 0.93;
        _this.coordinate.y = 0.04;
        _this.active = true;
        return _this;
    }
    ToggleSpeakerBtn.prototype.click = function () {
        _sfx__WEBPACK_IMPORTED_MODULE_2__["default"].swoosh();
        this.is_mute = !this.is_mute;
        _sfx__WEBPACK_IMPORTED_MODULE_2__["default"].currentVolume = this.is_mute ? 0 : 1;
    };
    ToggleSpeakerBtn.prototype.setImg = function () {
        var key = "".concat(this.is_mute ? 'mute' : 'unmute');
        this.img = this.assets.get(key);
    };
    ToggleSpeakerBtn.prototype.init = function () {
        this.assets.set('mute', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__["default"].asset('btn-mute'));
        this.assets.set('unmute', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_1__["default"].asset('btn-speaker'));
        this.setImg();
    };
    ToggleSpeakerBtn.prototype.Update = function () {
        this.reset();
        if (this.isHovered) {
            this.move({
                x: 0,
                y: 0.004
            });
        }
        this.setImg();
        _super.prototype.Update.call(this);
    };
    ToggleSpeakerBtn.prototype.Display = function (ctx) {
        var xLoc = this.calcCoord.x;
        var yLoc = this.calcCoord.y;
        var xRad = this.dimension.width / 2;
        var yRad = this.dimension.height / 2;
        ctx.drawImage(this.img, xLoc - xRad, yLoc - yRad, xRad * 2, yRad * 2);
    };
    return ToggleSpeakerBtn;
}(_abstracts_button_event_handler__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ToggleSpeakerBtn);


/***/ }),

/***/ "./src/model/count.ts":
/*!****************************!*\
  !*** ./src/model/count.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var Count = (function (_super) {
    __extends(Count, _super);
    function Count() {
        var _this = _super.call(this) || this;
        _this.currentValue = 0;
        _this.numberAsset = {};
        _this.numberDimension = {
            width: 0,
            height: 0
        };
        return _this;
    }
    Count.prototype.init = function () {
        this.setInitAsset(0, 'number-lg-0');
        this.setInitAsset(1, 'number-lg-1');
        this.setInitAsset(2, 'number-lg-2');
        this.setInitAsset(3, 'number-lg-3');
        this.setInitAsset(4, 'number-lg-4');
        this.setInitAsset(5, 'number-lg-5');
        this.setInitAsset(6, 'number-lg-6');
        this.setInitAsset(7, 'number-lg-7');
        this.setInitAsset(8, 'number-lg-8');
        this.setInitAsset(9, 'number-lg-9');
    };
    Count.prototype.setInitAsset = function (num, loc) {
        this.numberAsset[String(num)] = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset(loc);
    };
    Count.prototype.setNum = function (value) {
        this.currentValue = value;
    };
    Count.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.numberDimension = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)(_constants__WEBPACK_IMPORTED_MODULE_0__.COUNT_DIMENSION, {
            height: height * 0.065
        });
        this.coordinate.x = this.canvasSize.width * _constants__WEBPACK_IMPORTED_MODULE_0__.COUNT_COORDINATE.x;
        this.coordinate.y = this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.COUNT_COORDINATE.y;
    };
    Count.prototype.Update = function () { };
    Count.prototype.Display = function (context) {
        var _this = this;
        var numArr = String(this.currentValue).split('');
        var totalWidth = numArr.length * this.numberDimension.width;
        var lastWidth = this.coordinate.x - totalWidth / 2;
        var topPos = this.coordinate.y - this.numberDimension.height / 2;
        numArr.forEach(function (numString) {
            context.drawImage(_this.numberAsset[numString], lastWidth, topPos, _this.numberDimension.width, _this.numberDimension.height);
            lastWidth += _this.numberDimension.width;
        });
    };
    return Count;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Count);


/***/ }),

/***/ "./src/model/flash-screen.ts":
/*!***********************************!*\
  !*** ./src/model/flash-screen.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_animation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/animation */ "./src/lib/animation/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


var FlashScreen = (function (_super) {
    __extends(FlashScreen, _super);
    function FlashScreen(_a) {
        var style = _a.style, strong = _a.strong, interval = _a.interval, easing = _a.easing;
        var _this = _super.call(this) || this;
        _this.strong = strong;
        _this.style = style;
        _this.events = [];
        _this.fadeEvent = new _lib_animation__WEBPACK_IMPORTED_MODULE_1__.FadeOut({
            duration: interval,
            transition: easing
        });
        _this.value = 0;
        return _this;
    }
    FlashScreen.prototype.init = function () { };
    FlashScreen.prototype.reset = function () {
        this.fadeEvent.reset();
        for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
            var evt = _a[_i];
            evt.isCalled = false;
        }
    };
    FlashScreen.prototype.start = function () {
        this.fadeEvent.start();
    };
    FlashScreen.prototype.setEvent = function (range, callback) {
        this.events.push({
            range: {
                min: range[0],
                max: range[1]
            },
            callback: callback,
            isCalled: false
        });
    };
    Object.defineProperty(FlashScreen.prototype, "status", {
        get: function () {
            return __assign(__assign({}, this.fadeEvent.status), { value: this.value });
        },
        enumerable: false,
        configurable: true
    });
    FlashScreen.prototype.Update = function () {
        if (!this.status.complete || this.status.running) {
            this.value = this.fadeEvent.value;
            for (var _i = 0, _a = this.events; _i < _a.length; _i++) {
                var evt = _a[_i];
                if (evt.isCalled)
                    continue;
                if (evt.range.min <= this.value && evt.range.max >= this.value) {
                    evt.callback();
                    evt.isCalled = true;
                }
            }
        }
        else {
            this.value = 0;
        }
    };
    FlashScreen.prototype.Display = function (context) {
        context.globalAlpha = this.strong * this.value;
        context.fillStyle = this.style;
        context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);
        context.fill();
        context.globalAlpha = 1;
    };
    return FlashScreen;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FlashScreen);


/***/ }),

/***/ "./src/model/pipe-generator.ts":
/*!*************************************!*\
  !*** ./src/model/pipe-generator.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _pipe__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pipe */ "./src/model/pipe.ts");
/* harmony import */ var _scene_generator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scene-generator */ "./src/model/scene-generator.ts");




var PipeGenerator = (function () {
    function PipeGenerator() {
        this.range = { max: 0, min: 0 };
        this.width = 0;
        this.pipes = [];
        this.distance = 0;
        this.initialXPos = 0;
        this.canvasSize = {
            width: 0,
            height: 0
        };
        this.pipeColor = 'green';
    }
    PipeGenerator.prototype.reset = function () {
        this.pipes.splice(0, this.pipes.length);
        this.resize({
            max: this.range.max,
            width: this.canvasSize.width,
            height: this.canvasSize.height
        });
        this.pipeColor = _scene_generator__WEBPACK_IMPORTED_MODULE_3__["default"].pipe;
    };
    PipeGenerator.prototype.resize = function (_a) {
        var max = _a.max, width = _a.width, height = _a.height;
        this.range = { max: max, min: height * _constants__WEBPACK_IMPORTED_MODULE_0__.PIPE_MIN_GAP };
        this.distance = width * _constants__WEBPACK_IMPORTED_MODULE_0__.PIPE_DISTANCE;
        this.width = width;
        this.canvasSize = { width: width, height: height };
        for (var _i = 0, _b = this.pipes; _i < _b.length; _i++) {
            var pipe = _b[_i];
            pipe.resize(this.canvasSize);
        }
    };
    PipeGenerator.prototype.needPipe = function () {
        var pipeLen = this.pipes.length;
        if (pipeLen === 0) {
            this.initialXPos = (this.width + _pipe__WEBPACK_IMPORTED_MODULE_2__["default"].pipeSize.width) * 2;
            return true;
        }
        if (this.distance <= this.width - this.pipes[pipeLen - 1].coordinate.x) {
            this.initialXPos = this.width + _pipe__WEBPACK_IMPORTED_MODULE_2__["default"].pipeSize.width;
            return true;
        }
        return false;
    };
    PipeGenerator.prototype.generate = function () {
        return {
            position: {
                x: this.initialXPos,
                y: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.randomClamp)(this.range.min, this.range.max - this.range.min)
            }
        };
    };
    PipeGenerator.prototype.Update = function () {
        if (this.needPipe()) {
            var pipe = new _pipe__WEBPACK_IMPORTED_MODULE_2__["default"]();
            pipe.init();
            pipe.use(this.pipeColor);
            pipe.resize(this.canvasSize);
            pipe.setHollPosition(this.generate().position);
            this.pipes.push(pipe);
        }
        for (var index = 0; index < this.pipes.length; index++) {
            this.pipes[index].Update();
            if (this.pipes[index].isOut()) {
                this.pipes.splice(index, 1);
                index--;
            }
        }
    };
    return PipeGenerator;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PipeGenerator);


/***/ }),

/***/ "./src/model/pipe.ts":
/*!***************************!*\
  !*** ./src/model/pipe.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _scene_generator__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scene-generator */ "./src/model/scene-generator.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();





var Pipe = (function (_super) {
    __extends(Pipe, _super);
    function Pipe() {
        var _this = _super.call(this) || this;
        _this.images = new Map();
        _this.color = 'green';
        _this.hollSize = 0;
        _this.pipePosition = {
            top: { x: 0, y: 0 },
            bottom: { x: 0, y: 0 }
        };
        _this.isPassed = false;
        _this.velocity.x = _constants__WEBPACK_IMPORTED_MODULE_0__.GAME_SPEED;
        _this.scaled = {
            top: { width: 0, height: 0 },
            bottom: { width: 0, height: 0 }
        };
        return _this;
    }
    Pipe.prototype.init = function () {
        this.images.set('green.top', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('pipe-green-top'));
        this.images.set('green.bottom', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('pipe-green-bottom'));
        this.images.set('red.top', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('pipe-red-top'));
        this.images.set('red.bottom', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('pipe-red-bottom'));
        Object.assign(_scene_generator__WEBPACK_IMPORTED_MODULE_4__["default"].pipeColorList, ['red', 'green']);
    };
    Pipe.prototype.setHollPosition = function (coordinate) {
        this.hollSize = this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.PIPE_HOLL_SIZE;
        this.coordinate = coordinate;
    };
    Pipe.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        var oldX = (this.coordinate.x / this.canvasSize.width) * 100;
        var oldY = (this.coordinate.y / this.canvasSize.height) * 100;
        _super.prototype.resize.call(this, { width: width, height: height });
        var min = this.canvasSize.width * 0.18;
        Pipe.pipeSize = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)(_constants__WEBPACK_IMPORTED_MODULE_0__.PIPE_INITIAL_DIMENSION, { width: min });
        this.hollSize = this.canvasSize.height * _constants__WEBPACK_IMPORTED_MODULE_0__.PIPE_HOLL_SIZE;
        this.coordinate.x = width * (oldX / 100);
        this.coordinate.y = height * (oldY / 100);
        this.velocity.x = width * _constants__WEBPACK_IMPORTED_MODULE_0__.GAME_SPEED;
        this.scaled.top = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)({
            width: this.images.get("".concat(this.color, ".top")).width,
            height: this.images.get("".concat(this.color, ".top")).height
        }, { width: min });
        this.scaled.bottom = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)({
            width: this.images.get("".concat(this.color, ".bottom")).width,
            height: this.images.get("".concat(this.color, ".bottom")).height
        }, { width: min });
    };
    Pipe.prototype.isOut = function () {
        return this.coordinate.x + Pipe.pipeSize.width < 0;
    };
    Pipe.prototype.use = function (select) {
        this.color = select;
    };
    Pipe.prototype.Update = function () {
        this.coordinate.x -= this.velocity.x;
    };
    Pipe.prototype.Display = function (context) {
        var width = Pipe.pipeSize.width / 2;
        var posX = this.coordinate.x;
        var posY = this.coordinate.y;
        var radius = this.hollSize / 2;
        context.drawImage(this.images.get("".concat(this.color, ".top")), posX - width, -(this.scaled.top.height - Math.abs(posY - radius)), this.scaled.top.width, this.scaled.top.height);
        context.drawImage(this.images.get("".concat(this.color, ".bottom")), posX - width, posY + radius, this.scaled.bottom.width, this.scaled.bottom.height);
    };
    Pipe.pipeSize = {
        width: 0,
        height: 0
    };
    return Pipe;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Pipe);


/***/ }),

/***/ "./src/model/platform.ts":
/*!*******************************!*\
  !*** ./src/model/platform.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var Platform = (function (_super) {
    __extends(Platform, _super);
    function Platform() {
        var _this = _super.call(this) || this;
        _this.velocity.x = _constants__WEBPACK_IMPORTED_MODULE_1__.GAME_SPEED;
        _this.platformSize = {
            width: 0,
            height: 0
        };
        _this.img = void 0;
        return _this;
    }
    Platform.prototype.init = function () {
        this.img = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_3__["default"].asset('platform');
    };
    Platform.prototype.reset = function () {
        this.coordinate = { x: 0, y: 0 };
        this.resize(this.canvasSize);
    };
    Platform.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.platformSize = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.img.width,
            height: this.img.height
        }, { height: height / 4 });
        this.coordinate.y = height - this.platformSize.height;
    };
    Platform.prototype.Update = function () {
        this.coordinate.x += this.canvasSize.width * this.velocity.x;
        this.coordinate.y += this.velocity.y;
    };
    Platform.prototype.Display = function (context) {
        var _a = this.platformSize, width = _a.width, height = _a.height;
        var _b = this.coordinate, x = _b.x, y = _b.y;
        var sequence = Math.ceil(this.canvasSize.width / width) + 1;
        var offset = x % width;
        for (var i = 0; i < sequence; i++) {
            context.drawImage(this.img, i * (width - i) - offset, y, width, height);
        }
    };
    return Platform;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Platform);


/***/ }),

/***/ "./src/model/scene-generator.ts":
/*!**************************************!*\
  !*** ./src/model/scene-generator.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");

var SceneGenerator = (function () {
    function SceneGenerator() {
    }
    Object.defineProperty(SceneGenerator, "background", {
        get: function () {
            if (SceneGenerator.bgThemeList.length < 1)
                throw new Error('No theme available');
            var t = SceneGenerator.bgThemeList[(0,_utils__WEBPACK_IMPORTED_MODULE_0__.randomClamp)(0, SceneGenerator.bgThemeList.length)];
            SceneGenerator.isNight = t === 'night';
            return t;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneGenerator, "bird", {
        get: function () {
            if (SceneGenerator.birdColorList.length < 1)
                throw new Error('No available bird color');
            return SceneGenerator.birdColorList[(0,_utils__WEBPACK_IMPORTED_MODULE_0__.randomClamp)(0, SceneGenerator.birdColorList.length)];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SceneGenerator, "pipe", {
        get: function () {
            if (SceneGenerator.pipeColorList.length < 1)
                throw new Error('No available pipe color');
            if (SceneGenerator.isNight) {
                return SceneGenerator.pipeColorList[(0,_utils__WEBPACK_IMPORTED_MODULE_0__.randomClamp)(0, SceneGenerator.pipeColorList.length)];
            }
            return 'green';
        },
        enumerable: false,
        configurable: true
    });
    SceneGenerator.birdColorList = [];
    SceneGenerator.bgThemeList = [];
    SceneGenerator.pipeColorList = [];
    SceneGenerator.isNight = false;
    return SceneGenerator;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SceneGenerator);


/***/ }),

/***/ "./src/model/score-board.ts":
/*!**********************************!*\
  !*** ./src/model/score-board.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _spark__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spark */ "./src/model/spark.ts");
/* harmony import */ var _btn_play__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./btn-play */ "./src/model/btn-play.ts");
/* harmony import */ var _btn_ranking__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./btn-ranking */ "./src/model/btn-ranking.ts");
/* harmony import */ var _btn_toggle_speaker__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./btn-toggle-speaker */ "./src/model/btn-toggle-speaker.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _lib_animation__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/animation */ "./src/lib/animation/index.ts");
/* harmony import */ var _lib_storage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../lib/storage */ "./src/lib/storage/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();









var ScoreBoard = (function (_super) {
    __extends(ScoreBoard, _super);
    function ScoreBoard() {
        var _this = _super.call(this) || this;
        _this.flags = 0;
        _this.images = new Map();
        _this.playButton = new _btn_play__WEBPACK_IMPORTED_MODULE_3__["default"]();
        _this.rankingButton = new _btn_ranking__WEBPACK_IMPORTED_MODULE_4__["default"]();
        _this.toggleSpeakerButton = new _btn_toggle_speaker__WEBPACK_IMPORTED_MODULE_5__["default"]();
        _this.spark = new _spark__WEBPACK_IMPORTED_MODULE_2__["default"]();
        _this.currentHighScore = 0;
        _this.currentGeneratedNumber = 0;
        _this.currentScore = 0;
        _this.FlyInAnim = new _lib_animation__WEBPACK_IMPORTED_MODULE_7__.Fly({
            duration: 500,
            from: {
                x: 0.5,
                y: 1.5
            },
            to: {
                x: 0.5,
                y: 0.438
            },
            transition: 'easeOutExpo'
        });
        _this.TimingEventAnim = new _lib_animation__WEBPACK_IMPORTED_MODULE_7__.TimingEvent({ diff: 30 });
        _this.BounceInAnim = new _lib_animation__WEBPACK_IMPORTED_MODULE_7__.BounceIn({
            durations: {
                bounce: 300,
                fading: 100
            }
        });
        return _this;
    }
    ScoreBoard.prototype.init = function () {
        this.images.set('banner-gameover', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('banner-game-over'));
        this.images.set('score-board', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('score-board'));
        this.images.set('coin-10', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('coin-dull-bronze'));
        this.images.set('coin-20', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('coin-dull-metal'));
        this.images.set('coin-30', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('coin-shine-gold'));
        this.images.set('coin-40', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('coin-shine-silver'));
        this.images.set('new-icon', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset('toast-new'));
        for (var i = 0; i < 10; ++i) {
            this.images.set("number-".concat(i), _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_6__["default"].asset("number-md-".concat(i)));
        }
        this.rankingButton.init();
        this.playButton.init();
        this.toggleSpeakerButton.init();
        this.playButton.active = false;
        this.rankingButton.active = false;
        this.toggleSpeakerButton.active = false;
        this.spark.init();
        var prevScore = _lib_storage__WEBPACK_IMPORTED_MODULE_8__["default"].get('highscore');
        this.currentHighScore = typeof prevScore === 'number' ? prevScore : 0;
    };
    ScoreBoard.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.rankingButton.resize(this.canvasSize);
        this.playButton.resize(this.canvasSize);
        this.spark.resize(this.canvasSize);
        this.toggleSpeakerButton.resize(this.canvasSize);
    };
    ScoreBoard.prototype.Update = function () {
        this.rankingButton.Update();
        this.playButton.Update();
        this.spark.Update();
        this.toggleSpeakerButton.Update();
    };
    ScoreBoard.prototype.Display = function (context) {
        if ((this.flags & ScoreBoard.FLAG_SHOW_BANNER) !== 0) {
            var bgoScaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
                width: this.images.get('banner-gameover').width,
                height: this.images.get('banner-gameover').height
            }, { width: this.canvasSize.width * 0.7 });
            var anim = this.BounceInAnim.value;
            var yPos = this.canvasSize.height * 0.225 - bgoScaled.height / 2;
            context.globalAlpha = anim.opacity;
            context.drawImage(this.images.get('banner-gameover'), this.canvasSize.width * 0.5 - bgoScaled.width / 2, yPos + anim.value * (this.canvasSize.height * 0.015), bgoScaled.width, bgoScaled.height);
            context.globalAlpha = 1;
        }
        if ((this.flags & ScoreBoard.FLAG_SHOW_SCOREBOARD) !== 0) {
            var sbScaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
                width: this.images.get('score-board').width,
                height: this.images.get('score-board').height
            }, { width: this.canvasSize.width * 0.85 });
            var anim = Object.assign({}, this.FlyInAnim.value);
            anim.x = this.canvasSize.width * anim.x - sbScaled.width / 2;
            anim.y = this.canvasSize.height * anim.y - sbScaled.height / 2;
            context.drawImage(this.images.get('score-board'), anim.x, anim.y, sbScaled.width, sbScaled.height);
            if (this.TimingEventAnim.value && this.currentScore > this.currentGeneratedNumber) {
                this.currentGeneratedNumber++;
            }
            if (this.TimingEventAnim.status.complete && !this.TimingEventAnim.status.running) {
                if (this.currentGeneratedNumber > this.currentHighScore) {
                    this.setHighScore(this.currentGeneratedNumber);
                    this.flags |= ScoreBoard.FLAG_NEW_HIGH_SCORE;
                }
                this.addMedal(context, anim, sbScaled);
                this.showButtons();
            }
            this.displayScore(context, anim, sbScaled);
            this.displayBestScore(context, anim, sbScaled, (this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) !== 0);
            if (this.FlyInAnim.status.complete && !this.FlyInAnim.status.running) {
                this.TimingEventAnim.start();
                if (this.currentGeneratedNumber === this.currentScore) {
                    this.TimingEventAnim.stop();
                }
            }
        }
        if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0) {
            this.rankingButton.Display(context);
            this.playButton.Display(context);
            this.toggleSpeakerButton.Display(context);
        }
    };
    ScoreBoard.prototype.showBanner = function () {
        this.flags |= ScoreBoard.FLAG_SHOW_BANNER;
        this.BounceInAnim.start();
    };
    ScoreBoard.prototype.showBoard = function () {
        this.flags |= ScoreBoard.FLAG_SHOW_SCOREBOARD;
        this.FlyInAnim.start();
        this.spark.doSpark();
    };
    ScoreBoard.prototype.showButtons = function () {
        this.flags |= ScoreBoard.FLAG_SHOW_BUTTONS;
        this.playButton.active = true;
        this.rankingButton.active = true;
        this.toggleSpeakerButton.active = true;
    };
    ScoreBoard.prototype.setHighScore = function (num) {
        _lib_storage__WEBPACK_IMPORTED_MODULE_8__["default"].save('highscore', num);
        this.currentHighScore = num;
    };
    ScoreBoard.prototype.setScore = function (num) {
        this.currentScore = num;
    };
    ScoreBoard.prototype.addMedal = function (context, coord, parentSize) {
        if (this.currentScore < 10)
            return;
        var medal;
        if (this.currentScore >= 10 && this.currentScore < 20) {
            medal = this.images.get('coin-10');
        }
        else if (this.currentScore >= 20 && this.currentScore < 30) {
            medal = this.images.get('coin-20');
        }
        else {
            if (Math.floor(this.currentScore / 10) % 2 === 0) {
                medal = this.images.get('coin-40');
            }
            else {
                medal = this.images.get('coin-30');
            }
        }
        var scaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: medal.width,
            height: medal.height
        }, { width: parentSize.width * 0.1878 });
        var pos = {
            x: (coord.x + parentSize.width / 2) * 0.36,
            y: (coord.y + parentSize.height / 2) * 0.9196
        };
        context.drawImage(medal, pos.x, pos.y, scaled.width, scaled.height);
        this.spark.move(pos, scaled);
        this.spark.Display(context);
    };
    ScoreBoard.prototype.displayScore = function (context, coord, parentSize) {
        var _this = this;
        var numSize = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.images.get('number-1').width,
            height: this.images.get('number-1').height
        }, { width: parentSize.width * 0.05 });
        coord = Object.assign({}, coord);
        coord.x = (coord.x + parentSize.width / 2) * 1.565;
        coord.y = (coord.y + parentSize.height / 2) * 0.864;
        var numArr = String(this.currentGeneratedNumber).split('');
        numArr.reverse().forEach(function (c, index) {
            context.drawImage(_this.images.get("number-".concat(c)), coord.x - index * (numSize.width + 5), coord.y, numSize.width, numSize.height);
        });
    };
    ScoreBoard.prototype.displayBestScore = function (context, coord, parentSize, _p0) {
        var _this = this;
        var numSize = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.images.get('number-1').width,
            height: this.images.get('number-1').height
        }, { width: parentSize.width * 0.05 });
        coord = Object.assign({}, coord);
        coord.x = (coord.x + parentSize.width / 2) * 1.565;
        coord.y = (coord.y + parentSize.height / 2) * 1.074;
        var numArr = String(this.currentHighScore).split('');
        numArr.reverse().forEach(function (c, index) {
            context.drawImage(_this.images.get("number-".concat(c)), coord.x - index * (numSize.width + 5), coord.y, numSize.width, numSize.height);
        });
        if ((this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) === 0)
            return;
        var toastSize = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.images.get('new-icon').width,
            height: this.images.get('new-icon').height
        }, { width: parentSize.width * 0.14 });
        context.drawImage(this.images.get('new-icon'), coord.x * 0.73, coord.y * 0.922, toastSize.width, toastSize.height);
    };
    ScoreBoard.prototype.hide = function () {
        this.flags = 0;
        this.playButton.active = false;
        this.rankingButton.active = false;
        this.toggleSpeakerButton.active = false;
        this.currentGeneratedNumber = 0;
        this.FlyInAnim.reset();
        this.BounceInAnim.reset();
        this.TimingEventAnim.reset();
        this.spark.stop();
    };
    ScoreBoard.prototype.onRestart = function (cb) {
        this.playButton.onClick(cb);
    };
    ScoreBoard.prototype.onShowRanks = function (_cb) {
    };
    ScoreBoard.prototype.mouseDown = function (_a) {
        var x = _a.x, y = _a.y;
        this.playButton.mouseEvent('down', { x: x, y: y });
        this.rankingButton.mouseEvent('down', { x: x, y: y });
        this.toggleSpeakerButton.mouseEvent('down', { x: x, y: y });
    };
    ScoreBoard.prototype.mouseUp = function (_a) {
        var x = _a.x, y = _a.y;
        this.playButton.mouseEvent('up', { x: x, y: y });
        this.rankingButton.mouseEvent('up', { x: x, y: y });
        this.toggleSpeakerButton.mouseEvent('up', { x: x, y: y });
    };
    ScoreBoard.prototype.triggerPlayATKeyboardEvent = function () {
        if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0)
            this.playButton.click();
    };
    ScoreBoard.FLAG_SHOW_BANNER = 1;
    ScoreBoard.FLAG_SHOW_SCOREBOARD = 2;
    ScoreBoard.FLAG_SHOW_BUTTONS = 4;
    ScoreBoard.FLAG_NEW_HIGH_SCORE = 8;
    return ScoreBoard;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_1__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ScoreBoard);


/***/ }),

/***/ "./src/model/sfx.ts":
/*!**************************!*\
  !*** ./src/model/sfx.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/web-sfx */ "./src/lib/web-sfx/index.ts");
/* harmony import */ var _assets_audio_die_ogg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/audio/die.ogg */ "./src/assets/audio/die.ogg");
/* harmony import */ var _assets_audio_hit_ogg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../assets/audio/hit.ogg */ "./src/assets/audio/hit.ogg");
/* harmony import */ var _assets_audio_point_ogg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../assets/audio/point.ogg */ "./src/assets/audio/point.ogg");
/* harmony import */ var _assets_audio_swooshing_ogg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../assets/audio/swooshing.ogg */ "./src/assets/audio/swooshing.ogg");
/* harmony import */ var _assets_audio_wing_ogg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../assets/audio/wing.ogg */ "./src/assets/audio/wing.ogg");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var Sfx = (function () {
    function Sfx() {
    }
    Sfx.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].init()];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Sfx.volume = function (num) {
        Sfx.currentVolume = num;
    };
    Sfx.die = function () {
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].volume(Sfx.currentVolume);
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].play(_assets_audio_die_ogg__WEBPACK_IMPORTED_MODULE_1__["default"]);
    };
    Sfx.point = function () {
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].volume(Sfx.currentVolume);
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].play(_assets_audio_point_ogg__WEBPACK_IMPORTED_MODULE_3__["default"]);
    };
    Sfx.hit = function (cb) {
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].volume(Sfx.currentVolume);
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].play(_assets_audio_hit_ogg__WEBPACK_IMPORTED_MODULE_2__["default"], cb);
    };
    Sfx.swoosh = function () {
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].volume(Sfx.currentVolume);
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].play(_assets_audio_swooshing_ogg__WEBPACK_IMPORTED_MODULE_4__["default"]);
    };
    Sfx.wing = function () {
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].volume(Sfx.currentVolume);
        _lib_web_sfx__WEBPACK_IMPORTED_MODULE_0__["default"].play(_assets_audio_wing_ogg__WEBPACK_IMPORTED_MODULE_5__["default"]);
    };
    Sfx.currentVolume = 1;
    return Sfx;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Sfx);


/***/ }),

/***/ "./src/model/spark.ts":
/*!****************************!*\
  !*** ./src/model/spark.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _lib_animation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/animation */ "./src/lib/animation/index.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();




var Spark = (function (_super) {
    __extends(Spark, _super);
    function Spark() {
        var _this = _super.call(this) || this;
        _this.images = new Map();
        _this.timingEvent = new _lib_animation__WEBPACK_IMPORTED_MODULE_3__.TimingEvent({
            diff: 200
        });
        _this.scaled = {
            width: 0,
            height: 0
        };
        _this.dimension = {
            width: 0,
            height: 0
        };
        _this.target = {
            x: 0,
            y: 0
        };
        _this.status = 'stopped';
        _this.sparkList = [];
        _this.currentSparkIndex = 0;
        return _this;
    }
    Spark.prototype.init = function () {
        this.images.set('spark-sm', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__["default"].asset('spark-sm'));
        this.images.set('spark-md', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__["default"].asset('spark-md'));
        this.images.set('spark-lg', _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_2__["default"].asset('spark-lg'));
        this.sparkList = ['spark-sm', 'spark-md', 'spark-lg', 'spark-md', 'spark-sm'];
    };
    Spark.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.scaled = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.rescaleDim)({
            width: this.images.get('spark-lg').width,
            height: this.images.get('spark-lg').height
        }, { width: width * 0.03 });
    };
    Spark.prototype.doSpark = function () {
        if (this.status === 'running')
            return;
        this.status = 'running';
        this.timingEvent.start();
    };
    Spark.prototype.stop = function () {
        this.status = 'stopped';
        this.timingEvent.reset();
    };
    Spark.prototype.relocate = function () {
        this.target.x = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.randomClamp)(this.coordinate.x, this.coordinate.x + this.dimension.width);
        this.target.y = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.randomClamp)(this.coordinate.y, this.coordinate.y + this.dimension.height);
    };
    Spark.prototype.move = function (_a, dimension) {
        var x = _a.x, y = _a.y;
        this.coordinate = { x: x, y: y };
        this.dimension = dimension;
    };
    Spark.prototype.Update = function () {
        if (this.status === 'stopped')
            return;
        if (this.timingEvent.value) {
            if (this.currentSparkIndex > this.sparkList.length - 2) {
                this.currentSparkIndex = 0;
                this.relocate();
            }
            else {
                this.currentSparkIndex++;
            }
        }
    };
    Spark.prototype.Display = function (context) {
        if (this.status === 'stopped')
            return;
        context.drawImage(this.images.get(this.sparkList[this.currentSparkIndex]), Math.abs(this.target.x - this.scaled.width / 2), Math.abs(this.target.y - this.scaled.height / 2), this.scaled.width, this.scaled.height);
    };
    return Spark;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_0__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Spark);


/***/ }),

/***/ "./src/screens/gameplay.ts":
/*!*********************************!*\
  !*** ./src/screens/gameplay.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _model_banner_instruction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../model/banner-instruction */ "./src/model/banner-instruction.ts");
/* harmony import */ var _model_bird__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/bird */ "./src/model/bird.ts");
/* harmony import */ var _model_count__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../model/count */ "./src/model/count.ts");
/* harmony import */ var _model_flash_screen__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/flash-screen */ "./src/model/flash-screen.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _model_score_board__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../model/score-board */ "./src/model/score-board.ts");
/* harmony import */ var _model_sfx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../model/sfx */ "./src/model/sfx.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();







var GetReady = (function (_super) {
    __extends(GetReady, _super);
    function GetReady(game) {
        var _this = _super.call(this) || this;
        _this.state = 'waiting';
        _this.bird = new _model_bird__WEBPACK_IMPORTED_MODULE_1__["default"]();
        _this.count = new _model_count__WEBPACK_IMPORTED_MODULE_2__["default"]();
        _this.game = game;
        _this.pipeGenerator = _this.game.pipeGenerator;
        _this.bannerInstruction = new _model_banner_instruction__WEBPACK_IMPORTED_MODULE_0__["default"]();
        _this.gameState = 'none';
        _this.scoreBoard = new _model_score_board__WEBPACK_IMPORTED_MODULE_5__["default"]();
        _this.transition = new _model_flash_screen__WEBPACK_IMPORTED_MODULE_3__["default"]({
            interval: 500,
            strong: 1.0,
            style: 'black',
            easing: 'sineWaveHS'
        });
        _this.flashScreen = new _model_flash_screen__WEBPACK_IMPORTED_MODULE_3__["default"]({
            style: 'white',
            interval: 180,
            strong: 0.7,
            easing: 'linear'
        });
        _this.hideBird = false;
        _this.showScoreBoard = false;
        _this.transition.setEvent([0.99, 1], _this.reset.bind(_this));
        return _this;
    }
    GetReady.prototype.init = function () {
        this.bird.init();
        this.count.init();
        this.bannerInstruction.init();
        this.scoreBoard.init();
        this.setButtonEvent();
        this.flashScreen.init();
        this.transition.init();
    };
    GetReady.prototype.reset = function () {
        this.gameState = 'none';
        this.state = 'waiting';
        this.game.background.reset();
        this.game.platform.reset();
        this.pipeGenerator.reset();
        this.bannerInstruction.reset();
        this.game.bgPause = false;
        this.hideBird = false;
        this.showScoreBoard = false;
        this.scoreBoard.hide();
        this.bird.reset();
    };
    GetReady.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.bird.resize(this.canvasSize);
        this.count.resize(this.canvasSize);
        this.bannerInstruction.resize(this.canvasSize);
        this.scoreBoard.resize(this.canvasSize);
        this.flashScreen.resize(this.canvasSize);
        this.transition.resize(this.canvasSize);
    };
    GetReady.prototype.Update = function () {
        var _this = this;
        this.flashScreen.Update();
        this.transition.Update();
        this.scoreBoard.Update();
        if (!this.bird.alive) {
            this.game.bgPause = true;
            this.bird.Update();
            return;
        }
        if (this.state === 'waiting') {
            this.bird.doWave({
                x: this.bird.coordinate.x,
                y: this.canvasSize.height * 0.48
            }, 1, 6);
            return;
        }
        this.bannerInstruction.Update();
        this.pipeGenerator.Update();
        this.bird.Update();
        if (this.bird.isDead(this.pipeGenerator.pipes)) {
            this.flashScreen.reset();
            this.flashScreen.start();
            this.gameState = 'died';
            window.setTimeout(function () {
                _this.scoreBoard.setScore(_this.bird.score);
                _this.showScoreBoard = true;
                window.setTimeout(function () {
                    _this.scoreBoard.showBoard();
                    _model_sfx__WEBPACK_IMPORTED_MODULE_6__["default"].swoosh();
                }, 700);
                _this.scoreBoard.showBanner();
                _model_sfx__WEBPACK_IMPORTED_MODULE_6__["default"].swoosh();
            }, 500);
            _model_sfx__WEBPACK_IMPORTED_MODULE_6__["default"].hit(function () {
                _this.bird.playDead();
            });
        }
    };
    GetReady.prototype.Display = function (context) {
        if (this.state === 'playing' || this.state === 'waiting') {
            this.bannerInstruction.Display(context);
            if (this.gameState !== 'died' || !this.showScoreBoard) {
                this.count.setNum(this.bird.score);
                this.count.Display(context);
            }
            if (!this.hideBird)
                this.bird.Display(context);
            this.scoreBoard.Display(context);
        }
        this.flashScreen.Display(context);
        this.transition.Display(context);
    };
    GetReady.prototype.setButtonEvent = function () {
        var _this = this;
        this.scoreBoard.onRestart(function () {
            if (_this.transition.status.running)
                return;
            _this.transition.reset();
            _this.transition.start();
        });
    };
    GetReady.prototype.click = function (_a) {
        var x = _a.x, y = _a.y;
        if (this.gameState === 'died')
            return;
        this.state = 'playing';
        this.gameState = 'playing';
        this.bannerInstruction.tap();
        this.bird.flap();
    };
    GetReady.prototype.mouseDown = function (_a) {
        var x = _a.x, y = _a.y;
        if (this.gameState !== 'died')
            return;
        this.scoreBoard.mouseDown({ x: x, y: y });
    };
    GetReady.prototype.mouseUp = function (_a) {
        var x = _a.x, y = _a.y;
        if (this.gameState !== 'died')
            return;
        this.scoreBoard.mouseUp({ x: x, y: y });
    };
    GetReady.prototype.startAtKeyBoardEvent = function () {
        if (this.gameState === 'died')
            this.scoreBoard.triggerPlayATKeyboardEvent();
    };
    return GetReady;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_4__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GetReady);


/***/ }),

/***/ "./src/screens/intro.ts":
/*!******************************!*\
  !*** ./src/screens/intro.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils/index.ts");
/* harmony import */ var _model_bird__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/bird */ "./src/model/bird.ts");
/* harmony import */ var _abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../abstracts/parent-class */ "./src/abstracts/parent-class.ts");
/* harmony import */ var _model_btn_play__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../model/btn-play */ "./src/model/btn-play.ts");
/* harmony import */ var _model_btn_ranking__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../model/btn-ranking */ "./src/model/btn-ranking.ts");
/* harmony import */ var _model_btn_rate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../model/btn-rate */ "./src/model/btn-rate.ts");
/* harmony import */ var _model_btn_toggle_speaker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../model/btn-toggle-speaker */ "./src/model/btn-toggle-speaker.ts");
/* harmony import */ var _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../lib/sprite-destructor */ "./src/lib/sprite-destructor/index.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../constants */ "./src/constants.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();









var Introduction = (function (_super) {
    __extends(Introduction, _super);
    function Introduction() {
        var _this = _super.call(this) || this;
        _this.bird = new _model_bird__WEBPACK_IMPORTED_MODULE_1__["default"]();
        _this.playButton = new _model_btn_play__WEBPACK_IMPORTED_MODULE_3__["default"]();
        _this.rankingButton = new _model_btn_ranking__WEBPACK_IMPORTED_MODULE_4__["default"]();
        _this.rateButton = new _model_btn_rate__WEBPACK_IMPORTED_MODULE_5__["default"]();
        _this.toggleSpeakerButton = new _model_btn_toggle_speaker__WEBPACK_IMPORTED_MODULE_6__["default"]();
        _this.flappyBirdBanner = void 0;
        _this.copyright = void 0;
        return _this;
    }
    Introduction.prototype.init = function () {
        this.bird.init();
        this.playButton.init();
        this.rankingButton.init();
        this.rateButton.init();
        this.toggleSpeakerButton.init();
        this.flappyBirdBanner = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_7__["default"].asset('banner-flappybird');
        this.copyright = _lib_sprite_destructor__WEBPACK_IMPORTED_MODULE_7__["default"].asset('copyright');
    };
    Introduction.prototype.resize = function (_a) {
        var width = _a.width, height = _a.height;
        _super.prototype.resize.call(this, { width: width, height: height });
        this.bird.resize({ width: width, height: height });
        this.playButton.resize({ width: width, height: height });
        this.rankingButton.resize({ width: width, height: height });
        this.rateButton.resize({ width: width, height: height });
        this.toggleSpeakerButton.resize({ width: width, height: height });
    };
    Introduction.prototype.Update = function () {
        this.bird.doWave({
            x: this.canvasSize.width * 0.5,
            y: this.canvasSize.height * 0.4
        }, 1.4, 9);
        this.playButton.Update();
        this.rankingButton.Update();
        this.rateButton.Update();
        this.toggleSpeakerButton.Update();
    };
    Introduction.prototype.Display = function (context) {
        this.toggleSpeakerButton.Display(context);
        this.playButton.Display(context);
        this.rankingButton.Display(context);
        this.rateButton.Display(context);
        this.bird.Display(context);
        var fbbScaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.flappyBirdBanner.width,
            height: this.flappyBirdBanner.height
        }, { width: this.canvasSize.width * 0.67 });
        context.drawImage(this.flappyBirdBanner, this.canvasSize.width * 0.5 - fbbScaled.width / 2, this.canvasSize.height * 0.28 - fbbScaled.height / 2, fbbScaled.width, fbbScaled.height);
        var crScaled = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.rescaleDim)({
            width: this.copyright.width,
            height: this.copyright.height
        }, { width: this.canvasSize.width * 0.44 });
        context.drawImage(this.copyright, this.canvasSize.width * 0.5 - crScaled.width / 2, this.canvasSize.height * 0.806 - crScaled.height / 2, crScaled.width, crScaled.height);
        this.insertAppVersion(context);
    };
    Introduction.prototype.insertAppVersion = function (context) {
        var fSize = this.canvasSize.width * 0.04;
        var bot = this.canvasSize.height * 0.985;
        var right = this.canvasSize.width * 0.985;
        context.font = "bold ".concat(fSize, "px monospace");
        context.textAlign = 'center';
        context.fillStyle = '#8E8E93';
        context.fillText("v".concat(_constants__WEBPACK_IMPORTED_MODULE_8__.APP_VERSION), right - 2 * fSize, bot);
    };
    Introduction.prototype.mouseDown = function (_a) {
        var x = _a.x, y = _a.y;
        this.toggleSpeakerButton.mouseEvent('down', { x: x, y: y });
        this.playButton.mouseEvent('down', { x: x, y: y });
        this.rankingButton.mouseEvent('down', { x: x, y: y });
        this.rateButton.mouseEvent('down', { x: x, y: y });
    };
    Introduction.prototype.mouseUp = function (_a) {
        var x = _a.x, y = _a.y;
        this.toggleSpeakerButton.mouseEvent('up', { x: x, y: y });
        this.playButton.mouseEvent('up', { x: x, y: y });
        this.rankingButton.mouseEvent('up', { x: x, y: y });
        this.rateButton.mouseEvent('up', { x: x, y: y });
    };
    Introduction.prototype.startAtKeyBoardEvent = function () {
        this.playButton.click();
    };
    return Introduction;
}(_abstracts_parent_class__WEBPACK_IMPORTED_MODULE_2__["default"]));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Introduction);


/***/ }),

/***/ "./src/utils/clamp.ts":
/*!****************************!*\
  !*** ./src/utils/clamp.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* binding */ clamp)
/* harmony export */ });
var clamp = function (min, max, value) {
    return Math.max(Math.min(value, max), min);
};


/***/ }),

/***/ "./src/utils/flip-range.ts":
/*!*********************************!*\
  !*** ./src/utils/flip-range.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   flipRange: () => (/* binding */ flipRange)
/* harmony export */ });
var flipRange = function (min, max, value) {
    return max - (value - min);
};


/***/ }),

/***/ "./src/utils/framer.ts":
/*!*****************************!*\
  !*** ./src/utils/framer.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   framer: () => (/* reexport safe */ _lib_stats__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _lib_stats__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../lib/stats */ "./src/lib/stats/index.ts");




/***/ }),

/***/ "./src/utils/index.ts":
/*!****************************!*\
  !*** ./src/utils/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* reexport safe */ _clamp__WEBPACK_IMPORTED_MODULE_3__.clamp),
/* harmony export */   cosine: () => (/* reexport safe */ _waves__WEBPACK_IMPORTED_MODULE_5__.cosine),
/* harmony export */   flipRange: () => (/* reexport safe */ _flip_range__WEBPACK_IMPORTED_MODULE_6__.flipRange),
/* harmony export */   framer: () => (/* reexport safe */ _framer__WEBPACK_IMPORTED_MODULE_1__.framer),
/* harmony export */   lerp: () => (/* reexport safe */ _linear_interpolation__WEBPACK_IMPORTED_MODULE_2__.lerp),
/* harmony export */   openInNewTab: () => (/* reexport safe */ _open_in_new_tab__WEBPACK_IMPORTED_MODULE_7__.openInNewTab),
/* harmony export */   randomClamp: () => (/* reexport safe */ _random_clamp__WEBPACK_IMPORTED_MODULE_4__.randomClamp),
/* harmony export */   rescaleDim: () => (/* reexport safe */ _rescale_dim__WEBPACK_IMPORTED_MODULE_0__.rescaleDim),
/* harmony export */   sine: () => (/* reexport safe */ _waves__WEBPACK_IMPORTED_MODULE_5__.sine)
/* harmony export */ });
/* harmony import */ var _rescale_dim__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rescale-dim */ "./src/utils/rescale-dim.ts");
/* harmony import */ var _framer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./framer */ "./src/utils/framer.ts");
/* harmony import */ var _linear_interpolation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./linear-interpolation */ "./src/utils/linear-interpolation.ts");
/* harmony import */ var _clamp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./clamp */ "./src/utils/clamp.ts");
/* harmony import */ var _random_clamp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./random-clamp */ "./src/utils/random-clamp.ts");
/* harmony import */ var _waves__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./waves */ "./src/utils/waves.ts");
/* harmony import */ var _flip_range__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./flip-range */ "./src/utils/flip-range.ts");
/* harmony import */ var _open_in_new_tab__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./open-in-new-tab */ "./src/utils/open-in-new-tab.ts");










/***/ }),

/***/ "./src/utils/linear-interpolation.ts":
/*!*******************************************!*\
  !*** ./src/utils/linear-interpolation.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lerp: () => (/* binding */ lerp)
/* harmony export */ });
var lerp = function (a, b, t) {
    return a + (b - a) * t;
};


/***/ }),

/***/ "./src/utils/open-in-new-tab.ts":
/*!**************************************!*\
  !*** ./src/utils/open-in-new-tab.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   openInNewTab: () => (/* binding */ openInNewTab)
/* harmony export */ });
var openInNewTab = function (href) {
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: href
    }).click();
};


/***/ }),

/***/ "./src/utils/random-clamp.ts":
/*!***********************************!*\
  !*** ./src/utils/random-clamp.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   randomClamp: () => (/* binding */ randomClamp)
/* harmony export */ });
var randomClamp = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};


/***/ }),

/***/ "./src/utils/rescale-dim.ts":
/*!**********************************!*\
  !*** ./src/utils/rescale-dim.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   rescaleDim: () => (/* binding */ rescaleDim)
/* harmony export */ });
var rescaleDim = function (oldDim, newDim) {
    var filledDim = {
        width: 0,
        height: 0
    };
    if ('width' in newDim) {
        filledDim.width = newDim.width;
        filledDim.height = (oldDim.height / oldDim.width) * newDim.width;
    }
    else if ('height' in newDim) {
        filledDim.height = newDim.height;
        filledDim.width = (oldDim.width * newDim.height) / oldDim.height;
    }
    return filledDim;
};


/***/ }),

/***/ "./src/utils/waves.ts":
/*!****************************!*\
  !*** ./src/utils/waves.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cosine: () => (/* binding */ cosine),
/* harmony export */   sine: () => (/* binding */ sine)
/* harmony export */ });
var sine = function (frequency, amplitude) {
    var time = new Date().getTime();
    return Math.sin(((time / 1000) * 2 * Math.PI) / (1 / frequency)) * amplitude;
};
var cosine = function (frequency, amplitude) {
    var time = new Date().getTime();
    return Math.sin(((time / 1000) * 2 * Math.PI) / (1 / frequency)) * amplitude;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkflappybird"] = self["webpackChunkflappybird"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_solid-primitives_raf_dist_index_js-node_modules_total-typescript_ts-rese-48c27c"], () => (__webpack_require__("./src/index.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map