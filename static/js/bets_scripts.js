let isNavigatingAway = false;

console.log("script load" + isNavigatingAway)
document.getElementById('bet-button').addEventListener('click',function (event) {
    console.log(isNavigatingAway)
    isNavigatingAway = true;
});

console.log("Here")
window.addEventListener('beforeunload', function(event) {
    if (!isNavigatingAway) {
        navigator.sendBeacon('/disconnect');
    }
});
