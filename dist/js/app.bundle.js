/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(2);
	__webpack_require__(3);
	var TetrisBoard_1 = __webpack_require__(7);
	ReactDOM.render(React.createElement(TetrisBoard_1.TetrisBoard, { rows: 20, columns: 10 }), document.getElementById("root-container"));


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = React;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = ReactDOM;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(2);
	var _ = __webpack_require__(8);
	var BLOCK_COLOR = '#ff3434';
	var COMPLETING_LINE_COLOR = 'rgb(128, 255, 128)';
	// Size of the single building block square.
	var BLOCK_SIZE = 30;
	// Take taken by the piece to move one row down.
	var SPEED = 500;
	// Opacity to reduce in one step while disappearing a completed row.
	var OPACITY_STEP = 0.05;
	// time interval in which disappearing row deduces it's opacity by taken by opacity by OPACITY_STEP
	var LINE_DISAPPEARING_DELAY = 25;
	var TetrisBoard = (function (_super) {
	    __extends(TetrisBoard, _super);
	    function TetrisBoard(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {
	            setBlocks: [],
	            curPiecePos: null,
	            curScore: 0,
	            animatingRows: [],
	            animationOpacity: 1,
	            gameState: 'FRESH'
	        };
	        return _this;
	    }
	    TetrisBoard.prototype.componentDidMount = function () {
	        this.focusBoard();
	    };
	    TetrisBoard.prototype.componentDidUpdate = function () {
	        var _this = this;
	        this.focusBoard();
	        if (this.state.animatingRows.length > 0) {
	            setTimeout(function () {
	                var newOpacity = Math.max(0, _this.state.animationOpacity - OPACITY_STEP);
	                if (newOpacity < 1e-9) {
	                    _this.clearLines();
	                }
	                else {
	                    _this.setState({
	                        animationOpacity: newOpacity
	                    });
	                }
	            }, LINE_DISAPPEARING_DELAY);
	        }
	    };
	    TetrisBoard.prototype.componentWillUnmount = function () {
	        if (this.timer !== void 0) {
	            clearTimeout(this.timer);
	        }
	    };
	    TetrisBoard.prototype.render = function () {
	        var _this = this;
	        var wallThickness = 5;
	        var boardWidth = BLOCK_SIZE * this.props.columns + (this.props.columns + 1);
	        var scoreWidth = 150;
	        var height = BLOCK_SIZE * this.props.rows + (this.props.rows + 1);
	        var marginLeft = -(scoreWidth + boardWidth / 2 + wallThickness);
	        var marginTop = -(height / 2 + wallThickness);
	        var arenaStyle = {
	            width: boardWidth + scoreWidth + 2 * wallThickness,
	            height: height,
	            marginTop: marginTop,
	            marginLeft: marginLeft
	        };
	        var nextPieceDom = null;
	        if (this.state.nextPieceIndex !== void 0) {
	            var colOffset = this.state.nextPieceIndex > 3 ? 1 : 0;
	            nextPieceDom = this.getBlocksForPiece(this.state.nextPieceIndex, 0, {
	                row: 1,
	                col: colOffset
	            }).map(function (block) { return _this.getSingleBlockDom(block, BLOCK_COLOR, 1.0); });
	        }
	        return (React.createElement("div", { className: "ts-arena", style: arenaStyle },
	            React.createElement("div", { className: "ts-game-info" },
	                React.createElement("div", { className: "ts-current-score" },
	                    React.createElement("div", { className: "ts-game-info-label ts-score-text" }, "Score:"),
	                    React.createElement("div", { className: "ts-score-number" }, this.state.curScore)),
	                React.createElement("div", { className: "ts-next-piece-info" },
	                    React.createElement("div", { className: "ts-game-info-label" }, "Next:"),
	                    nextPieceDom)),
	            React.createElement("div", { ref: "tsBoard", className: "ts-board", tabIndex: 0, style: { width: boardWidth }, onKeyDown: function (event) { return _this.onKeyPress(event.keyCode); } },
	                this.getStartButtonDom(),
	                this.getPausedButtonDom(),
	                this.getAllBlocks().map(function (block) {
	                    var backgroundColor = BLOCK_COLOR;
	                    var opacity = 1.0;
	                    if (_this.state.animatingRows.indexOf(block.row) !== -1) {
	                        backgroundColor = COMPLETING_LINE_COLOR;
	                        opacity = _this.state.animationOpacity;
	                    }
	                    return _this.getSingleBlockDom(block, backgroundColor, opacity);
	                }),
	                this.state.gameState === 'OVER' ? React.createElement("div", { className: "ts-game-over" }, "Game Over!") : null)));
	    };
	    TetrisBoard.prototype.getSingleBlockDom = function (block, fillColor, opacity) {
	        var left = block.col * BLOCK_SIZE + (block.col + 1);
	        var top = block.row * BLOCK_SIZE + (block.row + 1);
	        return (React.createElement("div", { key: block.row + ':' + block.col, className: "ts-block", style: {
	                left: left,
	                top: top,
	                width: BLOCK_SIZE,
	                height: BLOCK_SIZE,
	                backgroundColor: fillColor,
	                opacity: opacity
	            } }));
	    };
	    TetrisBoard.prototype.getStartButtonDom = function () {
	        var _this = this;
	        if (this.state.gameState === 'FRESH' || this.state.gameState === 'OVER') {
	            return (React.createElement("button", { className: "ts-start-button", title: "START", onClick: function () { return _this.onStartButtonClick(); } }, this.state.gameState === 'FRESH' ? 'Start' : 'Replay'));
	        }
	        return null;
	    };
	    TetrisBoard.prototype.focusBoard = function () {
	        ReactDOM.findDOMNode(this.refs.tsBoard).focus();
	    };
	    TetrisBoard.prototype.onStartButtonClick = function () {
	        var _this = this;
	        this.setState({
	            gameState: 'PLAYING',
	            setBlocks: [],
	            curPiecePos: null,
	            curScore: 0
	        }, function () {
	            _this.callEveryNMs(function () {
	                return _this.updateBoard();
	            }, SPEED);
	        });
	    };
	    TetrisBoard.prototype.onPauseButtonClick = function () {
	        var gameState = this.state.gameState;
	        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
	            var newGameState = gameState === 'PLAYING' ? 'PAUSED' : 'PLAYING';
	            this.setState({
	                gameState: newGameState
	            });
	        }
	    };
	    TetrisBoard.prototype.getAllBlocks = function () {
	        return this.state.setBlocks.concat(this.getCurrentPieceBlocks());
	    };
	    TetrisBoard.prototype.getCurrentPieceBlocks = function () {
	        if (this.state.curPiecePos !== null) {
	            return this.getBlocksForPiece(this.state.curPieceType, this.state.curPieceRotation, this.state.curPiecePos);
	        }
	        return [];
	    };
	    TetrisBoard.prototype.getBlocksForPiece = function (pieceType, rotation, position) {
	        return pieces[pieceType][rotation].map(function (block) {
	            return {
	                row: block.row + position.row,
	                col: block.col + position.col
	            };
	        });
	    };
	    TetrisBoard.prototype.updateBoard = function () {
	        if (this.state.gameState === 'PAUSED') {
	            return true;
	        }
	        if (this.canMoveDown()) {
	            this.state.curPiecePos.row++;
	            this.setState({ curPiecePos: this.state.curPiecePos });
	            return true;
	        }
	        var newSetBlocks = this.getAllBlocks();
	        var rowIds = this.getCompletedRowIDs(newSetBlocks);
	        if (rowIds.length > 0) {
	            this.setState({
	                setBlocks: newSetBlocks,
	                curPiecePos: null,
	                animatingRows: rowIds,
	                animationOpacity: 1.0
	            });
	            return false;
	        }
	        var newPieceIndex = this.state.nextPieceIndex !== void 0
	            ? this.state.nextPieceIndex
	            : getRandomInteger(0, pieces.length - 1);
	        var startRow = 0, startCol = Math.floor((this.props.columns - (newPieceIndex > 4 ? 0 : 1)) / 2), newPiecePos = { row: startRow, col: startCol };
	        if (this.canStartNewPiece(newPieceIndex, newPiecePos)) {
	            this.setState({
	                setBlocks: newSetBlocks,
	                curPiecePos: newPiecePos,
	                curPieceType: newPieceIndex,
	                nextPieceIndex: getRandomInteger(0, pieces.length - 1),
	                curPieceRotation: 0
	            });
	            return true;
	        }
	        else {
	            this.setState({
	                setBlocks: newSetBlocks,
	                curPiecePos: null,
	                gameState: 'OVER'
	            });
	            return false;
	        }
	    };
	    TetrisBoard.prototype.getCompletedRowIDs = function (blocks) {
	        var _this = this;
	        var groups = _.pickBy(_.groupBy(blocks, 'row'), function (group, rowId) {
	            return group.length === _this.props.columns;
	        });
	        return Object.keys(groups).map(function (key) {
	            return +key;
	        });
	    };
	    TetrisBoard.prototype.clearLines = function () {
	        var _this = this;
	        var blocksByRow = [];
	        this.state.setBlocks.forEach(function (block) {
	            var rowIndexFromBottom = _this.props.rows - 1 - block.row;
	            blocksByRow[rowIndexFromBottom] = blocksByRow[rowIndexFromBottom] || [];
	            blocksByRow[rowIndexFromBottom].push(block);
	        });
	        var reducedBlocksByRow = [];
	        var clearedLines = 0;
	        for (var rowIndex = 0; rowIndex < blocksByRow.length; rowIndex++) {
	            if (blocksByRow[rowIndex].length < this.props.columns) {
	                reducedBlocksByRow.push(blocksByRow[rowIndex]);
	            }
	            else {
	                clearedLines++;
	            }
	        }
	        if (clearedLines === 0) {
	            return;
	        }
	        var updatedBlocks = [];
	        var _loop_1 = function (rowIndex) {
	            updatedBlocks = updatedBlocks.concat(reducedBlocksByRow[rowIndex].map(function (block) {
	                return {
	                    row: _this.props.rows - 1 - rowIndex,
	                    col: block.col
	                };
	            }));
	        };
	        for (var rowIndex = 0; rowIndex < reducedBlocksByRow.length; rowIndex++) {
	            _loop_1(rowIndex);
	        }
	        this.setState({
	            setBlocks: updatedBlocks,
	            curScore: this.state.curScore + clearedLines,
	            animatingRows: []
	        }, function () {
	            _this.callEveryNMs(function () {
	                return _this.updateBoard();
	            }, SPEED);
	        });
	    };
	    TetrisBoard.prototype.canMoveDown = function () {
	        return this.canShiftPiece(1, 0, 0);
	    };
	    TetrisBoard.prototype.canMoveLeft = function () {
	        return this.canShiftPiece(0, -1, 0);
	    };
	    TetrisBoard.prototype.canMoveRight = function () {
	        return this.canShiftPiece(0, 1, 0);
	    };
	    TetrisBoard.prototype.canRotate = function () {
	        return this.canShiftPiece(0, 0, 1);
	    };
	    TetrisBoard.prototype.canShiftPiece = function (rowShift, colShift, rotationShift) {
	        var _this = this;
	        if (this.state.curPiecePos === null) {
	            return false;
	        }
	        var hash = [];
	        this.state.setBlocks.forEach(function (block) {
	            hash[block.row] = hash[block.row] || [];
	            hash[block.row][block.col] = 1;
	        });
	        var newPos = {
	            row: this.state.curPiecePos.row + rowShift,
	            col: this.state.curPiecePos.col + colShift
	        };
	        var newRotation = (this.state.curPieceRotation + rotationShift) % 4;
	        var newBlocks = this.getBlocksForPiece(this.state.curPieceType, newRotation, newPos);
	        var isClash = false;
	        newBlocks.forEach(function (block) {
	            if (isClash) {
	                return;
	            }
	            if (block.row >= _this.props.rows || block.row < 0 ||
	                block.col >= _this.props.columns || block.col < 0) {
	                isClash = true;
	                return;
	            }
	            hash[block.row] = hash[block.row] || [];
	            if (hash[block.row][block.col]) {
	                isClash = true;
	            }
	        });
	        return !isClash;
	    };
	    TetrisBoard.prototype.canStartNewPiece = function (newPieceType, newPiecePosition) {
	        var hash = [];
	        this.getAllBlocks().forEach(function (block) {
	            hash[block.row] = hash[block.row] || [];
	            hash[block.row][block.col] = 1;
	        });
	        var isClash = false;
	        var newMovingBlocks = this.getBlocksForPiece(newPieceType, 0, newPiecePosition);
	        newMovingBlocks.forEach(function (block) {
	            if (isClash) {
	                return;
	            }
	            hash[block.row] = hash[block.row] || [];
	            if (hash[block.row][block.col]) {
	                isClash = true;
	            }
	        });
	        return !isClash;
	    };
	    TetrisBoard.prototype.callEveryNMs = function (func, interval) {
	        var _this = this;
	        if (func()) {
	            this.timer = setTimeout(function () {
	                _this.callEveryNMs(func, interval);
	            }, interval);
	        }
	    };
	    TetrisBoard.prototype.onKeyPress = function (keyCode) {
	        if (this.state.curPiecePos === null) {
	            return;
	        }
	        // rotate!
	        if (keyCode === 82) {
	            if (this.canRotate()) {
	                this.setState({
	                    curPieceRotation: (this.state.curPieceRotation + 1) % 4
	                });
	            }
	        }
	        else if (keyCode === 37) {
	            if (this.canMoveLeft()) {
	                this.state.curPiecePos.col--;
	                this.forceUpdate();
	            }
	        }
	        else if (keyCode === 39) {
	            if (this.canMoveRight()) {
	                this.state.curPiecePos.col++;
	                this.forceUpdate();
	            }
	        }
	        else if (keyCode === 40) {
	            if (this.canMoveDown()) {
	                this.state.curPiecePos.row++;
	                this.forceUpdate();
	            }
	        }
	    };
	    TetrisBoard.prototype.getPausedButtonDom = function () {
	        var _this = this;
	        if (this.state.gameState === 'PAUSED' || this.state.gameState === 'PLAYING') {
	            return (React.createElement("div", { className: "ts-pause-button", onClick: function () { return _this.onPauseButtonClick(); } }, this.state.gameState === 'PAUSED' ? 'Resume' : 'Pause'));
	        }
	        return null;
	    };
	    return TetrisBoard;
	}(React.Component));
	exports.TetrisBoard = TetrisBoard;
	// Configuration of all pieces for all 4 rotations.
	var pieces = [
	    // square
	    [
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }]
	    ],
	    // I
	    [
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }]
	    ],
	    // L
	    [
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: -1 }],
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 0, col: -1 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 0, col: 1 }]
	    ],
	    // N
	    [
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 0 }],
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
	        [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 0 }]
	    ],
	    // T
	    [
	        [{ row: 0, col: -1 }, { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }],
	        [{ row: 0, col: -1 }, { row: 0, col: 0 }, { row: 1, col: 0 }, { row: -1, col: 0 }],
	        [{ row: 0, col: -1 }, { row: 0, col: 0 }, { row: 0, col: 1 }, { row: -1, col: 0 }],
	        [{ row: 0, col: 1 }, { row: 0, col: 0 }, { row: 1, col: 0 }, { row: -1, col: 0 }]
	    ],
	    // Reverse L
	    [
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: -1 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 0, col: -1 }],
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 0, col: 1 }],
	        [{ row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }]
	    ],
	    // Reverse N
	    [
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: -1 }, { row: 2, col: -1 }],
	        [{ row: 0, col: -2 }, { row: 0, col: -1 }, { row: 1, col: -1 }, { row: 1, col: 0 }],
	        [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: -1 }, { row: 2, col: -1 }],
	        [{ row: 0, col: -2 }, { row: 0, col: -1 }, { row: 1, col: -1 }, { row: 1, col: 0 }],
	    ]
	];
	function getRandomInteger(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}


/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports = _;

/***/ })
/******/ ]);
//# sourceMappingURL=app.bundle.js.map