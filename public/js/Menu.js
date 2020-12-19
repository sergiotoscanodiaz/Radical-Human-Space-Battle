class Menu extends Phaser.Scene {
    constructor(){
        super("Menu");         
    }

    create(){

        this.backgroundSprite = this.physics.add.sprite(400,300,'background');

        //CLIENT: Say to the Server that I am here. I will have a socket.id
        this.socket = io();

        //Create a self property = this, that will allow me to use this (scene)
        //inside the listeners of socket.io
        let self = this;        
        
        //Initializate to 0 
        this.numPlayersActive = 0;


        //3 arrays (A. all textures, B. with active players textures, C. availables textures)
        //A=B+C
        this.allTextures = ["blue", "cyan", "green","lime","orange","pink","purple","red","yellow"];
        this.activeTextures = [];
        this.availableTextures = [];
        
        //availableSprites IMG Objects
        this.availableSprites = [];

        

        //Texts One for START and One for FULL Room
        //hide or show the text using Alpha property
        this.startTXT = this.add.text(10, 20, "Start" , {font:"25px Arial", fill:"yellow"}).setAlpha(1);
        /*.setInteractive().on("pointerdown",() => {            
            self.scene.start("Level1",self.socket);
        });*/
        this.fullTXT = this.add.text(10, 20, "Full Room" , {font:"25px Arial", fill:"yellow"}).setAlpha(0);


        //Text for showing number of players playing (Active == true)
        this.labelNumPlayers =  "Number of Players:";
        this.numPlayersTXT = this.add.text(10, 50, this.labelNumPlayers , {font:"25px Arial", fill:"yellow"})
        ;

        //class property for duplicating the players that I will receive from server        
        this.allPlayers;

        //SERVER --> CLIENT each time an user (include me) is connected or entered in the game
        this.socket.on('currentPlayers', function (players) {
            self.allPlayers = players;
            self.updateActivePlayers(players,self);            
        });
        
        //SERVER --> CLIENT every time a client disconnect (not me)
        this.socket.on('disconnect', function (playerId) {            
            delete self.allPlayers[playerId];
            self.updateActivePlayers(self.allPlayers,self);           
        });

    }

/**
 * Updating the texts and activate or hide the link for the game
 * @param {*} players 
 * @param {*} self 
 */
updateActivePlayers(players,self){
  

    let actives = 0;  
    self.activeTextures = [];          

    //Loop players and ask who is active
    Object.keys(players).forEach(function (id) {      
        if (players[id].active){
            actives++;
            self.activeTextures.push(players[id].texture);//we update the active textures
        } 
    });

    //We have to calculate the availableTexture array
    //difference between allTextures and activeTextures
    self.availableTextures = self.allTextures.filter(x => self.activeTextures.indexOf(x) === -1);    
    console.log(self.availableTextures);

    self.availableSprites.forEach((sp) => {
        sp.destroy();
    });


    for (let i = 0; i < self.availableTextures.length; i++) {
        self.availableSprites[i] = this.add
          .sprite(i * 60 + 10, 100, self.availableTextures[i])
          .setOrigin(0, 0);
  
          self.availableSprites[i].setInteractive().on("pointerdown", () => {
            self.scene.start("Level1", {            
            texture: self.availableSprites[i].texture.key,
            socket: this.socket,
          });
        });
      }

    self.numPlayersTXT.setText( self.labelNumPlayers + actives);
    
    //if active player less than 3 allow me to play
    if (actives<3){
        self.startTXT.setAlpha(1);//Show
        self.fullTXT.setAlpha(0);//Hide                
    }else {
        self.fullTXT.setAlpha(1);//Show
        self.startTXT.setAlpha(0);//Hide        
    }            

    //Update textures arrays
    //Paint at the menu the active players
    //Paint at the menu the available skins and also are interactive



}




}

export default Menu;