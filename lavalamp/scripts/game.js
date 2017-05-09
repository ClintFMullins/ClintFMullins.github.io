var cx = cx || {};

cx.Game = function() {
  this.board = new cx.Board();
};

cx.Game.prototype.initialize = function() {
  this.board.drawGrid();
};

$(function() {
  var game = new cx.Game();
  game.initialize();

  function gameCycleRecursionShiiiiit() {
    game.board.oneCycle();
    requestAnimationFrame(gameCycleRecursionShiiiiit);
  }
  requestAnimationFrame(gameCycleRecursionShiiiiit);
});
