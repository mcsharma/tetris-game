import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

interface Props {
    rows: number;
    columns: number;
}

type GameState = 'FRESH' | 'PLAYING' | 'PAUSED' | 'OVER';

interface State {
    setBlocks: BlockPosition[];
    curPiecePos: BlockPosition | null;
    curPieceType?: number;
    curPieceRotation?: number;
    curScore: number;
    nextPieceIndex?: number;
    animatingRows: number[];
    animationOpacity: number;
    gameState: GameState;
}

interface BlockPosition {
    row: number;
    col: number;
}

const BLOCK_COLOR = '#ff3434';

const COMPLETING_LINE_COLOR = 'rgb(128, 255, 128)';

// Size of the single building block square.
const BLOCK_SIZE = 30;

// Take taken by the piece to move one row down.
const SPEED = 500;

// Opacity to reduce in one step while disappearing a completed row.
const OPACITY_STEP = 0.05;

// time interval in which disappearing row deduces it's opacity by taken by opacity by OPACITY_STEP
const LINE_DISAPPEARING_DELAY = 25;


export class TetrisBoard extends React.Component<Props, State> {

    private timer: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            setBlocks: [],
            curPiecePos: null,
            curScore: 0,
            animatingRows: [],
            animationOpacity: 1,
            gameState: 'FRESH'
        };
    }

    componentDidMount() {
        this.focusBoard();
    }

    componentDidUpdate() {
        this.focusBoard();
        if (this.state.animatingRows.length > 0) {
            setTimeout(() => {
                let newOpacity = Math.max(0, this.state.animationOpacity - OPACITY_STEP);
                if (newOpacity < 1e-9) {
                    this.clearLines();
                } else {
                    this.setState({
                        animationOpacity: newOpacity
                    });
                }
            }, LINE_DISAPPEARING_DELAY);
        }
    }

    componentWillUnmount() {
        if (this.timer !== void 0) {
            clearTimeout(this.timer);
        }
    }

    render() {
        let wallThickness = 5;
        let boardWidth = BLOCK_SIZE * this.props.columns + (this.props.columns + 1);
        let scoreWidth = 150;
        let height = BLOCK_SIZE * this.props.rows + (this.props.rows + 1);
        let marginLeft = -(scoreWidth + boardWidth / 2 + wallThickness);
        let marginTop = -(height / 2 + wallThickness);
        let arenaStyle = {
            width: boardWidth + scoreWidth + 2 * wallThickness,
            height: height,
            marginTop: marginTop,
            marginLeft: marginLeft
        };
        let nextPieceDom = null;
        if (this.state.nextPieceIndex !== void 0) {
            let colOffset = this.state.nextPieceIndex > 3 ? 1 : 0;
            nextPieceDom = this.getBlocksForPiece(this.state.nextPieceIndex, 0, {
                row: 1,
                col: colOffset
            }).map((block) => this.getSingleBlockDom(block, BLOCK_COLOR, 1.0));
        }

        return (
            <div className="ts-arena" style={arenaStyle}>
                <div className="ts-game-info">
                    <div className="ts-current-score">
                        <div className="ts-game-info-label ts-score-text">Score:</div>
                        <div className="ts-score-number">{this.state.curScore}</div>
                    </div>
                    <div className="ts-next-piece-info">
                        <div className="ts-game-info-label">Next:</div>
                        {nextPieceDom}
                    </div>
                </div>
                <div ref="tsBoard" className="ts-board" tabIndex={0} style={{width: boardWidth}}
                     onKeyDown={(event) => this.onKeyPress(event.keyCode)}>
                    {this.getStartButtonDom()}
                    {this.getPausedButtonDom()}
                    {this.getAllBlocks().map((block) => {
                        let backgroundColor = BLOCK_COLOR;
                        let opacity = 1.0;
                        if (this.state.animatingRows.indexOf(block.row) !== -1) {
                            backgroundColor = COMPLETING_LINE_COLOR;
                            opacity = this.state.animationOpacity;
                        }
                        return this.getSingleBlockDom(block, backgroundColor, opacity);
                    })}
                    {this.state.gameState === 'OVER' ? <div className="ts-game-over">Game Over!</div> : null}
                </div>
            </div>
        );
    }

    private getSingleBlockDom(block: BlockPosition, fillColor: string, opacity: number) {
        let left = block.col * BLOCK_SIZE + (block.col + 1);
        let top = block.row * BLOCK_SIZE + (block.row + 1);
        return (
            <div
                key={block.row + ':' + block.col}
                className="ts-block"
                style={{
                    left: left,
                    top: top,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                    backgroundColor: fillColor,
                    opacity: opacity
                }}
            >
            </div>
        );
    }

    private getStartButtonDom() {
        if (this.state.gameState === 'FRESH' || this.state.gameState === 'OVER') {
            return (
                <button className="ts-start-button" title="START"
                        onClick={() => this.onStartButtonClick()}>
                    {this.state.gameState === 'FRESH' ? 'Start' : 'Replay'}
                </button>
            );
        }
        return null;
    }

    private focusBoard(): void {
        (ReactDOM.findDOMNode(this.refs.tsBoard) as HTMLDivElement).focus();
    }

    private onStartButtonClick() {
        this.setState({
            gameState: 'PLAYING',
            setBlocks: [],
            curPiecePos: null,
            curScore: 0
        }, () => {
            this.callEveryNMs(() => {
                return this.updateBoard();
            }, SPEED);
        });
    }

    private onPauseButtonClick() {
        let gameState = this.state.gameState;
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
            let newGameState: GameState = gameState === 'PLAYING' ? 'PAUSED' : 'PLAYING';
            this.setState({
                gameState: newGameState
            });
        }
    }

    private getAllBlocks() {
        return this.state.setBlocks.concat(this.getCurrentPieceBlocks());
    }

    private getCurrentPieceBlocks(): BlockPosition[] {
        if (this.state.curPiecePos !== null) {
            return this.getBlocksForPiece(
                this.state.curPieceType as number,
                this.state.curPieceRotation as number,
                this.state.curPiecePos as BlockPosition
            );
        }
        return [];
    }

    private getBlocksForPiece(pieceType: number, rotation: number, position: BlockPosition) {
        return pieces[pieceType][rotation].map((block) => {
            return {
                row: block.row + position.row,
                col: block.col + position.col
            };
        });
    }

    private updateBoard(): boolean {
        if (this.state.gameState === 'PAUSED') {
            return true;
        }
        if (this.canMoveDown()) {
            (this.state.curPiecePos as BlockPosition).row++;
            this.setState({curPiecePos: this.state.curPiecePos});
            return true;
        }

        let newSetBlocks = this.getAllBlocks();

        let rowIds = this.getCompletedRowIDs(newSetBlocks);
        if (rowIds.length > 0) {
            this.setState({
                setBlocks: newSetBlocks,
                curPiecePos: null,
                animatingRows: rowIds,
                animationOpacity: 1.0
            });
            return false;
        }

        let newPieceIndex = this.state.nextPieceIndex !== void 0
            ? this.state.nextPieceIndex
            : getRandomInteger(0, pieces.length - 1);
        let startRow = 0,
            startCol = Math.floor(
                (this.props.columns - (newPieceIndex > 4 ? 0 : 1)) / 2
            ),
            newPiecePos = {row: startRow, col: startCol};

        if (this.canStartNewPiece(newPieceIndex, newPiecePos)) {
            this.setState({
                setBlocks: newSetBlocks,
                curPiecePos: newPiecePos,
                curPieceType: newPieceIndex,
                nextPieceIndex: getRandomInteger(0, pieces.length - 1),
                curPieceRotation: 0
            });
            return true;
        } else {
            this.setState({
                setBlocks: newSetBlocks,
                curPiecePos: null,
                gameState: 'OVER'
            });
            return false;
        }
    }

    private getCompletedRowIDs(blocks: BlockPosition[]): number[] {
        let groups = _.pickBy(_.groupBy(blocks, 'row'), (group, rowId) => {
            return group.length === this.props.columns;
        });
        return Object.keys(groups).map((key) => {
            return +key;
        });
    }

    private clearLines(): void {
        let blocksByRow: BlockPosition[][] = [];
        this.state.setBlocks.forEach((block) => {
            let rowIndexFromBottom = this.props.rows - 1 - block.row;
            blocksByRow[rowIndexFromBottom] = blocksByRow[rowIndexFromBottom] || [];
            blocksByRow[rowIndexFromBottom].push(block);
        });

        let reducedBlocksByRow: BlockPosition[][] = [];
        let clearedLines = 0;
        for (let rowIndex = 0; rowIndex < blocksByRow.length; rowIndex++) {
            if (blocksByRow[rowIndex].length < this.props.columns) {
                reducedBlocksByRow.push(blocksByRow[rowIndex]);
            } else {
                clearedLines++;
            }
        }

        if (clearedLines === 0) {
            return;
        }

        let updatedBlocks: BlockPosition[] = [];
        for (let rowIndex = 0; rowIndex < reducedBlocksByRow.length; rowIndex++) {
            updatedBlocks = updatedBlocks.concat(
                reducedBlocksByRow[rowIndex].map((block) => {
                    return {
                        row: this.props.rows - 1 - rowIndex,
                        col: block.col
                    }
                })
            );
        }

        this.setState({
            setBlocks: updatedBlocks,
            curScore: this.state.curScore + clearedLines,
            animatingRows: []
        }, () => {
            this.callEveryNMs(() => {
                return this.updateBoard();
            }, SPEED);
        });
    }

    private canMoveDown() {
        return this.canShiftPiece(1, 0, 0);
    }

    private canMoveLeft() {
        return this.canShiftPiece(0, -1, 0);
    }

    private canMoveRight() {
        return this.canShiftPiece(0, 1, 0);
    }

    private canRotate() {
        return this.canShiftPiece(0, 0, 1);
    }

    private canShiftPiece(rowShift: number, colShift: number, rotationShift: number) {
        if (this.state.curPiecePos === null) {
            return false;
        }

        let hash: number[][] = [];
        this.state.setBlocks.forEach((block) => {
            hash[block.row] = hash[block.row] || [];
            hash[block.row][block.col] = 1;
        });

        let newPos = {
            row: this.state.curPiecePos.row + rowShift,
            col: this.state.curPiecePos.col + colShift
        };
        let newRotation = (this.state.curPieceRotation as number + rotationShift) % 4;
        let newBlocks = this.getBlocksForPiece(
            this.state.curPieceType as number,
            newRotation,
            newPos
        );

        let isClash = false;
        newBlocks.forEach((block) => {
            if (isClash) {
                return;
            }
            if (block.row >= this.props.rows || block.row < 0 ||
                block.col >= this.props.columns || block.col < 0) {
                isClash = true;
                return;
            }
            hash[block.row] = hash[block.row] || [];
            if (hash[block.row][block.col]) {
                isClash = true;
            }
        });

        return !isClash;
    }

    private canStartNewPiece(newPieceType: number, newPiecePosition: BlockPosition) {

        let hash: number[][] = [];
        this.getAllBlocks().forEach((block) => {
            hash[block.row] = hash[block.row] || [];
            hash[block.row][block.col] = 1;
        });

        let isClash = false;
        let newMovingBlocks = this.getBlocksForPiece(newPieceType, 0, newPiecePosition);
        newMovingBlocks.forEach((block) => {
            if (isClash) {
                return;
            }
            hash[block.row] = hash[block.row] || [];
            if (hash[block.row][block.col]) {
                isClash = true;
            }
        });

        return !isClash;
    }

    private callEveryNMs(func: () => boolean, interval: number): void {
        if (func()) {
            this.timer = setTimeout(() => {
                this.callEveryNMs(func, interval);
            }, interval);
        }
    }

    private onKeyPress(keyCode: number) {
        if (this.state.curPiecePos === null) {
            return;
        }
        // rotate!
        if (keyCode === 82) {
            if (this.canRotate()) {
                this.setState({
                    curPieceRotation: (this.state.curPieceRotation as number + 1) % 4
                });
            }
        } else if (keyCode === 37) {
            if (this.canMoveLeft()) {
                (this.state.curPiecePos as BlockPosition).col--;
                this.forceUpdate();
            }
        } else if (keyCode === 39) {
            if (this.canMoveRight()) {
                (this.state.curPiecePos as BlockPosition).col++;
                this.forceUpdate();
            }
        } else if (keyCode === 40) {
            if (this.canMoveDown()) {
                (this.state.curPiecePos as BlockPosition).row++;
                this.forceUpdate();
            }
        }
    }

    private getPausedButtonDom() {
        if (this.state.gameState === 'PAUSED' || this.state.gameState === 'PLAYING') {
            return (
                <div className="ts-pause-button" onClick={() => this.onPauseButtonClick()}>
                    {this.state.gameState === 'PAUSED' ? 'Resume' : 'Pause'}
                </div>
            );
        }

        return null;
    }
}

// Configuration of all pieces for all 4 rotations.
let pieces = [
    // square
    [
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}],
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}],
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}],
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}, {row: 1, col: 1}]
    ],
    // I
    [
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 3, col: 0}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}],
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 3, col: 0}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}]
    ],
    // L
    [
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 2, col: 1}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 2, col: -1}],
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 0, col: -1}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 0, col: 1}]
    ],
    // N
    [
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 2, col: 1}],
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: -1}, {row: 1, col: 0}],
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 2, col: 1}],
        [{row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: -1}, {row: 1, col: 0}]
    ],
    // T
    [
        [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: 1, col: 0}],
        [{row: 0, col: -1}, {row: 0, col: 0}, {row: 1, col: 0}, {row: -1, col: 0}],
        [{row: 0, col: -1}, {row: 0, col: 0}, {row: 0, col: 1}, {row: -1, col: 0}],
        [{row: 0, col: 1}, {row: 0, col: 0}, {row: 1, col: 0}, {row: -1, col: 0}]
    ],
    // Reverse L
    [
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 2, col: -1}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 0, col: -1}],
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}, {row: 0, col: 1}],
        [{row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}, {row: 2, col: 1}]
    ],
    // Reverse N
    [
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 1, col: -1}, {row: 2, col: -1}],
        [{row: 0, col: -2}, {row: 0, col: -1}, {row: 1, col: -1}, {row: 1, col: 0}],
        [{row: 0, col: 0}, {row: 1, col: 0}, {row: 1, col: -1}, {row: 2, col: -1}],
        [{row: 0, col: -2}, {row: 0, col: -1}, {row: 1, col: -1}, {row: 1, col: 0}],
    ]
];


function getRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
