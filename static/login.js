function register(){
    var name = document.getElementById("select").value    
    console.log("Name: "+name)    
    sessionStorage.setItem('NAME', name);            
    
}

function update() {
    var request_public = new XMLHttpRequest();
    request_public.open('GET', "/game");      
    request_public.onload = function () {          
        var ret = JSON.parse(request_public.responseText);   
        players = ret['players']
        var s = ""
        for(var i=0; i<players.length; i++){
            console.log(players[i])
            s += "<option>"+players[i]+"</option>"
        }
        document.getElementById("select").innerHTML = s
             
         
    }    
    
    request_public.send();     
}

update()