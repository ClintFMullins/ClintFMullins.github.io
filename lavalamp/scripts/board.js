var cx = cx || {};

cx.Board = function(opts) {
  opts = $.extend({}, this.DEFAULTS, opts);
  this.rowCount = opts.rowCount;
  this.columnCount = opts.columnCount;
  this.width = opts.width;
  this.height = opts.height;
  this.squareWidth = this.width / this.columnCount;
  this.squareHeight = this.height / this.rowCount;
  this.$canvas = $('#game-canvas');
  this.$canvas.attr('width', this.width);
  this.$canvas.attr('height', this.height);
  this.grid = this.createGrid();
  this.hue = 0;
  this.$body = $('body');
  this.$canvas.on('click', (event) => {
    var canvasX = event.offsetX;
    var canvasY = event.offsetY;
    var columnIndex = Math.floor((canvasX * this.columnCount) / this.width);
    var rowIndex = Math.floor((canvasY * this.rowCount) / this.height);
    var square = this.grid[rowIndex][columnIndex];

    if (event.ctrlKey) {
      console.log('steal')
      this.hue = square.hue[0];
      this.$body.css({ background: 'hsl(' + this.hue + ', 100%, 80%)' })
      return;
    }
    console.log(this.hue)
    square.queueAttribute("hue", this.hue);
    square.nextAttribute("hue");
    square.counter = 10000;
  });
};

cx.Board.prototype.DEFAULTS = {
  width:       1000,
  height:      1000,
  rowCount:    50,
  columnCount: 50
};

cx.Board.prototype.oneCycle = function() {
  for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
    for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
      var currentSquare = this.grid[rowIndex][columnIndex];
      var adjacentSquares = this.getAdjacent(rowIndex, columnIndex);
      this.queueSquareHue(currentSquare, adjacentSquares);
      if (currentSquare.counter) {
        continue;
      }
      currentSquare.nextAttribute("hue");
    }
  }
  this.drawGrid();
}

cx.Board.prototype.queueSquareHue = function(square, adjacentSquares) {
  var averageColor = cx.color.getCircleAverage(adjacentSquares.listAttribute("hue"));
  var nextColorForSquare = cx.color.getInfluencedHue(square.getAttribute("hue"), averageColor);
  if (square.counter && square.counter > 0) {
    square.counter--;
    return;
  }

  square.queueAttribute("hue", nextColorForSquare);
};

cx.Board.prototype.createGrid = function() {
  var tempGrid = [];
  for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
    var row = [];
    for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
      var x1 = columnIndex * this.squareWidth;
      var y1 = rowIndex * this.squareHeight;
      var x2 = x1 + this.squareWidth;
      var y2 = y1 + this.squareHeight;

      var tempSquare = new cx.Square(rowIndex, columnIndex,
                                     {x1: x1,
                                      y1: y1,
                                      x2: x2,
                                      y2: y2, hue: parseInt(Math.random() * 359)});
      row.push(tempSquare);
    }
    tempGrid.push(row);
  }
  return tempGrid;
};

cx.Board.prototype.drawGrid = function() {
  var context = this.$canvas.get(0).getContext('2d');
  for (var rowIndex = 0; rowIndex < this.rowCount; rowIndex++) {
    for (var columnIndex = 0; columnIndex < this.columnCount; columnIndex++) {
      var currentSquare = this.grid[rowIndex][columnIndex];
      context.beginPath();
      context.rect(currentSquare.x1, currentSquare.y1, currentSquare.x2, currentSquare.y2);
      context.fillStyle = 'hsl(' + currentSquare.getAttribute('hue') + ', 100%, 80%)';
      context.fill();
    }
  }
};

cx.Board.prototype.getAdjacent = function(rowIndex, columnIndex) {
  adjacentSquares = [];
  if (rowIndex > 0 && columnIndex > 0) {
    adjacentSquares.push(this.grid[rowIndex - 1][columnIndex - 1]);
  }

  if (rowIndex > 0) {
    adjacentSquares.push(this.grid[rowIndex - 1][columnIndex]);
  }

  if (columnIndex > 0) {
    adjacentSquares.push(this.grid[rowIndex][columnIndex - 1]);
  }

  if (rowIndex < this.rowCount - 1 && columnIndex < this.columnCount - 1) {
    adjacentSquares.push(this.grid[rowIndex + 1][columnIndex + 1]);
  }

  if (rowIndex < this.rowCount - 1) {
    adjacentSquares.push(this.grid[rowIndex + 1][columnIndex]);
  }

  if (columnIndex < this.columnCount - 1) {
    adjacentSquares.push(this.grid[rowIndex][columnIndex + 1]);
  }

  if (rowIndex < this.rowCount - 1 && columnIndex > 0) {
    adjacentSquares.push(this.grid[rowIndex + 1][columnIndex - 1]);
  }

  if (columnIndex < this.columnCount - 1 & rowIndex > 0) {
    adjacentSquares.push(this.grid[rowIndex - 1][columnIndex + 1]);
  }

  return new cx.SquareCollection(adjacentSquares);
};
