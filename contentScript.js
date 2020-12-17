var playBtn = document.getElementById("MultiplayerVisitButton");
if(playBtn !== null)
{
playBtn.onclick = function() {
    chrome.storage.local.get(['metrics'], function(data){
        data.metrics.playCount++;
        data.metrics.stumbleCountPerPlay.push(data.metrics.currentStumbleCount);
        data.metrics.currentStumbleCount = 0;
        chrome.storage.local.set({metrics: data.metrics});
    });
  }
  playBtn.click();
}
