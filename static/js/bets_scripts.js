let isNavigatingAway = false;


if(in_game) {
    window.location.href = '/reset';
}
document.getElementById('bet-button').addEventListener('click',function (event) {
    isNavigatingAway = true;
});

window.addEventListener('beforeunload', function(event) {
    if (!isNavigatingAway) {
        navigator.sendBeacon('/disconnect');
    }
});
