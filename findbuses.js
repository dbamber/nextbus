Ext.regModel('BusRoute', { fields: ['Name'] });

var BusesPanel = Ext.extend(Ext.Panel, {
	    // New function added
	    constructor: function(root) {

			this.root = root;
    		BusesPanel.superclass.constructor.call(this, { layout: { type: 'vbox', align: 'stretch' } });
			
	    },
		onRender: function() {
			BusesPanel.superclass.onRender.apply(this, arguments);
			this.map = new MapPanel();
			this.list = new ListPanel();
			this.add(this.map);
			this.add(this.list);
    	},
		
		onBusRoutesDownloaded: function (data)
		{
	
	
			this.list.showRouteData(data, function(item) { this.getTimes(item); }, this);
			
			
		},
		
		
		busDownloaded: function (result)
		{
			
			this.root.setLoading(false);
			var results = result.results.bindings;
			
			var items = new Array();
			for (var i =0;i<result.results.bindings.length;i++)
			{
				items.push( { Name: result.results.bindings[i].label.value, Item: result.results.bindings[i].route.value });
				
			}
			this.onBusRoutesDownloaded(items);
		},
		getBuses: function(loc)
		{
			this.location = loc;
			this.map.update({ latitude : loc.Lat,longitude : loc.Long});
			  var query = "PREFIX transit: <http://vocab.org/transit/terms/> " +
			  				"SELECT distinct ?route ?label WHERE { " +
								"?thing <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> "+this.location.East+" . " + 
								"?thing <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> "+this.location.North+" . " +
								"?st transit:stop ?thing . " +
								"?trip transit:stopTime ?st . " + 
								"?trip transit:route ?route . " +
								"?route <http://www.w3.org/2000/01/rdf-schema#label> ?label" + 
							"}";
				//alert(query);
				
				this.root.setLoading(true);
				Ext.util.JSONP.request({
							url: 'http://jsonptunnel.appspot.com/',
			                callbackKey: '_callback',
			                params: {       
								extURL: 'http://linkedmanchester.org/sparql.json',             
			                    _per_page: 100,
			                    q: query
			                },
			                callback: this.busDownloaded,
							scope: this
			            });
			            
			            
		},
		getTimes: function(route)
		{
			
			var query = "SELECT ?tlabel ?depart ?st  where {" +
				"?s a <http://transport.data.gov.uk/def/naptan/BusStopPoint> . " +
				"?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/easting> " + this.location.East + " . " +
				"?s <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/northing> " + this.location.North + " . " +
				"?st <http://vocab.org/transit/terms/stop> ?s . " + 
				"?st <http://vocab.org/transit/terms/trip> ?t . " +
				"?t <http://vocab.org/transit/terms/route> <" + route + "> . " +
				"?t <http://www.w3.org/2000/01/rdf-schema#label> ?tlabel . " +
				"?st <http://vocab.org/transit/terms/departureTime> ?depart ." +
				"FILTER(STR(?depart) > \"" + getTime(0) + "\") . " +
				"FILTER(STR(?depart) < \"" + getTime(2) + "\") " + 
				"} ";
	
			this.root.setLoading(true);
			
			Ext.util.JSONP.request({
						url: 'http://jsonptunnel.appspot.com/',
		                callbackKey: '_callback',
		                params: {       
							extURL: 'http://linkedmanchester.org/sparql.json',             
		                    _per_page: 100,
		                    q: query
		                },
		                callback: this.routesDownloaded,
		                scope: this
		            });
		},
		routesDownloaded: function (result)
		{
			startPanel.setLoading(false);
			var results = result.results.bindings;
			
			var items = new Array();
			for (var i =0;i<result.results.bindings.length;i++)
			{
				alert(result.results.bindings[i].depart.value);
				items.push( { Depart: result.results.bindings[i].depart.value, Label: result.results.bindings[i].tlabel.value });
				
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

var ListPanel = Ext.extend(Ext.Panel, {
		flex: 1,
		layout:  'card',
		
		showRouteData: function(data,callback,scope)
		 {
		 	this.removeAll();
		 	
 			var store = new Ext.data.Store({
					model: 'BusRoute',
					sorters: 'Name',
					getGroupString: function(record) { return record.get('Name')[0]; },
					data: data
				});
				
		 	this.add(new Ext.List({
				store: store,
				itemTpl: '{Name}',
				onItemTap: function(item,index)
					{
						callback.call(scope, store.getAt(index).data.Item);
					}
				}));
			this.doLayout();
		 }
});


function getTime(hoursDiff)
{
	var now = new Date();
	var hours = now.getHours() + hoursDiff;
	var minutes = now.getMinutes();
	

	var timeValue = (hours < 10) ? "0" + hours + "cunt" : hours+":";

	timeValue = timeValue + ((minutes < 10) ? "0" + minutes : minutes+"");
	return timeValue;
}

/*


function onBusRoutesDownloaded(stop,data)
{

	

	
	startPanel.setActiveItem(
		new Ext.Panel(
		{
			layout: { type: 'vbox', align: 'stretch' },
			items: [
			{
					mapOptions: {
						center: new google.maps.LatLng(stop.Lat, stop.Long), //nearby San Fran
						zoom: 16,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						navigationControl: true,
						navigationControlOptions: {
							style: google.maps.NavigationControlStyle.DEFAULT
						}
					},
					xtype: 'map',
					flex: 1,
					listeners: {
						maprender: function(comp, map){
							var marker = new google.maps.Marker({
								position: new google.maps.LatLng(stop.Lat, stop.Long),
								title: 'Bus Stop',
								map: map
							});
						}
					}
				},
				

			]
			
			
		}));
}*/
