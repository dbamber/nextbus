Ext.regModel('BusRoute', { fields: ['Name'] });

var BusesPanel = Ext.extend(Ext.Panel, {
	    // New function added
	    constructor: function(loc,root) {

			this.root = root;
    		BusesPanel.superclass.constructor.call(this, { layout: { type: 'vbox', align: 'stretch' } });
			this.location = loc;
	    },
		onRender: function() {
			BusesPanel.superclass.onRender.apply(this, arguments);
    	},
		
		onBusRoutesDownloaded: function (data)
		{
			this.routeStore = new Ext.data.Store({
				model: 'BusRoute',
				sorters: 'Name',
				getGroupString: function(record) { return record.get('Name')[0]; },
				data: data
			});
	
			alert('done');
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
		getBuses: function()
				{
					
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
		
	});

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
				{
					xtype: 'list',
					store: routeStore,
					itemTpl: '{Name}',
					flex: 1,
					onItemTap: function(item,index)
						{
							var obj = routeStore.getAt(index).data;
							findTimes(stop,obj.Item);
						}
					
				}
				

			]
			
			
		}));
}*/
