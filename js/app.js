// 載入SortableJS
document.head.insertAdjacentHTML('beforeend', `
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>
`);

// 當DOM完全載入後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 初始化地圖
  if (typeof google !== 'undefined') {
    initMap();
  } else {
    alert('Google Maps API載入失敗，請檢查您的API密鑰和網路連接');
  }
  
  // 其他初始化代碼...
});