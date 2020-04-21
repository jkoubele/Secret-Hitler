var currentAction = ""
var actionSubmited = false
var vetoPossible = false;

var name  = sessionStorage.getItem("NAME");
//alert("Wilkommen, "+name)

function update() {
    var request_public = new XMLHttpRequest();
    request_public.open('GET', "/game");      
    request_public.onload = function () {          
        var ret = JSON.parse(request_public.responseText);        
        draw_board(ret)    
        draw_policies(ret)        
        document.getElementById("message").innerHTML = ret['message']             
    }

    var request_private = new XMLHttpRequest();
    request_private.open('GET', "/info/"+name);      
    request_private.onload = function () {          
        var ret = JSON.parse(request_private.responseText);
        draw_role(ret) 
        draw_action(ret)  
                  
    }

    request_public.send(); 
    request_private.send();
}

function draw_action(ret){
    if(ret["action"] == currentAction){
        return
    }
    currentAction = ret["action"]
    actionSubmited = false
    var content = ""    

    if(ret["action"] == "nomination"){
        content += "<h5>Choose a chancellor</h5>"

        content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='candidates' value='"+ret["candidates"][0]+"' checked>"+ret["candidates"][0]+ "</label> </div>"
        for(var i=1; i<ret["candidates"].length; i++){
            content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='candidates' value='"+ret["candidates"][i]+"'>"+ret["candidates"][i]+ "</label> </div>"        }
        
        content += "<p><p><button type='button' onclick='nominateChancellor()' class='btn btn-secondary btn-lg' style='position: absolute; left: 0px;'>Submit</button>"        
        
    }

    else if(ret["action"] == "execution"){
        content += "<h5>Choose a player to execute!</h5>"

        content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='execution' value='"+ret["candidates"][0]+"' checked>"+ret["candidates"][0]+ "</label> </div>"
        for(var i=1; i<ret["candidates"].length; i++){
            content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='execution' value='"+ret["candidates"][i]+"'>"+ret["candidates"][i]+ "</label> </div>"        }
        
        content += "<p><p><button type='button' onclick='execute()' class='btn btn-secondary btn-lg' style='position: absolute; left: 0px;'>Execute!</button>"        

    }

    else if(ret["action"] == "extra_president"){
        content += "<h5>Choose a next president for the special election.</h5>"

        content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='extraElections' value='"+ret["candidates"][0]+"' checked>"+ret["candidates"][0]+ "</label> </div>"
        for(var i=1; i<ret["candidates"].length; i++){
            content += "<div class='form-check' ><label class='form-check-label' onsubmit='event.preventDefault();'><input type='radio' class='form-check-input' name='extraElections' value='"+ret["candidates"][i]+"'>"+ret["candidates"][i]+ "</label> </div>"        }
        
        content += "<p><p><button type='button' onclick='extraElections()' class='btn btn-secondary btn-lg' style='position: absolute; left: 0px;'>Execute!</button>"        


    }

    else if (ret["action"] == "voting"){        
        content += "<div class='form-check' ><label class='form-check-label'><input type='radio' class='form-check-input' name='voting' value='ja' checked>"+'Ja!'+"</label> </div>"
        content += "<div class='form-check' ><label class='form-check-label'><input type='radio' class='form-check-input' name='voting' value='nein'>"+'Nein!'+"</label> </div>"
        content += "<p><p><button type='button' onclick='vote()' class='btn btn-secondary btn-lg' style='position: absolute; left: 0px;'>Vote</button>"

    }

    else if(ret["action"] == "legislative_president"){
        console.log("Veto"+ret["veto"])
        content += "<h5>Choose an article to discard:</h5>"        
        console.log(ret['cards'])
        content += "<form class='form-inline' onsubmit='event.preventDefault();'>"
        content += "<div class='form-check-inline' ><label class='form-check-label'><input type='radio' class='form-check-input' name='president_legislative' value="+ret['cards'][0]+" checked>"+ret['cards'][0]+"</label> </div>"
        for(var i=1; i<3; i++){
            content += "<div class='form-check-inline' ><label class='form-check-label'><input type='radio' class='form-check-input' name='president_legislative' value="+ret['cards'][i]+">"+ret['cards'][i]+"</label> </div>"
        }
        vetoPossible = false
        if (ret["veto"]){
            vetoPossible = true
            content += "<div class='form-check'><input type='checkbox' class='form-check-input' id='veto'><label class='form-check-label' for='veto'>Veto</label></div>"
        }

        content += "<button class='btn btn-secondary' onclick='legislative_president()'>Discard article</button> </form> "
    }

    else if(ret["action"] == "card_inspection"){
        content += "<h5>Next 3 cards in the deck:</h5>"        
        console.log(ret['cards'])        
        for(var i=0; i<3; i++){
            content += "<p>"+ret['cards'][i]            
        }
        content += "<p><button class='btn btn-secondary' onclick='inspection_done()'>O.K.</button> </form> "



    }

    else if(ret["action"] =='legislative_chancellor'){
        console.log("Veto"+ret["veto"])
        content += "<h5>Accept an article:</h5>"
        console.log("Chancellors choice:"+ret['cards'])

        content += "<form class='form-inline' onsubmit='event.preventDefault();'>"
        content += "<div class='form-check-inline' ><label class='form-check-label'><input type='radio' class='form-check-input' name='chancellor_legislative' value="+ret['cards'][0]+" checked>"+ret['cards'][0]+"</label> </div>"
        content += "<div class='form-check-inline' ><label class='form-check-label'><input type='radio' class='form-check-input' name='chancellor_legislative' value="+ret['cards'][1]+" >"+ret['cards'][1]+"</label> </div>"
        
        vetoPossible = false
        if (ret["veto"]){
            vetoPossible = true
            content += "<div class='form-check'><input type='checkbox' class='form-check-input' id='veto'><label class='form-check-label' for='veto'>Veto</label></div>"
        }

        content += "<button class='btn btn-secondary' onclick='legislative_chancellor()'>Accept article</button> </form> "


    }

    document.getElementById("action").innerHTML = content

}

function inspection_done(){
    if (actionSubmited){
        return
    }
    actionSubmited = true

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");
    
    var json = JSON.stringify({
        "player": name              
    });      
    request.send(json);   

}

function extraElections(){
    if (actionSubmited){
        return
    }
    actionSubmited = true
    var candidatesForm = document.getElementsByName("extraElections");
    var nominee;
    for(var i = 0; i < candidatesForm.length; i++){
        if(candidatesForm[i].checked){            
            nominee = candidatesForm[i].value
        }
    }    

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");
    
    var json = JSON.stringify({
        "player": name,
        "extraPresident": nominee        
    });      
    request.send(json);    

}

function execute(){
    if (actionSubmited){
        return
    }
    actionSubmited = true
    var candidatesForm = document.getElementsByName("execution");
    var nominee;
    for(var i = 0; i < candidatesForm.length; i++){
        if(candidatesForm[i].checked){            
            nominee = candidatesForm[i].value
        }
    }    

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");
    
    var json = JSON.stringify({
        "player": name,
        "executed": nominee        
    });      
    request.send(json);    

}


function legislative_chancellor(){    
    if (actionSubmited){
        return
    }
    actionSubmited = true

    var article = ""
    var form = document.getElementsByName("chancellor_legislative");
    for(var i = 0; i < form.length; i++){
        if(form[i].checked){            
            article=form[i].value
            break
        }
    } 
    console.log(article)

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");

    var veto = false;

    if (vetoPossible){
        var vetoBtn = document.getElementById("veto");        
        veto = vetoBtn.checked
    }
    
    var json = JSON.stringify({
        "player": name,
        "legislative_chancellor": article,
        "veto": veto     
    });     
    request.send(json);   
}

function legislative_president(){
    if (actionSubmited){
        return
    }
    actionSubmited = true

    console.log("Article discarded")
    var articles_passed = []
    var form = document.getElementsByName("president_legislative");
    for(var i = 0; i < form.length; i++){
        if(!form[i].checked){            
            articles_passed.push(form[i].value)
        }
    } 
   

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");

    var veto = false;

    if (vetoPossible){
        var vetoBtn = document.getElementById("veto");        
        veto = vetoBtn.checked
    }
    
    var json = JSON.stringify({
        "player": name,
        "legislative_president": articles_passed,
        "veto": veto      
    });     
    request.send(json);   
    
}

function vote(){
    if (actionSubmited){
        return
    }
    actionSubmited = true
    var votingForm = document.getElementsByName("voting");
    var vote;
    for(var i = 0; i < votingForm.length; i++){
        if(votingForm[i].checked){            
            vote = votingForm[i].value
        }
    }    
    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");
    
    var json = JSON.stringify({
        "player": name,
        "vote": vote        
    });      
    var v = "Ja!"
    if (vote=="nein"){
        v = "Nein!"
    }
    document.getElementById("action").innerHTML = "<h4>You voted "+v+"</h4>"
    request.send(json);   

}

function nominateChancellor(){
    if (actionSubmited){
        return
    }
    actionSubmited = true
    var candidatesForm = document.getElementsByName("candidates");
    var nominee;
    for(var i = 0; i < candidatesForm.length; i++){
        if(candidatesForm[i].checked){            
            nominee = candidatesForm[i].value
        }
    }    

    var request = new XMLHttpRequest();
    request.open('POST', "/action");    
    request.setRequestHeader("Content-Type", "application/json");
    
    var json = JSON.stringify({
        "player": name,
        "nominee": nominee        
    });      
    request.send(json);     
}


function draw_role(ret){
    content = ""
    content += "<h4>Role ("+name+")</h4><p>"
    if (ret["role"] == "liberal"){
        content += "<div class='card-liberal' style='width:80%;'></div>" 
    }
    else if(ret["role"] == "fascist"){
        content += "<div class='card-fascist' style='width:80%;'></div>" 
    }
    else if(ret["role"] == "hitler"){
        content += "<div class='card-hitler' style='width:80%;'></div>" 
    }
        
    if (ret["role"] !== "hitler"){
        content += "<p><p>You are "+ret["role"]+".</p>" 
    }
    else{
        content += "<p><p>You are Hitler.</p>" 
    }
    

    if (ret["role"] == "fascist"){
        content += "<p>"+ret["hitler"]+" is Hitler.</p>"
        fascists = []       
        
        for(f in ret["fascists"]){
            var ff = ret["fascists"][f]            
            if(ff !== name){                
                fascists.push(ff)
            }
        }
        if (fascists.length == 1){
            content += "<p>"+fascists[0]+" is fascist.</p>"
        } 
        if (fascists.length > 1){
            content += "<p>Other fascists: "
            for(f in fascists){
                content += fascists[f]+" "
            }
            content +="</p>"

        }
    }
    else if(ret["role"] == "hitler"){
        fascists = []       
        
        for(f in ret["fascists"]){
            var ff = ret["fascists"][f]            
            if(ff !== name){                
                fascists.push(ff)
            }
        }
        if (fascists.length == 1){
            content += "<p>"+fascists[0]+" is fascist.</p>"
        } 
        if (fascists.length > 1){
            content += "<p>Other fascists: "
            for(f in fascists){
                content += fascists[f]+" "
            }
            content +="</p>"

        }
    }

    document.getElementById("role").innerHTML = content
    


}


function draw_policies(ret){

    document.getElementById("liberal-articles-title").innerHTML = "Liberal articles: "+ret['liberal_articles']
    document.getElementById("fasist-articles-title").innerHTML = "Fascist articles: "+ret['fasist_articles']
    document.getElementById("anarchy-title").innerHTML = "Failed elections: "+ret['anarchy_counter']   
    

    var policiesLiberal = document.getElementById("policies-liberal");
    var margin = 10
    var sizeX = (policiesLiberal.clientWidth - 6 * margin) / 6
    var sizeY = sizeX * 1.47
    var content = ""
    for(var i=0; i<5; i++){
        if (i >= ret['liberal_articles']){            
                content += "<div class='article-empty' style='left: "+(sizeX+margin)*i +"px; top: 20px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"            
            
        }
        else{
            content += "<div class='article-liberal' style='left: "+(sizeX+margin)*i +"px; top: 20px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"
        }
        
    }    
    policiesLiberal.innerHTML = content


    var policiesFasist = document.getElementById("policies-fasist");
    var margin = 10
    var sizeX = (policiesFasist.clientWidth - 6 * margin) / 6
    var sizeY = sizeX * 1.47
    var content = ""    
    for(var i=0; i<6; i++){
        if (i >= ret['fasist_articles']){
            content += "<div class='article-empty' style='left: "+(sizeX+margin)*i +"px; top: 20px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'>"

            if(ret["players"].length<=6){
                if(i==2){
                    content += "<div class='examine-cards' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==3){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==4){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }

            }
            else if(ret["players"].length<=8){
                if(i==1){
                    content += "<div class='inspection' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==2){
                    content += "<div class='extra-elections' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==3){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==4){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                
            }
            else if(ret["players"].length<=10){
                if(i==0){
                    content += "<div class='inspection' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==1){
                    content += "<div class='inspection' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==2){
                    content += "<div class='extra-elections' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==3){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                if(i==4){                
                    content += "<div class='bullet' style='left: 0px; top: 0px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"                
                }
                
            }

            content += "</div>"
        }
        else{            
            content += "<div class='article-fasist' style='left: "+(sizeX+margin)*i +"px; top: 20px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"
        }
        
    }    
    policiesFasist.innerHTML = content


    var electionCounter = document.getElementById("anarchy");
    var margin = 8
    var sizeX = (electionCounter.clientWidth - 3 * margin) / 9
    var sizeY = sizeX * 1.47
    var content = ""
    for(var i=0; i<3; i++){
        if (i >= ret['anarchy_counter']){
            content += "<div class='article-empty' style='left: "+(sizeX+margin)*i +"px; top: 10px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"
        }
        else{
            content += "<div class='anarchy' style='left: "+(sizeX+margin)*i +"px; top: 10px; width:"+Math.round(sizeX)+"px; height:"+Math.round(sizeY)+"px;'></div>"
        }
    }    
    electionCounter.innerHTML = content
}


function draw_board(ret){  
    var players = ret["players"] 
    var dead = ret["dead"]      
    var board = document.getElementById("board"); 
    var boardWidth = board.clientWidth    
    var content = ""
    centerX = board.clientWidth / 2
    centerY = board.clientHeight / 2
    var a = board.clientWidth * 0.4
    var b = board.clientHeight * 0.4

    for(var i=0; i<players.length; i++){
        var angle = 2* Math.PI *i / players.length - Math.PI / 2
        var x = Math.cos(angle) * a + centerX - 15
        var y = Math.sin(angle) * b + centerY

        if(dead[i]){
            content += "<div class='player' style='left: "+x +"px; top:"+y+"px; background-color: rgb(250, 225, 225);' >"+players[i]+" (executed)</div>"                      
        }
        else{
            content += "<div class='player' style='left: "+x +"px; top:"+y+"px;' >"+players[i]+"</div>"
        }
        
        
        if(ret["chancellor"] == players[i]){            
            content += "<div class='office' style='left: "+x +"px; top:"+(y+30)+"px;' >Chancellor</div>"
        }
        else if(ret["president"] == players[i]){            
            content += "<div class='office' style='left: "+x +"px; top:"+(y+30)+"px;' >President</div>"
        }
        
    }    
    board.innerHTML = content
}

setInterval(update, 1000);
