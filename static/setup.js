init()
setInterval(update, 1000);

function update() {
    var request_public = new XMLHttpRequest();
    request_public.open('GET', "/game");      
    request_public.onload = function () {          
        var ret = JSON.parse(request_public.responseText); 
        var players = ret["players"].sort()  
        var currentGame = document.getElementById("currentGame")
        currentGame.innerHTML =   "Current game: "+players.length + " players - "      
        for(var i=0; i<players.length; i++){
            currentGame.innerHTML += " " + players[i]            
        }

        var newPlayers = []
        for(var i=1; i<=10; i++){
            var playerName = document.getElementById('player'+(i)).value
            if (playerName != ""){
                newPlayers.push(playerName)  
            }            
        }

        var newGame = document.getElementById("newGame")
        newGame.innerHTML =   "New game: "+newPlayers.length + " players - "      
        for(var i=0; i<newPlayers.length; i++){
            newGame.innerHTML += " " + newPlayers[i]            
        }        
                   
    }

    request_public.send();     
}


function restart(){
    var newPlayers = []
        for(var i=1; i<=10; i++){
            var playerName = document.getElementById('player'+(i)).value
            if (playerName != ""){
                newPlayers.push(playerName)  
            }            
        }

    var request = new XMLHttpRequest();
    request.open('POST', "/restart");    
    request.setRequestHeader("Content-Type", "application/json");
    console.log("restarting game witj players: "+newPlayers)
    var json = JSON.stringify({
        "players": newPlayers,              
    });      
    request.send(json);     

}


function init() {
    var request_public = new XMLHttpRequest();
    request_public.open('GET', "/game");      
    request_public.onload = function () {          
        var ret = JSON.parse(request_public.responseText); 
        var players = ret["players"].sort() 
        for(var i=0; i<players.length; i++){
            var id = 'player'+(i+1)
            console.log(id)
            document.getElementById(id).value = players[i]


        }
                   
    }

    request_public.send();  
 
}