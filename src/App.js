import React, { Component } from 'react'

//Constant (SABİTLER)

const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 50;
const MIN_PIPE_HEIGHT = 40;

//Pipe Sınıfı
class Pipe {
  constructor(ctx, height, space) {
    //Canvasın alınması
    this.ctx = ctx;
    //X koordinatı
    this.x = 50;
    //Y Koordinatı
    this.y = height ? HEIGHT - height : 0;
    //Genişlik
    this.width = PIPE_WIDTH;
    //Math random (0,1)
    //Uzunluk hesaplanması
    this.height = height || MIN_PIPE_HEIGHT + Math.random() * (HEIGHT - space - MIN_PIPE_HEIGHT * 2);
  }

  //Yeni bir pipe çizmek için gerekli fonksiyon
  draw() {

    //Rect rengi
    this.ctx.fillStyle = "#000";

    //Üst Pipe
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    //Alt Pipe
    //this.ctx.fillRect(50,firstPipeHeight + space,PIPE_WIDTH,secondPipeHeight);
  }

  update() {

  }
}


class App extends Component {

  constructor(props) {
    super(props);
    //Canvas referansının oluşturulması
    this.canvasRef = React.createRef();
    //Frame sayacı değişkeni
    this.frameCount = 0;

    //Kuşun geçeceği aralık
    this.space = 80
  }

  componentDidMount() {
    //Pipes dizisinin oluşturulması
    this.pipes = this.generatePipes();
    //Saniyede 60 FPS ile oyun döngüsünün yenilenmesi
    setInterval(this.gameLopp, 1000 / 60)
  }

  //Pipe oluşturmak için gerekli fonksiyon 
  generatePipes = () => {
    //Canvasın seçilmesi
    const ctx = this.canvasRef.current.getContext("2d");
    //İlk pipe 'ın oluşturulması
    const firstPipe = new Pipe(ctx, null, this.space);
    //İkinci Pipe'ın uzunluğunun hesaplanması
    const secondPipeHeight = HEIGHT - firstPipe.height - this.space;
    //İkinci Pipe'ın oluşturulması
    const secondPipe = new Pipe(ctx, secondPipeHeight, this.space);
    return [firstPipe, secondPipe]
  }

  //Oyun döngüsünün kurulması
  gameLopp = () => {
    this.update()
    this.draw()
  }

  //Pipeların oyun alanına çizilmesi
  draw = () => {
    this.pipes.forEach(pipe => pipe.draw())
  }

  update = () => {
    this.frameCount = this.frameCount + 1;
    if (this.frameCount % 30 === 0) {
      const pipes = this.generatePipes();
      this.pipes.push(...pipes)
    }
  }


  render() {
    return (
      <div className="App">
        <canvas
          ref={this.canvasRef}
          id="canvas"
          width={WIDTH}
          height={HEIGHT}
          style={{ marginTop: "24px", border: "1px solid #000000" }}
        >
          Your browser does not support the HTML5 canvas tag.
        </canvas>
      </div>
    )
  }
}

export default App;