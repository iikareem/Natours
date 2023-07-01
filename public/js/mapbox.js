

export const displayMap = (locations) =>{
  mapboxgl.accessToken = 'pk.eyJ1IjoiaWlrYXJlZW0iLCJhIjoiY2xqMXg3c2VpMWc5ajNmcWZiaDF6dGJpbyJ9.zyAG32ub9zYACU94M63MtQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/iikareem/clj2rb35g01gg01pfh34o8t7e/draft',
    scrollZoom: false
  });


  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc =>{

    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';


    // Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);


    // Add Popup
    new mapboxgl.Popup({
      offset : 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);


    // Extend map bounds to include Current location
    bounds.extend(loc.coordinates);
    map.fitBounds(bounds, {
      padding :{
        top : 200,
        bottom : 150,
        left : 100,
        right : 100
      }
    })

  })
}



