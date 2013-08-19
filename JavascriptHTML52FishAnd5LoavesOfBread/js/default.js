// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    //variables holding the scaling of the game which is set to basic resolution of 1366 x 768
    var WINDOW_RESOLUTION_WIDTH = 1366
    var WINDOW_RESOLUTION_HEIGHT = 768;
    var BREADBASKET_POSITION_X = 0;
    var BREADBASKET_POSITION_Y = 0;
    var scaleW = window.innerWidth / WINDOW_RESOLUTION_WIDTH;
    var scaleH = window.innerHeight / WINDOW_RESOLUTION_HEIGHT;

    var preload;
    var canvas, context, stage;

    var newGame = true; //this variable is used to determine which context should be used in the stage area

    var logoScreenImage, logoScreenBitmap;
    var fountainImage, fountainBitmap;
    var playerIdleImage;
    var playerWalk0Image, playerWalk0Bitmap;
    var playerWalk1Image, playerWalk1Bitmap;
    var fishImage, fishBitmap;

    // Define a spritesheet fish animation variables
    var swimmingfish;
    var swimmingfishBitmapAnimation;

    var breadbasketImage, breadbasketBitmap;
    var singlebreadImage, singlebreadBitmap;

    var timeToAddNewBread = 0; //time variable to wait until new fish is created
    var breads = [];
    var breadSpeed = 1.0;// speed variable specifying the speed at which the bread is approacghing the basket
    var player;
    var fishes = [];
    var fishSpeed = 1.0;// speed variable specifying the speed at which the fish is approaching your fish
    var fishcount = 0;
    var breadcount = 0;
    var timeToAddNewFish = 0; //time variable to wait until new fish is created
    var isGameOver = false;


    var scoreText;
    var playerScore = 0;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    /**
   This current fish class hold variables of the current posisiton of one single current fish
   and variables to move the specific fish towards player's fish


   **/
    function Fish(gfx) {
        this.positionX = Math.random() * 5000 - 2500;
        this.positionY = Math.random() * 3000 - 1500;

        this.setStartPosition = function () {
            if (this.positionX >= 0 && this.positionX <= window.innerWidth) {
                this.positionX = -500;
            }

            if (this.positionY >= 0 && this.positionY <= window.innerHeight) {
                this.positionY = -500;
            }
        }

        this.targetX = 0;
        this.targetY = 0;

        this.move = function (tX, tY,random) {

            //do not let them get the target but let them stay at a group of chaser in safe distance
            //from the player
            if (random) {
                this.targetX = ((Math.random() * tX) + 150);
                this.targetY = ((Math.random() * tY) + 150);
            } else {
                this.targetX =  tX;
                this.targetY =  tY;
            }

            if (this.targetX > this.positionX) {
                this.positionX += fishSpeed;
            }
            if (this.targetX < this.positionX) {
                this.positionX -= fishSpeed;
            }
            if (this.targetY > this.positionY) {
                this.positionY += fishSpeed;
            }
            if (this.targetY < this.positionY) {
                this.positionY -= fishSpeed;
            }
        };
        //checking whatever the player's fish is in collide course with the array of fishes
        this.isCollision = function (playerX, playerY, playerW, playerH) {
            var centerX = this.positionX + (this.fishBitmap.image.width * scaleW / 2);
            var centerY = this.positionY + (this.fishBitmap.image.height * scaleH / 2);

            if ((centerX >= playerX - playerW / 2) && (centerX < playerX + playerW / 2)) {
                if ((centerY >= playerY - playerH / 2) && (centerY < playerY + playerH / 2)) {
                    return true;
                }
            }

            return false;
        }

        this.fishBitmap = gfx;
    }


    /**
This current single bread class hold variables of the current posisiton of single bread
and variables to move the fishes in the circle of fishes towards the breads


**/
    function singlebread(gfx) {
        this.positionX = BREADBASKET_POSITION_X;
        this.positionY = BREADBASKET_POSITION_Y;

        this.setStartPosition = function () {
            if (this.positionX >= 0 && this.positionX <= window.innerWidth) {
                // this.positionX = (this.positionX + 20) + (Math.random());
                this.positionX = BREADBASKET_POSITION_X;
            }

            if (this.positionY >= 0 && this.positionY <= window.innerHeight) {
                //  this.positionY =( this.positionY +20)+(Math.random());
                this.positionY = BREADBASKET_POSITION_Y;
            }
        }

        this.targetX = 0;
        this.targetY = 0;

       this.move = function (tX, tY) {

            //do not let them get the target but let them stay at a group of chaser in safe distance
            //from the player
            this.targetX = ((Math.random() * tX) + 150);
            this.targetY = ((Math.random() * tY) + 150);

            if (this.targetX > this.positionX) {
                this.positionX += breadSpeed;
            }
            if (this.targetX < this.positionX) {
                this.positionX -= breadSpeed;
            }
            if (this.targetY > this.positionY) {
                this.positionY += breadSpeed;
            }
            if (this.targetY < this.positionY) {
                this.positionY -= breadSpeed;
            }
       }; 
        //checking whatever the single bread is in collide course with the array of fishes
        this.isCollision = function (playerX, playerY, playerW, playerH) {
            var centerX = this.positionX + (this.singlebreadBitmap.image.width * scaleW / 2);
            var centerY = this.positionY + (this.singlebreadBitmap.image.height * scaleH / 2);

            if ((centerX >= playerX - playerW / 2) && (centerX < playerX + playerW / 2)) {
                if ((centerY >= playerY - playerH / 2) && (centerY < playerY + playerH / 2)) {
                    return true;
                }
            }

            return false;
        }

        this.singlebreadBitmap = gfx;
    }

    /**
   this java script function is trigger
   when the user releases his/her finger
   and then the newgame variable is set to false and where the user
   has clicked with the finger and store that value with x.y values
   **/

    function pointerUp(event) {
        if (newGame && !isGameOver) {
            newGame = false;
        }
        else {
            //check whatever the target collides with existing group of fishes
           // checkswapFishWithPlaerFish(event);
            player.targetX = event.x;
            player.targetY = event.y;
        }

        if (isGameOver) {
            isGameOver = false;
            newGame = true;
        }
    }
    /**
this java script function is trigger
when the user pushes his/her finger
and then the newgame variable is set to false and where the user
has clicked with the finger and store that value with x.y values
**/

    function pointerDown(event) {
        if (newGame && !isGameOver) {
        }
        else {
            //check whatever the target collides with existing group of fishes
           // checkswapFishWithPlaerFish(event);
            player.targetX = event.x;
            player.targetY = event.y;
        }
    }
    /**
this java script function is trigger
when the user moves his/her finger
and then the newgame variable is set to false and where the user
has clicked with the finger and store that value with x.y values
**/
    function pointerMove(event) {
        if (newGame && !isGameOver) {
        }
        else {
            //check whatever the target collides with existing group of fishes
           // checkswapFishWithPlaerFish(event);
            player.targetX = event.x;
            player.targetY = event.y;
        }
    }
    //game specific initialization with directx and XNA
    //execution order of the functions is following
    //execution order
    //1. initialize
    //2. preparegame
    //3. Startgame
    //4. gameloop --> update,draw

    /**
    used to initialize the game variables such as canvas specific attributes

    
    **/
    function initialize() {
        canvas = document.getElementById("gameCanvas");
        //gets the resolution to fill the entire screen and get 2d context of it
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context = canvas.getContext("2d");

        //add listener to accually notice when the user has pressed and released the touch screen with a finger
        canvas.addEventListener("MSPointerUp", pointerUp, false);
        //and other listeners to enable the moving of the fish ,calling specific functions pointerMove or pointerDown
        canvas.addEventListener("MSPointerMove", pointerMove, false);
        canvas.addEventListener("MSPointerDown", pointerDown, false);

        stage = new createjs.Stage(canvas);


        //the loadcontent initializes the preloaded variable once all the
        //game content is loaded using preloadjs
        preload = new createjs.PreloadJS();
        preload.onComplete = prepareGame;

        //soundjs variable
        //soundj = new createjs.SoundJS();

        //define loaded image context
        var manifest = [
            { id: "logoScreen", src: "images/GFX/splashgreen.png" },
            { id: "fountain", src: "images/GFX/fountain.png" },
            { id: "bigFish", src: "images/GFX/bigFish.png" },
            { id: "playerIdle", src: "images/GFX/PlayerIdle.png" },
            { id: "playerWalk0", src: "images/GFX/PlayerWalk0.png" },
            { id: "breadbasket", src: "images/GFX/Breadbasket.png" },
            { id: "singlebread", src: "images/GFX/singlebread.png" },
            { id: "playerWalk1", src: "images/GFX/PlayerWalk1.png" }
        ];
        //Init Sounds
       /* SoundJS.addBatch([
         { name: "bubble_background", src: "../sounds/bread_background_bubbles.wav", instances: 1 },
         { name: "bread_fishbite", src: "../sounds/bead_fishbite.wav", instances: 1 },
         { name: "fishplash", src: "../sounds/bread_fishplash.wav", instances: 1 },
         { name: "fishswim", src: "../sounds/bread_fishswimming.wav", instances: 1 }]);
        
        */
        preload.loadManifest(manifest);
    }

    function prepareGame() {
        logoScreenImage = preload.getResult("logoScreen").result;
        logoScreenBitmap = new createjs.Bitmap(logoScreenImage);
        //setting the logoscreen bitmap to scale along the with of the height and widht of the screen
        logoScreenBitmap.scaleX = scaleW;
        logoScreenBitmap.scaleY = scaleH;
        logoScreenBitmap.x = BREADBASKET_POSITION_X += 120;
        logoScreenBitmap.y = BREADBASKET_POSITION_Y;
        stage.addChild(logoScreenBitmap);

        //adding the background fountain image with scaling settings
        fountainImage = preload.getResult("fountain").result;
        fountainBitmap = new createjs.Bitmap(fountainImage);
        fountainBitmap.visible = false;
        fountainBitmap.scaleX = scaleW;
        fountainBitmap.scaleY = scaleH;
        stage.addChild(fountainBitmap);

        playerIdleImage = preload.getResult("playerIdle").result;

        //initialize plyer with correct bitmap
        player = new Player(window, scaleW, scaleH, new createjs.Bitmap(playerIdleImage));
        /*playerIdleBitmap = new createjs.Bitmap(playerIdleImage);
        playerIdleBitmap.visible = false;
        playerIdleBitmap.scaleX = scaleW;
        playerIdleBitmap.scaleY = scaleH;*/
        stage.addChild(player.playerIdleBitmap);

        
        scoreText = new createjs.Text("Luotu kaloja : " +  (fishes.length+1) + ",leipia :"+(singlebread.length+1), "30px sans-serif", "yellow");
        scoreText.x = canvas.width / 2 - (scoreText.getMeasuredWidth() * scaleW / 2);
        scoreText.scaleX = scaleW;
        scoreText.scaleY = scaleH;
        scoreText.y = 30 * scaleH;
        scoreText.visible = false;
        stage.addChild(scoreText);

        fishImage = preload.getResult("bigFish").result;
        

        //fish animation
        swimmingfish = new createjs.SpriteSheet({
            "frames": {
                "width": 548,
                "numFrames": 6,//number of images
                "regX":  BREADBASKET_POSITION_X +=120,
                "regY": BREADBASKET_POSITION_Y,
                "height": 200
            },
            "animations": {
                swim_right: {
                    frames: [0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 1, 1, 1, 1, 1, 1, 1, 1,1,,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 2, 2, 2, 2, 2, 2, 2, 2 , 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3  ]
                },
                swim_left: {
                    frames: [4, 4, 4, 4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4, 5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, , 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, , 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6 , 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, ,6,6,6],
                    next: "swim_right"
                }
            },



           // "animations": { "swim_left": [6, 4], "swim_right": [0, 3] },//animation sequences from right to left and from left to right
            "images": ["images/GFX/fish_animation.png"]
        });
        //animation order
      swimmingfish.getAnimation("swim_left").frequency = 3;
      swimmingfish.getAnimation("swim_left").next = "swim_right";
      swimmingfish.getAnimation("swim_right").next = "swim_left";
        

        swimmingfishBitmapAnimation = new createjs.BitmapAnimation(swimmingfish);
        swimmingfishBitmapAnimation.scaleY = scaleH;

        swimmingfishBitmapAnimation.scaleX = scaleW;
        swimmingfishBitmapAnimation.x = BREADBASKET_POSITION_X + 220;
        swimmingfishBitmapAnimation.y = BREADBASKET_POSITION_Y+450;
        swimmingfishBitmapAnimation.gotoAndPlay("swim_left");
        swimmingfishBitmapAnimation.visible = false;
       // Ticker.setFPS(60);
        //Ticker.addListener(stage);
        stage.addChild(swimmingfishBitmapAnimation);


        //adding the breadbaseket image with scaling settings
        breadbasketImage = preload.getResult("breadbasket").result;
        breadbasketBitmap = new createjs.Bitmap(breadbasketImage);

        breadbasketBitmap.scaleX = scaleW;
        breadbasketBitmap.scaleY = scaleH;

        //lets set breadbasket picture to the center
        BREADBASKET_POSITION_X = canvas.width / 2 - (scoreText.getMeasuredWidth() * scaleW / 2) - 100;
        BREADBASKET_POSITION_Y = 240 * scaleH;
        breadbasketBitmap.x = BREADBASKET_POSITION_X +=120;
        breadbasketBitmap.y = BREADBASKET_POSITION_Y;
        breadbasketBitmap.visible = false;
        stage.addChild(breadbasketBitmap);
        
        //adding single bread to the basket image
        singlebreadImage = preload.getResult("singlebread").result;
        singlebreadBitmap = new createjs.Bitmap(singlebreadImage);

        singlebreadBitmap.scaleX = scaleW;
        singlebreadBitmap.scaleY = scaleH;

        //lets set breadbasket picture to the center
        singlebreadBitmap.x =BREADBASKET_POSITION_X;
        singlebreadBitmap.y = BREADBASKET_POSITION_Y;
        singlebreadBitmap.visible = false;
        stage.addChild(singlebreadBitmap);

       // player = new Player();

        stage.update();

        startGame();
    }

    function startGame() {

        //create Ticker-class from CreateJS to render the game using gameloop
        //function,at each Tick of the interval the gameLoop function
        //is called, and the window.requestAnimationFrame method ensures that
        //only the needed frames are drawn.
        createjs.Ticker.setInterval(window.requestAnimationFrame);
       // createjs.Ticker.setFPS(60);
        createjs.Ticker.addListener(gameLoop);
       
        //adding sound specific settings
        //createjs.PreloadJS.installPlugin(createjs.Sound);
        preload.installPlugin(createjs.Sound);
        createjs.Sound.registerPlugin(createjs.HTMLAudioPlugin,createjs.Flashplugin);  // need this so it doesn't default to Web Audio
       // preload.installPlugin(createjs.Sound);
        // this does two things, it initializes the default plugins, and if that fails the if statement triggers and we display an error
       if (!createjs.Sound.initializeDefaultPlugins()) {
            document.getElementById("error").style.display = "block";
           document.getElementById("content").style.display = "none";
            return;
        }

        // if this is a mobile device
       if (createjs.Sound.BrowserDetect.isIOS || createjs.Sound.BrowserDetect.isAndroid || createjs.Sound.BrowserDetect.isBlackberry) {
         
       }
       var soundInstanceLimit = 0;
        // check if we are using the HTMLAudioPlugin, and if so apply the MAX_INSTANCES to the above limit
       if (createjs.Sound.activePlugin.toString() == "[HTMLAudioPlugin]") {
           soundInstanceLimit = createjs.HTMLAudioPlugin.MAX_INSTANCES - 5;
       }

       var assetsPath = "../sounds/";
       var manifest = [
                { src: assetsPath + "background_bubbles.mp3|" + assetsPath + "background_bubbles.ogg", id: "backgroudsound" },
                { src: assetsPath + "bread_fishbite.mp3|" + assetsPath + "bread_fishbite.ogg", id: "1" },
                { src: assetsPath + "bread_fishplash.mp3|" + assetsPath + "bread_fishplash.ogg", id: "2" },
                { src: assetsPath + "bread_fishswimming.mp3|" + assetsPath + "bread_fishswimming.ogg", id: "3", data: soundInstanceLimit }
       ]
    /*   queue = new createjs.LoadQueue();
        // Instantiate a queue to preload our assets
       queue = new createjs.LoadQueue();
       queue.installPlugin(createjs.Sound);
       queue.addEventListener("complete", loadComplete);
       queue.addEventListener("error", handleFileError);
       queue.addEventListener("progress", handleProgress);
       queue.loadManifest(manifest);*/

       createjs.Sound.addEventListener("loadComplete", createjs.proxy(loadComplete(), this));
       createjs.Sound.registerSound(+assetsPath + "background_bubbles.wav", "backgroudsound");
        /*function playSound(evt) {
            if (evt.src == src) {  // note that callback and event listener return the same event
                soundInstance = createjs.Sound.play(src);  // start playing the sound we just loaded, storing the playing instance
                //displayStatus.innerText = "Playing source: " + evt.src;  // let the user know what we are playing
            }
            */
    }
    // show progress so the user knows something is happening during preload
    /*function handleProgress(evt) {
        messageField.text += ".";
        stage.update();
    }

    function handleFileError(evt) {
        console.log("preload error ", evt.item.src);
        // An error occurred.
        messageField.text = "Error :("
        stage.update();
    }*/

    function loadComplete() {
        var instance = createjs.Sound.createInstance("backgroudsound");
        instance.setVolume(Math.random()*0.5 + 0.5);
        instance.play(-1);//infinite loop
    }
    
    function gameLoop() {
        update();
        draw();
    }

    /**
  Used to determine which context is shown to the user along with the newgame variable
  and positioning the fish to correct location

  **/
    function update() {
        if (newGame) {
            logoScreenBitmap.visible = true;
            fountainBitmap.visible = false;
            player.playerIdleBitmap.visible = false;
            scoreText.visible = false;
            breadbasketBitmap.visible = false;
            singlebreadBitmap.visible = false;
            swimmingfishBitmapAnimation.visible = false;
            fishcount = 0;
            breadcount = 0;
        }
        else {
            if (isGameOver) {
               
                isGameOver = false;
                playerScore = 0;
                fishes.length = 0;
                stage.clear();
                fishcount = 0;
                breadcount = 0;

                stage.addChild(logoScreenBitmap);
                stage.addChild(fountainBitmap);
                stage.addChild(player.playerIdleBitmap);
                stage.addChild(scoreText);
                stage.addChild(breadbasketBitmap);
                stage.addChild(singlebreadBitmap);
                stage.addChild(swimmingfishBitmapAnimation);
                stage.update();
            }

            logoScreenBitmap.visible = false;
            fountainBitmap.visible = true;
            player.playerIdleBitmap.visible = true;
            scoreText.visible = true;
            breadbasketBitmap.visible = true;
            singlebreadBitmap.visible = true;
            swimmingfishBitmapAnimation.visible =false;

            //at every frame we check if we should move the fish
            //if this position is different than a target move it towards target
            //one way is to use vector or check x and y value positions checked below
            if (player.targetX > player.positionX) {
                player.positionX += 3;
            }
            if (player.targetX < player.positionX) {
                player.positionX -= 3;
            }
            if (player.targetY > player.positionY) {
                player.positionY += 3;
            }
            if (player.targetY < player.positionY) {
                player.positionY -= 3;
            }

            //playerScore += 1;
           
        
            //adding new fish which will eventually approach the player's fish
            timeToAddNewFish -= 1;
            if (timeToAddNewFish < 0) {
                timeToAddNewFish = 1000 //for each 1000 frames a new fish is added and added to the fishes array
                fishes.push(new Fish(new createjs.Bitmap(fishImage)));
                fishes[fishes.length - 1].setStartPosition();
                stage.addChild(fishes[fishes.length - 1].fishBitmap);
                fishcount += 1;
            }
            //but we need to update the fishes posistion otherwise they would be invisible and check
            //whatever the array of fishes is not in the same posisiton as the player's fish
            //var swimSound = "fishswim";
           // SoundJS.play(swimSound, SoundJS.INTERRUPT_ANY);
            for (var i = 0; i < fishes.length; i++)
            {
                fishes[i].fishBitmap.x = fishes[i].positionX;
                fishes[i].fishBitmap.y = fishes[i].positionY;
                fishes[i].fishBitmap.visible = true;
                fishes[i].move(player.positionX, player.positionY,true);
                isGameOver = fishes[i].isCollision(player.positionX, player.positionY, player.width, player.height);
                if (isGameOver) {
                    break;
                }
            }



            //adding new single bread which will eventually be approached by the players fish
           
            timeToAddNewBread -= 1;
            if (timeToAddNewBread < 0) {
                timeToAddNewBread = 1200 //for each 1200 frames a new bread is added and added to the single bread array
                breads.push(new singlebread(new createjs.Bitmap(singlebreadImage)));
                breads[breads.length - 1].setStartPosition();
                stage.addChild(breads[breads.length - 1].singlebreadBitmap);
                breadcount += 1;
            }
            //but we need to update the breads posistion otherwise they would be invisible and check
            //whatever the array of breads is not in the same posisiton as the player's fish

            for (var i = 0; i < breads.length; i++) {
                breads[i].singlebreadBitmap.x = breads[i].positionX;
                breads[i].singlebreadBitmap.y = breads[i].positionY;
                breads[i].singlebreadBitmap.visible = true;
                //move breads towards the player
                // breads[i].move(breads[i].positionX, breads[i].positionY);
                breads[i].move(player.positionX, player.positionY);


                for (var k = 0; k < fishes.length; k++) {
                    fishes[k].fishBitmap.x = fishes[k].positionX;
                    fishes[k].fishBitmap.y = fishes[k].positionY;
                    fishes[k].fishBitmap.visible = true;
                    //move fishes towards the bread
                    fishes[k].move(breads[i].positionX, breads[i].positionY, true);
                    var isBreadBitten = breads[i].isCollision(fishes[k].positionX, fishes[k].positionY, fishes[k].width, fishes[k].height);
                    if (isBreadBitten) {
                       // playerScore += 1;
                        scoreText.text = scoreText.text = ("Luotu kaloja : " + (fishcount) + ",leipia :" + (breadcount));


                    }
                }
                /*isGameOver = breads[i].isCollision(player.positionX, player.positionY, player.width, player.height);
                if (isGameOver) {
                    break;
                }*/
            }

            scoreText.text = ("Luotu kaloja : " + (fishcount) + ",leipia :" + (breadcount));


            //updating the fish bitmap image x,y position on the screen,the subtraction of the
            //half of the height and width of the character prevents the figure to move towards top-left corner
            player.playerIdleBitmap.x = player.positionX - (player.width / 2);
            player.playerIdleBitmap.y = player.positionY - (player.height / 2);
        }
    }

    function draw() {
        stage.update();
    }

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    document.addEventListener("DOMContentLoaded", initialize, false);

    app.start();
})();
