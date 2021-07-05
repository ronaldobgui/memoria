import shuffle from "./shuffle.js";

import getDataURL from "./data-url.js";

// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];

type Data = string | null;

type DataCallback = (data: Data) => void;

class Piece {

  private name: string;

  private jqueryRef: JQuery<HTMLElement>;

  private checked: boolean = false;

  private dataShow: Data = null;

  private enabled: boolean = true;

  private static dataHide: Data = null;

  public constructor(name: string, htmlElement: HTMLElement) {

    this.name = name;

    this.jqueryRef = $(htmlElement);

  }

  public startDataShow(callback: DataCallback) {

    getDataURL(`./icons/${this.name}.png`, (dataShow) => {

      callback(this.dataShow = dataShow);

    });

  }

  public static startDataHide(callback: DataCallback) {

    getDataURL(`./icons/pergunta.png`, (dataHide) => {

      callback(this.dataHide = dataHide);

    })

  }

  public getJqueryRef() {

    return this.jqueryRef;

  }

  public getChecked() {

    return this.checked;

  }

  public check() {

    this.checked = true;

    this.jqueryRef.finish();

    this.jqueryRef.fadeTo(150, 0.5);

    return null;

  }

  private toogle(name: string, data: Data) {

    const alt = `icone ${name}`;

    this.jqueryRef.attr("alt", alt).attr("title", alt).finish();

    this.jqueryRef.animate({ marginTop: "-9px", marginBottom: "+9px", opacity: 0.5 }, 150, () => {

      this.jqueryRef.attr("src", data);

    }).animate({ marginTop: "-0px", marginBottom: "+0px", opacity: 1.0 }, 150);

    return this;

  }

  public show() {

    if (this.dataShow !== null) {

      this.toogle(this.name, this.dataShow);

    }

    return this;

  }

  public hide() {

    if (Piece.dataHide !== null) {

      this.toogle("pergunta", Piece.dataHide);

    }

    return null;

  }

  public wrong() {

    this.jqueryRef.finish();

    for (let i = 6; i >= 0; i -= 2) {

      this.jqueryRef.animate({ marginLeft: `${+i}px`, marginRight: `${-i}px` }, 50);

      this.jqueryRef.animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);

    }

    return this;

  }

  public start(callback: DataCallback) {

    // preload
    this.startDataShow(callback);

    // finish animations
    this.jqueryRef.finish();

    // hide if show
    this.hide();

    return this;

  }

  public enable() {

    if (!this.enabled) {

      this.enabled = true;

      this.jqueryRef.finish();

      this.jqueryRef.fadeTo(150, 1.0);

    }

  }

  public disable() {

    if (this.enabled) {

      this.enabled = false;

      this.jqueryRef.finish();

      this.jqueryRef.fadeTo(150, 0.5);

    }

  }

  public static equals(piece1: Piece, piece2: Piece) {

    return piece1.name === piece2.name;

  }

}

function createPairNameList(valueList: string[], length: number) {

  const pairNameList = shuffle(valueList).slice(0, length / 2);

  return shuffle(pairNameList, pairNameList);

}

function createPieceList(pairNameList: string[], jqueryRef: JQuery<HTMLElement>) {

  const pieceList: Piece[] = [];

  jqueryRef.each(function (index) {

    pieceList[index] = new Piece(pairNameList[index], this);

  })

  return pieceList;

}

interface DataGame {

  enabled: boolean;

  timeout: number;

  pieceList: Piece[] | null;

  piece1: Piece | null;

  piece2: Piece | null;

}

function createDataGame(): DataGame {

  return {

    enabled: false,

    timeout: 0,

    pieceList: null,

    piece1: null,

    piece2: null

  }

}

// document ready
$(function () {

  // start dataHide
  Piece.startDataHide(function () {

    const jqueryRef = $(".piece");

    const data = createDataGame();

    jqueryRef.each(function (index) {

      // add onclick event
      $(this).on("click", function () {

        // enable to click and pieceList exists 
        if (data.enabled && data.pieceList !== null) {

          // piece is not checked
          if (!data.pieceList[index].getChecked()) {

            // piece1 not selected
            if (data.piece1 === null) {

              data.piece1 = data.pieceList[index].show();

            }

            // piece is not piece1 and piece2 not selected
            else if (data.piece1 !== data.pieceList[index] && data.piece2 === null) {

              data.piece2 = data.pieceList[index].show();

              if (data.piece1 !== null && data.piece2 !== null) {

                // pieces equals
                if (Piece.equals(data.piece1, data.piece2)) {

                  data.timeout = window.setTimeout(() => {

                    if (data.piece1 !== null && data.piece2 !== null) {

                      data.piece1 = data.piece1.check();
                      data.piece2 = data.piece2.check();

                    }

                  }, 400);

                }

                // pieces different
                else data.timeout = window.setTimeout(() => {

                  if (data.piece1 !== null && data.piece2 !== null) {

                    data.piece1 = data.piece1.hide();
                    data.piece2 = data.piece2.hide();

                  }

                }, 800);

              }

            }

            else data.pieceList[index].wrong();
          }

          else data.pieceList[index].wrong();

        }

      })

    })

    function start() {

      data.enabled = false;

      window.clearTimeout(data.timeout);

      data.timeout = 0;

      const pairNameList = createPairNameList(valueList, jqueryRef.length);

      data.pieceList = createPieceList(pairNameList, jqueryRef);

      data.pieceList.forEach(piece => piece.disable());

      (function interval(index: number) {

        if (index < data.pieceList.length) {

          data.pieceList[index++].start(function () {

            return window.setTimeout(() => interval(index), 50);

          })

        }

        else data.enabled = true;

      })(0);

      data.piece1 = null;

      data.piece2 = null;

    }

    // inicia
    start();

    // adiciona evento ao botao
    $("#restart").on("click", start);

    // easter egg
    let over = false;

    $("#link").on("pointerover", function () {

      over = true;

    })

    $("#link").on("pointerout", function () {

      over = false;

    })

    $(document).on("keydown", function (event) {

      if (data.enabled && over && event.key === "r") {

        data.pieceList!.forEach(function (piece) {

          if (!piece.getChecked() && piece !== data.piece1 && piece !== data.piece2) {

            piece.show();

            piece.getJqueryRef().finish();

          }

        })

      }

    })

    $(document).on("keyup", function (event) {

      if (event.key === "r") {

        data.pieceList!.forEach(function (piece) {

          if (!piece.getChecked() && piece !== data.piece1 && piece !== data.piece2) {

            piece.hide();

            piece.getJqueryRef().finish();

          }

        })

      }

    })

  })

})