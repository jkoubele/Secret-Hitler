function register(){
    var name = document.getElementById("playername").value
    console.log("Name: "+name)    
    sessionStorage.setItem('NAME', name);            
    
}