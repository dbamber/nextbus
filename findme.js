
var FindMePanel = Ext.extend(Ext.Panel, 
	{
	    // New function added
	    constructor: function(root) {
			this.root = root;
			
    		FindMePanel.superclass.constructor.call(this, 
    			{ 
					layout: { type: 'vbox', align: 'stretch' }
			    			
				});
		},
		back: function()
		{
			return this.list.back();

		},
		
		onRender: function() {
			BusesPanel.superclass.onRender.apply(this, arguments);
			this.map = new MapPanel();
			this.list = new BusStopPanel();
			this.list.root = this;
			this.add(this.map);
			this.add(this.list);
		},
		setLocationAndFindStops: function(pos)
		{
			var eandn = getEastingsAndNorthings(pos.coords.latitude,pos.coords.longitude);
			
			this.map.update({ latitude : pos.coords.latitude,longitude:pos.coords.longitude});
			
			var marker = new google.maps.Marker({
                                     position: new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude),
                                     map: this.map.map,
                                     icon: "http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png"
                                });
                                
			this.getBusStops(eandn);
			
                
				
		},
		getBusStops: function(pos)
		{
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
				
			Ext.util.JSONP.request({
				url: 'http://jsonptunnel.appspot.com/',
				//url: 'http://linkedmanchester.org/sparql.json',
                callbackKey: '_callback',
                params: {       
					extURL: 'http://linkedmanchester.org/sparql.json',             
                    _per_page: 100,
                    q: query
                },
                callback: this.busStopsDownloaded,
                scope: this
             });
		},
		busStopsDownloaded: function(result)
		{
			startPanel.setLoading(false);
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
			
			//this.displayBusStops(items);
			this.list.displayBusStops(items);
			
		},
		markers: [],
		clearMarkers: function (){
			for (var i=0;i<this.markers.length;i++)
			{
				this.markers[i].setMap(null);
			}
			this.markers = [];
		},
		
		displayBusStops: function(data)
		{
			
			this.clearMarkers();
			
			for (var i=0;i<data.length;i++)
			{
				var marker = new google.maps.Marker({
		                                     position: new google.maps.LatLng(data[i].Lat,data[i].Long),
		                                     map: this.map.map
		                                });
		        this.markers.push(marker);
			}
			
		}
	});
	   
var MapPanel = Ext.extend(Ext.Map, {
	mapOptions: {
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		navigationControl: true,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.DEFAULT
		}
	},
	flex: 1
	
}); 
	    
var BusStopPanel = Ext.extend(Ext.Panel, 
	{
		flex: 1,
		layout:  'card',
		back: function() {
			
			if (this.items.length == 1) return false;
			
			if (!this.getActiveItem().back())
			{
				this.root.clearMarkers.call(this.root);
				this.setActiveItem(0,'slide');
				this.remove(1);
				return true;
			}
			else {
				return true;
			}
			
			
		},
		displayBusStops: function (data)
		{
			var busStopStore = new Ext.data.Store({
				model: 'BusStop',
				sorters: 'Name',
				getGroupString: function(record) { return record.get('Name')[0]; },
				data: data
			});
			
			this.setActiveItem(new Ext.Panel({
				layout: 'fit',
				items: [
					new Ext.List({
						layout: 'fill',
						
						store: busStopStore,
						itemTpl: '{Name}',
						listeners: {
							itemtap: function(item,index)
								{
									var obj = busStopStore.getAt(index).data;
									this.showBusStop(obj);
									this.root.displayBusStops.call(this.root,[obj]);
								},
							scope: this
						}
					})
				]
			}));
		},
		showBusStop: function(busStop)
		{
			var panel = new BusesPanel(startPanel);
			this.setActiveItem(panel,'slide');
			panel.getBuses(busStop);
		}
	});
		
			


Ext.regModel('BusStop', { fields: ['Name'] });



