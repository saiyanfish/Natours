/* eslint-disable */
// console.log(locations);
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic2FpeWFuZmlzaGgiLCJhIjoiY2xzMHVhZ3dtMDR6djJqbzM2YzM3M3pmcSJ9.qwQ_NNvNN1i9p9uZ16_X3A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/saiyanfishh/cls0w6v6t00bk01pqgglhd0u6',
    // scrollZoom: false,
    // center: [-118.113491, 34.111745],
    zoom: 2,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    // ADD MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates, {
      padding: {
        top: 200,
        bottom: 50,
        left: 100,
        right: 100,
      },
    });
  });

  map.fitBounds(bounds);
};
