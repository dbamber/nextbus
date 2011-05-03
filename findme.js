



function findme()
{
	startPanel.setLoading('true','true');
	navigator.geolocation.getCurrentPosition(getBusStops);
}	
// our callback function, let's fetch some nearby tweets:
function getBusStops(position) {
  var pos = getEastingsAndNorthings(position.coords.latitude,position.coords.longitude);
  
  var query = "select distinct ?label ?east ?north ?lat ?long where { " +
 
				"?thing a <http://transport.data.gov.uk/def/naptan/BusStopPoint> . " + 
				"?thing <http://www.w3.org/2004/02/skos/core#prefLabel> ?label ." +
				"?thing <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> ?east ." +
				"?thing <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> ?north ." +
				"FILTER(?east > " + (parseInt(pos[0]) - 500) + ") ." +
				"FILTER(?east < " + (parseInt(pos[0]) + 500) + ") ." +
				"FILTER(?north > " + (parseInt(pos[1]) - 500) + ") ." +
				"FILTER(?north < " + (parseInt(pos[1]) + 500) + ") ." + 
				"?thing <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat ." +
				"?thing <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long" +
				"}";
	//alert(query);
	
	Ext.util.JSONP.request({
				url: 'http://jsonptunnel.appspot.com/',
                callbackKey: '_callback',
                params: {       
					extURL: 'http://linkedmanchester.org/sparql.json',             
                    _per_page: 100,
                    q: query
                },
                callback: function(result) {
					var results = result.results.bindings;
					
					var items = new Array();
					for (var i =0;i<result.results.bindings.length;i++)
					{
						items.push({
							Name:  result.results.bindings[i].label.value,
							Lat: result.results.bindings[i].lat.value,
							Long: result.results.bindings[i].long.value,
							East:  result.results.bindings[i].east.value,
							North:  result.results.bindings[i].north.value
						});
					}
                    onBusStopRecieved(position.coords.latitude,position.coords.longitude,items);
                }
            });
			
	
			
};

Ext.regModel('BusStop', { fields: ['Name'] });

function renderBusStopsOnMap(comp,map,data)
{

/*
{
	title: 'Map',
	mapOptions : {
		center : new google.maps.LatLng(lat, long),  //nearby San Fran
		zoom : 16,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		navigationControl: true,
		navigationControlOptions: {
    		style: google.maps.NavigationControlStyle.DEFAULT
		}
	},
	xtype: 'map',
	listeners: {
		maprender: function(comp, map){
			renderBusStopsOnMap(comp, map, localData);
		}
	}*/
						
	for (var i=0;i<data.length;i++)
	{
		var marker = new google.maps.Marker({
                                     position: new google.maps.LatLng(data[i].Lat,data[i].Long),
                                     title : data[i].Name,
                                     map: map
                                });

	    google.maps.event.addListener(marker, 'click', function() {
	         alert(data[i].Name);
	    });
	}

}


function onBusStopRecieved(lat,long,localData){
	var busStopStore = new Ext.data.Store({
		model: 'BusStop',
		sorters: 'Name',
		getGroupString: function(record) { return record.get('Name')[0]; },
		data: localData
	});
	startPanel.setLoading(false);
	startPanel.setActiveItem(new Ext.List({
		layout: 'fill',
		
		store: busStopStore,
		itemTpl: '{Name}',
		onItemTap: function(item,index)
		{
			var obj = busStopStore.getAt(index).data;
			showBusStop(obj);
		}
	}));
}


/*
*/

function showBusStop(busStop) {
	var panel = new BusesPanel(busStop,startPanel);
	startPanel.setActiveItem(panel);
	panel.getBuses();
	
}
