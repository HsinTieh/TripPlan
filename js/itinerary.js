let places = [];

// 添加景點到行程
function addPlaceToItinerary(place) {
  // 檢查是否已存在
  if (places.some(p => p.place_id === place.place_id)) {
    alert('此景點已在行程中！');
    return;
  }
  
  const placeData = {
    id: Date.now().toString(),
    place_id: place.place_id,
    name: place.name,
    location: place.geometry.location,
    address: place.formatted_address
  };
  
  places.push(placeData);
  renderItinerary();
  
  // 如果有多於一個景點，計算路線
  if (places.length > 1) {
    const origin = places[places.length - 2].location;
    const destination = places[places.length - 1].location;
    calculateRoute(origin, destination);
  }
}

// 渲染行程列表
function renderItinerary() {
  const container = document.getElementById('places-container');
  container.innerHTML = '';
  
  places.forEach((place, index) => {
    const placeElement = document.createElement('div');
    placeElement.className = 'place-item';
    placeElement.dataset.id = place.id;
    placeElement.innerHTML = `
      <div class="place-header">
        <span class="place-number">${index + 1}</span>
        <h4>${place.name}</h4>
        <button class="delete-btn" data-id="${place.id}"><i class="fas fa-times"></i></button>
      </div>
      <p class="place-address">${place.address}</p>
    `;
    
    container.appendChild(placeElement);
  });
  
  // 初始化拖拽排序
  initSortable();
  
  // 添加刪除按鈕事件
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      places = places.filter(place => place.id !== id);
      renderItinerary();
    });
  });
}

// 初始化拖拽排序
function initSortable() {
  const container = document.getElementById('places-container');
  
  new Sortable(container, {
    animation: 150,
    onEnd: function(evt) {
      // 重新排序places數組
      const movedItem = places.splice(evt.oldIndex, 1)[0];
      places.splice(evt.newIndex, 0, movedItem);
      
      // 重新渲染
      renderItinerary();
      
      // 如果有足夠的景點，重新計算路線
      if (places.length > 1) {
        calculateRouteForAll();
      }
    }
  });
}

// 計算整個行程的路線
function calculateRouteForAll() {
  if (places.length < 2) return;
  
  const waypoints = places.slice(1, -1).map(place => ({
    location: place.location,
    stopover: true
  }));
  
  directionsService.route({
    origin: places[0].location,
    destination: places[places.length - 1].location,
    waypoints: waypoints,
    travelMode: 'DRIVING',
    optimizeWaypoints: true
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      
      // 計算總時間
      let totalDuration = 0;
      response.routes[0].legs.forEach(leg => {
        totalDuration += leg.duration.value;
      });
      
      const hours = Math.floor(totalDuration / 3600);
      const minutes = Math.round((totalDuration % 3600) / 60);
      
      let durationText = '';
      if (hours > 0) durationText += `${hours}小時 `;
      durationText += `${minutes}分鐘`;
      
      document.getElementById('duration-display').innerHTML = `
        <strong>總車程時間:</strong> ${durationText}
      `;
    }
  });
}