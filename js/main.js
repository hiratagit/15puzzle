"use strict";
{

    /*

    [ 1 ]
    - Puzzleクラスを作る
    - 指定したタイルを切り出す関数 renderTile()
       指定したタイルを指定した場所に切り出す関数を作る
       画像を切り出す drawImage()
    - 全てのタイルを描画 tilesの描画
      this.tilesプロパティとして各パネルを配列として設定する
    [ 2 ]
    - クリックイベントを設定 e.lientX e.clientY getBoundingClientRect()
    - クリックした位置を求める
    - 上下左右のタイルを調べる swapTile() とりあえずswitchを使う
    - クリックしたタイルを入れ替える
        クリックしたタイルの上下左右に15があれば入れ替える
    - 空白のタイルを動かせるようにする　shuffle() 空白の移動先
        ゲーム開始時にランダムに空白タイルが移動されている状況を作る
    - タイルをシャッフル
    - switch文の書き換えUDLR
    - 移動距離の差分を配列に destCol destRow switch書き換え
    - swapTilesの書き換え　UDLRのプロパティ化
    - 重複したコードをまとめる isOutside()
    - ゲームクリア画面を作成 renderGameClear()
    - クリア判定の実装 isComplete() shuffle()の修正
      shuffleした結果、たまたま終了状態になっていることを避ける
    - 不具合の修正する
    - 描画クラスを別クラスに切り出す
    - Puzzleクラスにアクセス プロパティの書き換え　メソッドの実装
    - 画像を差し替える renderTile()の修正
    - マジックナンバーをなくす
    - 
    */

    (() => {

      const button = document.getElementById('button');
      const easy = document.getElementById('easy');
      const difficult = document.getElementById('difficult');
      const reset = document.getElementById('reset');

     
      easy.addEventListener('click', () => {
        new PuzzleRenderer( new Puzzle(5), canvas );
        button.parentNode.removeChild(button);
      });

      difficult.addEventListener('click', () => {
        new PuzzleRenderer( new Puzzle(20), canvas );
        button.parentNode.removeChild(button);
      });

      reset.addEventListener('click', () => {
        location.reload(true);
      });
      

      class PuzzleRenderer {
        constructor(puzzle, canvas) {
          this.canvas = canvas;
          this.ctx = this.canvas.getContext('2d');
          this.puzzle = puzzle;

          this.img = document.createElement('img');
          this.img.src = 'img/ayahono.jpg';
          // this.img.src = 'img/animal1.png';

          this.img.addEventListener('load', () => {
            this.render();
          });

          this.TILE_SIZE = 70;

          this.canvas.addEventListener('click', e => {
            
              if(this.puzzle.getGameClearStatus()) return;

              const rect = this.canvas.getBoundingClientRect();
              const col = Math.floor((e.clientX - rect.left) / this.TILE_SIZE);
              const row = Math.floor((e.clientY - rect.top) / this.TILE_SIZE);

              this.puzzle.swapTile(col, row);
              this.render();
              
              if(this.puzzle.isComplete()) {
                this.renderGameClear();
                this.puzzle.setGameClearStatus(true);
              }
          });
        }

        render() {
          for(let row = 0; row < this.puzzle.getBoardSize(); row ++) {
            for(let col = 0; col < this.puzzle.getBoardSize(); col ++) {
              this.renderTile(this.puzzle.getTile(col, row), col, row);
            }
          }
        }

        renderTile(n, col, row) {

          this.ctx.drawImage(
            this.img,
            (n % this.puzzle.getBoardSize()) * this.TILE_SIZE,
            Math.floor(n / 4) * this.TILE_SIZE,
            this.TILE_SIZE,
            this.TILE_SIZE,
            col * this.TILE_SIZE, 
            row * this.TILE_SIZE,
            this.TILE_SIZE,
            this.TILE_SIZE
          );

          if( n === this.puzzle.getPuzzleLastIndex()) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(
              col * this.TILE_SIZE, 
              row * this.TILE_SIZE,
              this.TILE_SIZE,
              this.TILE_SIZE
            );
          }
        }

        renderGameClear() {
          // 一旦クリアして元の最後のピース画像(右下:lastIndex)をレンダリング
          // clearRect無しでもレンダリングはされる
          this.ctx.clearRect(
            (this.BOARD_SEZE - 1) * 70,
            (this.BOARD_SEZE - 1) * 70,
            70,
            70
          );

          this.ctx.drawImage(
            this.img,
            (this.puzzle.getBoardSize() - 1) * 70,
            (this.puzzle.getBoardSize() - 1) * 70,
            70,
            70,
            (this.puzzle.getBoardSize() - 1) * 70,
            (this.puzzle.getBoardSize() - 1) * 70,
            70,
            70
          );

          this.ctx.strokeStyle = 'yellow'
          this.ctx.lineWidth = 6;
          this.ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);
        }
      }

      class Puzzle {
        constructor(level) {

          this.level = level;

          this.tiles = [
            [ 0, 1, 2, 3 ],
            [ 4, 5, 6, 7 ],
            [ 8, 9, 10, 11 ],
            [ 12, 13, 14, 15 ]
          ];

          this.UDLR = [
            [ 0, -1],
            [ 0, 1 ],
            [ -1, 0 ],
            [ 1, 0 ]
          ];

          this.BOARD_SEZE = this.tiles.length; // 4
          this.PUZZLE_LASTINDEX = this.BOARD_SEZE ** 2 - 1 ;

          this.isCompleted = false;

          do {
            this.shuffle(this.level);
          } while(this.isComplete())

        }

        shuffle(level) {

          let blankCol = this.BOARD_SEZE - 1;
          let blankRow = this.BOARD_SEZE - 1;

          
          for(let i = 0; i < level; i++) {
            let destCol;
            let destRow;

            do {
              const n = Math.floor(Math.random() * this.BOARD_SEZE);
              destCol = blankCol + this.UDLR[n][0];
              destRow = blankRow + this.UDLR[n][1];

            }while(this.isOutside(destCol, destRow))

            [
              this.tiles[blankRow][blankCol],
              this.tiles[destRow][destCol]
            ] = 
            [
              this.tiles[destRow][destCol],
              this.tiles[blankRow][blankCol]
            ];           

            [ blankCol, blankRow ] = [ destCol, destRow ];

          }
        }

        swapTile(col, row) {

          if(this.tiles[row][col] === this.PUZZLE_LASTINDEX) return;

          let destCol;
          let destRow;

          for(let i = 0; i < 4; i++) {

              destCol = col + this.UDLR[i][0];
              destRow = row + this.UDLR[i][1];

              if(this.isOutside(destCol, destRow)) {
                continue;
              }

              if(this.tiles[destRow][destCol] === this.PUZZLE_LASTINDEX) {
                [
                  this.tiles[row][col],
                  this.tiles[destRow][destCol]
                ] = 
                [
                  this.tiles[destRow][destCol],
                  this.tiles[row][col]
                ];

                break;
              }
          }
        }

        isComplete() {
          let n = 0;

          for(let row = 0; row < this.BOARD_SEZE; row ++) {
            for(let col = 0; col < this.BOARD_SEZE; col ++) {
              if(this.tiles[row][col] !== n++) {
                return false;
              }
            }
          }

          return true;
        }

        isOutside(col, row) {
          return (
            col < 0 || 
            row < 0 || 
            col > this.BOARD_SEZE - 1 || 
            row > this.BOARD_SEZE - 1
          )
        }

        getBoardSize() {
          return this.BOARD_SEZE;
        }

        getPuzzleLastIndex() {
          return this.PUZZLE_LASTINDEX;
        }

        getGameClearStatus() {
          return this.isCompleted;
        }

        setGameClearStatus(boolean) {
          this.isCompleted = boolean;
        }

        getTile(col, row) {
          return this.tiles[row][col];
        }
      }

      const canvas = document.querySelector('canvas');
      if(canvas.getContext('2d') === 'undefined') return;

      // new PuzzleRenderer( new Puzzle(3), canvas );
        

        // class PuzzleRenderer {
        //     constructor(puzzle, canvas) {
        //         this.puzzle = puzzle;
        //         this.canvas = canvas;

        //         this.ctx = this.canvas.getContext('2d');
        //         this.TILE_SIZE = 70;

        //         this.img = document.createElement('img');
        //         this.img.src = 'img/animal2.png';
        //         this.img.addEventListener('load', () => {
        //             this.render();
        //         });

        //         this.canvas.addEventListener('click', e => {

        //             if(this.puzzle.getCompletedStatus()) return;

        //             const rect = this.canvas.getBoundingClientRect();
        //             // console.log(e.clientX - rect.left, e.clientY - rect.top);
        //             const col = Math.floor((e.clientX - rect.left) / this.TILE_SIZE);
        //             const row = Math.floor((e.clientY - rect.top) / this.TILE_SIZE);
        //             // console.log(col, row)

        //             this.puzzle.swapTiles(col, row);
        //             this.render();

        //             if(this.puzzle.isComplete()) {
        //                 this.puzzle.setCompletedStatus(true);
        //                 this.renderGameClear();
        //             }
        //         });
        //     }

        //     renderGameClear() {
        //         this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        //         this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //         this.ctx.font = '28px Arial';
        //         this.ctx.fillStyle = '#fff';
        //         this.ctx.fillText('GAME CLEAR!!', 40, 150);
        //     }

        //     render() {
        //         for(let row = 0; row < this.puzzle.getBoardSize(); row++) {
        //             for(let col = 0; col < this.puzzle.getBoardSize(); col++) {
        //                 this.renderTile(this.puzzle.getTile(row, col), col, row);
        //             }
        //         }
        //     }

        //     renderTile(n, col, row) {
        //         if(n === this.puzzle.getBlankIndex()) {
        //             this.ctx.fillStyle = '#eee';
        //             this.ctx.fillRect(
        //                 col * this.TILE_SIZE, 
        //                 row * this.TILE_SIZE, 
        //                 this.TILE_SIZE, 
        //                 this.TILE_SIZE
        //             );
        //         } else {
        //             this.ctx.drawImage(
        //                 this.img,
        //                 (n % this.puzzle.getBoardSize()) * this.TILE_SIZE,
        //                  Math.floor(n / this.puzzle.getBoardSize()) * this.TILE_SIZE,
        //                  this.TILE_SIZE, 
        //                  this.TILE_SIZE,
        //                 col * this.TILE_SIZE, 
        //                 row * this.TILE_SIZE, 
        //                 this.TILE_SIZE, 
        //                 this.TILE_SIZE
        //             );
        //         }
        //     }
        // }

        // class Puzzle {
        //     constructor(level) {
        //         this.level = level;
                
        //         this.tiles = [
        //             [0, 1, 2, 3],
        //             [4, 5, 6, 7],
        //             [8, 9, 10, 11],
        //             [12, 13, 14, 15],
        //         ];

        //         this.UDLR = [
        //             [0, -1], //up
        //             [0, +1], //down
        //             [-1, 0], //left
        //             [+1, 0], //right
        //         ]

        //         this.isCompleted = false;
        //         this.BOARD_SIZE = this.tiles.length;
        //         this.BLANK_INDEX = this.BOARD_SIZE ** 2 - 1;

        //         do {
        //             this.shuffle(this.level);
        //         } while (this.isComplete()) //いきなりクリアの状態を避ける

        //     }

        //     getBoardSize() {
        //         return this.BOARD_SIZE;
        //     }

        //     getBlankIndex() {
        //         return this.BLANK_INDEX;
        //     }

        //     getCompletedStatus() {
        //         return this.isCompleted;
        //     }

        //     setCompletedStatus(value) {
        //         this.isCompleted = value;
        //     }

        //     getTile(row, col) {
        //         return this.tiles[row][col];
        //     }

        //     shuffle(n) {
        //         let blankCol = this.BOARD_SIZE -1;
        //         let blankRow = this.BOARD_SIZE -1;

        //         for(let i = 0; i < n; i++) {
        //             let destCol;
        //             let destRow;

        //             do {
        //                 const dir = Math.floor(Math.random() * this.UDLR.length);

        //                 destCol = blankCol + this.UDLR[dir][0];
        //                 destRow = blankRow + this.UDLR[dir][1];

        //                 // switch (dir) {
        //                 //     case 0: //up
        //                 //         destCol = blankCol + UDLR[0][0];
        //                 //         destRow = blankRow + UDLR[0][1];
        //                 //     break;
        //                 //     case 1: // down
        //                 //         destCol = blankCol + UDLR[1][0];
        //                 //         destRow = blankRow + UDLR[1][1];
        //                 //         break;
        //                 //     case 2:  // left
        //                 //         destCol = blankCol + UDLR[2][0];
        //                 //         destRow = blankRow + UDLR[2][1];
        //                 //         break;
        //                 //     case 3: //right
        //                 //         destCol = blankCol + UDLR[3][0];
        //                 //         destRow = blankRow + UDLR[3][1];
        //                 //         break;
        //                 // }
        //             } while (this.isOutside(destCol, destRow));

        //             [
        //                 this.tiles[blankRow][blankCol],
        //                 this.tiles[destRow][destCol],
        //             ] = [
        //                 this.tiles[destRow][destCol],
        //                 this.tiles[blankRow][blankCol],
        //             ];

        //             [blankCol, blankRow] = [destCol, destRow];
        //         }
        //     }

        //     swapTiles(col, row) {
        //         if(this.tiles[row][col] === this.BLANK_INDEX) {
        //             return;
        //         }

        //         for(let i = 0; i < this.UDLR.length; i++) {
        //             const destCol = col + this.UDLR[i][0];
        //             const destRow = row + this.UDLR[i][1];

        //             // switch (i) {
        //             //     case 0: //up
        //             //         destCol = col;
        //             //         destRow = row - 1;
        //             //         break;
        //             //     case 1: // down
        //             //         destCol = col;
        //             //         destRow = row + 1;
        //             //         break;
        //             //     case 2:  // left
        //             //         destCol = col - 1;
        //             //         destRow = row;
        //             //         break;
        //             //     case 3: //right
        //             //         destCol = col + 1;
        //             //         destRow = row;
        //             //         break;
        //             // }

        //             if(this.isOutside(destCol, destRow)) {
        //                 continue;
        //             }

        //             if(this.tiles[destRow][destCol] === this.BLANK_INDEX) {
        //                 [
        //                     this.tiles[row][col],
        //                     this.tiles[destRow][destCol],
        //                 ] = [
        //                     this.tiles[destRow][destCol],
        //                     this.tiles[row][col],
        //                 ];

        //                 break;
        //             }
        //         }
        //     }

        //     isOutside(destCol, destRow) {
        //         return  (
        //             destCol < 0 || destCol > this.BOARD_SIZE -1 ||
        //             destRow < 0 || destRow > this.BOARD_SIZE -1
        //         );
        //     }

        //     isComplete() {
        //         let i = 0;
        //         for(let row = 0; row < this.BOARD_SIZE; row++) {
        //             for(let col = 0; col < this.BOARD_SIZE; col++) {
        //                 if(this.tiles[row][col] !== i++) {
        //                     return false;
        //                 }
        //             }
        //         }
        //         return true;
        //     }
        // }

        // const canvas = document.querySelector('canvas');
        // if(typeof canvas.getContext('2d') === 'undefined') return;

        // new PuzzleRenderer(new Puzzle(2), canvas);
    })();




   
    // let currentImgNum = 0;
    // let duringTime = 1000;
    // let timeoutId;
    // let isRunnning = false;

    // function draw() {
    //     const canvas = document.querySelector('canvas');
        
    //     if(typeof canvas.getContext === 'undefined') {
    //         return;
    //     }
    //     const ctx = canvas.getContext('2d');
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     const images = [
    //         'img/honoka.png',
    //         'img/ayane.png'
    //     ]

    //     const img = document.createElement('img');
    //     img.src = images[currentImgNum % 2];

    //     img.addEventListener('load', () => {
    //         // ctx.drawImage(img, 0, 0, 300, 300);

    //         const pattern = ctx.createPattern(img, 'repeat');

    //         ctx.fillStyle = pattern;
    //         ctx.fillRect(0, 0, canvas.width, canvas.height);
    //     })

    //     timeoutId = setTimeout(() => {
    //         currentImgNum ++;
    //         if(duringTime >= 200) {
    //             duringTime -= 100; 
    //         } else if(duringTime >= 100) 
    //         {
    //             duringTime -= 50;
    //         } else {
    //             duringTime = 20;
    //         }
    //         draw();
    //     }, duringTime);

    //     isRunnning = true;
    // }

    // draw();

    // window.addEventListener('click', () => {
    //     if(isRunnning) {
    //         clearTimeout(timeoutId);
    //         isRunnning = false;
    //         return;
    //     }

    //     duringTime = 1500;
    //     draw();
        
    // })




}