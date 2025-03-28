let map;
let markers = [];
let directionsService;
let directionsRenderer;

// 初始化地圖
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 23.5, lng: 121 }, // 台灣中心位置
    zoom: 8
  });
  
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  
  initSearchBox();
}

// 初始化搜索框
function initSearchBox() {
  const input = document.getElementById('search-input');
  const searchBox = new google.maps.places.SearchBox(input);
  
  document.getElementById('search-btn').addEventListener('click', () => {
    if (input.value.trim() === '') return;
    searchBox.setBounds(map.getBounds());
  });
  
  searchBox.addListener('places_changed', () => {
    const places = searchBox.getPlaces();
    
    if (places.length === 0) return;
    
    // 清除舊標記
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    // 創建新標記
    const bounds = new google.maps.LatLngBounds();
    places.forEach(place => {
      if (!place.geometry) return;
      
      const marker = new google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location
      });
      
      markers.push(marker);
      
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      
      // 添加到行程列表
      addPlaceToItinerary(place);
    });
    
    map.fitBounds(bounds);
  });
}

// 計算路線
function calculateRoute(origin, destination) {
  directionsService.route({
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      
      const duration = response.routes[0].legs[0].duration.text;
      document.getElementById('duration-display').innerHTML = `
        <strong>車程時間:</strong> ${duration}
      `;
    } else {
      alert('路線計算失敗: ' + status);
    }
  });
}
// 在 map.js 中添加以下函數
function showPlaceOnMap(place) {
  // 清除舊標記
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  
  // 創建新標記
  const marker = new google.maps.Marker({
    map: map,
    title: place.name,
    position: place.geometry.location
  });
  
  markers.push(marker);
  
  // 跳轉到景點位置
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(15); // 適當的縮放級別
  }
  
  // 創建訊息框
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div class="info-window">
        <h3>${place.name}</h3>
        <p>${place.formatted_address || '無地址資訊'}</p>
        <button class="add-to-itinerary">加入行程規劃</button>
      </div>
    `,
    position: place.geometry.location
  });
  
  infoWindow.open(map, marker);
  
  // 為訊息框中的按鈕添加事件監聽
  google.maps.event.addListener(infoWindow, 'domready', () => {
    document.querySelector('.add-to-itinerary').addEventListener('click', () => {
      addPlaceToItinerary(place);
      infoWindow.close();
    });
  });
}

// 修改搜索按鈕的事件處理
document.getElementById('search-btn').addEventListener('click', () => {
  const input = document.getElementById('search-input');
  if (input.value.trim() === '') return;
  
  const searchBox = new google.maps.places.SearchBox(input);
  searchBox.setBounds(map.getBounds());
  
  searchBox.addListener('places_changed', () => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;
    
    // 只顯示第一個搜索結果
    showPlaceOnMap(places[0]);
  });
});


// 初始化地圖
window.initMap = initMap;