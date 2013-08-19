function Player(window,scaleW,scaleH, playerIdleImage) {
    this.positionX = window.innerWidth / 2;
    this.positionY = window.innerHeight / 2;

    this.targetX = this.positionX;
    this.targetY = this.positionY;
    this.playerIdleBitmap=playerIdleImage;
    this.width = this.playerIdleBitmap.image.width * scaleW;
    this.height = this.playerIdleBitmap.image.height * scaleH;
}