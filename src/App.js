import React, { Component } from 'react'
import { NeuralNetwork } from './neural/nn';
import './App.css'

//Constant (SABİTLER)
const TOTAL_BIRDS = 1000;
const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 20;
const MIN_PIPE_HEIGHT = 40;
const FPS = 120;
const SPEED_MODE_FPS = 480;
const BIRD_START_X = 150;



class Bird {
  constructor(ctx, brain) {
    //Canvasın alınması
    this.ctx = ctx;
    //X koordinatı
    this.x = BIRD_START_X;
    //Y Koordinatı
    this.y = 150;
    //Kuşun durumu
    this.isDead = false;
    //Kuşun yaşı
    this.age = 0;
    //Kuşun sağlığı
    this.fitness = 0;
    //Yerçekimi
    this.gravity = 0;
    //İvme
    this.velocity = 0.1;
    //Neural Network Kullanımı
    if (brain) {
      this.brain = brain.copy();
      this.mutate();
    }
    else {
      this.brain = new NeuralNetwork(6, 10, 1);
    }
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

  update(pipeX, spaceStartY, spaceEndY) {
    //Kuşun yaşının artması
    this.age += 1;
    //Yer çekimini her frame de ivmeyle arttırdık
    this.gravity += this.velocity;
    //Maksimum gravity 4 olsun dedik
    this.gravity = Math.min(4, this.gravity);
    //Yer çekimini y eksenine ekledik
    this.y += this.gravity;
    //Kuşun düşünmesi
    this.think(pipeX, spaceStartY, spaceEndY);

    //Kuşun düşmesinin engellenmesi
    if (this.y < 0) {
      this.y = 0;
    }
    else if (this.y > HEIGHT) {
      this.y = HEIGHT;
    }

  }

  //Tahmin fonksiyonu

  think = (pipeX, spaceStartY, spaceEndY) => {
    //Giriş değerleri
    const inputs = [
      //Kuşun kordinatları
      Math.abs((this.x - pipeX) / WIDTH).toFixed(2),
      (this.y / HEIGHT).toFixed(2),
      //Boşluğun koordinatları
      (spaceStartY / HEIGHT).toFixed(2),
      (spaceEndY / HEIGHT).toFixed(2),
      //Yer çekimi
      (this.gravity / 4).toFixed(2),
      //Genişlik
      ((this.x + PIPE_WIDTH) / WIDTH).toFixed(2),
    ];
    //0 ile 1 arasında değer döner //Output katmanı
    const output = this.brain.predict(inputs);
    //console.log(inputs)
    if (output[0] < 0.5) {
      this.jump();
    }
  }

  //Kuş mutasyon fonksiyonu 
  mutate = () => {
    this.brain.mutate((x) => {
      if (Math.random() < 0.2) {
        const offset = Math.random();
        return x + offset;
      }
      return x;
    });
  }


  jump = () => {
    //Zıplandığında uygulanacak kuvvet
    this.gravity = -3;
  }

}

let counter = 0;

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
    if ((this.x + PIPE_WIDTH) < 0) {
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
    //Eğitim için kullanılacak ölü kuşları
    this.deadBirds = [];

    //Oyun Hızı 
    this.state = {
      shouldDraw: false,
      gameSpeed: FPS,
    };
  }

  componentDidMount() {
    this.startGame();
  }

  startGame = () => {
    //Sayaç ekleme 
    counter++;
    console.log("Jenerasyon : ", counter)

    if(counter > 0) {
      this.setState({shouldDraw:true});
    }

    this.frameCount = 0;
    clearInterval(this.loop);
    const ctx = this.getCtx();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    //Kullanıcının space e basması
    //document.addEventListener('keydown', this.onkeydown);
    //Pipes dizisinin oluşturulması
    this.pipes = this.generatePipes();
    //Kuş oluşturma
    this.birds = this.generateBirds();
    //Ölü kuşların sıfırlanması
    //this.deadBirds = [];
    //Saniyede 60 FPS ile oyun döngüsünün yenilenmesi
    this.loop = setInterval(this.gameLopp, 1000 / this.state.gameSpeed)
  }


  onkeydown = (e) => {
    //Space e basıldığında
    //console.log(e.code)
    if (e.code === "Space") {
      this.birds[0].jump();
    }
  }

  generateBirds = () => {
    const birds = [];
    const ctx = this.getCtx();
    for (let i = 0; i < TOTAL_BIRDS; i += 1) {
      //console.log(this.deadBirds)
      const brain = this.deadBirds.length && this.pickOne().brain;
      const newBird = new Bird(ctx, brain);
      birds.push(newBird);
    }
    return birds;
  };

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
    if(this.state.shouldDraw) {
      this.update()
    }
    else {
      for (let i = 0; i <1000; i++) {
        this.update();
      }
    }
    
    this.draw()
  }

  getCtx = () => this.canvasRef.current.getContext("2d");

  //Pipeların oyun alanına çizilmesi
  draw = () => {

    //Simülasyon da çizme
    if(!this.state.shouldDraw) {
      return;
    } 

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
    if ((this.frameCount % 300) === 0) {

      //Boru oluştur
      const pipes = this.generatePipes();

      //Borular dizisine ekle
      this.pipes.push(...pipes)
    }


    //Boruların pozisyonunun güncellenmesi
    this.pipes.forEach(pipe => pipe.update());

    //Ölü boruların filtrelenmesi
    this.pipes = this.pipes.filter(pipe => !pipe.isDead);

    //Kuşların pozisyonunun güncellenmesi
    this.birds.forEach(bird => {
      //En yakın boruyu almak
      const nextPipe = this.getNextPipe(bird);
      const spaceStartY = nextPipe.y + nextPipe.height;
      bird.update(nextPipe.x, spaceStartY, spaceStartY + this.space)
    });

    //Ölü kuşların bulunması
    this.updateBirdDeadState();

    //ölü Kuşların bir diziye alınması
    this.deadBirds.push(...this.birds.filter(bird => bird.isDead));
    //Ölü kuşların silinmesi
    this.birds = this.birds.filter(bird => !bird.isDead);

    //Oyun bittimi kontrolü 
    // if (this.isGameOver()) {
    //   //alert("Game Over");
    //   //clearInterval(this.loop);
    // }

    //Yeni jenarasyon kuşları oluşturma

    if (this.birds.length === 0) {
      let totalAge = 0;
      //Kümülatif yaşların toplanması
      this.deadBirds.forEach(deadBird => totalAge += deadBird.age);
      //Fitness oranı hesaplanması
      this.deadBirds.forEach((deadBird) => { deadBird.fitness = deadBird.age / totalAge;});
      // //En güçlü kuşu array de ilk sıraya alma
      // this.deadBirds.sort((a, b) => a.fitness >= b.fitness)
      // //En güçlü kuşun seçimi
      // const strongest = this.deadBirds[0];
      // //En güçlü kuşu  mutasyona uğrat
      // strongest.mutate();
      this.startGame();
    }

  }

  // olen kuslar arasindan bir tane kus sec
  pickOne = () => {
    let index = 0;
    let r = Math.random();
    while (r > 0) {
      r -= this.deadBirds[index].fitness;
      index += 1;
    }
    index -= 1;
    return this.deadBirds[index];
  }

  getNextPipe = (bird) => {
    for (let index = 0; index < this.pipes.length; index++) {
      if (this.pipes[index].x > bird.x) {
        return this.pipes[index];
      }
    }
  }

  updateBirdDeadState = () => {
    //Durum Değişkeni
    let gameOver = false;
    //Çarpmaları bulmak
    this.birds.forEach((bird) => {
      this.pipes.forEach((pipe) => {
        if (bird.y <= 0 || bird.y >= HEIGHT || (bird.x >= pipe.x && bird.x <= pipe.x + pipe.width && bird.y >= pipe.y && bird.y <= pipe.y + pipe.height)) {
          //console.log("Game OVER");
          bird.isDead = true;
        }
        //console.log(bird.x, bird.y)
      })
    })
    //console.log("Oyun Devam")
    //return gameOver;
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
        <div>
          <input
            type="button"
            value={"Hızlandır"}
            onClick={() => { this.setState({ gameSpeed: SPEED_MODE_FPS }); this.startGame() }}
          />
        </div>
        {
          this.state.gameSpeed
        }
      </div>
    )
  }
}

export default App;