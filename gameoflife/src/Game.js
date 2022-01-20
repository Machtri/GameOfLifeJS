import React from "react";
import "./Game.css";

const CELLSIZE = 16;
const WIDTH = 800;
const HEIGHT = 600;

class Cell extends React.Component {
  render() {
    const { x, y, z } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELLSIZE * x}px`,
          top: `${CELLSIZE * y}px`,
          width: `${CELLSIZE}px`,
          height: `${CELLSIZE}px`,
          background: `${z ? 'rgb(0,0,0,0)' : 'rgb(0,0,0)'}`
        }}
      />
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.rows = HEIGHT / CELLSIZE;
    this.cols = WIDTH / CELLSIZE;
    this.board = this.makeEmptyBoard();
  }

  state = {
    cells: [],
    interval: 100,
    isRunning: false,
  }

  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  }

  stopGame = () => {
    this.setState({ isRunning: false });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  handleIntervalChange = (event) => {
    this.setState({ interval: event.target.value });
  }

  runIteration() {
    console.log("running iteration");
    let newBoard = this.makeEmptyBoard();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let neighbors = this.calculateNeghbors(this.board, x, y);
        if (this.board[y][x][0]) {
          if (neighbors === 2 || neighbors === 3) {
            newBoard[y][x][0] = true;
          } else {
            newBoard[y][x][0] = false;
          }
        } else {
          if (!this.board[y][x][0] && neighbors === 3) {
            newBoard[y][x][0] = true;
          }
        }
      }
    }
    this.board = newBoard;
    this.setState({ cells: this.makeCells() });
    this.timeoutHandler = window.setTimeout(() => {
      this.runIteration();
    }, this.state.interval);
    
  }

  calculateNeghbors(board, x, y) {
    let neighbors = 0;
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];
      if (
        x1 >= 0 &&
        x1 < this.cols &&
        y1 >= 0 &&
        y1 < this.rows &&
        board[y1][x1][0] === true
      ) {
        neighbors++;
      }
    }
    return neighbors;
  }

  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  }

  handleClick = (event) => {
    const elemOffset = this.getElementOffset();
    const offsetX = event.clientX - elemOffset.x;
    const offsetY = event.clientY - elemOffset.y;
    const x = Math.floor(offsetX / CELLSIZE);
    const y = Math.floor(offsetY / CELLSIZE);
    if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
      this.board[y][x][0] = !this.board[y][x][0];
    }
    this.setState({ cells: this.makeCells() });
  }

  handleClear = () => {
    this.board = this.makeEmptyBoard();
    this.setState({ cells: this.makeCells() });
  }

  handleRandom = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.board[y][x][0] = (Math.random() >= 0.5);
      }
    }
    this.setState({ cells: this.makeCells() });
  }

  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < this.rows; y++) {
      board[y] = [];
      for (let x = 0; x < this.cols; x++) {
        board[y][x] = [];
        board[y][x][0] = false;
      }
    }
    return board;
  }

  makeCells() {
    let cells = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x][0]) {
          cells.push({ x, y, z: true });
        }
        else {
          cells.push({ x, y, z: false });
        }
      }
    }
    return cells;
  }

  render() {
    const { cells, isRunning } = this.state;
    return (
      <div>
        <div
          className="Board"
          style={{
            width: WIDTH,
            height: HEIGHT,
          }}
          onClick={this.handleClick}
          ref={(n) => {
            this.boardRef = n;
          }}
        >
          {cells.map((cell) => (
            <Cell x={cell.x} y={cell.y} z={cell.z} key={`${cell.x},${cell.y},${cell.z}`} />
          ))}
        </div>
        <div className="controls">
          Update every{" "}
          <input
            value={this.state.value}
            onchange={this.handleIntervalChange}
          />{" "}
          msec
          {isRunning ? (
            <button className="button" onClick={this.stopGame}>
              Stop
            </button>
          ) : (
            <button className="button" onClick={this.runGame}>
              Run
            </button>
          )}
          <button className="button" onClick={this.handleRandom}>Random</button>
          <button className="button" onClick={this.handleClear}>Clear</button>
        </div>
      </div>
    );
  }
}

export default Game;
