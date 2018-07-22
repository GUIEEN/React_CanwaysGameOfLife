import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { ButtonToolbar, MenuItem, DropdownButton } from 'react-bootstrap'

class Box extends React.Component {
  /*
    When we create a function in here, they're all going to be arrow function !
    Because we need to have word `this` bound appropriately.
    If not, it won't be referring to the right `this`.
  */
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col)
  }

  render() {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        onClick={this.selectBox}
      />
    )
  }
}

class Grid extends React.Component {
  render() {
    const width = this.props.cols * 14 + 1 // 14px * cols
    var rowsArr = []

    var boxClass = ''

    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        let boxId = i + '_' + j

        boxClass = this.props.gridFull[i][j] ? 'box on' : 'box off' // this will just be classes that we get from our CSS to show what color the box is gonna be

        rowsArr.push(
          // push JSX
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        )
      }
    }

    // style div in inline-style, needs two curly braces because we're within a tag. But when you're not inside a tag, you only need one curly brace
    return (
      <div className="grid" style={{ width: width }}>
        {rowsArr}
      </div>
    )
  }
}

class Buttons extends React.Component {
  handleSelect = evt => {
    this.props.gridSize(evt)
  }

  render() {
    return (
      <div className="center">
        <ButtonToolbar>
          <button className="btn btn-default" onClick={this.props.playButton}>
            Play
          </button>
          <button className="btn btn-default" onClick={this.props.pauseButton}>
            Pause
          </button>
          <button className="btn btn-default" onClick={this.props.clear}>
            Clear
          </button>
          <button className="btn btn-default" onClick={this.props.slow}>
            Slow
          </button>
          <button className="btn btn-default" onClick={this.props.fast}>
            Fast
          </button>
          <button className="btn btn-default" onClick={this.props.seed}>
            Seed
          </button>
          <DropdownButton
            title="Grid Size"
            id="size-menu"
            onSelect={this.handleSelect}
          >
            <MenuItem eventKey="1">20x10</MenuItem>
            <MenuItem eventKey="2">50x30</MenuItem>
            <MenuItem eventKey="3">70x50</MenuItem>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    )
  }
}

class Main extends React.Component {
  constructor() {
    super()
    /* NOTE_1
      the reason why I don't have these in `this.state` is because
      I'm going to reference the rows & columns when I originally create the state.
    */
    this.speed = 100 // how fast the program is gonna be running
    this.rows = 30
    this.cols = 50

    this.state = {
      generation: 0,
      // create an array that's as big as the rows variable && initialize all row & col to false
      gridFull: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false))
    }
  }

  selectBox = (row, col) => {
    let gridCopy = arrayClone(this.state.gridFull)
    gridCopy[row][col] = !gridCopy[row][col] // false <=> true
    this.setState({
      gridFull: gridCopy
    })
  }

  seed = () => {
    let gridCopy = arrayClone(this.state.gridFull)
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true
        }
      }
    }
    this.setState({
      gridFull: gridCopy
    })
  }

  playButton = () => {
    // Question :: Where's this.intervalId is coming from ??
    clearInterval(this.intervalId)
    this.intervalId = setInterval(this.play, this.speed)
  }

  pauseButton = () => {
    clearInterval(this.intervalId)
  }

  slow = () => {
    this.speed = 1000
    this.playButton()
  }
  fast = () => {
    this.speed = 100
    this.playButton()
  }
  clear = () => {
    var grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false))

    this.setState({
      gridFull: grid,
      generation: 0
    })
  }

  gridSize = size => {
    switch (size) {
      case '1':
        this.cols = 20
        this.rows = 10
        break
      case '2':
        this.cols = 50
        this.rows = 30
        break
      default:
        this.cols = 70
        this.rows = 50
        break
    }
    this.clear()
  }

  play = () => {
    let g = this.state.gridFull // curent state
    let g2 = arrayClone(this.state.gridFull) // clone

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let count = 0

        // parsing neighbors
        if (0 < i) {
          if (g[i - 1][j]) count++
          if (0 < j) if (g[i - 1][j - 1]) count++
          if (j < this.cols - 1) if (g[i - 1][j + 1]) count++
        }

        if (0 < j) if (g[i][j - 1]) count++
        if (j < this.cols - 1) if (g[i][j + 1]) count++

        if (i < this.rows - 1) {
          if (g[i + 1][j]) count++
          if (0 < j) if (g[i + 1][j - 1]) count++
          if (j < this.cols - 1) if (g[i + 1][j + 1]) count++
        }

        // Live or Not
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false
        if (!g[i][j] && count === 3) g2[i][j] = true
      }
    }

    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1
    })
  }

  componentDidMount() {
    this.seed()
    this.playButton()
  }

  render() {
    return (
      // JSX
      <div>
        <h1>The Game of Life</h1>
        <Buttons
          playButton={this.playButton}
          pauseButton={this.pauseButton}
          slow={this.slow}
          fast={this.fast}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />

        {/* pass variables( state variables & properties ) which will be props in their child component */}
        <Grid
          gridFull={this.state.gridFull}
          rows={this.rows}
          cols={this.cols}
          selectBox={this.selectBox}
        />
        <h2>Generations : {this.state.generation}</h2>
      </div>
    )
  }
}

const arrayClone = arr => {
  return JSON.parse(JSON.stringify(arr))
}

ReactDOM.render(<Main />, document.getElementById('root'))
