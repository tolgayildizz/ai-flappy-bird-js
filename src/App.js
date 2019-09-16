import React, { Component } from 'react'

//Constant (SABİTLER)

const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 80;
const MIN_PIPE_HEIGHT = 40;
const FPS = 120;

class Bird {
  constructor(ctx, height, space) {
    //Canvasın alınması
    this.ctx = ctx;
    //X koordinatı
    this.x = 150;
    //Y Koordinatı
    this.y = 150;
    //Yerçekimi
    this.gravity = 0;
    //İvme
    this.velocity = 0.1;
  }

  //Yeni bir kuş çizmek için gerekli fonksiyon
  draw() {

    //Kuş rengi
    this.ctx.fillStyle = "red";
    //Yeni bir path başlatma
    this.ctx.beginPath();
    //Daire çizimi
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    //daire içinin doldurulması
    this.ctx.fill();
  }

  update() {
    //Yer çekimini her frame de ivmeyle arttırdık
    this.gravity += this.velocity;
    //Maksimum gravity 4 olsun dedik
    this.gravity = Math.min(4, this.gravity);
    //Yer çekimini y eksenine ekledik
    this.y += this.gravity;
  }

  jump = () => {
    //Zıplandığında uygulanacak kuvvet
    this.gravity = -3;
  }

}



//Pipe Sınıfı
class Pipe {
  constructor(ctx, height, space) {
    //Canvasın alınması
    this.ctx = ctx;
    //X koordinatı
    this.x = WIDTH;
    //Y Koordinatı
    this.y = height ? HEIGHT - height : 0;
    //Genişlik
    this.width = PIPE_WIDTH;
    //Ölü borular
    this.isDead = false;
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
    this.x -= 1;
    if( (this.x + PIPE_WIDTH) < 0 ) {
      this.isDead = true;
    }
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
    this.space = 120;

    //Borular 
    this.pipes = [];
    //Eğitilecek kuşlar
    this.birds = [];
  }

  componentDidMount() {
    //Kullanıcının space e basması
    document.addEventListener('keydown', this.onkeydown);
    //Context oluşturulması
    const ctx = this.getCtx();
    //Pipes dizisinin oluşturulması
    this.pipes = this.generatePipes();
    //Kuş oluşturma
    this.birds = [new Bird(ctx)];
    //Saniyede 60 FPS ile oyun döngüsünün yenilenmesi
    setInterval(this.gameLopp, 1000 / FPS)
  }

  onkeydown = (e) => {
    //Space e basıldığında
    console.log(e.code)
    if(e.code === "Space") {
      this.birds[0].jump();
    }
  }

  //Pipe oluşturmak için gerekli fonksiyon 
  generatePipes = () => {
    //Canvasın seçilmesi
    const ctx = this.getCtx();
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

  getCtx = () => this.canvasRef.current.getContext("2d");

  //Pipeların oyun alanına çizilmesi
  draw = () => {
    //Canvasın seçilmesi
    const ctx = this.getCtx();
    //Canvasın sıfırlanması
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //Boruların çizilmesi
    this.pipes.forEach(pipe => pipe.draw());
    //Kuşların çizilmesi
    this.birds.forEach(bird => bird.draw());
  }

  update = () => {
    //Frame sayısının arttırılması
    this.frameCount = this.frameCount + 1;
    
    //3 saniye de bir yeni boru eklenmesi
    if (this.frameCount % 320 === 0) {
    
      //Boru oluştur
      const pipes = this.generatePipes();
    
      //Borular dizisine ekle
      this.pipes.push(...pipes)

      //Oyun bittimi kontrolü 
      this.isGameOver();
    }
    
    //Boruların pozisyonunun güncellenmesi
    this.pipes.forEach(pipe => pipe.update());
    
    //Ölü boruların filtrelenmesi
    this.pipes = this.pipes.filter(pipe => !pipe.isDead);
    
    //Kuşların pozisyonunun güncellenmesi
    this.birds.forEach(bird => bird.update());

    
  }

  isGameOver = () => {
    //Çarpmaları bulmak
    this.birds.forEach((bird) => {
      this.pipes.forEach((pipe) => {
        //Borunun Sol Üst Kısmı
        const pipeTopLeft = {x: pipe.x, y: pipe.y};
        //Borunun Sağ Üst Kısmı (x + boru uzunluğu)
        const pipeTopRight = {x: pipe.x + pipe.width, y: pipe.y};
        //Borunun Sol Alt Kısmı
        const pipeBottomLeft = {x: pipe.x, y: pipe.y + pipe.height };
        //Borunun Sağ Alt Kısmı
        const pipeBottomRight = {x: pipe.x + pipe.width, y: pipe.y + pipe.height };
        if(bird.x > pipeTopLeft.x && bird.x < pipeTopRight.x
          && bird.y > pipeTopLeft.y && bird.y < pipeBottomLeft.y) {
          console.log("Game Over")
          return true;
        }
        
      })
    })

    return false;
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