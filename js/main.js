class Config {
    static breackPointRatio = 1.34;
    static bgRatio = 2;
    static textureAtlasDir = 'images/';
    static imgExtension = 'png';
}

class Data {

    static getTextureAtlasUrls() {
        let arr = [];
        Data.textureAtlasNames.forEach(function(item) {
            arr.push(`${Config.textureAtlasDir}${item}.json`);
        });
        return arr;
    }

    static getSprite(imgName) {
        let texture = PIXI.TextureCache[`${imgName}.${Config.imgExtension}`];
        return new PIXI.Sprite(texture);
    }

    static randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    static shuffle(arr){
        let j, temp;
        for(let i = arr.length - 1; i > 0; i--){
            j = Math.floor(Math.random()*(i + 1));
            temp = arr[j];
            arr[j] = arr[i];
            arr[i] = temp;
        }
        return arr;
    }

    static sendRequest(request, f, url) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(request);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;

            if (xhr.status != 200) {
                console.log(xhr.status + ': ' + xhr.statusText);
            } else f(xhr.responseText);
        }
    }

    static initData(callback) {
        Data.sendRequest('test=1', init, 'data.json');

        function init(data) {
            data = JSON.parse(data);
            for (let k in data) Data[k] = data[k];
            callback();
        }
    }

    static addChild() {
       for (let i = 1; i < arguments.length; i++) arguments[0].addChild(arguments[i]);
    }
}

class Intro {

    constructor(app) {

        let bg = new PIXI.Sprite(PIXI.utils.TextureCache[`images/Bkg.jpg`]),
            characters = new PIXI.Sprite(PIXI.utils.TextureCache[`images/characters.png`]),
            logo = new PIXI.Sprite(PIXI.utils.TextureCache[`images/Logo.png`]),

            base = Data.getSprite('LB_Base'),

            ld_1 = Data.getSprite('ld_1'),
            ld_2 = Data.getSprite('ld_2'),
            ld_3 = Data.getSprite('ld_3'),

            container = new PIXI.Container(),
            ld = new PIXI.Container(),
            strip = new PIXI.Container();

        Data.addChild(strip, ld_1, ld_2, ld_3);
        Data.addChild(ld, base, strip);
        Data.addChild(container, characters, logo, ld);

        Data.addChild(app.stage, bg, container);

        ld_2.x = 48;
        ld_2.width = 0;
        ld_3.x = 48;

        base.position.set(29, 24);
        strip.position.set(0, 0);

        ld.scale.set(0.6);
        ld.position.set(310, 625);

        logo.position.set(190, 350);

        layout();

        window.addEventListener('resize', function() {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            layout();
        });

        this.progress = [ld_2, ld_3];
        this.bg = bg;
        this.container = container;

        function layout() {
            if (app.width / app.height > 1.78) {
                bg.width = app.width;
                bg.height = app.width / 1.78;
            } else {
                bg.height = app.height;
                bg.width = app.height * 1.78;
            }

            bg.x = (app.width - bg.width) / 2;
            bg.y = (app.height - bg.height) / 2;

            let ratio = container.width / container.height;

            if (app.width / app.height > ratio / 1.1) {
                container.height = +app.height / 1.1;
                container.width = container.height * ratio;
            } else {
                container.width =  app.width;
                container.height = container.width / 1.4
            }

            container.x = (app.width - container.width) / 2;
            container.y = (app.height - container.height) / 2;
        }

    }

    set progressValue(value) {
        let result = Math.round(4.73 * value);
        this.progress[0].width = result;
        this.progress[1].x = result + 48;
    }

    hide() {
        this.container.alpha = 0;
        this.bg.alpha = 0;
    }
}

class Start {

    static app() {

        let font1 = new FontFaceObserver('Roboto Condensed bold'),
            font2 = new FontFaceObserver('DIN Pro Cond Bold'),
            font3 = new FontFaceObserver('Roboto Condensed regular');

        Promise.all([font1.load(), font2.load(), font3.load()]).then(function () {
            Data.initData(start);
        });

        function start() {

            let app = new Application();
            loader(Data.loader, loadIntro, false);

            function loadIntro() {

                let intro = new Intro(app);
                loader(Data.getTextureAtlasUrls(), loadGame, intro);

                function loadGame() {
                    Data.sound = new Snd(function () {
                        intro.hide();

                        Controller.build(app);
                    }, app.app);
                    Data.sound.loadHandler = (perc) => intro.progressValue = Math.round(perc * 0.06 + 94);
                }
            }

            function loader(data, func, intro) {
                PIXI.loader
                    .add(data)
                    .on("progress", loadProgressHandler)
                    .load(function () {
                        func();
                    });

                function loadProgressHandler (loader, resource) {
                    if (intro) intro.progressValue = Math.round(loader.progress * 0.94);
                }
            }
        }

    }
}

class Snd {

    constructor(callback, app) {

        this.app = app;

        createjs.Sound.on('fileload', loaded);
        createjs.Sound.registerSounds(Data.audio, 'sounds/');
        this.s = createjs.Sound;
        this.rl = createjs.Sound.createInstance("reel");
        this.main = createjs.Sound.createInstance("main");

        this.LoadPerc = 0;
        this.loadHandler = ()=> console.log('soundLoad');
        createjs.Sound.on("fileload", this.sndLoader, this);

        let counter = 0;
        function loaded() {
           if(++counter == Data.audio.length) setTimeout(callback, 50);
        }

        this.acceessStopKick = true;
        this.acceessSpl = true;
        this.freeGame = false;
    }

    set fileload(func) {
        this.loadHandler = func;
    }

    set muted(status) {
        if (status) this.s.muted = true;
        else this.s.muted = false;
    }

    sndLoader() {
        this.LoadPerc+= 100 / Data.audio.length;
        this.loadHandler(Math.round(this.LoadPerc));
    }

    playMain() {
        this.main.volume = 0.4;
        this.main.play({loop:-1, volume: 0.4});
    }

    stopMain() {
        this.app.ticker.add(fade, this);

        function fade(delta) {
            this.main.volume -= 0.005 * delta;
            if(this.main.volume <= 0) {
                this.main.stop();
                this.app.ticker.remove(fade, this);
            }
        }
    }

    mainBtn() {
        this.s.play('3', {startTime: 46047, duration: 706, volume: 0.2});
    }

    reel() {
        this.rl.play({volume: 0.4, loop:-1});
    }

    reelStop() {
        this.rl.stop();
    }

    reelStopKick() {
        if (this.acceessStopKick) {
            this.s.play('3', {startTime: 47030, duration: 460, volume: 0.2});
            this.acceessStopKick = false;
            setTimeout(() => this.acceessStopKick = true, 10);
        }
    }

    win() {
        this.wn = this.s.play('3', {startTime: 39848, duration: 1990, volume: 0.2, loop:-1});
    }

    stopWin() {
        this.wn.stop();
    }

    bell() {
        this.s.play('3', {startTime: 37072, duration: 2329, volume: 0.1});
    }

    dinoSmall() {
        this.s.play('3', {startTime: 488, duration: 2102, volume: 0.2});
    }

    bonus() {
        this.s.play('3', {startTime: 8051, duration: 3078, volume: 0.2});
    }

    flash() {
        this.s.play('3', {startTime: 5518, duration: 492, volume: 0.2});
    }

    click() {
        this.s.play('2', {startTime: 20342, duration: 168, volume: 0.3});
    }

    hello() {
        this.s.play('3', {startTime: 32745, duration: 815, volume: 0.3});
    }

    hoy() {
        this.s.play('3', {startTime: 36014, duration: 495, volume: 0.3});
    }

    casing() {
         this.cs = this.s.play('1', {startTime: 488, duration: 6316, volume: 0.09});
    }

    stopCasing() {
        this.cs.stop();
    }

    dinoBig() {
        this.s.play('1', {startTime: 47234, duration: 3907, volume: 0.25});
    }

    shooting() {
        let shoot = this.s.play('3', {startTime: 16796, duration: 10009, volume: 0.25});
        this.main.volume = 0.05;

        this.app.ticker.add(pl, this);

        let frame = 0;
        function pl(delta) {
            if (frame >= 130) {
                if(this.main.volume < 0.4) this.main.volume += 0.0043 * delta;
                else if(this.main.volume > 0.4) this.main.volume = 0.4;
                shoot.volume -= 0.003 * delta;
                if(!shoot.volume)  this.app.ticker.remove(pl, this);

            }

            frame += delta;
        }
    }

    spl() {
        if (this.acceessSpl) {
            this.sp = this.s.play('3', {startTime: 48033, duration: 1652, volume: 0.4});
            this.acceessSpl = false;
            setTimeout(() => this.acceessSpl = true, 100);
        }
    }

    startFreeGame() {
        this.s.play('3', {startTime: 11550, duration: 4688, volume: 0.25});
    }

    freeGameBell() {
        this.s.play('1', {startTime: 7337, duration: 4718, volume: 0.25});
    }

    playFreeGame() {
       this.freeGame = this.s.play('5', {loop:-1, volume: 0});

        this.app.ticker.add(fade, this);
        function fade(delta) {
            this.freeGame.volume += 0.01 * delta;
            if(this.freeGame.volume >= 0.3) {
                this.freeGame.volume = 0.3;
                this.app.ticker.remove(fade, this);
            }
        }
    }

    stopFreeGame() {
        this.app.ticker.add(fade, this);

        function fade(delta) {
            this.freeGame.volume -= 0.02 * delta;
            if(this.freeGame.volume <= 0) {
                this.freeGame.volume = 0;
                this.freeGame.stop();
                this.app.ticker.remove(fade, this);
            }
        }
    }

    bigWin() {
        if(this.main.playState == 'playSucceeded') {
            this.stopMain();
            this.wait = 'playMain';
        } else {
            this.stopFreeGame();
            this.wait = 'playFreeGame';
        }

        this.bgWin = this.s.play('1', {startTime: 17149, duration: 29616, volume: 0.25});
    }

    bigWinStop() {
        let elm = this.s.play('1', {startTime: 12508, duration: 4179, volume: 0.08});

        this.app.ticker.add(fade, this);

        function fade(delta) {
            elm.volume += 0.01 * delta;
            if(elm.volume >= 0.25) {
                elm.volume = 0.25;
                this.app.ticker.remove(fade, this);
            }
        }

        this.bgWin.stop();
        setTimeout(this[this.wait].bind(this), 1500);
    }

    finalFreeGame() {

       if(this.sp) if(this.sp.playState == 'playSucceeded') {
           this.sp.volume = 0;
       }

        this.stopFreeGame();
        this.freeGameFinal = this.s.play('1', {startTime: 17149, duration: 29616, volume: 0.25});
    }

    finalFreeGame2() {

        let elm = this.s.play('1', {startTime: 12508, duration: 4179, volume: 0.08});
        this.app.ticker.add(fade, this);

        function fade(delta) {
            elm.volume += 0.01 * delta;
            if(elm.volume >= 0.25) {
                elm.volume = 0.25;
                this.app.ticker.remove(fade, this);
            }
        }

        this.freeGameFinal.stop();
    }

}

class Application {

    constructor() {
        this.app = new PIXI.Application({width: window.innerWidth, height: window.innerHeight});
        this.app.renderer.autoResize = true;
        this.stage = this.app.stage;
        this.renderer = this.app.renderer;

        let appView = this.app.view;
        appView.style.position = 'absolute';
        document.body.append(appView);
    }

    get ratio() {
       return this.app.renderer.width / this.app.renderer.height;
    }

    get width() {
        return this.app.renderer.width;
    }

    get height() {
        return this.app.renderer.height;
    }

}

class Element {

    constructor() {
        this.content = new PIXI.Container();
    }

    get width() {
        return this.content.width;
    }

    get height() {
        return this.content.height;
    }

    set width(val) {
        this.content.width = val;
    }

    set height(val) {
        this.content.height = val;
    }

    set x(val) {
        this.content.x = val;
    }

    set y(val) {
        this.content.y = val;
    }

    set visible(val) {
        this.content.visible = val;
    }

    addChild(elm) {
        this.content.addChild(elm);
    }

    removeChild(elm) {
        this.content.removeChild(elm);
    }

    makeFlash() {
        if (this.glow.alpha > 0 && this.glow.alpha < 1) {
            this.glowStep = Math.abs(this.glowStep);
        }
        else this.app.ticker.add(this._makeFlash, this);
    }

    _makeFlash() {
        this.glowX += this.glowStep;
        if(this.glowX < 0) this.glowX = 0;
        this.glowY = Math.pow(this.glowX,  0.8);
        this.glow.alpha = this.glowY;
        if(this.glow.alpha >= 0.8) this.glowStep = - 0.03;
        if(this.glow.alpha <= 0) {
            this.glowStep =  0.05;
            this.app.ticker.remove(this._makeFlash, this);
        }

    }

}

class LineTable extends Element {

    constructor(app) {
        super();

        let paylineIndTexture = [];
        Data.lineTable.board.forEach(function(item) {
            paylineIndTexture.push(PIXI.TextureCache[`${item}.${Config.imgExtension}`]);
        });

        let paylineInd = new PIXI.extras.AnimatedSprite(paylineIndTexture, false);

        this.addChild(paylineInd);

        let digit = Data.getSprite();
        this.addChild(digit);

        digit.alpha = 0;
        digit.y = 14;

        this.callback2 = null;

        this.digit = digit;
        this.paylineInd = paylineInd;
        this.frame = 0;
        this.app = app;
        this.content.alpha = 0.0001;
        this.currentLineId = 0;
        this.stop = false;
        this.lines = [1];
        this.app.ticker.add(this._paylineIndAnimStart, this);
    }

    _paylineIndAnimStart() {
        this.paylineInd.gotoAndPlay(this.frame);
        this.frame += 1;

        if (this.frame == 19) {
            this.frame = 0;
            this.app.ticker.remove(this._paylineIndAnimStart, this);
        }
    }

    _paylineIndAnim(delta) {

        if (delta > 5) delta = 5;
        this.paylineInd.gotoAndPlay(this.frame);
        this.frame += 0.34 * delta;

        if (this.paylineInd.currentFrame > 5 && this.paylineInd.currentFrame < 15) this.digit.alpha = 1;
        else this.digit.alpha = 0;

        if (this.frame - 0.34 * delta == 0) {

            this.callback();
            if(this.stop) {
                this.app.ticker.remove(this._paylineIndAnim, this);
                this.content.alpha = 0;
                this.frame = 0;
                this.stop = false;
            } else {
                if (this.currentLineId == this.lines.length) {
                    if (this.callback2) {
                        this.callback2();
                        this.callback2 = null;
                        this.stopLines();
                    } else this.currentLineId = 0;
                }

                if (this.start) {
                    this.digit.texture = PIXI.TextureCache[`${Data.lineTable.digit[this.lines[this.currentLineId] - 1]}.${Config.imgExtension}`];
                    this._setLineXY(this.lines[this.currentLineId]);
                    this.currentLineId++;
                    this.content.alpha = 1;
                }

            }

        } else if (this.frame >= this.paylineInd.totalFrames) this.frame = 0;

    }

    showLines(lines, callback, callback2) {
        this.callback = callback;
        if(callback2) this.callback2 = callback2;
        if (!this.start) {
            this.start = true;
            this.lines = lines;
            this.app.ticker.add(this._paylineIndAnim, this);
        }
    }

    _setLineXY(line) {

        if (line < 14) {
            this.paylineInd.scale.x = 1;
            this.digit.x = 96;
        } else {
            this.paylineInd.scale.x = -1;
            this.digit.x = -134;
        }

        switch (line) {
            case 1:
                this.content.position.set(63, 112);
                break;
            case 2:
                this.content.position.set(85, 143);
                break;
            case 3:
                this.content.position.set(63, 174);
                break;
            case 4:
                this.content.position.set(85, 205);
                break;
            case 5:
                this.content.position.set(63, 237);
                break;
            case 6:
                this.content.position.set(85, 269);
                break;
            case 7:
                this.content.position.set(63, 300);
                break;
            case 8:
                this.content.position.set(85, 331);
                break;
            case 9:
                this.content.position.set(63, 362);
                break;
            case 10:
                this.content.position.set(85, 394);
                break;
            case 11:
                this.content.position.set(63, 425);
                break;
            case 12:
                this.content.position.set(87, 457);
                break;
            case 13:
                this.content.position.set(63, 488);
                break;
            case 14:
                this.content.position.set(1359, 112);
                break;
            case 15:
                this.content.position.set(1382, 143);
                break;
            case 16:
                this.content.position.set(1359, 174);
                break;
            case 17:
                this.content.position.set(1382, 205);
                break;
            case 18:
                this.content.position.set(1359, 237);
                break;
            case 19:
                this.content.position.set(1382, 268);
                break;
            case 20:
                this.content.position.set(1359, 300);
                break;
            case 21:
                this.content.position.set(1382, 331);
                break;
            case 22:
                this.content.position.set(1359, 362);
                break;
            case 23:
                this.content.position.set(1382, 394);
                break;
            case 24:
                this.content.position.set(1359, 425);
                break;
            case 25:
                this.content.position.set(1382, 457);
                break;
            case 26:
                this.content.position.set(1382, 488);
                break;
        }

    }

    stopLines() {
        this.start = false;
        this.app.ticker.remove(this._paylineIndAnim, this);
        this.content.alpha = 0;
        this.frame = 0;
        this.currentLineId = 0;
        this.digit.alpha = 0;
        this.callback2 = null;
    }

}

class Rack extends Element {

    constructor(app) {
        super();
        let background = Data.getSprite(Data.rack.background),
            logo = Data.getSprite(Data.rack.logo),
            titleGlow = Data.getSprite(Data.rack.titleGlow),
            jackpotBackImg = Data.getSprite(Data.rack.jackpotBack),
            scBoardJackpotDigit = new scoreboard(Data.rack.scoreboard.digit),
            scBoardMultiplierDigit = new scoreboard(Data.rack.scoreboard.digit2),
            scBoardJackpotLabel = new scoreboard(Data.rack.scoreboard.label),
            scBoardMultiplierLabel = new scoreboard(Data.rack.scoreboard.label),
            leftTank = new FuelTank(app),
            rightTank = new FuelTank(app);

        this.scBoardJackpotDigit = scBoardJackpotDigit;
        this.scBoardMultiplierDigit = scBoardMultiplierDigit;
        this.scBoardJackpotLabel = scBoardJackpotLabel;
        this.scBoardMultiplierLabel = scBoardMultiplierLabel;
        this.leftTank = leftTank;
        this.rightTank = rightTank;

        Data.addChild(this,
            background,
            logo,
            jackpotBackImg,
            titleGlow,
            scBoardJackpotDigit.content,
            scBoardMultiplierDigit.content,
            scBoardJackpotLabel.content,
            scBoardMultiplierLabel.content,
            leftTank.content,
            rightTank.content
        );

        this.glow = titleGlow;
        this.glowStep = 0.05;
        this.glowX = 0;
        this.glowY = 0;
        this.app = app;

        background.y = 12;

        logo.x = 59;
        logo.scale.set(0.95);

        jackpotBackImg.position.set(405, 23);

        titleGlow.position.set(674, 58);
        titleGlow.alpha = 0;

        scBoardJackpotDigit.content.position.set(402, 81);
        scBoardMultiplierDigit.content.position.set(664, 74);
        scBoardMultiplierDigit.height = 38;

        scBoardJackpotLabel.content.position.set(402, 44);
        scBoardMultiplierLabel.content.position.set(662, 44);

        leftTank.content.position.set(19, 187);
        rightTank.content.position.set(916, 187);

    }

    setBoardValue(board, val) {
        this[board].value = val;
    }

}

class scoreboard extends Element {

    constructor(scoreboard) {
        super();

        let scoreboardParam = {
            prefix: '',
            shadow: false,
            shadowAngle: 0,
            stroke: 'black',
            strokeThickness: 0,
            dropShadowDistance: 5
        };

        for (let k in scoreboard) scoreboardParam[k] = scoreboard[k];
        this._prefix = scoreboardParam.prefix;

        let text = new PIXI.Text(scoreboardParam.prefix, {
            fontFamily: scoreboardParam.font,
            fill: scoreboardParam.color,
            fontSize: scoreboardParam.fontSize,
            dropShadow: scoreboardParam.shadow,
            dropShadowAngle: scoreboardParam.shadowAngle,
            stroke: scoreboardParam.stroke,
            strokeThickness: scoreboardParam.strokeThickness,
            dropShadowDistance: scoreboardParam.dropShadowDistance
        });

        this.addChild(text);
        text.scale.set(0.5);
        this.text = text;

        if (scoreboardParam.hasOwnProperty('width')) {
            this._startPoint = scoreboardParam.width / 2;
            text.x = this._startPoint - text.width / 2;
        }

    }

    set value(val) {
        let scBoard = this.content.children[0];
        scBoard.text = `${this._prefix}${val}`;
        if (this.hasOwnProperty('_startPoint')) scBoard.x = this._startPoint - scBoard.width / 2;
    }

    set fill(val) {
        this.content.children[0].style.fill = val;
    }

    set fontSize(val) {
        this.content.children[0].style._fontSize = val;
        if (val > 55)  this.text.y = -5;
        else this.text.y = 0;
    }

}

class ControlPanel extends Element {

    constructor() {

        super();
        this.toggleSound = true;
        this.togglePlayOn = true;
        this.toggleFullScreen = true;

        let $this = this,
            background = Data.getSprite(Data.ctrPanel.background),
            btnPlus2 = new Button(Data.ctrPanel.btn.plus),
            btnMin2 = new Button(Data.ctrPanel.btn.min),
            scoreboardCoin = new scoreboard(Data.ctrPanel.scoreboard.betLevel),

            btn = {},
            scBoard = {};

        for(let k in Data.ctrPanel.btn) btn[k] = new Button(Data.ctrPanel.btn[k]);
        for(let k in Data.ctrPanel.scoreboard) scBoard[k] = new scoreboard(Data.ctrPanel.scoreboard[k]);

        this.btn = btn;
        this.btn.btnPlus2 = btnPlus2;
        this.btn.btnMin2 = btnMin2;
        this.scBoardBet = scBoard.bet;
        this.scBoardBetLevel = scBoard.betLevel;
        this.scBoardCoin = scoreboardCoin;
        this.scBoardBalance = scBoard.balance;
        this.scBoardBalanceSmall =  scBoard.balanceSmall;
        this.scBoardBetWinSmalll = scBoard.betWinSmall;
        this.scBoardLabelBetLevel = scBoard.labelBetLevel;
        this.scBoardLabelCoin = scBoard.labelCoin;

        Data.addChild(this, background, btnPlus2.content, btnMin2.content, scoreboardCoin.content);

        for(let k in btn) this.addChild(btn[k].content);
        for(let k in scBoard) this.addChild(scBoard[k].content);

        btn.main.content.position.set((this.width - btn.main.width) / 2, 12);
        btn.menu.content.position.set(85, 110);
        btn.playOn.content.position.set(915, 110);
        btn.sound.content.position.set(888, 110);
        btn.maxMin.content.position.set(942, 110);

        btn.auto.content.position.set(586, 31);
        btn.auto.addText('AUTO PLAY', Data.ctrPanel.btnTextStyle, 13, 11);

        btn.betMax.content.position.set(402, 31);
        btn.betMax.addText('BET MAX', Data.ctrPanel.btnTextStyle, 15, 11);

        btn.info.content.position.set(98, 35);
        btn.min.content.position.set(272, 35);

        btn.plus.content.position.set(355, 35);
        btnPlus2.content.position.set(739, 35);
        btnMin2.content.position.set(656, 35);

        btn.cashier.visible = false;
        btn.refresh.visible = false;
        btn.bonusLED.visible = false;

        scBoard.bet.content.position.set(155, 46);
        scBoard.betLevel.content.position.set(308, 46);
        scoreboardCoin.content.position.set(694, 46);
        scBoard.balance.content.position.set(795, 46);
        scBoard.labelBet.content.position.set(190, 81);
        scBoard.labelBetLevel.content.position.set(297, 81);
        scBoard.labelCoin.content.position.set(700, 81);
        scBoard.labelBalance.content.position.set(838, 81);
        scBoard.labelBalanceSmall.content.position.set(117, 118);
        scBoard.balanceSmall.content.position.set(193, 118);
        scBoard.betWinSmall.content.position.set(450, 118);


        btn.main.on('click', function () {
             $this.mainButton();
         });

        btn.betMax.on('click', function () {
            $this.betMax();
        });

        btn.auto.on('click', function () {
            $this.autoPlay();
            if (!this.blk) setClickImg.call(this);
        });

        btn.plus.on('click', function () {
            setClickImg.call(this);
            $this.betLevelPlus();
        });

        btn.min.on('click', function () {
            setClickImg.call(this);
            $this.betLevelMinus();
        });

        btnPlus2.on('click', function () {
            setClickImg.call(this);
            $this.coinPlus();
        });

        btnMin2.on('click', function () {
            setClickImg.call(this);
            $this.coinMinus();
        });

        btn.info.on('click', function () {
            $this.info();
        });

        btn.sound.on('mouseover', function () {
            $this.sound_mouseover();
         });

        btn.sound.on('mouseout', function () {
            $this.sound_mouseout();
        });

        btn.sound.on('click', function () {
            $this._setToggle('toggleSound', this);
            $this.sound();
        });

        btn.playOn.on('click', function () {
            $this._setToggle('togglePlayOn', this);
            $this.playOn();
        });

        btn.maxMin.on('click', function () {
            $this._setToggle('toggleFullScreen', this);
            $this.fullScreen();
        });

        btn.menu.on('click', function () {
            setClickImg.call(this);
            $this.menu();
        });

        function setClickImg() {
            this.setImg(0);
            let $this = this;
            setTimeout(function () {
                $this.setImg(1);
            }, 250);
        }

        document.addEventListener('keydown', function(event) {
            if (event.code == 'Space' && !btn.main.blk) $this.mainButton();
        });

    }

    _setToggle(toogleName, $btnThis) {
        if(this[toogleName]) {
            $btnThis.setImg(3, 4);
            this[toogleName] = false;
        } else {
            $btnThis.setImg(0, 1);
            this[toogleName] = true;
        }
    }

    click(el) {
        if(el == 'playOn') this._setToggle('togglePlayOn', this.btn.playOn);
        else if(el == 'maxMin') {
            this._setToggle('toggleFullScreen', this.btn.maxMin);

        }
    }

    on(elm, func) {
        this[elm] = func;
    }

    setBoardValue(board, val) {
        this[board].value = val;
    }
}

class Button extends Element {

    constructor(imgNames) {

        super();
        this.content.interactive = true;

        let $this = this,
            sprite = [];

        imgNames.forEach(function(item) {
            sprite.push(Data.getSprite(item));
        });

        this._sprite = sprite;
        this.setImg(0, 1);
        this.clickZone();
        this.blk = false;

        this.content.on('mouseover', function () {
            $this._replace($this._img[1]);
            if($this._mouseover && !$this.blk) $this._mouseover();
        });

        this.content.on('mouseout', function () {
            $this._replace($this._img[0]);
            if($this._mouseout) $this._mouseout();

        });

        this.content.on('click', function () {
           if(!$this.blk) $this._click();
        });

    }

    block(clickOnly = false) {
        this.blk = true;
        if (!clickOnly) this.setImg(2, 2);
    }

    unBlock(clickOnly = false) {
        this.blk = false;
        if (!clickOnly) this.setImg(0, 1);
    }

    on(action, func) {
        this[`_${action}`] = func;
    }

    setImg(numbImg, numbImgHover = false) {
        this._replace(this._sprite[numbImg]);
        if (numbImgHover) this._img = [this._sprite[numbImg], this._sprite[numbImgHover]];
    }

    _replace(el) {
        if (this.hasOwnProperty('_current')) this.removeChild(this._current);
        this.addChild(el);
        if (this.hasOwnProperty('text')) this.addChild(this.text);
        this._current = el;
    }

    clickZone(value = true) {
        if (value === false) this.content.hitArea = new PIXI.Rectangle(0, 0, this.width / 1.05, this.height /1.2);
         else {
            let size = this.width / 2;
            this.content.hitArea = new PIXI.Circle(size, size, size);
        }
    }

    addText(value, params, x, y) {
        if(this.text) this.removeChild(this.text);
        let text = new PIXI.Text(value, params);
        text.x = x;
        text.y = y;
        text.scale.set(0.5);
        this.addChild(text);
        this.text = text;
    }

    addCountSpin(count) {
        let x;
        if (count > 99) x = 19;
        else if (count > 9) x = 23;
        else x = 27;

        this.addText(count, Data.ctrPanel.btnTextStyle, x, 21);
    }

    set textFill(val) {
        this.text.style.fill = val;
    }

}

class FuelTank extends Element {

    constructor(app) {
        super();

        this.app = app;
        let img = {};
        for (let k in Data.fuelTank.img) img[k] = Data.getSprite(Data.fuelTank.img[k]);

        let liquidTexture = [];
        Data.fuelTank.lH_Liquid.forEach(function(item) {
            liquidTexture.push(PIXI.TextureCache[`${item}.${Config.imgExtension}`]);
        });

        let liquid = new PIXI.extras.AnimatedSprite(liquidTexture, false);

        const graphics = new PIXI.Graphics();
        let bubblesCont = new PIXI.Container();
        this.bubblesCont = bubblesCont;

        graphics.beginFill();
        graphics.drawRect(0, 0, 20, 50);
        graphics.endFill();

        Data.addChild(this, img.tankBg, img.liquidFill, liquid, graphics, bubblesCont, img.tank, img.glass, img.glow);

        img.liquidFill.mask = graphics;
        bubblesCont.mask = graphics;

        liquid.position.set(16, 214);

        img.liquidFill.position.set(16, 17);
        img.liquidFill.height = 210;

        graphics.position.set(12, 226);
        graphics.width = 46;
        graphics.height = 196;

        img.tank.x = 2;

        img.glow.y = 19;
        img.glow.alpha = 0;

        img.glass.position.set(12, 30);
        img.plug.position.set(10, 30);
        img.tankBg.position.set(12, 30);

        this.graphics = graphics;
        this.level = 214;
        this.frame = 0;
        this.totalFrames = liquid.totalFrames;
        this.liquid = liquid;
        this.liquidFill = img.liquidFill;
        this.bubbles = [];
        this.glow = img.glow;
        this.glowStep = 0.05;
        this.glowX = 0;
        this.glowY = 0;

        app.ticker.add(this._waves, this);
        app.ticker.add(this._bubbles, this);
    }

    _waves() {
        this.liquid.gotoAndPlay(this.frame);
        this.frame += 0.4;
        if(this.liquid.currentFrame == this.totalFrames - 1) this.frame = 0;
    }

    _bubbles() {
        let random = Data.randomInteger(1, 10);
        if(random > 7) {

            let bubble = {
                content: Data.getSprite(Data.fuelTank.img.tankBubble),
                speed: Data.randomInteger(100, 150),
                del: false,
                trend: Data.randomInteger(1, 10),
                k: 1,
                radian: Data.randomInteger(-10, 10)
            };

            bubble.content.position.set(Data.randomInteger(22, 50), 220);
            bubble.content.anchor.set(0.5, 0.5);
            bubble.content.alpha = Data.randomInteger(1, 4) * 0.125 + 0.5;
            if (this.liquid.y > 149) bubble.k = 11 * Math.pow(this.liquid.y - 149, 3) / 486680 + 1;
            else  bubble.k = 1;

            let size = Data.randomInteger(1, 25);
            if(size <= 6) size = 3;
            else if (size > 7 && size <= 20) size = 4;
            else if (size > 20 && size <= 23) size = 5;
            else if (size > 23) size = 6;

            size = size / 3;

            bubble.content.width = bubble.content.width / size;
            bubble.content.height = bubble.content.height / size;

            this.bubbles.push(bubble);
            this.bubblesCont.addChild(bubble.content);
        }

        let $this = this;
        this.bubbles.forEach(function(item) {
            let speed = item.speed / 100 * 1.2 / (((item.k-1) / 2.2) + 1);

            item.content.y -= speed;
            item.content.rotation += item.radian / 300;

            if (item.content.y < $this.liquid.y + 65)
                item.content.alpha -= 0.025 * item.k;
            let trend = (item.trend - 6) * 0.05;
            if ((item.content.x + trend) >= 50) trend = -trend;
            if (item.content.x + trend <= 22) trend = Math.abs(trend);

            item.content.x += trend;

            if (item.content.y < $this.liquid.y) item.del = true;

        });

        for (let i = 0; i < this.bubbles.length; i++) {
            if (this.bubbles[i].del) {
                this.bubbles[i].content.destroy();
                this.bubbles.splice(i, 1);
                break;
            }
        }
    }


    set liquidLevel(level) {
        this.level = +(214 - 1.92 * level).toFixed(2);
        this.app.ticker.add(this._moveLevel, this);
    }

    _moveLevel(delta) {

        let step = (3 * (Math.abs(this.level - this.liquid.y)) + 61) / 64;

        let integer = Math.trunc(delta) - 1,
            nextLiquid = this.liquid.y - step,
            deltaStep = 0;

        for (let i = 0; i < integer; i++) {
            let nextStep = (3 * (Math.abs(this.level - nextLiquid)) + 61) / 64;
            nextLiquid = nextLiquid - nextStep;
            deltaStep += nextStep;
        }

        step += deltaStep;

            if (this.level < this.liquid.y) {
                let rezult = this.liquid.y - step;
                if (!Number.isInteger(rezult)) rezult = +rezult.toFixed(2);
                let rezult2 = this.graphics.y - step;
                if (!Number.isInteger(rezult)) rezult = +rezult.toFixed(2);

                if(rezult < 22) {
                    this.liquid.y = 22;
                    this.graphics.y  = 30;
                } else {
                    this.liquid.y = rezult;
                    this.graphics.y  = rezult2;
                }

                if (this.level >= this.liquid.y) {
                    this.app.ticker.remove(this._moveLevel, this);
                    if (this.callback) this.callback();
                }

            } else if (this.level > this.liquid.y) {
                let rezult = this.liquid.y + step;
                if (!Number.isInteger(rezult)) rezult = +rezult.toFixed(2);
                let rezult2 = this.graphics.y  + step;
                if (!Number.isInteger(rezult)) rezult = +rezult.toFixed(2);

                if(rezult > 214) {
                    this.liquid.y = 214;
                    this.graphics.y  = 222;
                }
                else {
                    this.liquid.y = rezult;
                    this.graphics.y  = rezult2;
                }

                if (this.level <= this.liquid.y) this.app.ticker.remove(this._moveLevel, this);

            }

        if (this.level == this.liquid.y) this.app.ticker.remove(this._moveLevel, this);

    }

}

class Reel extends Element {

    constructor(app) {
        super();
        let symbolMap = Data.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        let symbols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let texture = [];
        let textureOriginal = [];
        symbolMap.forEach(function (item) {
            texture.push(PIXI.TextureCache[`${Data.symbol[item]}.${Config.imgExtension}`]);
        });

        for (let i = 0; i < symbols.length; i++) textureOriginal.push(PIXI.TextureCache[`${Data.symbol[i]}.${Config.imgExtension}`]);

        let sprite = [];
        for (let i = 0; i < 4; i++) sprite.push(new PIXI.Sprite(texture[i]));

        for (let i = 0; i < sprite.length; i++) this.addChild(sprite[i]);
        let margin = 144;

        sprite[3].height = 134;
        sprite[2].y = margin - 10;
        sprite[1].y = margin * 2 - 10;
        sprite[0].y = margin * 3 - 10;

        this.sprite = sprite;
        this.step = 37;
        this.stopStep = -3.1;
        this.app = app;
        this.nextSymbol = 4;
        this.texture = texture;
        this.textureOriginal = textureOriginal;
        this._stop = false;
        this.status = 0;
    }

    speedMode(mode) {
       if (mode == 2)  this.step = 45;
       else if (mode == 1) this.step = 37;
    }

    getSpeedStep() {
        return this.step;
    }

    move() {
        if (!this.status) {
            this.status = 1;
            this.app.ticker.add(this._moveReel, this);
        }
    }

    stop(stopSymbol, callback = false, callback2 = false) {
        if (this.status == 1) {
            this.status = 2;
            this._stop = 1;
            this.stopSymbol = stopSymbol;
            this.callback = callback;
            this.callback2 = callback2;
            Data.sound.reelStopKick();
        }
    }

    _stopReel(delta) {
        let def_1 = 34;
        let def_2 = 5;

        if(this._stop == 1) {
            for (let i = 0; i < this.sprite.length; i++) {
                if (this.sprite[i].y) {
                    if (this.sprite[i].y < 278) {
                        this.sprite[i].y = 134 + def_1;
                        this.sprite[i].texture = this.textureOriginal[this.stopSymbol[0]];
                    } else if (this.sprite[i].y < 422) {
                        this.sprite[i].y = 278 + def_1;
                        this.sprite[i].texture = this.textureOriginal[this.stopSymbol[1]];
                    } else if (this.sprite[i].y > 421) {
                        this.sprite[i].y = 422 + def_1;
                        this.sprite[i].texture = this.textureOriginal[this.stopSymbol[2]];
                    }
                }
            }

            this._stop = 2;
        }

        if(this._stop == 2) {
            this.stopStep += 0.098;
            if(this.stopStep > -1) this.stopStep = -1;

            let mainStep = this.stopStep,
                deltaPart = delta - 1;

            if (deltaPart > 2) deltaPart = 2;

            let intPart = Math.trunc(deltaPart),
                fractPart = deltaPart - intPart;

            for (let i = 0; i < intPart; i++) {
                this.stopStep += 0.098;
                mainStep += this.stopStep;
            }

            if(fractPart) {
                this.stopStep += 0.098 * fractPart;
                mainStep += this.stopStep * fractPart;
            }

            for (let i = 0; i < this.sprite.length; i++) if (this.sprite[i].y) this.sprite[i].y += mainStep;

            for (let i = 0; i < this.sprite.length; i++) {
                let result = this.sprite[i].y <= 134 - def_2 && this.sprite[i].y > 134 - def_2 - Math.abs(mainStep) * 2;
                if (result) {
                    this._stop = 3;
                    this.stopStep = Math.abs(mainStep / 5);
                }
            }
        }

        if(this._stop == 3) {
             let step = this.stopStep * delta;

            let stop = false;

            for (let i = 0; i < this.sprite.length; i++) {
                if (this.sprite[i].y) {
                    this.sprite[i].y += step;

                    if (this.sprite[i].y >= 134 && this.sprite[i].y < 134 + step * 2) {
                        this.sprite[i].y = 134;
                        stop = true;
                    } else if (this.sprite[i].y >= 278 && this.sprite[i].y < 278 + step  * 2) {
                        this.sprite[i].y = 278;
                        stop = true;
                    } else if (this.sprite[i].y >= 422 && this.sprite[i].y < 422 + step  * 2) {
                        this.sprite[i].y = 422;
                        stop = true;
                    }
                }
            }

            if (stop) {
                this._stop = false;
                this.stopStep = -3.1;
                this.status = 0;
                if (this.callback) this.callback();
                if (this.callback2) this.callback2();
                this.app.ticker.remove(this._stopReel, this);
            }

        }

    }

    _moveReel(delta) {
        if(delta > 3) delta = 3;

        let step = this.step * delta;

        for (let i = 0; i < this.sprite.length; i++) {
            if (this.sprite[i].height < 144) {
                if (this.sprite[i].height + step <= 144) this.sprite[i].height += step;
                else {
                    this.sprite[i].y = this.sprite[i].height + step - 144;
                    this.sprite[i].height = 144;
                }
            } else this.sprite[i].y += step;

            if (this.sprite[i].y >= 566) {
                if(this._stop) {
                    this.sprite[i].height = 134;
                    this.sprite[i].y = 0;
                    this.app.ticker.add(this._stopReel, this);
                    this.app.ticker.remove(this._moveReel, this);
                } else {
                    let height = 134 + this.sprite[i].y - 566;
                    if (height <= 144) this.sprite[i].height = height;
                    else this.sprite[i].height = 144;
                    this.sprite[i].y = Math.max(0, height - 144);
                    this.sprite[i].texture = this.texture[this.nextSymbol];
                    if (this.nextSymbol++ == 9) this.nextSymbol = 0;
                }
            }
        }

    }

}

class WinRate extends Element {

    constructor(app) {
        super();
        this.app = app;
    }

    showTotalWin(delay, summ, time, callback, callback2, callback3) {

        let frame = 0;
        this.app.ticker.add(show, this);

        function show(delta) {
          if (frame >= delay) {
              Data.sound.win();
              callback2();
              this._showTotalWin(summ, time, callback, callback3);
              this.app.ticker.remove(show, this);
          } else frame = frame + delta;

        }
    }

    _showTotalWin(summ, time, callback, callback3) {

        this.current = 0;
        this.summ = +summ.toFixed(2);

        let currentScale = 1.8,
            digitSlot = [],
            step = this.summ /  (time * 60),
            scaleStep = (currentScale - 0.95) / (time * 60),
            container = new PIXI.Container;

        for (let i = 0; i < 8; i++) digitSlot.push(new PIXI.Sprite());
        for (let i = 0; i < digitSlot.length; i++) container.addChild(digitSlot[i]);
        this.addChild(container);

        this.app.ticker.add(showDigits, this);

        function showDigits(delta) {

            let curr = this.current.toFixed(2);
            for (let i = 0; i < digitSlot.length; i++) digitSlot[i].texture = false;

            for (let i = 0; i < curr.length; i++) {
                digitSlot[i].texture = this._getTexture(curr[i]);
                if (i > 0) digitSlot[i].x =  digitSlot[i-1].x + 100;
            }

            container.scale.set(currentScale);
            container.x = (835 - container.width) / 2;

            if (+curr == this.summ)  {
                callback3();
                container.scale.set(0.95);
                container.x = (835 - container.width) / 2;
                Data.sound.stopWin();
                Data.sound.bell();
                this.app.ticker.remove(showDigits, this);
                this.app.ticker.add(hideDigits, this);
            }
            this.current += step * delta;
            currentScale -= scaleStep * delta;

            if (this.current >= summ) this.current = this.summ;
        }

        let delay = 40;
        function hideDigits(delta) {
            if(delay <= 0) {
                if (callback) {
                    callback();
                    callback = false;
                }

                for (let i = 0; i < digitSlot.length; i++) digitSlot[i].alpha -= 0.035 * delta;
                if (digitSlot[0].alpha <= 0) {
                    this.app.ticker.remove(hideDigits, this);
                    this.current = 0;
                    this.summ = 0;
                    for (let i = 0; i < digitSlot.length; i++) digitSlot[i].destroy();
                }
            }
            delay = delay - delta;
        }
    }

    _getTexture(elm) {
        let numbElm;
        if(+elm || +elm == 0)  numbElm = +elm;
        else numbElm = 11;

       return  PIXI.TextureCache[`${Data.winRate.digits[numbElm]}.${Config.imgExtension}`];
    }

    rewind() {
        if(this.summ) this.current = this.summ;
    }

}

class AnimateMonitor extends Element {

    constructor(app) {
       super();

       for (let i = 0; i < 5; i++) {
           let column = new PIXI.Container();
           this.addChild(column);
       }

        let graphics = new PIXI.Graphics();

        graphics.beginFill();
        graphics.drawRect(0, 0, 1160, 720);
        graphics.endFill();
        this.mask = graphics;
        this.addChild(graphics);
        this.content.mask = graphics;

        this.content.children[1].x = 155;
        this.content.children[2].x = 310;
        this.content.children[3].x = 465;
        this.content.children[4].x = 620;

        this.sprite = {};

        this.app = app;
        this.уLimit = 900;

        this.numbDino = [];
        this.modeDino = [];
        this.bgDino = [];

        this.currentShowLine = 0;
        this.framePosition = [];

        for (let i = 0; i < 5; i++) {
            for (let k = 0; k < 3; k++) {
                Data.animateMonitor[`lineFrame_${i}_${k}`] =  Data.animateMonitor.lineFrame;
                Data.animateMonitor[`shockFlash_${i}_${k}`] =  Data.animateMonitor.shockFlash;
            }
        }

        for (let i = 0; i < 5; i++)  Data.animateMonitor[`lineFrame2_${i}`] = Data.animateMonitor.lineFrame;

    }

    moveAnimation(reelStep) {
        this.mask.height = 566;
        this.reelStep = reelStep;
        this.blkCasing = false;
        this.timerId = 'pre';
        this.app.ticker.add(this._moveAnimation, this);
        this.numbDino = [];
        this.modeDino = [];
    }

    hunterTop(param) {
        let name = 'hunterTop';
        this._propInit(name);
        this._preAnimateInit(param[0], param[1], name, 0.2, [67, 67, 67], [134, 278, 422]);
        this._addToAnimate(name, 0, false, false, false, false, 6);

        Data.sound.spl();
    }

    initShowLine(showLine) {
        this.framePosition = [];
        this.currentShowLine = 0;
        for (let i = 0; i < 5; i++) this.framePosition.push(false);
        this.showLine = showLine;
        this.stopFrame = false;

        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.brightness(3);

        for (let i = 0; i < 5; i++) {
            let name = `lineFrame2_${i}`;
            this._propInit(name);
            this._preAnimateInit(i, 1, name, 0.3, [39, 39, 39], [105, 248, 391], false, false, [colorMatrix], 0);
            this._addToAnimate(name, 0);
        }
    }

    showNextLine() {
        let currentShowLine = this.currentShowLine,
            lineParam = this.showLine[currentShowLine],
            framePosition = this.framePosition;

        for (let i = 0; i < lineParam.length; i++) {
            if (framePosition[i] !== false) {
                if (lineParam[i] === false) this._hideLineFrame(i);
                else if (framePosition[i] != lineParam[i])  this._moveLineFrame(i, lineParam[i]);
            } else if (lineParam[i] !== false) this._showLineFrame(i, lineParam[i]);
        }

        this.framePosition = lineParam;
        if(++this.currentShowLine == this.showLine.length)  this.currentShowLine = 0;
    }

    _showLineFrame(reel, position) {

        let sprite = this.sprite[`lineFrame2_${reel}`][0];

        if (position == 0) sprite.y = 105;
        else if (position == 1) sprite.y = 248;
        else sprite.y = 391;

        this.app.ticker.add(show, this);

        function show(delta) {
            if (sprite.alpha == 0.4) this.app.ticker.remove(show, this);
            else  {
                sprite.alpha += 0.05 * delta;
                if(sprite.alpha > 0.4) sprite.alpha = 0.4;
            }
        }

    }

    _hideLineFrame(reel) {
        let sprite = this.sprite[`lineFrame2_${reel}`][0];
        this.app.ticker.add(hide, this);

        function hide(delta) {
            if (sprite.alpha == 0) this.app.ticker.remove(hide, this);
            else  {
                sprite.alpha -= 0.05 * delta;
                if (sprite.alpha < 0) sprite.alpha = 0;
            }
        }
    }

    _moveLineFrame(reel, position) {
        let sprite = this.sprite[`lineFrame2_${reel}`][0];

        let result;
        if (position == 0) result = 105;
        else if (position == 1) result = 248;
        else result = 391;

        let step = 12;
        if (result < sprite.y) step = -step;

        if (result > sprite.y && (result - sprite.y) != 143) step *= 2;
         else if (result < sprite.y && (sprite.y - result) != 143) step *= 2;

        this.app.ticker.add(move, this);

        function move(delta) {
            if (this.stopFrame) this.app.ticker.remove(move, this);
            sprite.y += step * delta;
            if(step > 0  && sprite.y >= result) stop.call(this);
            else if (step < 0 && sprite.y <= result) stop.call(this);
        }

        function stop() {
            sprite.y = result;
            this.app.ticker.remove(move, this);
        }

    }

    hideAllLine() {
        if (this.sprite.hasOwnProperty('lineFrame2_0')) {
            this.stopFrame = true;
            for (let i = 0; i < 5; i++)  this.sprite[`lineFrame2_${i}`][0].alpha = 0;
        }
    }

    flashLine(param, delay, reverse, callback, callback2, callback3) {
        this.flashLineCallback = callback;
        this.flashLineCount = param.length;

        let priority = [0, 6, 12, 18, 24],
            blackItem = [],
            frame = -delay,
            soundFlash = true;

        function findBlackItem(item) {
            let result = false;
            for (let elm of blackItem) if(elm[0] == item[0] && elm[1] == item[1]) result = true;
            return result;
        }

       this.app.ticker.add(show, this);
       function show(delta) {
           if(callback2 && frame >= 0) {
               callback2();
               callback2 = null;
           }

           if(callback3 && frame >= 0) {
               callback3();
               callback3 = null;
           }

           if(frame >= 0 && soundFlash)   {
               Data.sound.flash();
               soundFlash = false;
           }


           for (let item of param) {

               for (let i = 0; i < 5; i++) {
                   if(!reverse) {
                       if (item[0] == i && frame >= priority[i] && !findBlackItem(item)) {
                           this._flashLine(item);
                           blackItem.push(item);
                       }
                   } else if (item[0] == i && frame >= priority[priority.length - 1 - i] && !findBlackItem(item)) {
                       this._flashLine(item);
                       blackItem.push(item);
                   }
               }

           }

           if (frame >= 24 ) this.app.ticker.remove(show, this);
           else frame = frame + delta;
       }

    }

    _flashLine(param) {
        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
        colorMatrix.brightness(3);

        let name = `lineFrame_${param[0]}_${param[1]}`;
        this._propInit(name);
        this._preAnimateInit(param[0], param[1], name, 0.3, [39, 39, 39], [105, 248, 391], false, false, [colorMatrix], 0.4);

        let $lineFrame;
        this._addToAnimate(name, 0, false, false, false, function (sprite) {
            if (!$lineFrame) $lineFrame = sprite;
        });

        let name2 = `shockFlash_${param[0]}_${param[1]}`;
        this._propInit(name2);
        this._preAnimateInit(param[0], param[1], name2, 0.25, [67, 67, 67], [133, 276, 419]);

        let $shock,
            $this = this;
        this._addToAnimate(name2, 3, false, false, false, function(sprite, frame) {
            $shock = sprite;
            if (frame == 3) $this.app.ticker.add(hideAll, $this);
        });

        function hideAll(delta) {
            if (this.animFunc) {
                if ($shock.alpha > 0) $shock.alpha -= 0.03 * delta;
                if ($shock.alpha < 0.05 && $lineFrame.alpha > 0) $lineFrame.alpha -= 0.025 * delta;
                if($lineFrame.alpha <= 0) {
                    this.app.ticker.remove(hideAll, this);
                    if (--this.flashLineCount == 0) {
                        this.flashLineCallback();
                    }
                }
           }

        }
    }

    _delay(name) {
        this.app.ticker.add(delay, this);
        let frame = 0;
        function delay() {
            if(frame== 17) {
             Data.sound.shooting();

                this._addToAnimate(name);
                this.app.ticker.remove(delay, this);
            } else frame++;
        }
    }

    hunterLeftAngleUp(param, callback) {
        this._hunterInit(param, 'hunterAngleUp', 0.27, [36, 242, 242], [89, 233, 377], callback, true);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 2) lightWidth = 300;
        else if(param[0] == 3) lightWidth = 400;
        else if(param[0] == 4) lightWidth = 550;

        this._preAnimateInit(param[0], param[1], name, 0.26, [0, -40, -40], [340, 310, 455], false, [0, 3.8, 3.8], false, false, lightWidth);
        this._delay(name);
    }

    hunterLeft(param, callback) {
        this._hunterInit(param, 'hunterRightStraight', 0.27, [209, 209, 209], [116, 260, 404], callback, true);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 2) lightWidth = 250;
        else if(param[0] == 3) lightWidth = 400;
        else if(param[0] == 4) lightWidth = 550;

        this._preAnimateInit(param[0], param[1], name, 0.26, [-30, -40, -30], [275, 415, 550], false, [3.15, 3.15, 3.24], false, false, lightWidth);
        this._delay(name);
    }

    hunterLeftAngleDown(param, callback) {
        this._hunterInit(param, 'hunterAngleDown', 0.27, [210, 0, 0], [112, 0, 0], callback, true);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 2) lightWidth = 250;
        else if(param[0] == 3) lightWidth = 400;
        else if(param[0] == 4) lightWidth = 550;


        this._preAnimateInit(param[0], param[1], name, 0.26, [-10, 0, 0], [340, 0, 0], false, [2.8, 0, 0], false, false, lightWidth);
        this._delay(name);
    }

    hunterLeftDown(param, callback) {
        this._hunterInit(param, 'hunterDownVertDown', 0.27, [310, 0, 0], [94, 0, 0], callback, true);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 4) lightWidth = 250;
        this._preAnimateInit(param[0], param[1], name, 0.26, [130, 0, 0], [400, 0, 0], false, [2, 0, 0], false, false, lightWidth);
        this._delay(name);
    }

    hunterLeftUp(param, callback) {
        this._hunterInit(param, 'hunterUpVertUp', 0.26, [250, 28, 250], [90, 234, 378], callback, true);
        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 4) lightWidth = 300;
        this._preAnimateInit(param[0], param[1], name, 0.26, [250, 0, 15], [380, 0, 390], false, [0, 0, 4.3], false, false, lightWidth);
        this._delay(name);
    }

    hunterRightUp(param, callback) {
        this._hunterInit(param, 'hunterUpVertUp', 0.26, [250, 28, 29], [90, 234, 378], callback);
        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 3) lightWidth = 300;
        this._preAnimateInit(param[0], param[1], name, 0.26, [250, 0, 150], [380, 0, 350], false, [0, 0, -1.3], false, false, lightWidth);
        this._delay(name);
    }

    hunterRightDown(param, callback) {
        this._hunterInit(param, 'hunterDownVertDown', 0.27, [-32, 0, 0], [95, 0, 0], callback);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 3) lightWidth = 250;
        this._preAnimateInit(param[0], param[1], name, 0.26, [250, 0, 0], [360, 0, 0], false, [1.2, 0, 0], false, false, lightWidth);
        this._delay(name);
    }

    hunterRightAngleDown(param, callback) {
        this._hunterInit(param, 'hunterAngleDown', 0.27, [68, 0, 0], [112, 0, 0], callback);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 2) lightWidth = 250;
        else if(param[0] == 1) lightWidth = 440;
        else if(param[0] == 0) lightWidth = 600;

        this._preAnimateInit(param[0], param[1], name, 0.26, [350, 0, 0], [240, 0, 0], false, [0.4, 0, 0], false, false, lightWidth);
        this._delay(name);
    }

    hunterRightAngleUp(param, callback) {
        this._hunterInit(param, 'hunterAngleUp', 0.27, [36, 36, 36], [89, 233, 377], callback);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 1) lightWidth = 400;
        else if (param[0] == 2) lightWidth = 250;
        else if (param[0] == 0) lightWidth = 550;

        this._preAnimateInit(param[0], param[1], name, 0.26, [150, 260, 260], [0, 210, 355], false, [0, -0.55, -0.55], false, false, lightWidth);
        this._delay(name);
    }

    hunterRight(param, callback) {
        this._hunterInit(param, 'hunterRightStraight', 0.27, [69, 69, 69], [116, 260, 404], callback);

        let name = 'lightning';
        this._propInit(name);

        let lightWidth;
        if(param[0] == 0) lightWidth = 520;
        else if(param[0] == 1) lightWidth = 420;
        else if(param[0] == 2) lightWidth = 250;


        this._preAnimateInit(param[0], param[1], name, 0.27, [320, 320, 320], [170, 310, 450], false, [0, -0.1, -0.1], false, false, lightWidth);
        this._delay(name);
    }

    showHunterWaiting(param) {
        this._hunterInit(param, 'hunterWaiting', 0.2, [209, 209, 209], [111, 255, 399], false, true, 8, true, 1);

        if (Math.random() > 0.5) Data.sound.hello();
        else Data.sound.hoy();
    }

    showDinoSmall(param, delay, callback) {
        let reel = param[0],
            row = param[1],
            name = 'dinoSmall',
            frame = - delay;

        this._propInit(name);
        this._preAnimateInit(reel, row, name, 0.25, [0, 0, 0], [87, 231, 375]);

        this.app.ticker.add(show, this);
        function show() {
            if(frame == 0) {
                Data.sound.dinoSmall();
                this._addToAnimate(name, false, false, callback);
                this.app.ticker.remove(show, this);
            }
            else frame++;
        }
    }

    showDinoBig(param, callback) {
        let name = 'dinoBig', x, y,
            $this = this;

        this.numbDino.push(param[0]);
        this.modeDino.push(param[1]);

        Data.sound.dinoBig();

        this._propInit(name);
        this._preAnimateInit(0, 0, name, 0.29, [0, 0, 0], [0, 0, 0]);
        this._addToAnimate(name, 48, false, callback, false, function (sprite, frame, i) {
            [x, y] = getXY($this.numbDino[i], $this.modeDino[i], frame);
            sprite.position.set(x, y);
        });

        function getXY(numb, mode, frame = false) {
            let x,y;

            switch(numb) {
                case 1:
                    x = 63;
                    y = 39;
                    leftUp();
                    break;
                case 2:
                    if (mode == 0) {
                        x = 63;
                        y = 183;
                        leftUp();
                        if (frame !== 0) y -= 3;
                    } else {
                        x = 63;
                        y = 39;
                        leftDown();
                    }
                    break;
                case 3:
                    x = 63;
                    y = 183;
                    leftDown();
                    if (frame !== 0) y -= 3;
                    break;
                case 4:
                    x = 521;
                    y = 39;
                    rightUp();
                    break;
                case 5:
                    if (mode == 0) {
                        x = 521;
                        y = 185;
                        rightUp();
                        if (frame !== 0) y -= 4;
                    } else {
                        x = 521;
                        y = 39;
                        rightDown();
                    }
                    break;
                case 6:
                    x = 521;
                    y = 183;
                    rightDown();
                    if (frame !== 0) y -= 2;
                    break;
            }

            function leftUp() {
                switch (frame) {
                    case 0:
                        x += 2;
                        y += 3;
                        break;
                    case 1:
                        x += -1;
                        y -= 3;
                        break;
                    case 2:
                        x += -1;
                        y += -2;
                        break;
                }
            }

            function leftDown() {
                switch (frame) {
                    case 0:
                        x += 2;
                        y += 147;
                        break;
                    case 1:
                        x += -1;
                        y += 125;
                        break;
                    case 2:
                        x += -1;
                        y += 95;
                        break;
                    case 3:
                        x += -1;
                        y += 63;
                        break;
                    case 4:
                        x += -1;
                        y += 32;
                        break;
                }
            }

            function rightUp() {
                switch (frame) {
                    case 0:
                        x += 164;
                        y += 2;
                        break;
                    case 1:
                        x += 134;
                        y += -1;
                        break;
                    case 2:
                        x += 100;
                        y += -1;
                        break;
                    case 3:
                        x += 67;
                        y += -1;
                        break;
                    case 4:
                        x += 34;
                        y += -1;
                        break;
                }
            }

            function rightDown() {
                switch (frame) {
                    case 0:
                        x += 164;
                        y += 147;
                        break;
                    case 1:
                        x += 133;
                        y += 120;
                        break;
                    case 2:
                        x += 100;
                        y += 90;
                        break;
                    case 3:
                        x += 67;
                        y += 60;
                        break;
                    case 4:
                        x += 34;
                        y += 30;
                        break;
                }
            }

            return [x, y];
        }
    }

    showCasing(time) {
        if(!this.blkCasing) {

            Data.sound.casing();

            let name = 'AF';
            this._propInit(name);
            this._preAnimateInit(4, 0, name, 0.3, [-13, 0, 0], [33, 0, 0]);
            this._addToAnimate(name, 6);

            this.frameShowCasing = 0;
            this.targetFrame = Math.round(time / 1000 * 60);
            this.app.ticker.add(hide, this);

            Data.animateMonitor.steam2 = Data.animateMonitor.steam;

            let name2 = 'steam',
                name3 = 'steam2';
            this._propInit(name2);
            this._propInit(name3);
            this._preAnimateInit(4, 0, name2, 0.6, [235, 0, 0], [105, 0, 0], false, false, false, false, 300, 150);
            this._preAnimateInit(4, 0, name3, 0.6, [30, 0, 0], [400, 0, 0], true, false, false, false, 300, 150);

            let counter = 0;
            this.app.ticker.add(delay, this);

            let steam = true,
                steam2 = true;
            function delay(delta) {
                if (counter >= 25 && steam) {
                    this._addToAnimate(name2);
                    steam = false;
                }

                if (counter >= 55 && steam2) {
                    steam2 = false;
                    this.app.ticker.remove(delay, this);
                    this._addToAnimate(name3);
                }

                counter += delta;
            }

            function hide(delta) {
                if(this.frameShowCasing >= this.targetFrame) {
                    Data.sound.stopCasing();
                    this.app.ticker.remove(hide, this);
                    this.app.ticker.add(this._animateHideCasing, this);
                    this.frameShowCasing = 0;
                    this.targetFrame = 0;
                } else this.frameShowCasing = this.frameShowCasing + delta;
            }
        }

    }

    hideCasing() {
        this.blkCasing = true;
        this.frameShowCasing = this.targetFrame;
    }

    hide(name) {
        if (this.sprite.hasOwnProperty(name)) {
            for(let i = 0; i < this.sprite[name].length; i++) this.sprite[name][i].alpha = 0;
            if(this.sprite.hunterBackWaiting) this.sprite.hunterBackWaiting[0].alpha = 0
        }
    }

    _propInit(name) {
        if (!this.sprite) this.sprite = [];
        let $this = this;
        ['stop', 'allready', 'callback', 'callback2', 'step', 'counter', 'historyFrame', 'AF'].forEach((item) => {if(!$this[item]) $this[item] = {}});

        if (!this.counter[name]) this.counter[name] = 0;
    }

    _preAnimateInit(reel, row, name, step, x, y, invert = false, rotation = false, filters = false, alpha = false, width = false,  height = false) {

        let sprite = new PIXI.Sprite();
        if (filters) sprite.filters = filters;
        if (alpha !== false) sprite.alpha = alpha;
        if (width !== false) sprite.width = width;
        if (height !== false) sprite.height = height;

        if (invert) sprite.scale.x = -1;

        this.content.children[reel].addChild(sprite);

        if(!this.sprite) this.sprite = {};
        if(!this.sprite[name]) this.sprite[name] = [];
        this.sprite[name].push(sprite);

        if(!this.step) this.step = {};
        this.step[name] = step;

        if (row == 0) {
            sprite.position.set(x[0], y[0]);
            if (rotation) sprite.rotation = rotation[0];
        }
        else if (row == 1) {
            sprite.position.set(x[1], y[1]);
            if (rotation) sprite.rotation = rotation[1];
        }
        else if (row == 2) {
            sprite.position.set(x[2], y[2]);
            if (rotation) sprite.rotation = rotation[2];
        }
    }

    _hunterInit(param, name, step, x, y, callback = false, invert = false, loop = false, reverse = false, mode = 0) {

        let reel = param[0],
            row = param[1],
            bgHunter = Data.getSprite('hunter_back'),
            xBgHunter = 67,
            yBgHunter = 135 + 144 * row;

        this._propInit(name);

        this.stop[name] = false;
        this.content.children[reel].addChild(bgHunter);

        if(!mode) {
            if (!this.sprite.hunterBack) this.sprite.hunterBack = [];
            this.sprite.hunterBack.push(bgHunter);
        } else {
            if (!this.sprite.hunterBackWaiting) this.sprite.hunterBackWaiting = [];
            this.sprite.hunterBackWaiting.push(bgHunter);
        }

        bgHunter.position.set(xBgHunter, yBgHunter);

        this._preAnimateInit(reel, row, name, step, x, y, invert);
        this._addToAnimate(name, loop, reverse, callback, () => {
            this.sprite.hunterBack.forEach(function (item) {
                item.destroy();
            });
            this.sprite.hunterBack = [];
        });

    }

    _animateHideCasing(delta) {
        if (this.timerId) this.timerId = false;
        if(this.sprite.AF[0]) {
            this.sprite.AF[0].alpha -= 0.07 * delta;

            if(this.sprite.steam[0]) this.sprite.steam[0].alpha -=0.07 * delta;
            if(this.sprite.steam2[0]) this.sprite.steam2[0].alpha -=0.07 * delta;

            if (this.sprite.AF[0].alpha <= 0) {
                this.stop.AF = true;
                this.app.ticker.remove(this._animateHideCasing, this);
            }
        } else this.app.ticker.remove(this._animateHideCasing, this);
    }

    _moveAnimation() {
        let stop = false;
        let remove = true;

        for (let k in this.sprite) {
            for (let i = 0; i < this.sprite[k].length; i++) {
                remove = false;
                if (this.sprite[k][i]) this.sprite[k][i].y += this.reelStep;

                if (this.sprite[k][i].y >= this.уLimit) {
                    stop = true;
                    break;

                }
            }
        }

        if (stop) {

            for (let k in this.sprite) {

                for (let i = 0; i < this.sprite[k].length; i++) this.sprite[k][i].destroy();

                this.allready[k] = false;
                this.historyFrame[k] = undefined;
                this.counter[k] = 0;
            }
            this.sprite = [];
            this.mask.height = 720;
            this.app.ticker.remove(this._moveAnimation, this);

            for(let key in this.animFunc) this.app.ticker.remove(this.animFunc[key], this);
            this.animFunc = false;
        }

        if (remove) {
            this.app.ticker.remove(this._moveAnimation, this);
            this.mask.height = 720;
        }
    }

    _addToAnimate(name, loop = false, reverse = false, callback = false, callback2 = false, callback3 = false, pause = false) {
        if (callback) this.callback[name] = callback;
        if (callback2) this.callback2[name] = callback2;

        if(!this.animFunc) this.animFunc= {};
        if (!this.animFunc[`animate_${name}`]) {

            this.animFunc[`animate_${name}`] = function (delta) {

                this._animate(name, `animate_${name}`, this.step, loop, reverse, pause, callback3, delta);
            }
       }
        if (!this.allready[name]) this.app.ticker.add(this.animFunc[`animate_${name}`], this);
        this.allready[name] = true;
    }

    _animate(name, fName, step, loop = false, reverse = false, pause = false, callback = false, delta) {

       if(this.stop[name]) this._stopAnimate(name, fName);

       let frame = Math.floor(this.counter[name]);

       for (let i = 0; i < this.sprite[name].length; i++) {
           if (frame != this.historyFrame[name]) {
               this.sprite[name][i].texture = PIXI.TextureCache[`${Data.animateMonitor[name][frame]}.${Config.imgExtension}`];
               if (callback) callback(this.sprite[name][i], frame, i);
           }

       }

       if (this.step[name] < 0 && frame <= loop) this.step[name] = Math.abs(this.step[name]);

       if (this.counter[name] >= Data.animateMonitor[name].length - this.step[name] * delta) {
          if(loop === false) this._stopAnimate(name, fName);
          else {
              if (reverse) {
                  this.step[name] = -this.step[name];
                  this.historyFrame[name] = frame;
                  this.counter[name] += this.step[name];
              }
              else if (pause) {
                  this.historyFrame[name] = frame;
                  this.counter[name] = - pause;
              } else {
                  this.historyFrame[name] = frame;
                  this.counter[name] = loop;
              }
          }

       } else {
           this.historyFrame[name] = frame;
           this.counter[name] += this.step[name] * delta;
       }

   }

   _stopAnimate(name, fName) {
       for (let i = 0; i < this.sprite[name].length; i++) this.sprite[name][i].destroy();
       this.app.ticker.remove(this.animFunc[fName], this);
       this.allready[name] = false;
       this.stop[name] = false;
       this.historyFrame[name] = undefined;
       this.counter[name] = 0;
       this.sprite[name] = {};

       if (this.callback[name]) {
           this.callback[name]();
           this.callback[name] = false;
       }

       if (this.callback2[name]) {
           this.callback2[name]();
           this.callback2[name] = false;
       }

   }

}

class ReelBlock extends Element {
    constructor(app) {
        super();
        let reel_0 = new Reel(app),
            reel_1 = new Reel(app),
            reel_2 = new Reel(app),
            reel_3 = new Reel(app),
            reel_4 = new Reel(app);

        let graphics = new PIXI.Graphics();

        graphics.beginFill();
        graphics.drawRect(0, 0, 775, 431);
        graphics.endFill();

        this.app = app;

        Data.addChild(this, graphics, reel_0.content, reel_1.content, reel_2.content, reel_3.content, reel_4.content);

        this.content.mask = graphics;
        graphics.y = 135;

        reel_1.x = 155;
        reel_2.x = 310;
        reel_3.x = 465;
        reel_4.x = 620;

        this.speedMode = 1;

        this._reel_0 = reel_0;
        this._reel_1 = reel_1;
        this._reel_2 = reel_2;
        this._reel_3 = reel_3;
        this._reel_4 = reel_4;

        this.startFrame = 26;
        this.step = 9;
        this.frame = 0;
        this.stopFrame = [];
        for (let i = 0; i < 5; i++) {
            if(i > 0) this.stopFrame[i] = this.stopFrame[i-1] + this.step;
            else this.stopFrame[i] = this.startFrame;
        }

        this.access = [];
        for (let i = 0; i < 5; i++) this.access[i] = true;

        this.allready = false;

    }

    spin() {
        this._reel_0.move();
        this._reel_1.move();
        this._reel_2.move();
        this._reel_3.move();
        this._reel_4.move();
    }

    stopAndShow(param, callback, mode = 0, callback2 = false, callback3 = false, delay = false, callback4 = false, callback5 = false, callbackDelay, callback6 = false) {

        if(mode == 1) {
            if (this.frame > 17) for (let i = 0; i < 5; i++) this.stopFrame[i] = this.frame;
            else {
                this.startFrame = 17;
                for (let i = 0; i < 5; i++) this.stopFrame[i] = 17;
            }
        }

        if (!this.allready) {
            this.allready = true;
            if (delay) this.stopFrame[4] += delay;
            this.app.ticker.add(stop, this);
            function stop(delta) {

                if (this.frame >= this.stopFrame[0]) {
                   if(callback4) callback4();
                      callback4 = false;

                    if(callbackDelay) {
                        this.frame = this.frame - callbackDelay;
                        callbackDelay = false;
                    } else if (this._access(0)) this._reel_0.stop(param.reel_0, callback2);
                }
                if (this.frame >= this.stopFrame[1] && this._access(1)) this._reel_1.stop(param.reel_1, callback3);
                if (this.frame >= this.stopFrame[2] && this._access(2)) this._reel_2.stop(param.reel_2);
                if (this.frame >= this.stopFrame[3]  && this._access(3)) this._reel_3.stop(param.reel_3);
                if (this.frame >= this.stopFrame[4] && this._access(4)) {
                    this._reel_4.stop(param.reel_4, callback, Data.sound.reelStop());
                    this.app.ticker.remove(stop, this);
                    this.frame = 0;
                    for (let i = 0; i < 5; i++) this.access[i] = true;
                    this.allready = false;
                    this.startFrame = 36;

                    for (let i = 0; i < 5; i++) {
                        if(i > 0) this.stopFrame[i] = this.stopFrame[i-1] + this.step;
                        else this.stopFrame[i] = this.startFrame;
                    }
                } else  this.frame = this.frame + delta;
            }
        }
    }

    _access(index) {
        if (this.access[index]) {
            this.access[index] = false;
            return true;
        } else  return false;
    }

    setSpeedMode(mode) {
        if (mode == 2 || mode == 1)  {
            this.speedMode = mode;
            this._reel_0.speedMode(mode);
            this._reel_1.speedMode(mode);
            this._reel_2.speedMode(mode);
            this._reel_3.speedMode(mode);
            this._reel_4.speedMode(mode);
        }
    }

    getSpeedStep() {
        return this._reel_0.getSpeedStep();
    }

}

class UiControl {

    constructor(app) {

        this.transformStep = {};
        this.transformMax = 30;
        this.transformMin = 0;

        this.opacityStep = {};
        this.opacityMax = 1;
        this.opacityMin = 0;

        this.opacityInfoStep = 0.06;

        this.app = app.app;

        this.opacity = {};
        this.transform = {};
        this.pointerEvents = {};

        this.el = {};

        this.transformStep.menu_1 = -3;
        this.transformStep.menu_2 = -3;

        this.opacityStep.menu_1 = 0.1;
        this.opacityStep.menu_2 = 0.1;

        this.blkHowToPlay = false;

        let content = Data.uiControl.content,
            elName = Data.uiControl.elName,
            imgName = Data.uiControl.imgName,
            container = document.createElement('div'),
            elm = {},
            style = document.createElement('style'),
            $this = this,
            text = document.createTextNode(window.navigator.userAgent);

        container.innerHTML = atob(content);
        document.body.appendChild(container);
        (document.getElementsByClassName('slotUIExternalHelp')[0]).appendChild(text);

        elName.forEach(function (item) {
            elm[item] = document.getElementsByClassName(item)[0];
        });

        this.en = elm.en;

        imgName.forEach(function (item) {
            setImgToCanvas(item);
        });

        setElement('UI_Btn_BetMax', 'BET MAX', 15, 11);
        setElement('UI_Btn_Auto', 'AUTO PLAY', 13, 11);

        elm.closeBtn.addEventListener('click', function() {
            Data.sound.click();
            elm.modal.style.display = 'none';
            elm['ui-bg'].style.display = 'none';
        });

        let cl = ['modalBetMax', 'modalLimit'];
        for (let i = 0; i < cl.length; i++) {
            document.querySelector('.'+ cl[i] + ' .button').addEventListener('click', function() {
                document.getElementsByClassName(cl[i] + '-main')[0].style.display = 'none';
                document.getElementsByClassName('ui-bg')[0].style.display = 'none';
            });
        }

        elm.ui.addEventListener('click', function(e) {
            let atr = e.target.getAttribute('data-id');
            if (atr == 'howToPlay') {
                Data.sound.click();
                if(!$this.blkHowToPlay) {
                    if (this.howToPlay) this.howToPlay();
                    elm.modal.style.display = 'table';
                    elm['ui-bg'].style.display = 'block';
                    $this.showHide('menu_1');
                }

            } else if (atr == 'quickSpin' || atr == 'showBase' || atr == 'freeGame') {
                Data.sound.click();
                if ($this[atr]) $this[atr]();
                e.target.classList.toggle('toggle-wrapper_on');

            } else if (atr >= 10) {
                Data.sound.click();
                let cl = 'enabled',
                    element = e.target.parentNode.getElementsByClassName(cl)[0];
                    if (element) element.classList.remove(cl);
                e.target.classList.add(cl);
            } else if (atr == 'startAutoPlay') {
                let param = {};
                let input = document.querySelectorAll('input');

                param.numbSpin = elm.menu_2.getElementsByClassName('enabled')[0].getAttribute('data-id');
                param.toggle = elm.menu_2.getElementsByClassName('toggle-wrapper_on')[0] ? true : false;
                param.value_1 = input[0].value;
                param.value_2 = input[1].value;

                if ($this[atr]) $this[atr](param);
                $this.showHide('menu_2');

            } else if (atr == 'cancel') {
                Data.sound.click();
                $this.showHide('menu_2');

            }

        });

        let input = document.querySelectorAll('input');

        for (let i = 0; i < input.length; i++) {
            input[i].addEventListener('input', function (e) {
                let el = e.target.parentNode.parentNode.parentNode;
                if (e.target.value) el.classList.remove('off');
                else el.classList.add('off');

            });
        }

        style.setAttribute('type', 'text/css');
        setScrollStyle(elm.uiScroller, elm.slotUIExternalHelp);
        setScrollStyle(elm.pagesContainer, elm.cont2);

        this.moveVolume = null;

        let volThumb =  document.querySelector('.volumeControl .thumb'),
            fill =  document.querySelector('.volumeControl .fill'),
            track =  document.querySelector('.volumeControl .track'),
            volumeControl =  document.querySelector('.volumeControl'),
            canvas = document.querySelectorAll('canvas')[0],
            mouseDown = false,
            mouseOver = false;

        volumeControl.addEventListener('mousemove', function (e) {
            move(e);
        });

        volumeControl.addEventListener('mouseover', function (e) {
            $this.timer = 'stop';
            mouseOver = true;
        });

        volumeControl.addEventListener('mouseout', function (e) {
            mouseOver = false;
            if(!mouseDown) $this.hideVolume();
        });

        track.addEventListener('mousedown', function (e) {
            mouseDown = true;
            move(e);
        });

        volumeControl.addEventListener('mouseup', function () {
            mouseDown = false;
        });

        canvas.addEventListener('mousemove', function (e) {
            move(e);
        });

        canvas.addEventListener('mouseup', function (e) {
            mouseDown = false;
            if(!mouseOver) $this.hideVolume();
        });


        function move(e) {

            let perc = e.clientY * 100 / document.body.clientHeight;

            if(perc < 72.8) perc = 72.8;
            else if (perc > 91.1)  perc = 91.1;

            let result = Math.round((perc -72.8) * 100 / 18.3);
            if (mouseDown) {
                volThumb.style.top = result + '%';
                fill.style.height = (100 - result) + '%';
                let masterVolume = 1 - result / 100;
                createjs.Sound.volume = masterVolume;
                if($this.moveVolume) $this.moveVolume(masterVolume);
            }

        }

        window.addEventListener('resize', function() {
            setUiLayout();
        });

        setUiLayout();

        function setUiLayout() {

            let scale,
                ratio = window.innerWidth / window.innerHeight;

            if (ratio > Config.breackPointRatio) {
                scale = window.innerHeight / 720;
                elm.modal.style.height = '720px';
            } else {
                scale = window.innerWidth / 960;
            }

            elm.ui.style.transform = `scale(${scale})`;
            elm.ui.style.left = `${(window.innerWidth - 960 * scale) / 2}px`;
            elm.ui.style.top = `${(window.innerHeight - 720 * scale) / 2}px`;
            elm['modalBetMax-main'].style.transform = `scale(${scale})`;
            elm['modalLimit-main'].style.transform = `scale(${scale})`;

                if (window.innerHeight > 720 && window.innerWidth > 960) {
                          elm.modal.style.width = `${window.innerWidth}px`;
                          elm.modal.style.height = `${window.innerHeight}px`;

                          elm.modal.style.transform = 'matrix(1, 0, 0, 1, 0, 0)';

                          elm.dialog.style.height = `${600 * (scale)}px`;
                          elm.dialog.style.width = `${800 * (scale)}px`;
                          elm.content.style.height = `${(600 * (scale)) - 56}px`;
                } else {
                    elm.modal.style.width = `${window.innerWidth / scale}px`;
                    elm.modal.style.height = `${window.innerHeight / scale}px`;

                    elm.modal.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`;

                    elm.content.style.height = '544px';
                    elm.dialog.style.width = '800px';
                    elm.dialog.style.height = '600px';
                }
        }

        function setImgToCanvas(imgName) {

            let texture = PIXI.TextureCache[`${imgName}.${Config.imgExtension}`],
                img = texture.baseTexture.source,
                coord = texture.frame,
                canvas = document.getElementsByClassName(imgName),
                trim;

            if (texture.trim) trim = texture.trim;
            else trim = {x: 0, y: 0};

            for (let i = 0; i < canvas.length; i++) {
               let context = canvas[i].getContext('2d');
               context.drawImage(img, coord.x, coord.y, coord.width, coord.height, trim.x, trim.y, coord.width, coord.height);
            }
        }

        function addText(value, params, x, y) {

            let text = new PIXI.Text(value, params);
            text.x = x;
            text.y = y;
            text.scale.set(0.5);

            return text;
        }

        function setElement(cl, text, x, y) {

            let betMaxRender = new PIXI.CanvasRenderer(66, 68, {transparent: true}),
                betMax = document.getElementsByClassName(cl)[0],
                cont = new PIXI.Container(),
                sprite = Data.getSprite(cl);
            betMax.append(betMaxRender.view);
            cont.addChild(sprite);
            cont.addChild(addText(text, Data.ctrPanel.btnTextStyle, x, y));
            betMaxRender.render(cont);

        }

        function setScrollStyle(el ,el2) {
            el.addEventListener('mousedown', function(e) {

                let x1 = Math.round(el.offsetWidth * 0.990),
                    x2 = Math.round(el.offsetWidth * 0.999),
                    y1 = Math.round(el.scrollTop / el2.offsetHeight * el.offsetHeight * 0.96),
                    y2 = Math.round(el.offsetHeight / el2.offsetHeight * el.offsetHeight * 1.08 + y1);

                if (e.offsetX >= x1 && e.offsetX <= x2 && e.offsetY >= y1 && e.offsetY <= y2) {
                    style.innerHTML = '::-webkit-scrollbar-thumb:hover {background: #ff9921;}::-webkit-scrollbar-track {background: #333333;}';
                    document.body.appendChild(style);
                } else if (e.offsetX >= x1 && e.offsetX <= x2) {
                    style.innerHTML = '::-webkit-scrollbar-track {background: #333333;}';
                    document.body.appendChild(style);
                }

            });

            el.addEventListener('mouseup', function(e) {
                style.remove();
            });

        }

    }

    set value(val) {
        document.getElementsByClassName('betMaxValue')[0].innerText = val;
    }

    showMaxBetModal() {
       document.getElementsByClassName('modalBetMax-main')[0].style.display = 'table';
       document.getElementsByClassName('ui-bg')[0].style.display = 'block';
    }

    showLimitModal() {
        document.getElementsByClassName('modalLimit-main')[0].style.display = 'table';
        document.getElementsByClassName('ui-bg')[0].style.display = 'block';
    }

    blockHowToPlay() {
        this.blkHowToPlay = true;
        let style = document.querySelector('[data-id="howToPlay"]').style;
        style.background = 'hsla(0, 0%, 60%, 0.95)';
        style['pointer-events'] = 'none';
    }

    unBlockHowToPlay() {
        this.blkHowToPlay = false;
        let style = document.querySelector('[data-id="howToPlay"]').style;
        style.background = 'hsla(0,0%,100%,.95)';
        style['pointer-events'] = 'inherit';
    }

    click(elm) {
        document.querySelector(`[data-id="${elm}"]`).classList.toggle('toggle-wrapper_on');
    }

    on(el, f) {
        this[el] = f;
    }

    showHideInfoText() {
        if(!this.opacity.info) {
            this.opacity.info = 0;
            this.en.style['pointer-events']  = 'auto';
        } else this.en.style['pointer-events']  = 'none';

        this.app.ticker.add(this._animateInfo, this);
    }

    hide(el) {
        if (this[`${el}Toggle`]) this.showHide(el);
    }

    showHide(el) {
        if (el == 'menu_1'  || el == 'menu_2') {

            if (!this[`${el}Toggle`]) {
                this.el[el] = document.getElementById(el);
                this[`${el}Toggle`] = true;
                this.transform[el] = this.transformMax;
                this.opacity[el] = this.opacityMin;
                this.pointerEvents[el] = 'auto';

                if (this.transformStep[el] > 0) this.transformStep[el] = - this.transformStep[el];
                this.opacityStep[el] = Math.abs(this.opacityStep[el]);
                this.app.ticker.add(_animate, this);

            } else {
                this.el[el] = document.getElementById(el);
                this[`${el}Toggle`] = false;
                this.transform[el] = this.transformMin;
                this.opacity[el] = this.opacityMax;
                this.pointerEvents[el] = 'none';

                this.transformStep[el] = Math.abs(this.transformStep[el]);
                if (this.opacityStep[el] > 0) this.opacityStep[el] = - this.opacityStep[el];
                this.app.ticker.add(_animate, this);
            }

            function _animate() {

                this.transform[el] += this.transformStep[el];
                this.opacity[el] += this.opacityStep[el];
                if (this.opacity[el] < 0.1) this.opacity[el] = 0;

                if (this.transform[el] < this.transformMin) this.transform[el] = this.transformMin;
                else if(this.transform[el] > this.transformMax) this.transform[el] = this.transformMax;

                if (this.opacity[el] < this.opacityMin) this.opacity[el] = this.opacityMin;
                else if(this.opacity[el] > this.opacityMax) this.opacity[el]  = this.opacityMax;

                this.el[el].style.transform = `matrix(1, 0, 0, 1, 0, ${this.transform[el]})`;
                this.el[el].style.opacity = `${this.opacity[el]}`;

                if (this.transform[el] == this.transformMin || this.transform[el] == this.transformMax) this.app.ticker.remove(_animate, this);
                this.el[el].style['pointer-events'] = this.pointerEvents[el];

            }

        }
    }

    _animateInfo() {
        this.opacity.info += this.opacityInfoStep;
        this.en.style.opacity = this.opacity.info;

        if (this.opacity.info <= 0 || this.opacity.info >= 1) {

            if (this.opacity.info <= 0)  {
                this.opacityInfoStep = Math.abs(this.opacityInfoStep);
                this.opacity.info = 0;

            } else if (this.opacity.info >= 1) {
                this.opacityInfoStep = -this.opacityInfoStep;
                this.opacity.info = 1;
            }

            this.app.ticker.remove(this._animateInfo, this);
        }

    }

    showVolume() {
        let style = document.querySelector('.volumeControl').style;
        style.visibility = 'visible';
        style.opacity = '1';
        style['pointer-events'] = 'auto';
    }

    hideVolume() {

        if(!this.timer || this.timer == 'stop') {

            this.timer = 20;
            this.app.ticker.add(hide, this);

            function hide() {

                if (this.timer == 'stop') {
                    this.app.ticker.remove(hide, this);
                } else {
                    if (this.timer == 0) {
                        let style = document.querySelector('.volumeControl').style;
                        style.visibility = 'hidden';
                        style.opacity = '0';
                        style['pointer-events'] = 'none';
                        this.app.ticker.remove(hide, this);
                    } else this.timer--;

                }
            }
        }

    }

}

class ModalInfo extends Element {

    constructor(app) {

        super();
        let bg = new PIXI.Graphics(),
            board = Data.getSprite(Data.modalInfo.bg),
            btnHome = new Button(Data.modalInfo.btn),
            $this = this;

        bg.beginFill(0x000000);
        bg.drawRect(0, 0, 1440, 720);
        bg.endFill();
        bg.alpha = 0.75;

        this.addChild(bg);
        this.addChild(board);
        this.addChild(btnHome.content);
        this.step = 0.06;
        this.content.alpha = 0;
        this.app = app;
        this.btnHome = btnHome;


        btnHome.on('click', function () {
            $this.click();
        });

        board.x = 285;
        board.y = 25;

        btnHome.x = 692;
        btnHome.y = 506;

        btnHome.block(true);

    }

    on(param, f) {
        if(param == 'click') this.click = f;
    }

    showHide() {
        this.app.ticker.add(this._animate, this);
    }

    _animate() {

        this.content.alpha += this.step;

        if (this.content.alpha <= 0 || this.content.alpha >= 1) {

            if (this.content.alpha <= 0)  {
                this.step = Math.abs(this.step);
                this.content.alpha = 0;
                this.btnHome.block(true);

            } else if (this.content.alpha >= 1) {
                this.step = -this.step;
                this.content.alpha = 1;
                this.btnHome.unBlock(true);
            }

            this.app.ticker.remove(this._animate, this);
        }

    }

}

class BigWin extends Element {

    constructor(app) {
        super();

        this.app = app;

        let graphics = new PIXI.Graphics();
        graphics.beginFill();
        graphics.drawRect(0, 0, 2880, 1440);
        graphics.endFill();
        graphics.alpha = 0.8;

        this.addChild(graphics);

        let mainImg = [];
        for (let item of Data.bigWin.main) mainImg.push(Data.getSprite(item));

        let tubeLeft = Data.getSprite(Data.bigWin.tube[0]),
            middleTube = Data.getSprite(Data.bigWin.tube[1]),
            middleTube2 = Data.getSprite(Data.bigWin.tube[1]),
            tubeRight = Data.getSprite(Data.bigWin.tube[2]);

        let main = new PIXI.Container();
        for (let item of mainImg) main.addChild(item);
        Data.addChild(main, tubeLeft, middleTube, middleTube2, tubeRight);

        this.main = main;

        this.gear = mainImg[1];
        this.gear.anchor.set(0.5);

        this.gear2 = mainImg[6];
        this.gear2.anchor.set(0.5);

        this.gear3 = mainImg[7];
        this.gear3.anchor.set(0.5);

        this.mainGear = mainImg[3];
        this.mainGear.anchor.set(0.5);

        let coinContainer = new PIXI.Container(),
            cirlceContainer = new PIXI.Container();

        this.cirlceContainer = cirlceContainer;
        this.coinContainer = coinContainer;
        this.addChild(cirlceContainer);
        this.addChild(coinContainer);

        let mask = new PIXI.Graphics();
        mask.beginFill(0xFF);
        mask.drawRect(0, 0, 1440, 720);
        mask.endFill();

        this.addChild(mask);
        this.coinContainer.mask = mask;
        this.cirlceContainer.mask = mask;
        main.mask = mask;

        this.addChild(main);

        mask.position.set(720, 360);

        mainImg[0].x = 102;

        mainImg[1].position.set(135, 415);
        mainImg[2].position.set(22, 5);
        mainImg[3].position.set(264, 280);
        mainImg[4].position.set(47, 62);
        mainImg[5].position.set(0, 0);
        mainImg[6].position.set(327, 440);
        mainImg[7].position.set(367, 390);
        mainImg[8].position.set(50, 0);
        mainImg[9].position.set(110, 50);

        tubeLeft.scale.set(0.5);
        tubeLeft.position.set(82, 192);

        middleTube.scale.set(0.5);
        middleTube.position.set(167, 192);

        middleTube2.scale.set(0.5);
        middleTube2.position.set(247, 192);

        tubeRight.scale.set(0.5);
        tubeRight.position.set(325, 192);

        let cirlce = new PIXI.Graphics();
        cirlce.lineStyle(120, 0xffdb6e);
        cirlce.drawCircle(0, 0, 280);
        this.cirlceContainer.addChild(cirlce);
        cirlce.filters = [new PIXI.filters.BlurFilter(23, 3, 0.1)];
        cirlce.alpha = 0.5;
        cirlce.position.set(1440, 685);
        cirlce.scale.set(0.5);
        this.cirlce = cirlce;

        let display = [];
        for (let i = 0; i < 4; i++) display.push(new PIXI.Sprite());
        for (let i = 0; i < 4; i++) main.addChild(display[i]);
        for (let i = 0; i < 4; i++) display[i].scale.set(0.5);

        display[3].position.set(104, 237);
        display[2].position.set(187, 237);
        display[1].position.set(268, 237);
        display[0].position.set(349, 237);

        this.display = display;

        main.x = (this.content.width - 530) / 2;
        main.y = (this.content.height - 670) / 2;

        let btn = new Button(Data.bigWin.btn);
        this.addChild(btn.content);

        btn.clickZone(false);
        btn.x = (this.content.width - btn.width) / 2;
        btn.y = 1010;
        this.btn = btn;

        let $this = this,
            clickFunc = ()=> $this.summCounter = $this.summ;
        btn.on('click', clickFunc);

        document.addEventListener('keydown', function(event) {
            if (event.code == 'Space' && $this.btn.content.interactive) clickFunc();
        });

        this.btn.content.interactive = false;
        this.content.alpha = 0;
    }

    showBigWin(summ, delay, callback, callback2) {
        if(summ > 9999) summ = 9999;

        let frame = delay;
        this.app.ticker.add(pause, this);

        function pause(delta) {
            if (frame <= -80) {
                this.app.ticker.remove(pause, this);
                callback2();
                start.call(this);

            } else frame -= delta;
        }

        function start() {

            Data.sound.bigWin();

            this.btn.content.interactive = true;
            this.callback = callback;
            this.summ = summ;
            this.removeCoin = false;

            let frameGear = 0,
                scale = 0.5,
                arrCoin = [],
                scaleDelay = 0,

                summStep = 0,
                summAddStep = 0.00125,

                scale2 = 1,
                frameHideSumm = 0,
                frameHideStep = 0.0005,
                mainStep = 0;

            this.summCounter = 0;
            this.app.ticker.add(showGear, this);
            this.app.ticker.add(showRoundCoin, this);
            this.app.ticker.add(moveCoin, this);
            this.app.ticker.add(shine, this);
            this.app.ticker.add(showSumm, this);


            function showSumm(delta) {
                if (this.content.alpha < 1) this.content.alpha += 0.03 * delta;

                if (this.summCounter > summ) this.summCounter = summ;

                let displaySumm = (Math.floor(this.summCounter)).toFixed();

                for (let i = displaySumm.length - 1; i > -1; i--) {
                    this.display[displaySumm.length - 1 - i].texture = PIXI.TextureCache[`${Data.bigWin.numbers[+displaySumm[i]]}.${Config.imgExtension}`];
                }

                if (displaySumm == summ) {
                    Data.sound.bigWinStop();
                    this.content.alpha = 1;
                    this.app.ticker.remove(showSumm, this);
                    this.app.ticker.add(hideSumm, this);
                }

                this.summCounter += mainStep;
                if (displaySumm < 100) summStep += summAddStep;
                else summStep *= 1.003;

                    mainStep = summStep;
                    let deltaPart = delta - 1;

                let intPart = Math.trunc(deltaPart);

                for (let i = 0; i < intPart; i++) {
                    if (displaySumm < 100) summStep += summAddStep;
                    else summStep *= 1.004;
                    mainStep += summStep;
                }

            }

            function hideSumm(delta) {

                this.btn.setImg(2, 2);
                if (frameHideSumm > 120) {
                    this.content.alpha -= 0.03 * delta;
                    if (this.content.alpha <= 0) {
                        this.app.ticker.remove(showGear, this);
                        this.app.ticker.remove(showRoundCoin, this);
                        this.app.ticker.remove(shine, this);
                        this.app.ticker.remove(hideSumm, this);
                        this.removeCoin = true;
                        this.main.scale.set(1);
                        this.btn.setImg(0, 1);
                        this.btn.content.interactive = false;

                        for (let i = 0; i < this.display.length; i++) this.display[i].texture = null;
                        this.callback();
                    }
                } else if (frameHideSumm > 75) frameHideStep /= 1.06;
                else if (frameHideSumm > 55) frameHideStep *= 1.17;
                else if (frameHideSumm > 18) frameHideStep /= 1.08;
                else if (frameHideSumm > 11) frameHideStep = frameHideStep;
                else frameHideStep *= 1.19;

                this.main.scale.set(scale2);
                this.main.x = (2880 - 530 * scale2) / 2;
                this.main.y = (1440 - 670 * scale2) / 2;

                if (frameHideSumm > 50) scale2 -= frameHideStep * delta;
                else scale2 += frameHideStep * delta;
                frameHideSumm += delta;
            }

            function shine(delta) {
                if (scale >= 0.85) {
                    if (scaleDelay >= 30) {
                        scale = 0.5;
                        this.cirlce.alpha = 0.5;
                        scaleDelay = 0;
                    } else {
                        this.cirlce.alpha -= 0.020 * delta;
                        scaleDelay += delta;
                    }
                }

                this.cirlce.scale.set(scale);
                scale = +(scale + 0.011 * delta).toFixed(4);
            }

            function moveCoin(delta) {

                if (Data.randomInteger(1, 4) == 1) {
                    let coin = {
                        deg: Data.randomInteger(1, 365),
                        step: 5,
                        scale: 0.2,
                        scaleStep: Data.randomInteger(30, 50) / 10000,
                        roundCounter: 0,
                        roundStep: Data.randomInteger(25, 40) / 100,
                        content: Data.getSprite(Data.bigWin.coin[0]),
                        del: false
                    };

                    coin.content.x = 1450;
                    coin.content.y = 590;
                    coin.content.scale.set(1);
                    coin.content.anchor.set(0.5);
                    coin.content.rotation = Data.randomInteger(1, 6);

                    arrCoin.push(coin);
                    this.coinContainer.addChild(coin.content);

                }

                for (let item of arrCoin) {
                    let radian = (Math.PI / 180) * item.deg,
                        k_x = Math.cos(radian),
                        k_y = Math.sqrt(1 - Math.pow(k_x, 2));

                    item.content.x += item.step * k_x * delta;
                    let deltaY = item.step * k_y;
                    if (item.deg > 180) deltaY = -deltaY;
                    item.content.y += deltaY  * delta;
                    item.content.scale.set(item.scale);

                    item.scale += item.scaleStep  * delta;


                    if (item.content.x < 350 ||
                        item.content.x > 2346 ||
                        item.content.y < 200 ||
                        item.content.y > 1300
                    ) item.del = true;
                }

                for (let i = 0; i < arrCoin.length; i++) {
                    if (arrCoin[i].del) {
                        arrCoin[i].content.destroy();
                        arrCoin.splice(i, 1);
                        break;
                    }
                }

                if (this.removeCoin == true) {
                    for (let i = 0; i < arrCoin.length; i++) arrCoin[i].content.destroy();
                    this.app.ticker.remove(moveCoin, this);
                }

            }

            function showRoundCoin(delta) {
                for (let item of arrCoin) {
                    let frame = Math.floor(item.roundCounter);
                    if (frame >= 15) {
                        item.roundCounter = 0;
                        frame = 0;
                    }

                    item.content.texture = PIXI.TextureCache[`${Data.bigWin.coin[frame]}.${Config.imgExtension}`];
                    item.roundCounter = +(item.roundCounter + item.roundStep * delta).toFixed(2);
                }
            }

            function showGear(delta) {

                this.gear.rotation += 0.025 * delta;
                this.gear2.rotation += 0.025 * delta;
                this.gear3.rotation += 0.12 * delta;

                if (frameGear < 30) this.mainGear.rotation += 0.02 * delta;
                else if (frameGear < 95) this.mainGear.rotation -= 0.003 * delta;

                else if (frameGear < 120) this.mainGear.rotation += 0.015 * delta;
                else if (frameGear < 128) this.mainGear.rotation -= 0.01 * delta;
                else if (frameGear < 155) this.mainGear.rotation += 0.017 * delta;
                else if (frameGear < 215) this.mainGear.rotation -= 0.003 * delta;

                else if (frameGear < 245) this.mainGear.rotation += 0.015 * delta;
                else if (frameGear < 253) this.mainGear.rotation -= 0.01 * delta;
                else if (frameGear < 280) this.mainGear.rotation += 0.017 * delta;
                else if (frameGear < 340) this.mainGear.rotation -= 0.003 * delta;

                if (frameGear >= 340) frameGear = 0;
                else frameGear += delta;
            }
        }
    }

}

class WildMulti extends Element {

    constructor(app) {
        super();
        let graphics = new PIXI.Graphics();
        graphics.beginFill();
        graphics.drawRect(0, 0, 815, 431);
        graphics.endFill();
        graphics.alpha = 0;

        this.app = app;

        let backPack = new PIXI.Container();

        let elm = [];
        for (let i = 0; i < Data.wildMulti.images.length; i++) {
            let sprite = Data.getSprite(Data.wildMulti.images[i]);
            elm.push(sprite);
            backPack.addChild(sprite);
        }

        Data.addChild(this, graphics, backPack);

        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
            colorMatrix.brightness(2);

        elm[3].filters = [colorMatrix];
        elm[3].position.set(119, 101);
        elm[3].alpha = 0;

        backPack.x = 165;
        backPack.alpha = 0;

        graphics.y = 115;

        let text = new PIXI.Text('', Data.wildMulti.text);

        text.y = 453;
        text.alpha = 0;
        text.scale.set(0.5);
        this.addChild(text);

        this.back = graphics;
        this.text = text;
        this.backPack = backPack;
        this.backPackGlow = elm[3];

        let x = Data.getSprite(Data.winRate.digits[12]),
        numb = Data.getSprite(Data.winRate.digits[3]);

        Data.addChild(this, x, numb);

        x.position.set(290, 271);
        x.alpha = 0;
        this.x_ = x;

        numb.position.set(400, 271);
        numb.alpha = 0;
        this.numb = numb;

        this.multi = false;
    }

    showWildExpansion() {
      this.text.text = 'WILD EXPANSION';
      this.text.x = 160;
      this._show();
    }

    showMultiplier(numb) {
        this.multi = true;
        this.x_.texture = PIXI.TextureCache[`${Data.winRate.digits[12]}.${Config.imgExtension}`];
        this.text.text = 'MULTIPLIER';
        this.numb.texture = PIXI.TextureCache[`${Data.winRate.digits[numb]}.${Config.imgExtension}`];

        this.text.x = 235;
        this._show();
    }

    showFreeGames() {
        this.multi = true;
        this.x_.texture = PIXI.TextureCache[`${Data.winRate.digits[13]}.${Config.imgExtension}`];
        this.text.text = 'FREE GAMES';
        this.numb.texture = PIXI.TextureCache[`${Data.winRate.digits[2]}.${Config.imgExtension}`];

        this.text.x = 235;
        this._show();
    }

    _show() {

        let frame = 0,
            backPackAccess = true;

        Data.sound.bonus();
        this.app.ticker.add(show, this);
        function show(delta) {

            if (this.back.alpha < 0.5) {
                this.back.alpha += 0.02 * delta;
                if(this.back.alpha > 0.5) this.back.alpha = 0.5;
            }

            if (frame > 26) {
                if(this.backPack.alpha < 1) {
                    this.backPack.alpha += 0.033 * delta;
                    if(this.backPack.alpha > 1) this.backPack.alpha = 1;
                }

                if(this.backPack.y > -7.5 && backPackAccess) {
                    this.backPack.y -= 0.64 * delta;
                    if(this.backPack.y < -7.5) this.backPack.y = -7.5;
                } else {
                    backPackAccess = false;
                    if(this.backPack.y < 7.5) {
                        this.backPack.y += 0.63 * delta;
                        if(this.backPack.y > 7.5) this.backPack.y = 7.5;
                    }

                }
            }

            if (frame > 56 && this.text.alpha < 1) {
                this.text.alpha += 0.055 * delta;
                if (this.multi && this.x_.alpha < 1) {
                    this.x_.alpha += 0.055 * delta;
                    this.numb.alpha += 0.055 * delta;
                }
            }

            if (frame > 75 && this.backPackGlow.alpha < 1) this.backPackGlow.alpha += 0.036 * delta;
            if (frame > 104 && this.backPackGlow.alpha > 0) this.backPackGlow.alpha -= 0.06 * delta;
            if (frame > 145 && this.content.alpha > 0) this.content.alpha -= 0.032 * delta;

            if (this.content.alpha <= 0) {
                this.back.alpha = 0;
                this.backPack.y = 0;
                this.backPack.alpha = 0;
                this.text.alpha = 0;
                this.backPackGlow.alpha = 0;
                this.x_.alpha = 0;
                this.numb.alpha = 0;
                this.content.alpha = 1;
                this.multi = false;

                this.app.ticker.remove(show, this);
            }

            frame = frame + 1 * delta;
        }
    }

}

class FreeGame extends Element {
    constructor(app) {
        super();

        this.app = app;
        let ft = Data.getSprite(Data.freeGames.ft),
            bgContainer = new PIXI.Container(),
            bg = Data.getSprite(Data.freeGames.bg),
            dino = Data.getSprite(Data.freeGames.dino),
            hunter = Data.getSprite(Data.freeGames.hunter),
            btn = new Button(Data.bigWin.btn);

        bgContainer.addChild(bg);
        bgContainer.addChild(dino);
        bgContainer.addChild(hunter);
        bgContainer.addChild(btn.content);

        this.addChild(bgContainer);
        this.addChild(ft);


        dino.x = 311;

        ft.x = 360;
        ft.y = 250;
        ft.alpha = 0;
        this.ft = ft;


        this.btnFunc = () => console.log('empty');
        btn.clickZone(false);
        btn.x = (this.content.width - btn.width) / 2;
        btn.y = 650;
        this.btn = btn;

        let $this = this;
        btn.on('click', () => {
            $this.hide = true;
        });

        document.addEventListener('keydown', function(event) {
            if (event.code == 'Space' && $this.btn.content.interactive) $this.hide = true;
        });


        this.btn.content.interactive = false;

        bgContainer.alpha = 0;
        this.bgContainer = bgContainer;

        this.hide = false;
        this.func = false;

    }

    start(callback, callback2) {
        let frame = 0,
            scale = 1.25,
            scaleStep = 0.00206,
            soundBlock = false,
            middleBlock = false;
        this.app.ticker.add(showHide, this);
        Data.sound.startFreeGame();


        function showHide(delta) {
            if (this.ft.alpha < 1) {
                this.ft.alpha += 0.0083 * delta;
                scale -= scaleStep * delta;
                this.ft.scale.set(scale);
                this.ft.x = (this.content.width - this.ft.width) / 2.2;
            }

            if(frame >= 170 && !soundBlock) {
                Data.sound.freeGameBell();
                soundBlock = true;
            }

            if (frame > 120) if (this.bgContainer.alpha < 1)  this.bgContainer.alpha += 0.011 * delta;
            if (frame >= 220 && !middleBlock) {
                middleBlock = true;
                callback2();
                this.btn.content.interactive = true;
                this.bgContainer.alpha = 1;
            }

            if(this.hide) {

                if (this.bgContainer.alpha > 0 ) this.bgContainer.alpha -= 0.1 * delta;
                if (this.ft.alpha > 0) this.ft.alpha -= 0.1 * delta;

                if (this.bgContainer.alpha <= 0 && this.ft.alpha <= 0) {
                    this.bgContainer.alpha = 0;
                    this.ft.alpha = 0;
                    this.btn.content.interactive = false;
                    this.hide = false;
                    this.app.ticker.remove(showHide, this);
                    callback();
                    Data.sound.stopMain();
                    Data.sound.playFreeGame();
                }
            }

          if (frame < 221)  frame += delta;
        }
    }



}

class FreeGameEnd extends Element {

    constructor(app) {
        super();

        this.hide = false;
        this.app = app;

         let bg = Data.getSprite(Data.main.background),
             aircraft = new PIXI.Container(),
             rope = Data.getSprite(Data.freeGamesEnd.rope),
             ropeBags = Data.getSprite(Data.freeGamesEnd.ropeBags[0]),
             bigPropeler = Data.getSprite(Data.freeGamesEnd.bigPropeler[0]),
             smallPropeler = Data.getSprite(Data.freeGamesEnd.smallPropeler[0]),
             flag1 = Data.getSprite(Data.freeGamesEnd.flag1[0]),
             flag2 = Data.getSprite(Data.freeGamesEnd.flag2[0]),
             flag3 = Data.getSprite(Data.freeGamesEnd.flag3[0]),
             yhw = Data.getSprite(Data.freeGamesEnd.yhw);

         Data.addChild(
             aircraft,
             rope,
             ropeBags,
             flag3,
             Data.getSprite(Data.freeGamesEnd.aircraft),
             flag2,
             flag1,
             bigPropeler,
             Data.getSprite(Data.freeGamesEnd.wing),
             smallPropeler,
             yhw
         );

        Data.addChild(this, bg, aircraft);

        rope.position.set(25, 20);
        ropeBags.position.set(365, 440);
        bigPropeler.position.set(62, 150);
        smallPropeler.position.set(170, 365);
        flag1.position.set(419, 72);
        flag2.position.set(385, 49);
        flag3.position.set(425, 47);

        aircraft.position.set(665, 360);
        aircraft.scale.set(0.95);
        aircraft.pivot.x = 570;
        aircraft.pivot.y = 323;

        yhw.position.set(338, 68);

        this.ropeBags = ropeBags;
        this.bigPropeler = bigPropeler;
        this.smallPropeler = smallPropeler;
        this.flag1 = flag1;
        this.flag2 = flag2;
        this.flag3 = flag3;

        this.aircraft = aircraft;
        this.content.alpha = 0;

        let digitSlot = [],
            digitContainer = new PIXI.Container;
        for (let i = 0; i < 8; i++) digitSlot.push(new PIXI.Sprite());
        for (let i = 0; i < digitSlot.length; i++) digitContainer.addChild(digitSlot[i]);

        digitContainer.y = 273;

        aircraft.addChild(digitContainer);
        this.digitSlot = digitSlot;
        this.digitContainer = digitContainer;

        let text = new PIXI.Text('', Data.wildMulti.text);
        aircraft.addChild(text);
        text.scale.set(0.4);
        text.y = 485;
        this.text = text;

        let btn = new Button(Data.bigWin.btn);
        btn.clickZone(false);
        btn.x = (this.content.width - btn.width) / 2.08;
        btn.y = 650;
        this.addChild(btn.content);
        this.btn = btn;

        btn.on('click', () => {
            this.hide = true;
            this.btn.setImg(2, 2);
        });

        let $this = this;
        document.addEventListener('keydown', function(event) {
            if (event.code == 'Space' && $this.btn.content.interactive) {
                $this.hide = true;
                $this.btn.setImg(2, 2);
            }
        });

        this.btn.content.interactive = false;
    }

    show(allWin, games, time, callback, callback2) {

        if (allWin > 99999.99) allWin = 99999.99;

        let ropeBagsCounter = 0,
            propelerCounter = 0,
            flagCounter = 0,
            rotation = 0,
            rotationStep = 0.0001,

            step = allWin / (time * 60),
            current = 0,
            summ = +allWin.toFixed(2),

            textCurrent = 0,
            textStep = games / (time * 60),
            textSumm = Math.round(games),

            frame = 0,
            scale = 1,
            scaleStep = 0.001,
            allFrames = time * 60,
            finalSound = true;

        this.btn.content.interactive = true;

        Data.sound.finalFreeGame();

        this.app.ticker.add(animate, this);

        function animate(delta) {

            if (this.content.alpha < 1) this.content.alpha = +(this.content.alpha + 0.04).toFixed(2);

            if(ropeBagsCounter >= Data.freeGamesEnd.ropeBags.length) ropeBagsCounter = 0;
            let ropeBagsFrame = Math.floor(ropeBagsCounter);

            if(propelerCounter >= Data.freeGamesEnd.bigPropeler.length) propelerCounter = 0;
            let propelerFrame = Math.floor(propelerCounter);

            if(flagCounter >= Data.freeGamesEnd.flag1.length) flagCounter = 0;
            let flagFrame = Math.floor(flagCounter);

            this.ropeBags.texture = PIXI.TextureCache[`${Data.freeGamesEnd.ropeBags[ropeBagsFrame]}.${Config.imgExtension}`];

            this.bigPropeler.texture = PIXI.TextureCache[`${Data.freeGamesEnd.bigPropeler[propelerFrame]}.${Config.imgExtension}`];
            this.smallPropeler.texture = PIXI.TextureCache[`${Data.freeGamesEnd.smallPropeler[propelerFrame]}.${Config.imgExtension}`];

            this.flag1.texture = PIXI.TextureCache[`${Data.freeGamesEnd.flag1[flagFrame]}.${Config.imgExtension}`];
            this.flag2.texture = PIXI.TextureCache[`${Data.freeGamesEnd.flag2[flagFrame]}.${Config.imgExtension}`];
            this.flag3.texture = PIXI.TextureCache[`${Data.freeGamesEnd.flag3[flagFrame]}.${Config.imgExtension}`];

            ropeBagsCounter+= 0.3 * delta;
            propelerCounter+= 0.3;
            flagCounter+= 0.3 * delta;

            if (rotation >= 0.03) rotationStep = -rotationStep;
            else if (rotation <= -0.03) rotationStep = Math.abs(rotationStep);

            rotation += rotationStep * delta;
            this.aircraft.rotation = rotation;

            let curr = current.toFixed(2);
            for (let i = 0; i < this.digitSlot.length; i++) this.digitSlot[i].texture = false;

            for (let i = 0; i < curr.length; i++) {
                this.digitSlot[i].texture = this._getTexture(curr[i]);
                if (i > 0) this.digitSlot[i].x =  this.digitSlot[i-1].x + 100;
            }

            current += step * delta;
            if (current >= summ) current = summ;

            this.text.text = `${Math.round(textCurrent)} FREE GAMES PLAYED`;

            textCurrent += textStep * delta;
            if (textCurrent >= textSumm) textCurrent = textSumm;

            if (frame >= allFrames - 30 && frame <= allFrames -3) scaleStep *= 1.08;
            if (frame >= allFrames - 3 && frame <= allFrames + 34) scaleStep /= 1.12;
            if (frame >= allFrames + 34 && frame <= allFrames + 52) {
                 scaleStep *= 1.25;
                if (scaleStep > 0) scaleStep = -scaleStep
            }
            if (frame >= allFrames + 52 && frame <= allFrames + 100) scaleStep /= 1.055;
            if (frame >= allFrames - 30 && frame <= allFrames + 100) {
                scale += scaleStep * delta;
                this.digitContainer.scale.set(scale);
                this.text.scale.set(scale / 2.5);
            }

            this.digitContainer.x = (this.aircraft.width - this.digitContainer.width) / 1.7;
            this.text.x = (this.aircraft.width - this.text.width) / 1.73;

            if(frame >= allFrames - 20 && finalSound)  {
                 Data.sound.finalFreeGame2();
                finalSound = false;
            }

            frame += delta;

            if(this.hide) {
                callback();
                if (frame < allFrames - 30) {
                    frame = allFrames - 30;
                    current = (allFrames - 30) * step;
                    textCurrent = (allFrames - 30) * textStep;
                }

                if (frame > allFrames + 150) {
                   this.content.alpha  = +(this.content.alpha -0.09).toFixed(2);
                   if (this.content.alpha <= 0) {
                       setTimeout(callback2, 50);
                       Data.sound.playMain();
                       this.hide = false;
                       this.btn.content.interactive = false;
                       this.app.ticker.remove(animate, this);
                       this.btn.setImg(0, 1);
                   }
                }
            }

        }

    }

    _getTexture(elm) {
        let numbElm;
        if(+elm || +elm == 0)  numbElm = +elm;
        else numbElm = 11;
        return  PIXI.TextureCache[`${Data.winRate.digits[numbElm]}.${Config.imgExtension}`];
    }

}

class LineSumm extends Element {

    constructor(app) {
        super();
        let digitSlot = [],
            container = new PIXI.Container;

        this.app = app;

        for (let i = 0; i < 8; i++) digitSlot.push(new PIXI.Sprite());
        for (let i = 0; i < digitSlot.length; i++) container.addChild(digitSlot[i]);
        for (let i = 0; i < digitSlot.length; i++) digitSlot[i].texture = false;

        this.addChild(container);

        container.alpha = 0;

        this.container = container;
        this.digitSlot = digitSlot;
        this.param = null;
        this.current = 0;
        this.reverse = false;
    }


    show(param) {
        if (!this.param) {
            let reverse = false;
            for (let item of param) {
               if (item[3][0] === false) {
                   reverse = true;
                   break;
               }
            }

            this.reverse = reverse;
            this.param = param;
        }

        if (this.current == this.param.length) this.current = 0;
        let summ = this.param[this.current][2].toFixed(2),
            arr = this.param[this.current][3],
            coord;

        this.current++;

        if (this.reverse) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== false) {
                    coord = [i, arr[i]];
                    break;
                }
            }
        } else {
            for (let i = arr.length - 1; i > -1; i--) {
                if (arr[i] !== false) {
                    coord = [i, arr[i]];
                    break;
                }
            }
        }

        let x, y;

        if (coord[0] == 0) x = 4.25;
        else if (coord[0] == 1) x = 2.75;
        else if (coord[0] == 2) x = 2;
        else if (coord[0] == 3) x = 1.58;
        else if (coord[0] == 4) x = 1.32;

        if (coord[1] == 0) y = 3.85;
        else if (coord[1] == 1) y = 2.06;
        else if (coord[1] == 2) y = 1.39;


        for (let i = 0; i < summ.length; i++) {
            this.digitSlot[i].texture = this._getTexture(summ[i]);
            if (i > 0) this.digitSlot[i].x = this.digitSlot[i-1].x + 100;
        }

        this.container.scale.set(0.3);
        this.container.alpha = 0;
        this.app.ticker.add(animate, this);
        let stop = false,
            delay = 12,
            delay2 = 7,
            scale = 0.4,
            scaleStep = 0.009,
            alphaStep = 0.07;

        function animate(delta) {

            if(delay2 <= 0) {

                scaleStep /= 1.08;

                let mainStep = scaleStep,
                    deltaPart = delta - 1;

                let intPart = Math.trunc(deltaPart);

                for (let i = 0; i < intPart; i++) {
                    scaleStep /= 1.08;
                    mainStep += scaleStep;
                }

                scale += mainStep;

                this.container.scale.set(scale);

                if (this.container.alpha < 1) {
                    if (!stop) this.container.alpha += alphaStep * delta;
                } else stop = true;

                if (stop) {
                    if (delay <= 0) {
                        this.container.alpha -= 0.07 * delta;
                        if (this.container.alpha <= 0.3) {
                            this.app.ticker.remove(animate, this);
                            for (let i = 0; i < this.digitSlot.length; i++) {
                                this.digitSlot[i].texture = null;
                                this.digitSlot[i].x = 0;
                                this.container.alpha = 0;
                            }

                        }
                    } else delay -= delta;
                }

                this.container.x = (1440 - this.container.width) / x;
                this.container.y = (720 - this.container.height) / y;

            } else delay2 -= delta;

        }
    }

    hide(){
        this.content.alpha = 0;
        this.current = 0;
    }

    update() {
        this.param = null;
        this.content.alpha = 1;
    }


    _getTexture(elm) {
        let numbElm;
        if(+elm || +elm == 0)  numbElm = +elm;
        else numbElm = 11;

        return  PIXI.TextureCache[`${Data.winRate.digits[numbElm]}.${Config.imgExtension}`];
    }

}

class PaymentBoard {

    constructor() {
       let arr = [];

       for (let item of Data.paymentBoard.cl) {
           let elm = document.querySelector('.' + item).parentNode.nextElementSibling.querySelectorAll('.count');
           for (let i = 0; i < elm.length; i++) arr.push(elm[i].nextElementSibling);
       }

       this.elm = arr;
    }

    update(bet) {
        let elm = this.elm;

        let i = 0;
        for (let k in Data.paymentBoard.payment) {
            let pay =+(bet * Data.paymentBoard.payment[k]).toFixed(2);
            if (String(pay).indexOf('.') != -1) pay = pay.toFixed(2);
            elm[i].innerHTML = '‡' + pay;
            i++;
        }
    }

}

class Controller {

    static bet = 12.5;
    static betLevel = 1;
    static coin  = 0.5;
    static balance = 2000;
    static start = true;

    static isPushStop = false;
    static param = {tankLevel:[{}, {}]};
    static countSpin = 1;
    static multiSpin = false;
    static blockStopBtn = false;
    static blockMainButton = false;
    static k = '1x';
    static startMain = true;
    static volumeToggle = 1;
    static historyVolume = 0;
    static fullScreen = false;


    static build(app) {

        Controller.mark = document.querySelector('body').id;

        let response = false;

        let btnsName = ['main','plus', 'min', 'info', 'betMax', 'btnPlus2', 'btnMin2', 'menu', 'maxMin', 'sound', 'playOn'],
            background = Data.getSprite(Data.main.background),
            linetable = new LineTable(app.app),
            controlPanel = new ControlPanel(),
            rack = new Rack(app.app),
            reelBlock = new ReelBlock(app.app),
            container = new PIXI.Container(),
            uiControl = new UiControl(app),
            modalInfo = new ModalInfo(app.app),
            animateMonitor = new AnimateMonitor((app.app)),
            winRate = new WinRate(app.app),
            bigWin = new BigWin(app.app),
            wildMulti = new WildMulti(app.app),
            freeGame = new FreeGame(app.app),
            freeGameEnd = new FreeGameEnd(app.app),
            lineSumm = new LineSumm(app.app),
            paymentBoard = new PaymentBoard();

        Data.addChild(container,
            background,
            linetable.content,
            rack.content,
            controlPanel.content,
            reelBlock.content,
            animateMonitor.content,
            lineSumm.content,
            modalInfo.content,
            winRate.content,
            wildMulti.content,
            freeGame.content,
            freeGameEnd.content
        );

        controlPanel.content.position.set((container.width - controlPanel.width) / 2, container.height - controlPanel.height);
        rack.content.position.set((container.width - rack.width) / 2, 1);
        reelBlock.content.position.set(336, 0);
        animateMonitor.x = 269;
        winRate.content.position.set(300, 250);
        wildMulti.content.position.set(310, 20);

        bigWin.x = (app.width - bigWin.width) / 2;

        modalInfo.on('click', function () {
            modalInfo.showHide();
            uiControl.showHideInfoText();
            unblockBtns();
            controlPanel.btn.auto.unBlock();
        });

        controlPanel.on('mainButton', whenOnMainButton);

        function whenOnMainButton() {

           if(Controller.startMain) {
               Data.sound.playMain();
               Controller.startMain = false;
           }

            if (!Controller.blockMainButton) {

               if (Controller.balance - Controller.bet <= 0) uiControl.showLimitModal();
               else {
                   Controller.blockMainButton = true;
                   Data.sound.mainBtn();
                   Data.sound.reel();

                   if (!Controller.detectFreeSpin(Controller.param)) Controller.balance -= Controller.bet;
                   controlPanel.on('mainButton', whenOnStop);
                   rack.setBoardValue('scBoardMultiplierDigit', Controller.k);
                   animateMonitor.hideAllLine();
                   lineSumm.hide();
                   animateMonitor.moveAnimation(reelBlock.getSpeedStep());
                   linetable.stopLines();

                   controlPanel.btn.main.setImg(3, 4);
                   uiControl.blockHowToPlay();

                   blockBtns(false);
                   if (Controller.multiSpin) {
                       controlPanel.btn.auto.addCountSpin(Controller.countSpin);
                   } else {
                       controlPanel.btn.auto.block();
                       controlPanel.btn.auto.textFill = Data.ctrPanel.btnTextStyle.fillDisable;
                   }

                   let balance = Controller.formatNumeric(Controller.balance);
                   controlPanel.setBoardValue('scBoardBalance', balance);
                   controlPanel.setBoardValue('scBoardBalanceSmall', balance);
                   reelBlock.spin();
                   Data.sendRequest(`bet=${Controller.bet}&mark=${++Controller.mark}`, whenResponce, 'game.php');
               }
            }
        }

        function whenOnStop() {
            if(!Controller.blockStopBtn) {
                Controller.blockStopBtn = true;
                controlPanel.btn.main.setImg(2, 2);
                animateMonitor.hideCasing();

                if (response) reelBlock.stopAndShow(Controller.param, whenStopReels, 1);
                else Controller.isPushStop = true;
            }
        }

        function whenResponce() {
            response = true;
            Controller.param = JSON.parse(arguments[0]);

            if (Controller.param.hasOwnProperty('mark')) {
                document.querySelector('canvas').style.width = 0;
                Data.sound.muted = true;
                location.reload();
                return;
            }

            Controller.balance = Controller.param.balance;

            let setTankLevel = () => {
                let rightLevel,
                    leftLevel,
                    isLeftAction,
                    isRightAction;

                if(!Controller.detectFreeSpin(Controller.param)) {
                    leftLevel = Controller.param.tankLevel[0][Controller.bet];
                    rightLevel = Controller.param.tankLevel[1][Controller.bet];
                    isLeftAction = Controller.param.multiplayer;
                    isRightAction = Controller.param.wildExp
                } else {
                    rack.setBoardValue('scBoardJackpotDigit', Controller.lostSpin - 1);
                    leftLevel = Controller.param.freeSpinTankLevel[0];
                    rightLevel = Controller.param.freeSpinTankLevel[1];
                    isLeftAction = Controller.param.freeSpinMultiplayer;
                    isRightAction = Controller.param.freeSpinfreeGame;
                }

                rack.rightTank.liquidLevel = rightLevel;

                if (isLeftAction && isRightAction) {
                    let del = 200;
                    app.app.ticker.add(delay, Controller);

                    function delay(delta) {
                        if (del <= 0) {
                            rack.leftTank.liquidLevel = leftLevel;
                            app.app.ticker.remove(delay, Controller);
                        } else del = del - 1 * delta;
                    }
                } else rack.leftTank.liquidLevel = leftLevel;
            };


            if (Controller.param.scatter) {
                Controller.delayLastReel = 132;
                Controller.whenFirstReelStop = () => {
                    animateMonitor.showHunterWaiting(Controller.param.scatter);
                    if (reelBlock.speedMode == 1) animateMonitor.showCasing(2200);
                }

            }  else {
                Controller.whenFirstReelStop = false;
                Controller.delayLastReel = 0;
            }


            let leftAction = false,
                rightAction = false,
                callbackDelay = 0;
            if (!Controller.detectFreeSpin(Controller.param)) {
               if (Controller.param.multiplayer) {
                   leftAction = () => {
                       wildMulti.showMultiplier(+Controller.param.k);
                       setTimeout(rack.setBoardValue.bind(rack), 3000,'scBoardMultiplierDigit', Controller.param.k + 'x');
                       Controller.k = Controller.param.k + 'x';
                   };
                   callbackDelay += 200;
               }

                if (Controller.param.wildExp) {
                    rightAction = () => {
                        wildMulti.showWildExpansion();
                    };
                    callbackDelay += 200;
                }

            } else {

                if (Controller.param.freeSpinMultiplayer) {
                    leftAction = () => {
                        wildMulti.showMultiplier(+Controller.param.k);
                        setTimeout(rack.setBoardValue.bind(rack), 3000,'scBoardMultiplierDigit', Controller.param.k + 'x');
                        Controller.k = Controller.param.k + 'x';
                    };
                    callbackDelay += 200;
                }

                if (Controller.param.freeSpinfreeGame) {
                    rightAction = () => {
                        wildMulti.showFreeGames();
                        setTimeout(rack.setBoardValue.bind(rack), 3000,'scBoardJackpotDigit', Controller.param.freeSpin[1]);
                    };
                    callbackDelay += 200;
                }
            }

            rack.leftTank.callback = leftAction;
            rack.rightTank.callback = rightAction;

            if (Controller.isPushStop || reelBlock.speedMode == 2) reelBlock.stopAndShow(Controller.param, whenStopReels, 1, Controller.whenFirstReelStop, false, false, setTankLevel, false, callbackDelay, false);
            else reelBlock.stopAndShow (Controller.param, whenStopReels, 0, Controller.whenFirstReelStop, false,  Controller.delayLastReel, setTankLevel, false, callbackDelay, false);

        }

        function whenStopReels() {
            rack.leftTank.callback = false;
            rack.rightTank.callback = false;

            if (Controller.param.animateAfterStopReels) {
                startingAnimateMethods(Controller.param.animateAfterStopReels, postAnimateMonitor);
            } else postAnimateMonitor();
        }

        function startingAnimateMethods(ArrParam, callback) {
            controlPanel.btn.main.setImg(2, 2);
            Controller.blockStopBtn = true;

            let delayDinoSmall = 0;

            let flashLine = false;
            for (let i = 0; i < ArrParam.length; i++) if(ArrParam[i][0] == 'flashLine') flashLine = ArrParam[i][1];

            if (flashLine) {
                let counter = 2,
                    delayBlockFlashLine = 0,
                    speedWin = Math.sqrt(Controller.param.allWin / Controller.param.bet) * 0.8;

                let dinoBig = false;
                for (let i = 0; i < ArrParam.length; i++) if(ArrParam[i][0] == 'showDinoBig') dinoBig = true;


                let leftLevelDown = false,
                     rightLevelDown = false;

                if (!Controller.detectFreeSpin(Controller.param)) {
                    if (Controller.param.tankLevel[0][Controller.bet] == 100) {

                        leftLevelDown = () => {
                            Controller.param.tankLevel[0][Controller.bet] = 0;
                            rack.leftTank.liquidLevel = 0;
                            Controller.k = '1x';
                        };
                    }
                } else {
                    if (Controller.param.freeSpinTankLevel[0] == 100) leftLevelDown = () => rack.leftTank.liquidLevel = 0;
                    if (Controller.param.freeSpinTankLevel[1] == 100) rightLevelDown = () => rack.rightTank.liquidLevel = 0;
                }


                if(dinoBig) {
                    if (!Controller.detectFreeSpin(Controller.param)) {
                        rightLevelDown = () => {
                            Controller.param.tankLevel[1][Controller.bet] = 0;
                            rack.rightTank.liquidLevel = 0;
                        };
                    }

                    delayBlockFlashLine = 150;
                    delayDinoSmall = 100;
                } else {
                    let dinoSmall = false;
                    for (let i = 0; i < ArrParam.length; i++) if(ArrParam[i][0] == 'showDinoSmall') dinoSmall = true;
                    if (dinoSmall) delayBlockFlashLine = 52;
                }

                animateMonitor.flashLine(flashLine, delayBlockFlashLine, false, () => {
                    if (! --counter) {
                        callback();
                    }
                }, rightLevelDown, leftLevelDown);

                let bWin = false;
                for (let i = 0; i < ArrParam.length; i++) if(ArrParam[i][0] == 'bigWin') bWin = ArrParam[i][1];

                if (bWin) bigWin.showBigWin(bWin, delayBlockFlashLine, () => {if (!--counter) callback()},  blockBtns);
                else {
                    winRate.showTotalWin(delayBlockFlashLine, Controller.param.allWin, speedWin, () => {if (!--counter) callback()},
                        function () {
                        controlPanel.btn.main.setImg(6, 7);
                        controlPanel.on('mainButton', () => {
                            winRate.rewind();
                            controlPanel.btn.main.setImg(2, 2);
                        });

                    }, () => controlPanel.btn.main.setImg(2, 2));
                }

            }

            for (let i = 0; i < ArrParam.length; i++) {
                let methodName = ArrParam[i][0],
                    param = ArrParam[i][1];
                let clback = false;
                if (i == ArrParam.length - 1 && !flashLine) clback = callback;
                if (methodName != 'flashLine' && methodName != 'bigWin') {
                    if (methodName == 'showDinoSmall') animateMonitor.showDinoSmall(param, delayDinoSmall, clback);
                    else {
                        if (Controller.param.scatter) if(param[0] == Controller.param.scatter[0] && param[1] == Controller.param.scatter[1]) animateMonitor.hide('hunterWaiting');
                        animateMonitor[methodName](param, clback);
                    }
                }
            }
        }

        function postAnimateMonitor() {

            controlPanel.btn.sound.unBlock(true);
            controlPanel.btn.menu.unBlock();
            controlPanel.btn.playOn.unBlock(true);
            controlPanel.btn.maxMin.unBlock(true);

            let balance = Controller.formatNumeric(Controller.balance);
            controlPanel.setBoardValue('scBoardBalance', balance);
            controlPanel.setBoardValue('scBoardBalanceSmall', balance);

         if (!Controller.detectStartFreeSpin(Controller.param)) {
             if (Controller.param.postAnimate && Controller.countSpin == 1) startingAnimateMethods(Controller.param.postAnimate, false);
             if (Controller.param.lines && Controller.countSpin == 1 && !Controller.detectFreeSpin(Controller.param)) Controller.showLines(Controller.param.lines, animateMonitor, linetable, lineSumm);
             end();

         }  else {
             Controller.countSpin = 1;
             blockBtns();


             freeGame.start(end, function () {
                 background.texture = PIXI.TextureCache[`${Data.freeGames.bg}.${Config.imgExtension}`];
                 rack.leftTank.liquidLevel = 0;
                 rack.rightTank.liquidLevel = 0;
                 rack.setBoardValue('scBoardJackpotLabel', 'FREE GAME');
                 rack.scBoardJackpotDigit.fontSize = 60;
                 rack.setBoardValue('scBoardJackpotDigit', Controller.param.freeSpin[1]);
                 Controller.blockMainButton = false;

             });
         }

            function end() {
                controlPanel.on('mainButton', whenOnMainButton);
                controlPanel.btn.main.setImg(0, 1);
                Controller.blockMainButton = false;

                response = false;
                Controller.isPushStop = false;
                Controller.blockStopBtn = false;
                if (Controller.countSpin > 1) {
                    Controller.countSpin --;
                    setTimeout(whenOnMainButton, 300);

                } else {
                    if (Controller.multiSpin) {
                        Controller.multiSpin = false;
                        controlPanel.btn.auto.addText('AUTO PLAY', Data.ctrPanel.btnTextStyle, 13, 11);
                        controlPanel.on('autoPlay', autoplay);
                    }

                    if (!Controller.detectStartFreeSpin(Controller.param) && !Controller.detectFreeSpin(Controller.param)) {
                        uiControl.unBlockHowToPlay();
                        unblockBtns();
                        controlPanel.btn.auto.unBlock();
                        controlPanel.btn.auto.textFill = Data.ctrPanel.btnTextStyle.fill;
                    } else {
                        if (Controller.param.freeSpin[1] > 0) {
                            controlPanel.btn.sound.unBlock();
                            controlPanel.btn.main.unBlock();
                            controlPanel.btn.menu.unBlock();
                            controlPanel.btn.playOn.unBlock(true);
                            controlPanel.btn.maxMin.unBlock(true);
                            Controller.lostSpin = Controller.param.freeSpin[1];
                            if (Controller.param.lines && Controller.detectFreeSpin(Controller.param)) Controller.showLines(Controller.param.lines, animateMonitor, linetable, lineSumm, () => {
                                whenOnMainButton();
                            });
                            else setTimeout(whenOnMainButton, 300);

                        } else {
                            Controller.blockMainButton = true;
                            animateMonitor.hideAllLine();
                            blockBtns();
                            freeGameEnd.show(Controller.param.freeSpin[3], Controller.param.freeSpin[4], 3, function () {
                                unblk();
                                background.texture = PIXI.TextureCache[`${Data.main.background}.${Config.imgExtension}`];
                                rack.leftTank.liquidLevel = Controller.param.tankLevel[0][Controller.bet];
                                rack.rightTank.liquidLevel = Controller.param.tankLevel[1][Controller.bet];
                                rack.setBoardValue('scBoardJackpotLabel', 'MINI JACKPOT');
                                rack.scBoardJackpotDigit.fontSize = 47;
                                rack.setBoardValue('scBoardJackpotDigit', '€19.93');
                                Controller.k = '1x';
                                rack.setBoardValue('scBoardMultiplierDigit', '1x');

                            }, () => Controller.blockMainButton = false);
                        }
                    }
                }

                function unblk() {
                    uiControl.unBlockHowToPlay();
                    unblockBtns();
                    controlPanel.btn.auto.unBlock();
                    controlPanel.btn.auto.textFill = Data.ctrPanel.btnTextStyle.fill;
                }

            }

        }

        function flash() {
             rack.leftTank.makeFlash();
             rack.rightTank.makeFlash();
             rack.makeFlash();
        }

        function blockBtns(all = true) {

            btnsName.forEach(function (item) {
                if(all) blk(item);
                else if (item != 'main' && item != 'menu' && item != 'playOn'  && item != 'maxMin' && item != 'sound') blk(item);
            });

            function blk(item) {
                let clickOnly = false;
                if (item == 'sound' || item == 'playOn' || item == 'maxMin') clickOnly = true;
                controlPanel.btn[item].block(clickOnly);
            }

            controlPanel.btn.betMax.textFill = Data.ctrPanel.btnTextStyle.fillDisable;
            controlPanel.scBoardLabelBetLevel.fill = Data.ctrPanel.scoreboard.labelBetLevel.colorDisable;
            controlPanel.scBoardLabelCoin.fill = Data.ctrPanel.scoreboard.labelCoin.colorDisable;
        }

        function unblockBtns() {

            btnsName.forEach(function (item) {
                    let clickOnly = false;
                    if (item == 'sound' || item == 'playOn' || item == 'maxMin') clickOnly = true;
                    controlPanel.btn[item].unBlock(clickOnly);
            });

            controlPanel.btn.betMax.textFill = Data.ctrPanel.btnTextStyle.fill;
            controlPanel.scBoardLabelBetLevel.fill = Data.ctrPanel.scoreboard.labelBetLevel.color;
            controlPanel.scBoardLabelCoin.fill = Data.ctrPanel.scoreboard.labelCoin.color;
        }

        function autoplay () {
            if(!Controller.block) {
                Data.sound.click();
                uiControl.hide('menu_1');
                uiControl.showHide('menu_2');
            }
        }

        function autoplay2 () {
            Controller.countSpin = 1;
            controlPanel.btn.auto.block(false);
        }

        controlPanel.on('betMax', function() {
            if(!Controller.block) {
                if(Controller.bet != 125) {
                    Controller.betLevel = 10;
                    Controller.updateBoards(controlPanel, rack, paymentBoard);
                    uiControl.showMaxBetModal();
                    uiControl.value = Controller.bet + '.00';
                } else whenOnMainButton();
            }
        });

        controlPanel.on('autoPlay', autoplay);

        controlPanel.on('betLevelPlus', function() {
            if(!Controller.block) {
                flash();
                if (Controller.betLevel == 1) Controller.betLevel = 2;
                else if (Controller.betLevel == 2) Controller.betLevel = 5;
                else if (Controller.betLevel == 5) Controller.betLevel = 7;
                else if (Controller.betLevel == 7) Controller.betLevel = 10;
                else if (Controller.betLevel == 10) Controller.betLevel = 1;

                Controller.updateBoards(controlPanel, rack, paymentBoard);
            }
        });

        controlPanel.on('betLevelMinus', function() {
            if(!Controller.block) {
                flash();
                if (Controller.betLevel == 1) Controller.betLevel = 10;
                else if (Controller.betLevel == 2) Controller.betLevel = 1;
                else if (Controller.betLevel == 5) Controller.betLevel = 2;
                else if (Controller.betLevel == 7) Controller.betLevel = 5;
                else if (Controller.betLevel == 10) Controller.betLevel = 7;

                Controller.updateBoards(controlPanel, rack, paymentBoard);
            }
        });

        controlPanel.on('coinPlus', function() {
            if(!Controller.block) {
                flash();
                if (Controller.coin != 0.02 && Controller.coin != 0.20 && Controller.coin != 2 && Controller.coin != 20) Controller.coin *= 2;
                else if (Controller.coin == 20) Controller.coin = 0.01;
                else Controller.coin *= 2.5;

                Controller.updateBoards(controlPanel, rack, paymentBoard);
            }
        });

        controlPanel.on('coinMinus', function() {
            if(!Controller.block) {
                flash();
                if (Controller.coin != 0.05 && Controller.coin != 0.5 && Controller.coin != 5 && Controller.coin != 0.01) Controller.coin /= 2;
                else if (Controller.coin == 0.01) Controller.coin = 20;
                else Controller.coin /= 2.5;

                Controller.updateBoards(controlPanel, rack, paymentBoard);
            }
        });

        controlPanel.on('info', function() {
            if(!Controller.block) {
                uiControl.hide('menu_1');
                uiControl.hide('menu_2');
                modalInfo.showHide();
                uiControl.showHideInfoText();
                blockBtns();
                controlPanel.btn.auto.block();
            }
        });

        controlPanel.on('sound', function() {

            if(Controller.volumeToggle == 1) {
                Controller.volumeToggle = 0;
                Controller.historyVolume = createjs.Sound.volume;
                createjs.Sound.volume = 0;
            } else {
                Controller.volumeToggle = 1;
                createjs.Sound.volume = Controller.historyVolume;
            }

        });

        uiControl.on('moveVolume', function (masterVolume) {
            if(masterVolume > 0) {
                controlPanel.toggleSound = true;
                controlPanel.btn.sound.setImg(0, 1);
                Controller.volumeToggle = 1;
            } else {
                controlPanel.toggleSound = false;
                controlPanel.btn.sound.setImg(3, 4);
                Controller.volumeToggle = 0;
                Controller.historyVolume = 0;
            }
        });

        controlPanel.on('sound_mouseover', function() {
            uiControl.showVolume();
        });

        controlPanel.on('sound_mouseout', function() {
            uiControl.hideVolume();
        });

        controlPanel.on('playOn', function() {
            Data.sound.click();
            uiControl.click('quickSpin');
            if(reelBlock.speedMode == 1) reelBlock.setSpeedMode(2);
            else reelBlock.setSpeedMode(1);
        });

        controlPanel.on('fullScreen', function() {
            Data.sound.click();
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();

        });

        controlPanel.on('menu', function() {
            Data.sound.click();
            uiControl.hide('menu_2');
            uiControl.showHide('menu_1');
        });

        uiControl.on('quickSpin', function () {
            controlPanel.click('playOn');
            if(reelBlock.speedMode == 1) reelBlock.setSpeedMode(2);
            else reelBlock.setSpeedMode(1);
        });

        uiControl.on('startAutoPlay', function (param) {
            Controller.countSpin = param.numbSpin;
            Controller.multiSpin = true;
            whenOnMainButton();
            controlPanel.on('autoPlay', autoplay2);
        });

        Controller.updateBoards(controlPanel, rack, paymentBoard);

        rack.setBoardValue('scBoardJackpotDigit', '€19.93');
        rack.setBoardValue('scBoardMultiplierDigit', '1x');
        rack.setBoardValue('scBoardJackpotLabel', 'MINI JACKPOT');
        rack.setBoardValue('scBoardMultiplierLabel', 'MULTIPLIER');

        layout(container);

        function layout(container) {
            if (app.ratio > Config.breackPointRatio) {

                container.height = app.height;
                container.width = container.height * Config.bgRatio;

                bigWin.height = app.height * 2;
                bigWin.width = bigWin.height * Config.bgRatio ;

            } else {
                let bgKef = Config.bgRatio / Config.breackPointRatio;

                container.width = app.width * bgKef;
                container.height = container.width / Config.bgRatio;

                bigWin.width = app.width * bgKef * 2;
                bigWin.height = bigWin.width/ Config.bgRatio;
            }

            container.x = (app.width - container.width) / 2;
            container.y = (app.height - container.height) / 2;

            bigWin.x = (app.width - bigWin.width) / 2;
            bigWin.y = (app.height - bigWin.height) / 2;

        }

        window.addEventListener('resize', function() {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            layout(container);

        });

        document.addEventListener('fullscreenchange', function() {
            let btn = controlPanel.btn.maxMin;

                if (document.fullscreenElement) {
                    Controller.fullScreen = true;
                    btn.setImg(3, 4);
                    controlPanel.toggleFullScreen = false;
                } else {
                    Controller.fullScreen = false;
                    btn.setImg(0, 1);
                    controlPanel.toggleFullScreen = true;
                }

        });

        document.addEventListener('keydown', function(event) {
            if (event.code == 'F11') {
                event.preventDefault();
                document.documentElement.requestFullscreen();

                let btn = controlPanel.btn.maxMin;
                btn.setImg(3, 4);
                controlPanel.toggleFullScreen = false;
            }
        });

        document.addEventListener('visibilitychange', function(e) {

            if (document.hidden)  Data.sound.muted = true;
            else Data.sound.muted = false;

        }, false);


        app.stage.addChild(container);
        app.stage.addChild(bigWin.content);

        if (Controller.start) {
            Controller.start = false;
            container.alpha = 0;
            app.app.ticker.add(startShow, this);


            function startShow() {
                container.alpha += 0.17;
                if(container.alpha > 10) {
                    container.alpha = 1;
                    app.app.ticker.remove(startShow, this);
                }
            }
        }
    }

    static updateBoards(controlPanel, rack, paymentBoard) {

        let bet = (Controller.betLevel * Controller.coin * 0.25 / 0.01);

        paymentBoard.update(bet);

        Controller.bet = bet;
        if(Controller.param.tankLevel[0].hasOwnProperty(Controller.bet))  rack.leftTank.liquidLevel = Controller.param.tankLevel[0][Controller.bet];
        else rack.leftTank.liquidLevel = 0;

        if(Controller.param.tankLevel[1].hasOwnProperty(Controller.bet))  rack.rightTank.liquidLevel = Controller.param.tankLevel[1][Controller.bet];
        else rack.rightTank.liquidLevel = 0;

        let betForBoard = Controller.formatNumeric(bet);
        controlPanel.setBoardValue('scBoardBet', betForBoard);

        let balanceForBoard = Controller.formatNumeric(Controller.balance);
        controlPanel.setBoardValue('scBoardBalance', balanceForBoard);
        controlPanel.setBoardValue('scBoardBalanceSmall', balanceForBoard);
        controlPanel.setBoardValue('scBoardBetWinSmalll', betForBoard);

        controlPanel.setBoardValue('scBoardBetLevel', Controller.betLevel);
        controlPanel.setBoardValue('scBoardCoin', (Controller.coin < 1 && Controller.coin > 0.09) ? `${Number(Controller.coin)}0`: Controller.coin);

    }

    static detectStartFreeSpin(param) {
       if (param.hasOwnProperty('freeSpin')) {
           if (param.freeSpin[0] == 0) return true;
           else return false;
       } else return false;
    }

    static detectFreeSpin(param) {
        if (param.hasOwnProperty('freeSpin')) {
            if (param.freeSpin[0] == 1 || param.freeSpin[0] == 2) return true;
            else return false;
        } else return false;;

    }

    static formatNumeric(number) {
        number = number.toFixed(2);
        if (number >= 1000000) number = `${number.slice(0, 1)},${number.slice(1)}`;
        else if (number >= 100000) number = `${number.slice(0, 3)},${number.slice(3)}`;
        else if (number >= 10000) number = `${number.slice(0, 2)},${number.slice(2)}`;
        else if (number >= 1000) number = `${number.slice(0, 1)},${number.slice(1)}`;
        return number;
    }

    static showLines(param, animateMonitor, linetable, lineSumm, callback = false) {

        let lines = [],
            lineFrame = [];
        for (let item of param) {
            lines.push(item[0]);
            lineFrame.push(item[3]);
        }

        animateMonitor.initShowLine(lineFrame);
        lineSumm.update();
        linetable.showLines(lines,  function () {
            animateMonitor.showNextLine();
            lineSumm.show(param);
        }, callback);

    }

}

window.addEventListener('load', function() {
    Start.app();
});
