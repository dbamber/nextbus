Ext.regModel('BusRoute', { fields: ['Name'] });
Ext.regModel('StopTime', { fields: ['Label','Depart'] });

var BusesPanel = Ext.extend(Ext.Panel, {
	
		back: function() {
			return this.list.back();
				
			
			
		},
	    // New function added
	    constructor: function(root) {

			this.root = root;
    		BusesPanel.superclass.constructor.call(this, { 
    			layout: { type: 'vbox', align: 'stretch' }
		    			
    			});
			
	    },
	    
	    backHandler: function(b,e) {
	    	if (this.list.items.length == 1)
	    	{
	    		startPanel.remove(2); 
	    		startPanel.setActiveItem(1,'slide');
	    	}
	    	else {
	    		this.list.setActiveItem(0,'slide');
	    		this.list.remove(1);
	    	}
	    },
		onRender: function() {
			BusesPanel.superclass.onRender.apply(this, arguments);
			//this.map = new MapPanel();
			this.list = new ListPanel();
			//this.add(this.map);
			this.add(this.list);
    	},
		
		onBusRoutesDownloaded: function (data)
		{
	
	
			this.list.showRouteData(data, function(item) { this.getTimes(item); }, this);
			
			
		},
		
		onTimesDownloaded: function (data)
		{
			this.list.showTimesData(data);
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
			//this.map.update({ latitude : loc.Lat,longitude : loc.Long});
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
				"FILTER(STR(?depart) < \"" + getTime(2) + "\") . " +
				"?t <http://vocab.org/transit/terms/serviceCalendar> ?sc . "+
				"?sc " + getTodaysDayField() + " true " +
				"} ";
	
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
				items.push( { Depart: result.results.bindings[i].depart.value, Label: result.results.bindings[i].tlabel.value });
				
			}   
			
			this.onTimesDownloaded(items);  
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
		back: function (){
			if (this.items.length == 1) return false;

			this.setActiveItem(0,'slide');
			this.remove(1);
			return true;
		},
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
		 },
		showTimesData: function (data)
		{
			var store = new Ext.data.Store({
				model: 'StopTime',
				sorters: 'Label',
				getGroupString: function(record) { return record.get('Label')[0]; },
				data: data
			});
			
			this.setActiveItem(new Ext.List({
				store: store,
				itemTpl: 'Departs: {Depart}',
				
				}),'slide');
		}
});


function getTime(hoursDiff)
{
	var now = new Date();
	var hours = now.getHours() + hoursDiff;
	var minutes = now.getMinutes();
	

	var timeValue = (hours < 10) ? "0" + hours +":": hours+":";

	timeValue = timeValue + ((minutes < 10) ? "0" + minutes : minutes+"");
	return timeValue;
}


function getTodaysDayField()
{
	var d = new Date();
	switch (d.getDay())
	{
		case 0:
			return '<http://vocab.org/transit/terms/sunday>';
		case 1:
			return '<http://vocab.org/transit/terms/monday>';
		case 2:
			return '<http://vocab.org/transit/terms/tuesday>';
		case 3:
			return '<http://vocab.org/transit/terms/wednesday>';
		case 4:
			return '<http://vocab.org/transit/terms/thursday>';
		case 5:
			return '<http://vocab.org/transit/terms/friday>';
		case 6:
			return '<http://vocab.org/transit/terms/saturday>';	
	}
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
