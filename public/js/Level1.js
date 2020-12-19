class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    //Every time you enter in Level1
    init(data){
        //Receive the socket
        this.socket = data.socket;
        //Send to SERVER the information that I'm playing        
        this.socket.emit('playerStartLevel1', data.texture);
        this.texture = data.texture;
    }

    

    create() {

        this.ship; 

        
        var self = this;
        this.otherPlayers = this.physics.add.group();

        this.backgroundSprite = this.physics.add.sprite(400,300,'background');
        
        //send to the server that I am active 
        //send to server playerStartLevel1
        //at server player.active = true
        //server send to all clients "CurrentActivePlayers"
        

        //from server
        this.socket.on('currentPlayersLevel1', function (players) {
            console.log("Todos los players");
            console.log(players);
            Object.keys(players).forEach(function (id) {                 
                if (players[id].active){
                    if (players[id].playerId === self.socket.id) {
                        self.addPlayer(self, players[id]);
                    } else {
                        self.addOtherPlayers(self, players[id]);
                    }
                }
            });
        });

        
        this.socket.on('newPlayer', function (playerInfo) {
            self.addOtherPlayers(self, playerInfo);
        });

        this.socket.on('disconnect', function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });
        this.cursors = this.input.keyboard.createCursorKeys();


        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: 'yellow' });
        this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: 'yellow' });

        this.socket.on('scoreUpdate', function (players) {
            console.log(players);
            self.blueScoreText.setText("");
            let newText = "";
        
            Object.keys(players).forEach(function (id) {  
            //players.getChildren().forEach(function (aPlayer) {                
                if (players[id].active) {
                    newText += players[id].texture + ":" + players[id].score + "\n";                 
                }
            });
            self.blueScoreText.setText(newText);
        });



        this.socket.on('starLocation', function (starLocation) {
            if (self.star) self.star.destroy();
            self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
            self.physics.add.overlap(self.ship, self.star, function () {
                this.socket.emit('starCollected');
            }, null, self);
        });
        


    }//CREATE

    addPlayer(self, playerInfo) {
        console.log("Player client");
        console.log(playerInfo);
        if (typeof self.ship === 'undefined') {
            self.ship = self.physics.add.image(playerInfo.y, playerInfo.x, playerInfo.texture).setOrigin(0.5, 0.5);
            self.ship.setDrag(100);
            self.ship.setAngularDrag(100);
            self.ship.setMaxVelocity(200);
        }


    }



    addOtherPlayers(self, playerInfo) {
        if (playerInfo.active){
            let exist = false;
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    exist = true;
                }
            });

            if (!exist){
                const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, playerInfo.texture).setOrigin(0.5, 0.5);
                //Recorrer el grupo otherPlayers y comprobar que no existe con el texture
                otherPlayer.playerId = playerInfo.playerId;
                self.otherPlayers.add(otherPlayer);
            }
        }
    }


    /****************************************************************************
    *  UPDATE                                                                 ***
    *****************************************************************************/
    update() {
        

        if (this.ship) {
            if (this.cursors.left.isDown) {
                this.ship.setAngularVelocity(-150);
            } else if (this.cursors.right.isDown) {
                this.ship.setAngularVelocity(150);
            } else {
                this.ship.setAngularVelocity(0);
            }

            if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
            } else {
                this.ship.setAcceleration(0);
            }

            this.physics.world.wrap(this.ship, 5);

            var y = this.ship.y;
            var x = this.ship.x;
            var r = this.ship.rotation;


            if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
                this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
            }

            this.ship.oldPosition = {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation
            };




        }





    }//update

}//class

export default Level1;
