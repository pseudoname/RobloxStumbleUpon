
function LoadGames(genre, criteriaChanged)
{
  //read local storage to get games, select random game, add to list of games shown 
  //and redirect to it.
  //get the pool of games, filter out recently played games and already seen games,
  // store list in storage
  
  chrome.storage.local.get(["gamesPool"], function(val){
    var exists = false;
    if(val != undefined && val.gamesPool != undefined && val.gamesPool.length > 0)
    {
      exists = true;
    }
    
    if(exists === false || criteriaChanged === true)
    {
      var excludeGames = [];
      if(genre === 'Default') {
        val.gamesPool = useDefaultSorts(val.gamesPool);
        console.log('Using default sorts');
      }
      else {
        val.gamesPool = useGenreFilters(val.gamesPool, genre);
        console.log('Using Genre filter: ' + genre);
      }
      getRecentAndFavoriteSorts(function(sorts){
          sorts.forEach(sort => {
            getGamesBySorts(sort.token, function(games){
              games.forEach(game => {
                if(excludeGames.indexOf(game.placeId) < 0) {
                excludeGames.push(game.placeId);
                }
              });
            });
          });
      });
      for(var i = 0; i < excludeGames.length; i++)
      {
        var idx = val.gamesPool.indexOf(excludeGames[i]);
        if(idx > -1) {
          val.gamesPool.splice(idx,1);
        }
      }
    }
    var randIdx = getRandomInt(val.gamesPool.length-1);
    var nextGameId = val.gamesPool[randIdx];
    val.gamesPool.splice(randIdx,1);
    saveGamesToLocalStorage(val.gamesPool);
    window.open("https://www.roblox.com/games/" + nextGameId);
});
}

function useGenreFilters(gamesPool, genre) {
  getGenreFilters(function(sorts){
    sorts.forEach(sort => {
      if(sort.name == genre) {
        getGamesByGenre(sort.token, function(games) {
          if(gamesPool === undefined)
          {
            gamesPool = [];
          }
          games.forEach(game => {
            gamesPool.push(game.placeId);
          });
        }); 
      }
    });
  });
  return gamesPool;
}
function useDefaultSorts(gamesPool)
{
  getDefaultSorts(function(sorts){
    sorts.forEach(sort => {
      getGamesBySorts(sort.token, function(games) {
            var gamesSort = gamesPool;
            if(gamesSort === undefined)
            {
              gamesSort = [];
            }
            games.forEach(game => {
              gamesSort.push(game.placeId);
            });
          gamesPool = gamesSort;
        }); 
    });
  });
  return gamesPool;
}
function saveGamesToLocalStorage(games)
{
  chrome.storage.local.set({ gamesPool: games}, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error setting local storage.");
    }
  });
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function getDefaultSorts(callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://games.roblox.com/v1/games/sorts", false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).sorts);
    }
  }
  xhr.send();
}
function getGenreFilters(callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://games.roblox.com/v1/games/sorts?model.gameSortsContext=GamesAllSorts", false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).genreFilters);
    }
  }
  xhr.send();
}
function getRecentAndFavoriteSorts(callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://games.roblox.com/v1/games/sorts?model.gameSortsContext=ChatSorts", false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).sorts);
    }
  }
  xhr.send();
}
function getGamesBySorts(token, callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://games.roblox.com/v1/games/list?model.sortToken=" + token, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).games);
    }
  }
  xhr.send();
}
function getGamesByGenre(token, callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://games.roblox.com/v1/games/list?model.genreFilter=" + token, false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).games);
    }
  }
  xhr.send();
}

function getUserTheme(callback)
{
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://accountsettings.roblox.com/v1/themes/User/1", false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.responseText).themeType);    
    }
  }
  xhr.send();
}

function handleClick(evt) {
    let criteria = selectEle.options[selectEle.selectedIndex].value;
    let criteriaChanged = false;
    chrome.storage.local.set({selectedGenre: criteria});
    chrome.storage.local.get(["criteria"], function(data) {
    if(data != undefined && data.criteria != undefined) {
        if(data.criteria != criteria) {
            chrome.storage.local.set({criteria:criteria});
            criteriaChanged = true;
        }
    }
    
    if(criteria === "Default")
    {
      
      chrome.storage.local.get(["metrics"], function(data){
        data.metrics.defaultCounter++;
        chrome.storage.local.set({metrics: data.metrics});
        IncrementStumbleCount();
      });
    }
    else 
    {
      
      chrome.storage.local.get(["metrics"], function(data) {
        var found = false;
        data.metrics.genreCounters.forEach(counter => {
          if(counter.name === criteria) {
            counter.count++;
            found = true;
          }
        });
        if(found === false){
          data.metrics.genreCounters.push({
            name: criteria,
            count: 1
          })
        }
        chrome.storage.local.set({metrics: data.metrics});
        IncrementStumbleCount();
      });
    }
    LoadGames(criteria, criteriaChanged);
  });
}
function IncrementStumbleCount()
{
  chrome.storage.local.get(["metrics"], function(data){
    data.metrics.totalStumbleCount++;
    data.metrics.currentStumbleCount++;
    chrome.storage.local.set({metrics: data.metrics});
  });
}

let genreBtn = document.getElementById('useGenre');
let selectEle = document.getElementById('genre');
let metricsBtn = document.getElementById('showMetrics');
let metricsSection = document.getElementById("metrics-section");
let metricsCaret = document.getElementById("showMetrics");
let stumbleCount =  document.getElementById("stumble-count");
let playCount =  document.getElementById("play-count");
let currentCount = document.getElementById("current-count");
let stumblesPerPlay = document.getElementById("stumbles-per-play-count");

metricsBtn.onclick = function () {  
  if (metricsSection.style.display !== "block") {
    chrome.storage.local.get(['metrics'], function(data) {
      var metrics = data.metrics;      
      metricsSection.style.display = "block";
      metricsCaret.innerHTML = "&#9650;";
      stumbleCount.innerHTML = metrics.totalStumbleCount;
      playCount.innerHTML = metrics.playCount;
      currentCount.innerHTML = metrics.currentStumbleCount;
      metrics.averageStumblesPerPlay = metrics.stumbleCountPerPlay.length > 0 ? metrics.totalStumbleCount / metrics.stumbleCountPerPlay.length : 0;
      stumblesPerPlay.innerHTML = metrics.playCount < 1 ? "0" : metrics.averageStumblesPerPlay;
      
    });
  } else {
    metricsCaret.innerHTML = "&#9660;"
    metricsSection.style.display = 'none';
  }
};

//defaultBtn.onclick = handleClick;
genreBtn.onclick = handleClick;
window.onload = function() {
    getUserTheme(function(themeType) {
      if (themeType == null)
      {
        themeType = "classic";
      }
       document.body.className += themeType.toLowerCase();      
      }); 
    
    chrome.storage.local.get(['selectedGenre'], function(data) {
      if(data != undefined && data.selectedGenre != undefined) {
        selectEle.value = data.selectedGenre;
      }
    });
};
