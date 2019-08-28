import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
    render() {
        return (
            <button
                className={'square ' + (this.props.isHighlighted ? 'highlighted' : '')}
                onClick={this.props.onClick}>
                {this.props.value}
            </ button>
        );
    }
}

class Board extends React.Component {
    renderRows() {
        const rowCount = 3;
        const columnCount = 3;

        let rows = [];
        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            let cells = [];
            for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
                cells.push(this.renderSquare((rowIndex * rowCount) + columnIndex));
            }
            rows.push(<div className="board-row" key={`A${rowIndex}`}>{cells}</div>);
        }
        return rows;
    }

    renderSquare(i) {
        const winningSquares = calculateWinningResult(this.props.squares);
        let isHighlighted = false;
        if (winningSquares != null) {
            isHighlighted = winningSquares.winningCells.includes(i);
        }

        return (
            <Square key={`B${i}`}
                value={this.props.squares[i]}
                index={i}
                isHighlighted={isHighlighted}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                {this.renderRows()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                col: null,
                row: null
            }],
            stepNumber: 0,
            xIsNext: true,
            isAscendingOrder: true,
            winningSquares: []
        }
    }

    getSortingLabel() {
        return 'Change order to ' + (this.state.isAscendingOrder ? "DESC" : "ASC");
    }

    renderSortingButton() {
        return (
            <button onClick={() => this.changeOrder()}>{this.getSortingLabel()}</button>
        );
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        const col = getColumnNumber(i);
        const row = getRowNumber(i);

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                col: col,
                row: row
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            winningSquares: []
        });
    }

    changeOrder() {
        this.setState({
            isAscendingOrder: !this.state.isAscendingOrder
        })
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const isSelectedStep = move === this.state.stepNumber;
            const desc = move ?
                'Go to move #' + move + ' (Col: ' + step.col + ', Row:' + step.row + ')' :
                'Go to game start';

            return (
                <li key={`C${move}`}>
                    <button className={(isSelectedStep ? 'current' : null)} onClick={() => this.jumpTo(move)}>
                        {desc}
                    </button>
                </li>
            )
        });

        const displayInfo = this.state.isAscendingOrder ? moves : moves.slice().reverse();

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        }
        else {
            const hasAvailableCells = current.squares.includes(null);
            if(hasAvailableCells) {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
            else {
                status = 'Draw';
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board squares={current.squares}
                        winningSquares={this.state.winningSquares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div className="status">{status}</div>
                    <div className="sortingButton">{this.renderSortingButton()}</div>
                    <ol>{displayInfo}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinningResult(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winningCells: lines[i],
                winner: squares[a]
            };
        }
    }
    return null;
}

function calculateWinner(squares) {
    const winnerResult = calculateWinningResult(squares);
    if (winnerResult != null) {
        return winnerResult.winner;
    }
    return null;
}

function getColumnNumber(index) {
    return (index % 3) + 1;
}

function getRowNumber(index) {
    return Math.ceil((index + 1) / 3);
}



// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

